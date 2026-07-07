// Parser de archivos .INP de EPANET hacia el modelo del editor.
// Devuelve la red en coordenadas crudas (x/y del archivo) más una lista de
// advertencias con todo lo que no se pudo representar en nuestro modelo.

const KNOWN_FLOW_UNITS = new Set(['CFS', 'GPM', 'MGD', 'IMGD', 'AFD', 'LPS', 'LPM', 'MLD', 'CMH', 'CMD'])
const KNOWN_HEADLOSS = new Set(['H-W', 'D-W', 'C-M'])
const SUPPORTED_VALVES = new Set(['PRV', 'PSV', 'PBV', 'FCV', 'TCV'])

/** Parsea tiempos EPANET: "24", "24:00", "1:30:00", "90 MINUTES", "1.5 HOURS" → segundos */
function parseInpTime(value, unitsWord = '') {
	if (value.includes(':')) {
		const [h = 0, m = 0, s = 0] = value.split(':').map(Number)
		return h * 3600 + m * 60 + s
	}
	const n = Number(value)
	if (Number.isNaN(n)) return null
	const u = unitsWord.toUpperCase()
	if (u.startsWith('SEC')) return Math.round(n)
	if (u.startsWith('MIN')) return Math.round(n * 60)
	if (u.startsWith('DAY')) return Math.round(n * 86400)
	return Math.round(n * 3600) // default horas
}

/**
 * @param {string} inpText
 * @returns {{
 *   title: string,
 *   flowUnits: string, headlossFormula: string, duration: number, hydStep: number,
 *   nodes: Array<{tag,type,x,y,elevation,baseDemand,initLevel,minLevel,maxLevel,tankDiameter}>,
 *   links: Array<{tag,type,from,to,length,diameter,roughness,power,valveType,setting,initialStatus,vertices:[{x,y}]}>,
 *   warnings: string[],
 * }}
 */
