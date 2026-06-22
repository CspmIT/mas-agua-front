import axios from 'axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { backend } from '../routes/app.routes'
import { storage } from '../../storage/storage'
import { getData } from '../../storage/cookies-store'

/**
 * Servicio de asistente IA (RAG).
 *
 * El frontend NUNCA llama al AI service directamente: todas las peticiones
 * pasan por el gateway Node bajo /api/ai/*, que valida el JWT y reenvía.
 * El tenant viaja implícito en el JWT (claim nameApp). NO se envía tenant_id
 * en body ni query.
 *
 * Errores normalizados: lanzan { status, code, message, details? } para que
 * el caller decida (401 -> logout, 5xx -> banner, 429 -> wait, etc).
 */

const buildBaseUrl = () => backend[import.meta.env.VITE_APP_NAME]

const resolveToken = async () => {
	const t = await getData('token')
	if (t) return t
	return storage.get('tokenCooptech')
}

const NETWORK_MSG = 'El asistente no está disponible en este momento'
const TIMEOUT_MSG = 'El asistente tardó demasiado en responder. Probá de nuevo.'

const normalizeError = (error) => {
	if (axios.isCancel?.(error)) {
		return { status: 0, code: 'cancelled', message: 'Solicitud cancelada' }
	}
	if (!error?.response) {
		return { status: 0, code: 'network', message: NETWORK_MSG, details: error?.message }
	}
	const { status, data } = error.response
	const backendMsg =
		typeof data === 'string'
			? data
			: data?.message || data?.error || data?.detail || null

	if (status === 401) return { status, code: 'auth', message: 'Sesión expirada', details: data }
	if (status === 403)
		return {
			status,
			code: 'forbidden',
			message: backendMsg || 'No tenés permisos para esta acción',
			details: data,
		}
	if (status === 400)
		return {
			status,
			code: 'validation',
			message: backendMsg || 'Solicitud inválida',
			details: data,
		}
	if (status === 413)
		return { status, code: 'validation', message: backendMsg || 'El archivo supera los 25 MB', details: data }
	if (status === 422)
		return {
			status,
			code: 'validation',
			message: backendMsg || 'Datos inválidos',
			details: data,
		}
	if (status === 429)
		return {
			status,
			code: 'rate',
			message: backendMsg || 'Demasiadas consultas. Esperá un momento.',
			details: data,
		}
	if (status === 504)
		return { status, code: 'timeout', message: backendMsg || TIMEOUT_MSG, details: data }
	if (status === 503 || status === 502)
		return { status, code: 'service', message: backendMsg || NETWORK_MSG, details: data }
	if (status >= 500)
		return { status, code: 'service', message: backendMsg || NETWORK_MSG, details: data }
	return { status, code: 'unknown', message: backendMsg || 'Ocurrió un error inesperado', details: data }
}

const authHeaders = async (extra = {}) => {
	const token = await resolveToken()
	return {
		Authorization: 'Bearer ' + token,
		Accept: 'application/json',
		...extra,
	}
}

/**
 * Envía una pregunta al asistente.
 * El gateway espera enableTools (camelCase) y lo traduce a enable_tools antes
 * de reenviar al AI service.
 *
 * Si `conversationId` viene null/undefined, el back crea una conversación
 * nueva y devuelve el id asignado en `conversationId` del response.
 *
 * Si `isRetry` es true, el back asume que la pregunta ya quedó persistida
 * en un intento previo y NO crea otro user msg. Requiere `conversationId`.
 *
 * @param {{ question: string, enableTools?: boolean, conversationId?: number|null, isRetry?: boolean, signal?: AbortSignal }} req
 */
