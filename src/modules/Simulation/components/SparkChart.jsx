import { useRef } from 'react'
import { formatSimTime } from '../lib/simTime'

const W = 248
const H = 88
const PAD = { top: 10, right: 8, bottom: 16, left: 8 }

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/**
 * Gráfico compacto SVG (sin dependencias) de la serie temporal de un elemento.
 * Marca el paso de tiempo activo y permite saltar a otro con un clic.
 */
const SparkChart = ({ label, unit, times, values, currentIndex, onPointClick }) => {
    const svgRef = useRef(null)
    if (!values || values.length < 2) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1

    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    const x = (i) => PAD.left + (plotW * i) / (values.length - 1)
    const y = (v) => PAD.top + plotH - ((v - min) / span) * plotH

    const linePoints = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
    const areaPoints = `${PAD.left},${PAD.top + plotH} ${linePoints} ${PAD.left + plotW},${PAD.top + plotH}`

    const onClick = (event) => {
        if (!onPointClick || !svgRef.current) return
        const rect = svgRef.current.getBoundingClientRect()
        const px = ((event.clientX - rect.left) / rect.width) * W
        const i = Math.round(((px - PAD.left) / plotW) * (values.length - 1))
        onPointClick(Math.max(0, Math.min(values.length - 1, i)))
    }

    return (
        <div className='mt-2'>
            <div className='flex items-baseline justify-between'>
                <span className='text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500'>
                    {label} ({unit})
                </span>
                <span className='text-sm font-semibold text-[#368bed] dark:text-[#5ea5f0]'>
                    {numberFormat.format(values[currentIndex])}
                </span>
            </div>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className='w-full cursor-pointer select-none'
                onClick={onClick}
            >
                <polygon points={areaPoints} fill='rgba(54, 139, 237, 0.12)' />
                <polyline points={linePoints} fill='none' stroke='#368bed' strokeWidth='1.8' strokeLinejoin='round' />
                {/* Marcador del paso activo */}
                <line
                    x1={x(currentIndex)}
                    y1={PAD.top}
                    x2={x(currentIndex)}
                    y2={PAD.top + plotH}
                    stroke='#d8621d'
                    strokeWidth='1'
                    strokeDasharray='3 2'
                />
                <circle cx={x(currentIndex)} cy={y(values[currentIndex])} r='3.2' fill='#d8621d' stroke='#fff' strokeWidth='1.2' />
                {/* Etiquetas de tiempo y rango */}
                <text x={PAD.left} y={H - 3} fontSize='8.5' fill='#94a3b8'>
                    {formatSimTime(times[0])}
                </text>
                <text x={W - PAD.right} y={H - 3} fontSize='8.5' fill='#94a3b8' textAnchor='end'>
                    {formatSimTime(times[times.length - 1])} hs
                </text>
                <text x={PAD.left} y={PAD.top - 2} fontSize='8.5' fill='#94a3b8'>
                    máx {numberFormat.format(max)}
                </text>
                <text x={W - PAD.right} y={PAD.top - 2} fontSize='8.5' fill='#94a3b8' textAnchor='end'>
                    mín {numberFormat.format(min)}
                </text>
            </svg>
        </div>
    )
}

export default SparkChart
