// Genera el texto .INP de EPANET a partir de una red del editor
// (objeto con options + nodes + links, mismo formato que la API /sim/network)

const US_FLOW_UNITS = new Set(['CFS', 'GPM', 'MGD', 'IMGD', 'AFD'])

const EARTH_RADIUS_M = 6371000

/** Distancia haversine en metros entre dos puntos {latitude, longitude} */
export function haversineMeters(a, b) {
	const toRad = (deg) => (deg * Math.PI) / 180
	const dLat = toRad(b.latitude - a.latitude)
	const dLng = toRad(b.longitude - a.longitude)
	const sinLat = Math.sin(dLat / 2)
	const sinLng = Math.sin(dLng / 2)
	const h = sinLat * sinLat + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

const formatDuration = (seconds) => {
	const h = Math.floor(seconds / 3600)
	const m = Math.round((seconds % 3600) / 60)
	return `${h}:${String(m).padStart(2, '0')}`
}

const row = (...cells) => ' ' + cells.map((c) => String(c).padEnd(16)).join('\t')

/**
 * @param {{
 *   name: string,
 *   flowUnits?: string,
 *   headlossFormula?: string,
 *   duration?: number,
 *   hydStep?: number,
 *   nodes: Array<object>,
 *   links: Array<object>,
 * }} network
 * @returns {string} contenido del archivo .INP
 */
export function buildInp(network) {
	const {
		name = 'Red sin nombre',
		flowUnits = 'LPS',
		headlossFormula = 'H-W',
		duration = 86400,
		hydStep = 3600,
		nodes = [],
		links = [],
		patterns = [],
		curves = [],
		controls = [],
	} = network

	const isUS = US_FLOW_UNITS.has(flowUnits)
	// Largo de tubería sumando los segmentos del trazado (con vértices intermedios).
	// En unidades US EPANET espera pies, en métricas metros.
	const lengthFromGeometry = (from, to, vertices = []) => {
		const path = [from, ...(vertices || []), to]
		let meters = 0
		for (let i = 0; i < path.length - 1; i++) meters += haversineMeters(path[i], path[i + 1])
		return isUS ? meters * 3.28084 : meters
	}
	const defaultRoughness = headlossFormula === 'H-W' ? 140 : 0.1

	const nodeByTag = new Map(nodes.map((n) => [n.tag, n]))

	const junctions = nodes.filter((n) => n.type === 'junction')
	const reservoirs = nodes.filter((n) => n.type === 'reservoir')
	const tanks = nodes.filter((n) => n.type === 'tank')
	const pipes = links.filter((l) => l.type === 'pipe')
	const pumps = links.filter((l) => l.type === 'pump')
	const valves = links.filter((l) => l.type === 'valve')

	const sections = []

	sections.push('[TITLE]', ` ${name}`, '')

	sections.push('[JUNCTIONS]', ';ID\tElev\tDemand\tPattern')
	for (const n of junctions) {
		sections.push(row(n.tag, n.elevation ?? 0, n.baseDemand ?? 0, n.demandPattern ?? '') + '\t;')
	}
	sections.push('')

	sections.push('[RESERVOIRS]', ';ID\tHead')
	for (const n of reservoirs) sections.push(row(n.tag, n.elevation ?? 0) + '\t;')
	sections.push('')

	sections.push('[TANKS]', ';ID\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\tMinVol')
	for (const n of tanks) {
		sections.push(row(n.tag, n.elevation ?? 0, n.initLevel ?? 0, n.minLevel ?? 0, n.maxLevel ?? 0, n.tankDiameter ?? 0, 0) + '\t;')
	}
	sections.push('')

	sections.push('[PIPES]', ';ID\tNode1\tNode2\tLength\tDiameter\tRoughness\tMinorLoss\tStatus')
	for (const l of pipes) {
		const from = nodeByTag.get(l.from)
		const to = nodeByTag.get(l.to)
		const length = l.length ?? lengthFromGeometry(from, to, l.vertices)
		sections.push(
			row(
				l.tag,
				l.from,
				l.to,
				length.toFixed(2),
				l.diameter ?? 110,
				l.roughness ?? defaultRoughness,
				0,
				l.initialStatus === 'CLOSED' ? 'Closed' : 'Open'
			) + '\t;'
		)
	}
	sections.push('')

	// Bombas: curva caudal-altura (HEAD) o potencia constante (POWER, kW métrico / HP US)
	sections.push('[PUMPS]', ';ID\tNode1\tNode2\tParameters')
	for (const l of pumps) {
		const params = l.headCurve ? `HEAD ${l.headCurve}` : `POWER ${l.power}`
		sections.push(row(l.tag, l.from, l.to, params) + '\t;')
	}
	sections.push('')

	sections.push('[VALVES]', ';ID\tNode1\tNode2\tDiameter\tType\tSetting\tMinorLoss')
	for (const l of valves) {
		sections.push(row(l.tag, l.from, l.to, l.diameter ?? 110, l.valveType, l.setting ?? 0, 0) + '\t;')
	}
	sections.push('')

	// Bombas y válvulas inicialmente cerradas van en [STATUS]
	const closedNonPipes = [...pumps, ...valves].filter((l) => l.initialStatus === 'CLOSED')
	if (closedNonPipes.length > 0) {
		sections.push('[STATUS]', ';ID\tStatus')
		for (const l of closedNonPipes) sections.push(row(l.tag, 'Closed'))
		sections.push('')
	}

	// Curvas caudal-altura de bombas
	if (curves.length > 0) {
		sections.push('[CURVES]', ';ID\tX-Value\tY-Value')
		for (const c of curves) {
			for (const p of c.points) sections.push(row(c.tag, p.flow, p.head))
		}
		sections.push('')
	}

	// Controles simples por nivel: LINK <tramo> <estado> IF NODE <nodo> ABOVE|BELOW <nivel>
	if (controls.length > 0) {
		sections.push('[CONTROLS]')
		for (const c of controls) {
			sections.push(` LINK ${c.link} ${c.action} IF NODE ${c.node} ${c.condition} ${c.level}`)
		}
		sections.push('')
	}

	// Patrones horarios (multiplicadores de la demanda base, paso de 1 hora)
	if (patterns.length > 0) {
		sections.push('[PATTERNS]', ';ID\tMultipliers')
		for (const p of patterns) {
			for (let i = 0; i < p.multipliers.length; i += 6) {
				sections.push(row(p.tag, ...p.multipliers.slice(i, i + 6)))
			}
		}
		sections.push('')
	}

	sections.push('[TIMES]')
	sections.push(` Duration           \t${formatDuration(duration)}`)
	sections.push(` Hydraulic Timestep \t${formatDuration(hydStep)}`)
	sections.push(' Pattern Timestep   \t1:00')
	sections.push(' Pattern Start      \t0:00')
	sections.push('')

	sections.push('[OPTIONS]')
	sections.push(` Units              \t${flowUnits}`)
	sections.push(` Headloss           \t${headlossFormula}`)
	sections.push(' Quality            \tNone')
	sections.push('')

	sections.push('[REPORT]', ' Status             \tNo', ' Summary            \tNo', '')

	// EPANET admite cualquier sistema XY; usamos lng/lat directamente
	sections.push('[COORDINATES]', ';Node\tX-Coord\tY-Coord')
	for (const n of nodes) sections.push(row(n.tag, n.longitude, n.latitude))
	sections.push('')

	const linksWithVertices = links.filter((l) => l.vertices?.length > 0)
	if (linksWithVertices.length > 0) {
		sections.push('[VERTICES]', ';Link\tX-Coord\tY-Coord')
		for (const l of linksWithVertices) {
			for (const v of l.vertices) sections.push(row(l.tag, v.longitude, v.latitude))
		}
		sections.push('')
	}

	sections.push('[END]')

	return sections.join('\n')
}
