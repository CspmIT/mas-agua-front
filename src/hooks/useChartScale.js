import { useEffect, useRef, useState } from 'react'

// Tamaño de card a partir del cual el gráfico se ve a escala completa (k = 1)
const BASE_SIZE = 260

// Escala mínima: por debajo de este factor las medidas dejan de achicarse
const MIN_K = 0.45

// Debajo de este factor el gráfico pasa a modo compacto (menos detalle visual)
const COMPACT_K = 0.72

// Mide la card que contiene al gráfico y devuelve un factor de escala k para
// multiplicar las medidas fijas de ECharts (anillos, agujas, fuentes). En cards
// grandes k = 1 y el gráfico se ve igual que siempre; en cards chicas todo se
// reduce en proporción y `compact` habilita simplificar el dibujo.
// `heightBias` compensa gráficos que no usan todo el alto (ej: arco de gauge).
export default function useChartScale({ heightBias = 1 } = {}) {
	const ref = useRef(null)
	const [size, setSize] = useState({ width: 0, height: 0 })

	useEffect(() => {
		if (!ref.current || typeof ResizeObserver === 'undefined') return

		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect
			setSize(prev =>
				prev.width === width && prev.height === height
					? prev
					: { width, height }
			)
		})

		observer.observe(ref.current)
		return () => observer.disconnect()
	}, [])

	const base = Math.min(
		size.width || BASE_SIZE,
		(size.height || BASE_SIZE) * heightBias
	)
	const k = Math.max(MIN_K, Math.min(1, base / BASE_SIZE))

	// Escala suave para los valores numéricos: se achican a la mitad del ritmo
	// del dibujo, así siguen legibles en cards chicas (k=0.45 → kSoft≈0.73)
	const kSoft = 0.5 + 0.5 * k

	return {
		ref,
		k,
		kSoft,
		compact: k < COMPACT_K,
		width: size.width,
		height: size.height,
	}
}
