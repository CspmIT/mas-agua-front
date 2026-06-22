/**
 * Paleta y helpers compartidos entre todos los artifacts.
 * Mantiene la convención visual del módulo Assistant: azules
 * corporativos #368bed/#1f4e79 + acentos verde/rojo/ámbar.
 */

export const TREND_STYLES = {
	rising: {
		label: 'Subiendo',
		arrow: '↑',
		dot: '#10B981',
		text: 'text-[#047857] dark:text-[#34d399]',
		bg: 'bg-[#10B981]/10 dark:bg-[#10B981]/15',
		border: 'border-[#10B981]/30',
	},
	falling: {
		label: 'Bajando',
		arrow: '↓',
		dot: '#ef4444',
		text: 'text-rose-700 dark:text-rose-300',
		bg: 'bg-rose-500/10 dark:bg-rose-500/15',
		border: 'border-rose-500/30',
	},
	stable: {
		label: 'Estable',
		arrow: '→',
		dot: '#64748b',
		text: 'text-slate-600 dark:text-slate-300',
		bg: 'bg-slate-500/10 dark:bg-slate-500/15',
		border: 'border-slate-400/30',
	},
	fluctuating: {
		label: 'Oscilando',
		arrow: '∿',
		dot: '#f59e0b',
		text: 'text-amber-700 dark:text-amber-300',
		bg: 'bg-amber-500/10 dark:bg-amber-500/15',
		border: 'border-amber-500/30',
	},
	no_data: {
		label: 'Sin datos',
		arrow: '·',
		dot: '#94a3b8',
		text: 'text-slate-500 dark:text-slate-400',
		bg: 'bg-slate-200/40 dark:bg-white/5',
		border: 'border-slate-300/40',
	},
}

export const LABEL_COLORS = {
	Automático: '#10B981',
	Manual: '#f59e0b',
	Falla: '#ef4444',
	'Sin definir': '#94a3b8',
}

const FALLBACK_LABEL_PALETTE = ['#368bed', '#1f4e79', '#7c3aed', '#0ea5e9', '#14b8a6', '#a855f7']

/**
 * Devuelve un color determinístico para un label desconocido.
 * Misma cadena → mismo color (hash simple sobre el string).
 */
export const colorForLabel = (label) => {
	if (LABEL_COLORS[label]) return LABEL_COLORS[label]
	let hash = 0
	for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) & 0xffff
	return FALLBACK_LABEL_PALETTE[hash % FALLBACK_LABEL_PALETTE.length]
}

/**
 * El backend ya envía time_label en formato "DD/MM/YYYY HH:mm hs"
 * en es-AR. Extrae sólo "HH:mm" para los ticks del eje X (sin
 * reparsear ISO → menos riesgo de mover timezones).
 */
export const shortTime = (timeLabel) => {
	if (!timeLabel) return ''
	const match = timeLabel.match(/(\d{2}:\d{2})/)
	return match ? match[1] : timeLabel
}

/**
 * Formateo numérico consistente para stats:
 * - enteros → sin decimales
 * - decimales → 2 cifras, sin ceros colgantes
 */
export const formatNumber = (value) => {
	if (value == null || Number.isNaN(value)) return '—'
	if (Number.isInteger(value)) return value.toLocaleString('es-AR')
	const rounded = Math.round(value * 100) / 100
	return rounded.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

export const formatValueWithUnit = (value, unit) => {
	const v = formatNumber(value)
	return unit ? `${v} ${unit}` : v
}