export function parseInp(inpText) {
	const warnings = []
	const nodes = new Map() // tag -> node (sin coords aún)
	const links = new Map() // tag -> link
	const coords = new Map() // tag -> {x, y}
	const vertices = new Map() // linkTag -> [{x, y}]
	const demands = new Map() // tag -> {total, pattern} de [DEMANDS]
	const statusOverrides = new Map() // linkTag -> 'OPEN' | 'CLOSED'
	const patterns = new Map() // tag -> multiplicadores acumulados
	const curves = new Map() // tag -> puntos {flow, head} acumulados
	const controls = [] // controles simples por nivel
	let defaultPattern = '1' // OPTIONS Pattern: patrón por defecto de EPANET

	let title = ''
	let flowUnits = 'GPM' // default de EPANET
	let headlossFormula = 'H-W'
	let duration = 0
	let hydStep = 3600

	let section = null
	const unsupportedSections = new Set()

	const lines = inpText.split(/\r?\n/)
	for (const rawLine of lines) {
		const line = rawLine.split(';')[0].trim()
		if (!line) continue

		const sectionMatch = line.match(/^\[(.+)\]$/)
		if (sectionMatch) {
			section = sectionMatch[1].trim().toUpperCase()
			continue
		}
		if (!section) continue

		const parts = line.split(/\s+/)

		switch (section) {
			case 'TITLE':
				title = title ? `${title} ${line}` : line
				break

			case 'JUNCTIONS': {
				const [tag, elev = '0', demand = '0', pattern] = parts
				nodes.set(tag, {
					tag,
					type: 'junction',
					elevation: Number(elev) || 0,
					baseDemand: Number(demand) || 0,
					demandPattern: pattern || null,
				})
				break
			}

			case 'RESERVOIRS': {
				const [tag, head = '0'] = parts
				nodes.set(tag, { tag, type: 'reservoir', elevation: Number(head) || 0, baseDemand: 0 })
				if (parts[2]) warnings.push(`Reservorio ${tag}: el patrón de carga "${parts[2]}" no está soportado y se ignoró.`)
				break
			}

			case 'TANKS': {
				const [tag, elev = '0', initLvl = '0', minLvl = '0', maxLvl = '0', diam = '0', , volCurve] = parts
				nodes.set(tag, {
					tag,
					type: 'tank',
					elevation: Number(elev) || 0,
					baseDemand: 0,
					initLevel: Number(initLvl) || 0,
					minLevel: Number(minLvl) || 0,
					maxLevel: Number(maxLvl) || 0,
					tankDiameter: Number(diam) || 1,
				})
				if (volCurve && volCurve !== '*') {
					warnings.push(`Tanque ${tag}: la curva de volumen "${volCurve}" no está soportada; se usa el diámetro equivalente.`)
				}
				break
			}

			case 'PIPES': {
				const [tag, n1, n2, length, diam, rough, , status] = parts
				const st = (status || 'OPEN').toUpperCase()
				if (st === 'CV') warnings.push(`Tubería ${tag}: la válvula de retención (CV) no está soportada; se importó como abierta.`)
				links.set(tag, {
					tag,
					type: 'pipe',
					from: n1,
					to: n2,
					length: Number(length) || null,
					diameter: Number(diam) || null,
					roughness: Number(rough) || null,
					initialStatus: st === 'CLOSED' ? 'CLOSED' : 'OPEN',
					vertices: [],
				})
				break
			}

			case 'PUMPS': {
				const [tag, n1, n2, ...params] = parts
				let power = null
				let headCurve = null
				for (let i = 0; i < params.length - 1; i += 2) {
					const key = params[i].toUpperCase()
					if (key === 'POWER') power = Number(params[i + 1]) || null
					else if (key === 'HEAD') headCurve = params[i + 1]
					else warnings.push(`Bomba ${tag}: el parámetro "${params[i]} ${params[i + 1]}" no está soportado y se ignoró.`)
				}
				links.set(tag, { tag, type: 'pump', from: n1, to: n2, power, headCurve, initialStatus: 'OPEN' })
				break
			}

			case 'CURVES': {
				const [tag, x, y] = parts
				if (!curves.has(tag)) curves.set(tag, [])
				curves.get(tag).push({ flow: Number(x), head: Number(y) })
				break
			}

			case 'CONTROLS': {
				// LINK <id> OPEN|CLOSED IF NODE <id> ABOVE|BELOW <valor>
				const up = parts.map((p) => p.toUpperCase())
				if (up[0] === 'LINK' && up[3] === 'IF' && up[4] === 'NODE' && ['ABOVE', 'BELOW'].includes(up[6])) {
					const action = up[2]
					if (action === 'OPEN' || action === 'CLOSED') {
						controls.push({
							link: parts[1],
							action,
							node: parts[5],
							condition: up[6],
							level: Number(parts[7]) || 0,
						})
					} else {
						warnings.push(`Control de ${parts[1]}: la consigna "${parts[2]}" (velocidad/apertura) no está soportada; se ignoró.`)
					}
				} else {
					warnings.push(`Control no soportado (sólo por nivel de nodo): "${line}".`)
				}
				break
			}

			case 'VALVES': {
				const [tag, n1, n2, diam, vType = 'PRV', setting = '0'] = parts
				let valveType = vType.toUpperCase()
				if (!SUPPORTED_VALVES.has(valveType)) {
					warnings.push(`Válvula ${tag}: el tipo "${vType}" no está soportado; se importó como TCV.`)
					valveType = 'TCV'
				}
				links.set(tag, {
					tag,
					type: 'valve',
					from: n1,
					to: n2,
					diameter: Number(diam) || 110,
					valveType,
					setting: Number(setting) || 0,
					initialStatus: 'OPEN',
				})
				break
			}

			case 'STATUS': {
				const [tag, st] = parts
				const up = (st || '').toUpperCase()
				if (up === 'OPEN' || up === 'CLOSED') statusOverrides.set(tag, up)
				else warnings.push(`Estado de ${tag}: la consigna inicial "${st}" no está soportada y se ignoró.`)
				break
			}

			case 'DEMANDS': {
				const [tag, demand, pattern] = parts
				const current = demands.get(tag) || { total: 0, pattern: null }
				current.total += Number(demand) || 0
				if (pattern) {
					if (current.pattern && current.pattern !== pattern) {
						warnings.push(`Nodo ${tag}: tiene varias categorías de demanda con patrones distintos; se usó "${pattern}" para el total.`)
					}
					current.pattern = pattern
				}
				demands.set(tag, current)
				break
			}

			case 'PATTERNS': {
				const [tag, ...values] = parts
				if (!patterns.has(tag)) patterns.set(tag, [])
				patterns.get(tag).push(...values.map(Number).filter(Number.isFinite))
				break
			}

			case 'COORDINATES': {
				const [tag, x, y] = parts
				coords.set(tag, { x: Number(x), y: Number(y) })
				break
			}

			case 'VERTICES': {
				const [tag, x, y] = parts
				if (!vertices.has(tag)) vertices.set(tag, [])
				vertices.get(tag).push({ x: Number(x), y: Number(y) })
				break
			}

			case 'OPTIONS': {
				const key = parts[0].toUpperCase()
				if (key === 'UNITS' && parts[1]) {
					const u = parts[1].toUpperCase()
					if (KNOWN_FLOW_UNITS.has(u)) flowUnits = u
					else warnings.push(`Unidades "${parts[1]}" desconocidas; se mantuvo ${flowUnits}.`)
				}
				if (key === 'HEADLOSS' && parts[1]) {
					const h = parts[1].toUpperCase()
					if (KNOWN_HEADLOSS.has(h)) headlossFormula = h
				}
				if (key === 'PATTERN' && parts[1]) defaultPattern = parts[1]
				break
			}

			case 'TIMES': {
				// "Duration 24:00" | "Hydraulic Timestep 1:00" | "Pattern Timestep 1:00"
				const joined = parts.join(' ').toUpperCase()
				if (joined.startsWith('DURATION')) {
					const t = parseInpTime(parts[1] ?? '0', parts[2] ?? '')
					if (t != null) duration = t
				} else if (joined.startsWith('HYDRAULIC')) {
					const t = parseInpTime(parts[2] ?? '1', parts[3] ?? '')
					if (t != null && t > 0) hydStep = t
				} else if (joined.startsWith('PATTERN TIMESTEP')) {
					const t = parseInpTime(parts[2] ?? '1', parts[3] ?? '')
					if (t != null && t !== 3600) {
						warnings.push('El paso de patrón del archivo no es de 1 hora; los multiplicadores se interpretan como horarios.')
					}
				}
				break
			}

			case 'END':
				break

			// Secciones que reconocemos pero no soportamos todavía
			case 'RULES':
			case 'ENERGY':
			case 'EMITTERS':
			case 'QUALITY':
			case 'SOURCES':
			case 'REACTIONS':
			case 'MIXING':
			case 'REPORT':
			case 'LABELS':
			case 'BACKDROP':
			case 'TAGS':
				unsupportedSections.add(section)
				break

			default:
				unsupportedSections.add(section)
		}
	}

	for (const s of unsupportedSections) {
		warnings.push(`La sección [${s}] no está soportada y se ignoró.`)
	}

	// Aplicar demandas de [DEMANDS] y estados de [STATUS]
	for (const [tag, { total, pattern }] of demands) {
		const node = nodes.get(tag)
		if (node) {
			node.baseDemand = total
			if (pattern) node.demandPattern = pattern
		}
	}
	for (const [tag, st] of statusOverrides) {
		const link = links.get(tag)
		if (link) link.initialStatus = st
	}

	// Resolver bombas: curva válida, o potencia, o default con advertencia
	for (const link of links.values()) {
		if (link.type !== 'pump') continue
		if (link.headCurve && !curves.has(link.headCurve)) {
			warnings.push(`Bomba ${link.tag}: la curva "${link.headCurve}" no está definida en el archivo.`)
			link.headCurve = null
		}
		if (!link.headCurve && link.power == null) {
			link.power = 5
			warnings.push(`Bomba ${link.tag}: sin curva ni potencia; se asignó 5 kW provisorio — ajustala a mano.`)
		}
	}

	// Descartar controles que referencian elementos inexistentes o no soportados
	const validControls = controls.filter((c) => {
		if (!links.has(c.link) || !nodes.has(c.node)) {
			warnings.push(`Un control referencia elementos inexistentes (${c.link} / ${c.node}) y se descartó.`)
			return false
		}
		return true
	})

	// Resolver patrones: aplicar el default de [OPTIONS] y validar referencias
	for (const node of nodes.values()) {
		if (node.type !== 'junction') continue
		if (!node.demandPattern && node.baseDemand !== 0 && patterns.has(defaultPattern)) {
			node.demandPattern = defaultPattern
		}
		if (node.demandPattern && !patterns.has(node.demandPattern)) {
			warnings.push(`Nodo ${node.tag}: el patrón "${node.demandPattern}" no está definido en el archivo; se usó demanda constante.`)
			node.demandPattern = null
		}
	}

	// Coordenadas: obligatorias para ubicar la red en el mapa
	const missing = [...nodes.keys()].filter((tag) => !coords.has(tag) || Number.isNaN(coords.get(tag).x))
	if (missing.length === nodes.size) {
		throw new Error('El archivo no tiene sección [COORDINATES]: no se puede ubicar la red en el mapa.')
	}
	if (missing.length > 0) {
		// Ubicar los nodos sin coordenadas en el centroide del resto
		const placed = [...coords.values()]
		const cx = placed.reduce((a, c) => a + c.x, 0) / placed.length
		const cy = placed.reduce((a, c) => a + c.y, 0) / placed.length
		for (const tag of missing) coords.set(tag, { x: cx, y: cy })
		warnings.push(`${missing.length} nodo(s) sin coordenadas se ubicaron en el centro de la red: ${missing.join(', ')}.`)
	}

	// Descartar tramos con extremos inexistentes
	for (const [tag, link] of links) {
		if (!nodes.has(link.from) || !nodes.has(link.to)) {
			warnings.push(`El tramo ${tag} referencia nodos inexistentes y se descartó.`)
			links.delete(tag)
		}
	}

	const outNodes = [...nodes.values()].map((n) => ({ ...n, ...coords.get(n.tag) }))
	const outLinks = [...links.values()].map((l) => ({ ...l, vertices: vertices.get(l.tag) ?? l.vertices ?? [] }))
	const outPatterns = [...patterns.entries()].map(([tag, multipliers]) => ({ tag, multipliers }))
	const outCurves = [...curves.entries()].map(([tag, points]) => ({ tag, points }))

	return {
		title,
		flowUnits,
		headlossFormula,
		duration,
		hydStep,
		nodes: outNodes,
		links: outLinks,
		patterns: outPatterns,
		curves: outCurves,
		controls: validControls,
		warnings,
	}
}

/** ¿Las coordenadas del archivo parecen ser lat/lng WGS84? */
export function looksLikeLatLng(parsed) {
	return parsed.nodes.every((n) => Math.abs(n.x) <= 180 && Math.abs(n.y) <= 90)
}
