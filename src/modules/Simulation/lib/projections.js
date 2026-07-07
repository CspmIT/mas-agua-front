// Conversión de coordenadas proyectadas a lat/lng WGS84 para importar archivos INP.
// Cubre los sistemas usuales en Argentina (POSGAR 2007 Gauss-Krüger) y UTM sur.
import proj4 from 'proj4'

// POSGAR 2007 / Argentina fajas 1 a 7 (EPSG:5343..5349)
// Meridianos centrales: faja 1 → -72, faja 2 → -69, ..., faja 7 → -54
for (let faja = 1; faja <= 7; faja++) {
	const lon0 = -75 + faja * 3
	proj4.defs(
		`EPSG:${5342 + faja}`,
		`+proj=tmerc +lat_0=-90 +lon_0=${lon0} +k=1 +x_0=${faja}500000 +y_0=0 +ellps=GRS80 +units=m +no_defs`
	)
}
// UTM zonas 18S a 21S (EPSG:32718..32721)
for (let zone = 18; zone <= 21; zone++) {
	proj4.defs(`EPSG:327${zone}`, `+proj=utm +zone=${zone} +south +ellps=WGS84 +units=m +no_defs`)
}

export const PROJECTION_OPTIONS = [
	{ code: null, label: 'Ya está en lat/lng (WGS84)' },
	{ code: 'EPSG:5346', label: 'Gauss-Krüger faja 4 (POSGAR 07) — Córdoba, oeste de Santa Fe y Chaco' },
	{ code: 'EPSG:5347', label: 'Gauss-Krüger faja 5 (POSGAR 07) — este de Santa Fe, oeste de Bs. As. y Entre Ríos' },
	{ code: 'EPSG:5348', label: 'Gauss-Krüger faja 6 (POSGAR 07) — este de Bs. As. y Entre Ríos, Corrientes' },
	{ code: 'EPSG:5345', label: 'Gauss-Krüger faja 3 (POSGAR 07) — La Rioja, San Luis, oeste de Córdoba' },
	{ code: 'EPSG:5344', label: 'Gauss-Krüger faja 2 (POSGAR 07) — San Juan, Mendoza, Neuquén' },
	{ code: 'EPSG:5349', label: 'Gauss-Krüger faja 7 (POSGAR 07) — Misiones' },
	{ code: 'EPSG:32720', label: 'UTM zona 20 Sur (WGS84) — centro del país' },
	{ code: 'EPSG:32719', label: 'UTM zona 19 Sur (WGS84) — cuyo y oeste' },
	{ code: 'EPSG:32721', label: 'UTM zona 21 Sur (WGS84) — litoral este' },
]

/**
 * Convierte la red parseada (x/y crudos) a latitude/longitude.
 * @param {object} parsed - salida de parseInp
 * @param {string|null} epsg - código EPSG de origen, o null si ya es lat/lng
 */
export function toLatLng(parsed, epsg) {
	const convert = (x, y) => {
		if (!epsg) return { latitude: y, longitude: x }
		const [lng, lat] = proj4(epsg, 'EPSG:4326', [x, y])
		return { latitude: lat, longitude: lng }
	}

	const nodes = parsed.nodes.map(({ x, y, ...n }) => ({ ...n, ...convert(x, y) }))
	const links = parsed.links.map((l) => ({
		...l,
		vertices: (l.vertices || []).map((v) => convert(v.x, v.y)),
	}))

	const bad = nodes.find((n) => !Number.isFinite(n.latitude) || Math.abs(n.latitude) > 90 || !Number.isFinite(n.longitude) || Math.abs(n.longitude) > 180)
	if (bad) {
		throw new Error(
			`Las coordenadas convertidas del nodo ${bad.tag} quedaron fuera del mundo (lat ${bad.latitude?.toFixed?.(2)}). Probá con otro sistema de coordenadas.`
		)
	}

	return { ...parsed, nodes, links }
}
