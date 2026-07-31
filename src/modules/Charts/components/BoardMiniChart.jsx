import { memo, useMemo } from 'react'
import LineChart from './LineChart'
import { useLineChartData } from '../../../hooks/useLineChartData'

// Último valor no nulo de la primera serie, para mostrarlo en el header.
const lastValueOf = (chartData) => {
    const serie = chartData?.ySeries?.[0]
    const data = serie?.data
    if (!Array.isArray(data)) return null
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] !== null && data[i] !== undefined) return data[i]
    }
    return null
}

/**
 * Minigráfico histórico para la columna derecha del BoardChart.
 * Renderiza un chart tipo LineChart existente (elegido en la config del
 * tablero) con el hook de series que ya usa el dashboard/home.
 */
const BoardMiniChart = memo(({ chart }) => {
    const { loader, chartData, handleZoomRange, handleRestore } = useLineChartData(
        chart,
        { refreshMs: 30000 }
    )

    const last = useMemo(() => lastValueOf(chartData), [chartData])
    const unit = chartData?.ySeries?.[0]?.idVar?.unit ?? ''
    const cleanUnit = typeof unit === 'string' && unit.trim().toLowerCase() !== 'bool' ? unit.trim() : ''

    return (
        <div className='flex-1 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-white/[0.02] shadow-[0_1px_3px_rgba(15,42,68,0.04),0_12px_30px_-22px_rgba(15,42,68,0.30)] overflow-hidden flex flex-col'>
            <div className='flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-[#1f4e79]/8 dark:border-white/5'>
                <span className='inline-flex items-center rounded-full bg-gradient-to-r from-[#12456f] to-[#1f5f95] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.11em] text-white truncate'>
                    {chart.name}
                </span>
                {last !== null && (
                    <span className='shrink-0 text-[15px] font-semibold tabular-nums text-slate-800 dark:text-slate-100'>
                        {Number(parseFloat(Number(last).toFixed(2)))}
                        {cleanUnit && (
                            <span className='ml-1 text-[11px] font-medium text-slate-400 dark:text-slate-500'>
                                {cleanUnit}
                            </span>
                        )}
                    </span>
                )}
            </div>
            <div className='flex-1 min-h-[150px] px-1 pb-1'>
                {loader ? (
                    <div className='flex h-full items-center justify-center text-[12px] text-slate-400 dark:text-slate-500'>
                        Cargando serie...
                    </div>
                ) : (
                    <LineChart
                        yType='value'
                        compact
                        xSeries={chartData?.xSeries || []}
                        ySeries={chartData?.ySeries || []}
                        onZoomRange={handleZoomRange}
                        onRestore={handleRestore}
                    />
                )}
            </div>
        </div>
    )
})

export default BoardMiniChart
