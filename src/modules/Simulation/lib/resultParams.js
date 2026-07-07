// Parámetros visualizables sobre el mapa en modo resultados, con sus rampas
// de color: fijas para presión y velocidad (umbrales de ingeniería) y
// automáticas por cuartiles para el resto.

const PRESSURE_STOPS = [
	{ value: 0, color: '#e11d48' },
	{ value: 10, color: '#f59e0b' },
	{ value: 20, color: '#10b981' },
	{ value: 40, color: '#368bed' },
]

const VELOCITY_STOPS = [
	{ value: 0, color: '#94a3b8' },
	{ value: 0.3, color: '#10b981' },
	{ value: 1.5, color: '#f59e0b' },
	{ value: 2.5, color: '#e11d48' },
]

// Escala secuencial para parámetros con rango automático
const AUTO_COLORS = ['#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']

export const NODE_PARAMS = {
	pressure: {
		label: 'Presión',
		getValue: (v) => v.pressure,
		unit: (r) => r.pressureUnitLabel,
		fixedStops: PRESSURE_STOPS,
	},
	head: {
		label: 'Carga hidráulica',
		getValue: (v) => v.head,
		unit: (r) => (r.isMetric ? 'm' : 'ft'),
		fixedStops: null,
	},
	demand: {
		label: 'Demanda',
		getValue: (v) => v.demand,
		unit: (r) => r.flowUnitLabel,
		fixedStops: null,
	},
}

export const LINK_PARAMS = {
	velocity: {
		label: 'Velocidad',
		getValue: (v) => v.velocity,
		unit: (r) => (r.isMetric ? 'm/s' : 'ft/s'),
		fixedStops: VELOCITY_STOPS,
	},
	flow: {
		label: 'Caudal',
		getValue: (v) => Math.abs(v.flow),
		unit: (r) => r.flowUnitLabel,
		fixedStops: null,
	},
	headloss: {
		label: 'Pérdida de carga',
		getValue: (v) => v.headloss,
		unit: (r) => (r.isMetric ? 'm/km' : 'ft/kft'),
		fixedStops: null,
	},
}

const round2 = (v) => {
	if (!Number.isFinite(v)) return 0
	const abs = Math.abs(v)
	if (abs >= 100) return Math.round(v)
	if (abs >= 1) return Math.round(v * 10) / 10
	return Math.round(v * 100) / 100
}

/**
 * Calcula la rampa de color de un parámetro sobre TODOS los pasos de la
 * simulación (así los colores no cambian al mover el slider).
 * @returns {Array<{value:number, color:string, label:string}>}
 */
export function computeStops(kind, paramKey, result) {
	const params = kind === 'node' ? NODE_PARAMS : LINK_PARAMS
	const param = params[paramKey]

	let stops
	if (param.fixedStops) {
		stops = param.fixedStops
	} else {
		const values = result.steps.flatMap((s) => (kind === 'node' ? s.nodes : s.links).map(param.getValue)).filter(Number.isFinite)
		const min = Math.min(...values)
		const max = Math.max(...values)
		const span = max - min || 1
		stops = AUTO_COLORS.map((color, i) => ({ value: round2(min + (span * i) / 4), color }))
	}

	const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
	return stops.map((s, i) => {
		const next = stops[i + 1]
		const label =
			i === 0
				? `< ${numberFormat.format(next.value)}`
				: next
				? `${numberFormat.format(s.value)}–${numberFormat.format(next.value)}`
				: `> ${numberFormat.format(s.value)}`
		return { ...s, label }
	})
}
