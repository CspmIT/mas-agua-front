// Defaults y helpers del editor de redes

export const NODE_TOOLS = [
	{ tool: 'junction', label: 'Nodo de consumo', prefix: 'N', color: '#368bed' },
	{ tool: 'reservoir', label: 'Reservorio / Pozo', prefix: 'R', color: '#10B981' },
	{ tool: 'tank', label: 'Tanque', prefix: 'T', color: '#8b5cf6' },
]

export const LINK_TOOLS = [
	{ tool: 'pipe', label: 'Tubería', prefix: 'P', color: '#64748b' },
	{ tool: 'pump', label: 'Bomba', prefix: 'B', color: '#d8621d' },
	{ tool: 'valve', label: 'Válvula', prefix: 'V', color: '#ec4899' },
]

export const NODE_COLORS = Object.fromEntries(NODE_TOOLS.map((t) => [t.tool, t.color]))
export const LINK_COLORS = Object.fromEntries(LINK_TOOLS.map((t) => [t.tool, t.color]))

const PREFIXES = Object.fromEntries([...NODE_TOOLS, ...LINK_TOOLS].map((t) => [t.tool, t.prefix]))

/** Genera un tag único para un nuevo elemento (N1, N2, ..., P1, ...) */
export function nextTag(type, existingTags) {
	const prefix = PREFIXES[type] ?? 'X'
	let i = 1
	while (existingTags.has(`${prefix}${i}`)) i++
	return `${prefix}${i}`
}

/** Crea un nodo nuevo con defaults razonables según el tipo */
export function makeNode(type, tag, lngLat) {
	const base = {
		tag,
		type,
		latitude: lngLat.lat,
		longitude: lngLat.lng,
		elevation: 0,
		baseDemand: 0,
	}
	if (type === 'tank') {
		return { ...base, initLevel: 2, minLevel: 0.5, maxLevel: 5, tankDiameter: 5 }
	}
	return base
}

/** Crea un tramo nuevo con defaults razonables según el tipo */
export function makeLink(type, tag, fromTag, toTag, vertices = []) {
	const base = { tag, type, from: fromTag, to: toTag, initialStatus: 'OPEN' }
	if (type === 'pipe') return { ...base, length: null, diameter: 110, roughness: 140, vertices }
	if (type === 'pump') return { ...base, power: 5 }
	return { ...base, diameter: 110, valveType: 'PRV', setting: 30 }
}

export const DEFAULT_NETWORK = {
	name: '',
	description: '',
	flowUnits: 'LPS',
	headlossFormula: 'H-W',
	duration: 86400,
	hydStep: 3600,
}

// Centro por defecto del mapa (Morteros, Córdoba)
export const DEFAULT_VIEW_STATE = { latitude: -30.7126, longitude: -62.0054, zoom: 13 }