export const sendChat = async ({ question, enableTools = false, conversationId = null, isRetry = false, signal } = {}) => {
	const url = `${buildBaseUrl()}/ai/chat`
	const body = { question, enableTools }
	if (conversationId != null) body.conversationId = conversationId
	if (isRetry) body.isRetry = true
	try {
		const { data } = await axios.post(url, body, {
			withCredentials: true,
			signal,
			headers: await authHeaders({ 'Content-Type': 'application/json' }),
		})
		return {
			answer: typeof data?.answer === 'string' ? data.answer : '',
			sources: Array.isArray(data?.sources) ? data.sources : [],
			tool_calls: Array.isArray(data?.tool_calls) ? data.tool_calls : [],
			trace_id: typeof data?.trace_id === 'string' ? data.trace_id : null,
			artifacts: Array.isArray(data?.artifacts) ? data.artifacts : [],
			conversationId: data?.conversationId ?? null,
		}
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Error fatal en el stream SSE: el server no devolvió text/event-stream o el
 * status no es 2xx. Tirado desde onopen para evitar que fetchEventSource
 * intente reconectar en loop ante un 500/404.
 */
class StreamFatalError extends Error {
	constructor(message, status) {
		super(message)
		this.name = 'StreamFatalError'
		this.status = status
	}
}

/**
 * Versión streaming del chat vía Server-Sent Events.
 *
 * El gateway expone POST /ai/chat/stream con Content-Type: text/event-stream y
 * emite los eventos: started, rag_done, tool_call_start, tool_call_end,
 * artifact, token, done, error (ver contrato del back).
 *
 * Diseño:
 *  - Usa fetchEventSource (no EventSource nativo) porque necesitamos POST +
 *    Authorization header con JWT, cosas que EventSource no soporta.
 *  - No reintenta automáticamente: es un chat puntual, no un stream eterno.
 *    onerror tira el error para detener la reconexión interna de la lib.
 *  - Los callbacks reciben el payload ya parseado. Si el JSON viene roto se
 *    ignora el evento (warn en dev).
 *  - El evento `error` del back NO rechaza la promesa: es recuperable y puede
 *    venir seguido de más eventos. Si el back quiere abortar, manda `done`.
 *
 * Resuelve cuando llega `done`; rechaza con error normalizado al cortarse
 * la conexión o ante respuestas no-SSE.
 *
 * @param {{
 *   question: string,
 *   enableTools?: boolean,
 *   conversationId?: number|null,
 *   signal?: AbortSignal,
 *   onConversationAssigned?: (data: { conversationId: number }) => void,
 *   onStarted?: (data: { trace_id: string }) => void,
 *   onRagDone?: (data: { sources_count: number }) => void,
 *   onToolCallStart?: (data: { name: string, args: any }) => void,
 *   onToolCallEnd?: (data: { name: string, summary: any }) => void,
 *   onArtifact?: (artifact: any) => void,
 *   onToken?: (data: { text: string }) => void,
 *   onError?: (data: { code: string, message: string }) => void,
 *   onDone?: (data: { trace_id: string, sources: any[] }) => void,
 * }} req
 */
export const sendChatStream = async ({
	question,
	enableTools = false,
	conversationId = null,
	isRetry = false,
	signal,
	onConversationAssigned,
	onStarted,
	onRagDone,
	onToolCallStart,
	onToolCallEnd,
	onArtifact,
	onToken,
	onError,
	onDone,
} = {}) => {
	const url = `${buildBaseUrl()}/ai/chat/stream`
	const token = await resolveToken()
	const body = { question, enableTools }
	if (conversationId != null) body.conversationId = conversationId
	if (isRetry) body.isRetry = true

	return new Promise((resolve, reject) => {
		let settled = false
		const finish = (fn, value) => {
			if (settled) return
			settled = true
			fn(value)
		}

		fetchEventSource(url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Authorization: 'Bearer ' + token,
				Accept: 'text/event-stream',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			signal,
			// Mantener la conexión viva si la pestaña pasa a background.
			openWhenHidden: true,

			async onopen(response) {
				const contentType = response.headers.get('content-type') || ''
				if (response.ok && contentType.includes('text/event-stream')) return
				// Distinguir 401 para que el caller redirija a login.
				if (response.status === 401) {
					throw new StreamFatalError('Sesión expirada', 401)
				}
				throw new StreamFatalError(
					`Respuesta inesperada del servidor (${response.status})`,
					response.status
				)
			},

			onmessage(ev) {
				if (!ev.event) return
				let data = {}
				if (ev.data) {
					try {
						data = JSON.parse(ev.data)
					} catch (_) {
						if (import.meta.env.DEV) {
							console.warn('[sendChatStream] payload no JSON:', ev.event, ev.data)
						}
						return
					}
				}
				switch (ev.event) {
					case 'conversation_assigned':
						// Primer evento del stream para conversaciones nuevas: el back
						// crea la conversación y comunica el id antes incluso del `started`.
						onConversationAssigned?.(data)
						break
					case 'started':
						onStarted?.(data)
						break
					case 'rag_done':
						onRagDone?.(data)
						break
					case 'tool_call_start':
						onToolCallStart?.(data)
						break
					case 'tool_call_end':
						onToolCallEnd?.(data)
						break
					case 'artifact':
						onArtifact?.(data)
						break
					case 'token':
						onToken?.(data)
						break
					case 'error':
						// Error recuperable: el stream puede seguir.
						onError?.(data)
						break
					case 'done':
						onDone?.(data)
						finish(resolve)
						break
					default:
						if (import.meta.env.DEV) {
							console.warn('[sendChatStream] evento desconocido:', ev.event)
						}
				}
			},

			onerror(err) {
				// Cancelado por el caller (AbortController): normalizar como cancelled.
				if (err?.name === 'AbortError' || signal?.aborted) {
					finish(reject, { status: 0, code: 'cancelled', message: 'Solicitud cancelada' })
					throw err
				}
				if (err instanceof StreamFatalError) {
					if (err.status === 401) {
						finish(reject, { status: 401, code: 'auth', message: 'Sesión expirada' })
					} else if (err.status >= 500) {
						finish(reject, { status: err.status, code: 'service', message: NETWORK_MSG })
					} else {
						finish(reject, { status: err.status || 0, code: 'unknown', message: err.message })
					}
					throw err
				}
				// Caída de red u otro error: rechazar y detener reconexión.
				finish(reject, { status: 0, code: 'network', message: NETWORK_MSG, details: err?.message })
				throw err
			},
		}).catch(() => {
			// Ya rechazamos en onerror; este catch evita unhandled rejection del
			// throw que hicimos para detener la reconexión interna.
		})
	})
}

/**
 * Lista conversaciones del usuario actual, ordenadas por last_message_at
 * descendente. Paginación por cursor (beforeId).
 *
 * @param {{ limit?: number, beforeId?: number|null, signal?: AbortSignal }} [opts]
 * @returns {Promise<{ conversations: Array<{id:number, title:string, messageCount:number, lastMessageAt:string, createdAt:string}>, hasMore: boolean }>}
 */
export const listConversations = async ({ limit = 20, beforeId = null, signal } = {}) => {
	const url = `${buildBaseUrl()}/ai/conversations`
	const params = { limit }
	if (beforeId != null) params.beforeId = beforeId
	try {
		const { data } = await axios.get(url, {
			withCredentials: true,
			signal,
			params,
			headers: await authHeaders(),
		})
		return {
			conversations: Array.isArray(data?.conversations) ? data.conversations : [],
			hasMore: !!data?.hasMore,
		}
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Obtiene una conversación con todos sus mensajes.
 * @param {number|string} conversationId
 * @param {{ signal?: AbortSignal }} [opts]
 */
export const getConversation = async (conversationId, { signal } = {}) => {
	const url = `${buildBaseUrl()}/ai/conversations/${conversationId}`
	try {
		const { data } = await axios.get(url, {
			withCredentials: true,
			signal,
			headers: await authHeaders(),
		})
		return {
			id: data?.id,
			title: data?.title || '',
			messageCount: data?.messageCount ?? 0,
			lastMessageAt: data?.lastMessageAt || null,
			messages: Array.isArray(data?.messages) ? data.messages : [],
		}
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Elimina una conversación (cascade borra todos sus mensajes en el back).
 * @param {number|string} conversationId
 */
export const deleteConversation = async (conversationId) => {
	const url = `${buildBaseUrl()}/ai/conversations/${conversationId}`
	try {
		await axios.delete(url, {
			withCredentials: true,
			headers: await authHeaders(),
		})
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Renombra el título de una conversación.
 * @param {number|string} conversationId
 * @param {string} title
 */
export const renameConversation = async (conversationId, title) => {
	const url = `${buildBaseUrl()}/ai/conversations/${conversationId}`
	try {
		const { data } = await axios.patch(
			url,
			{ title },
			{
				withCredentials: true,
				headers: await authHeaders({ 'Content-Type': 'application/json' }),
			}
		)
		return data
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Envía feedback (pulgar arriba / abajo) sobre una respuesta del asistente.
 *
 * @param {{
 *   question: string,
 *   answer: string,
 *   rating: 'positive'|'negative',
 *   expectedAnswer?: string|null,
 *   sources?: any[]|null,
 *   toolCalls?: any[]|null,
 *   traceId?: string|null,
 *   signal?: AbortSignal,
 * }} req
 */
export const sendFeedback = async ({
	question,
	answer,
	rating,
	expectedAnswer = null,
	sources = null,
	toolCalls = null,
	traceId = null,
	signal,
} = {}) => {
	const url = `${buildBaseUrl()}/ai/feedback`
	try {
		const { data } = await axios.post(
			url,
			{
				question,
				answer,
				rating,
				expected_answer: expectedAnswer,
				sources,
				tool_calls: toolCalls,
				trace_id: traceId,
			},
			{
				withCredentials: true,
				signal,
				headers: await authHeaders({ 'Content-Type': 'application/json' }),
			}
		)
		return data
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * @param {{
 *   file: File,
 *   title: string,
 *   docType: 'manual_bomba'|'procedimiento'|'ficha_tecnica'|'manual_general'|'documento',
 *   externalId?: string,
 *   onProgress?: (pct: number) => void,
 *   signal?: AbortSignal,
 * }} args
 */
export const ingestDocument = async ({ file, title, docType, externalId, onProgress, signal }) => {
	const url = `${buildBaseUrl()}/ai/ingest/document`
	const fd = new FormData()
	fd.append('file', file)
	fd.append('title', title)
	// El form-data se reenvía tal cual al AI service: campos en snake_case.
	fd.append('doc_type', docType)
	if (externalId) fd.append('external_id', externalId)
	try {
		const { data } = await axios.post(url, fd, {
			withCredentials: true,
			signal,
			// Sin Content-Type: axios detecta el FormData y genera
			// multipart/form-data; boundary=... con el boundary aleatorio
			// correcto. Forzar el header acá deja al body sin separador
			// y rompe el parser del gateway.
			headers: await authHeaders(),
			onUploadProgress: (e) => {
				if (!onProgress || !e.total) return
				onProgress(Math.round((e.loaded * 100) / e.total))
			},
		})
		return data
	} catch (error) {
		throw normalizeError(error)
	}
}

/** @param {string} docId */
export const deleteDocument = async (docId) => {
	const url = `${buildBaseUrl()}/ai/ingest/document/${encodeURIComponent(docId)}`
	try {
		await axios.delete(url, {
			withCredentials: true,
			headers: await authHeaders(),
		})
	} catch (error) {
		throw normalizeError(error)
	}
}

/**
 * Lista de documentos indexados del tenant actual.
 * Pendiente de implementar en el backend Node. Mientras no exista, lanza
 * { code: 'not_implemented' } para que la UI muestre placeholder.
 */
export const listDocuments = async () => {
	const url = `${buildBaseUrl()}/ai/ingest/document`
	try {
		const { data } = await axios.get(url, {
			withCredentials: true,
			headers: await authHeaders(),
		})
		return Array.isArray(data) ? data : data?.items || []
	} catch (error) {
		const norm = normalizeError(error)
		if (norm.status === 404 || norm.status === 501) {
			norm.code = 'not_implemented'
			norm.message = 'Endpoint /api/ai/ingest/documents pendiente en el backend'
		}
		throw norm
	}
}

/**
 * URL de descarga del documento original.
 * Pendiente de implementar en el backend Node.
 * @param {string} docId
 */
export const getDocumentDownloadUrl = (docId) =>
	`${buildBaseUrl()}/ai/ingest/document/${encodeURIComponent(docId)}/file`

/**
 * Liveness check del servicio AI. No requiere JWT.
 * Devuelve { ok: boolean, status, upstream?, message? }.
 */
export const getHealth = async () => {
	const url = `${buildBaseUrl()}/ai/health`
	try {
		const { data, status } = await axios.get(url, {
			withCredentials: true,
			validateStatus: (s) => s === 200 || s === 503,
		})
		return {
			ok: status === 200 && data?.status === 'ok',
			status,
			upstream: data?.upstream || null,
			message: data?.message || null,
		}
	} catch (error) {
		return {
			ok: false,
			status: 0,
			upstream: null,
			message: error?.message || NETWORK_MSG,
		}
	}
}
