import axios from 'axios'
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
 * @param {{ question: string, enableTools?: boolean, signal?: AbortSignal }} req
 */
export const sendChat = async ({ question, enableTools = false, signal } = {}) => {
	const url = `${buildBaseUrl()}/ai/chat`
	try {
		const { data } = await axios.post(
			url,
			{ question, enableTools },
			{
				withCredentials: true,
				signal,
				headers: await authHeaders({ 'Content-Type': 'application/json' }),
			}
		)
		return {
			answer: typeof data?.answer === 'string' ? data.answer : '',
			sources: Array.isArray(data?.sources) ? data.sources : [],
			tool_calls: Array.isArray(data?.tool_calls) ? data.tool_calls : [],
		}
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
