import axios from 'axios'
import { backend } from '../routes/app.routes'
import { storage } from '../../storage/storage'
import { getData } from '../../storage/cookies-store'

/**
 * Servicio de asistente IA (RAG).
 *
 * El frontend NUNCA llama al AI service directamente: todas las peticiones
 * pasan por el gateway Node, que valida el JWT y reenvía. El tenant viaja
 * implícito en el JWT (claim nameApp). NO se envía tenant_id en body ni query.
 *
 * Errores normalizados: lanzan { status, code, message } para que el caller
 * decida (401 -> logout, 5xx -> banner, etc).
 */

const buildBaseUrl = () => backend[import.meta.env.VITE_APP_NAME]

const resolveToken = async () => {
	const t = await getData('token')
	if (t) return t
	return storage.get('tokenCooptech')
}

const NETWORK_MSG = 'El asistente no está disponible en este momento'

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
	if (status === 413) return { status, code: 'validation', message: 'El archivo supera los 25 MB', details: data }
	if (status === 422)
		return {
			status,
			code: 'validation',
			message: backendMsg || 'No se pudo extraer texto del archivo',
			details: data,
		}
	if (status === 400)
		return { status, code: 'validation', message: backendMsg || 'Solicitud inválida', details: data }
	if (status === 503)
		return { status, code: 'rate', message: 'Esperá unos segundos y volvé a intentar', details: data }
	if (status >= 500) return { status, code: 'service', message: NETWORK_MSG, details: data }
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
 * @param {{ question: string, enable_tools?: boolean, signal?: AbortSignal }} req
 */
export const sendChat = async ({ question, enable_tools = false, signal } = {}) => {
	const url = `${buildBaseUrl()}/assistant/chat`
	try {
		const { data } = await axios.post(
			url,
			{ question, enable_tools },
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
 *   onProgress?: (pct: number) => void,
 *   signal?: AbortSignal,
 * }} args
 */
export const ingestDocument = async ({ file, title, docType, onProgress, signal }) => {
	const url = `${buildBaseUrl()}/assistant/ingest`
	const fd = new FormData()
	fd.append('file', file)
	fd.append('title', title)
	fd.append('doc_type', docType)
	try {
		const { data } = await axios.post(url, fd, {
			withCredentials: true,
			signal,
			headers: await authHeaders({ 'Content-Type': 'multipart/form-data' }),
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
	const url = `${buildBaseUrl()}/assistant/document/${encodeURIComponent(docId)}`
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
 * Requiere GET /api/assistant/documents en el backend Node (metadata en MySQL).
 */
export const listDocuments = async () => {
	const url = `${buildBaseUrl()}/assistant/documents`
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
			norm.message = 'Endpoint /api/assistant/documents pendiente en el backend'
		}
		throw norm
	}
}

/**
 * URL de descarga del documento original.
 * Requiere GET /api/assistant/document/:doc_id/file en el backend Node.
 * @param {string} docId
 */
export const getDocumentDownloadUrl = (docId) =>
	`${buildBaseUrl()}/assistant/document/${encodeURIComponent(docId)}/file`
