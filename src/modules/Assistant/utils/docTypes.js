/**
 * Mapa visual y semántico de tipos de documento / fuente.
 *
 * Cada doc_type del backend (incluyendo los virtuales que vienen del
 * AI service: influx_variable, alarm_definition, chart) tiene aquí un
 * label en español, un color de acento, y un grupo (uploaded | system).
 */

export const UPLOADED_DOC_TYPES = [
	{ value: 'manual_bomba', label: 'Manual de bomba' },
	{ value: 'procedimiento', label: 'Procedimiento' },
	{ value: 'ficha_tecnica', label: 'Ficha técnica' },
	{ value: 'manual_general', label: 'Manual general' },
	{ value: 'documento', label: 'Documento' },
]

const TYPE_MAP = {
	manual_bomba: { label: 'Manual de bomba', accent: '#1f4e79', soft: 'rgba(31,78,121,0.10)', group: 'uploaded' },
	procedimiento: { label: 'Procedimiento', accent: '#0f766e', soft: 'rgba(15,118,110,0.10)', group: 'uploaded' },
	ficha_tecnica: { label: 'Ficha técnica', accent: '#7c2d12', soft: 'rgba(124,45,18,0.10)', group: 'uploaded' },
	manual_general: { label: 'Manual general', accent: '#4338ca', soft: 'rgba(67,56,202,0.10)', group: 'uploaded' },
	documento: { label: 'Documento', accent: '#475569', soft: 'rgba(71,85,105,0.10)', group: 'uploaded' },
	influx_variable: { label: 'Variable en tiempo real', accent: '#368bed', soft: 'rgba(54,139,237,0.12)', group: 'system' },
	alarm_definition: { label: 'Alarma configurada', accent: '#d8621d', soft: 'rgba(216,98,29,0.12)', group: 'system' },
	chart: { label: 'Gráfico', accent: '#10B981', soft: 'rgba(16,185,129,0.12)', group: 'system' },
}

const FALLBACK = { label: 'Fuente', accent: '#475569', soft: 'rgba(71,85,105,0.10)', group: 'uploaded' }

/** @param {string} type */
export const getTypeMeta = (type) => TYPE_MAP[type] || FALLBACK

/** @param {string|null|undefined} externalId */
export const parseExternalId = (externalId) => {
	if (!externalId || typeof externalId !== 'string') return null
	const idx = externalId.indexOf(':')
	if (idx === -1) return null
	const kind = externalId.slice(0, idx)
	const id = externalId.slice(idx + 1)
	if (!kind || !id) return null
	return { kind, id }
}
