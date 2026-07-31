import { memo } from 'react'
import LineChart from './LineChart'
import FiltersChart from './FiltersChart'
import GralfChart from './GralfChart'
import { useLineChartData } from '../../../hooks/useLineChartData'

/**
 * Panel de histórico dentro del drawer: filtros de rango/muestreo + LineChart
 * completo (con eje X y slider). `active` pausa el polling cuando el drawer
 * está cerrado, así los tableros no consultan Influx por gráficos que no se ven.
 */
const BoardHistoryPanel = ({ chart, active }) => {
    const { loader, chartData, setFilters, handleZoomRange, handleRestore } =
        useLineChartData(chart, { active, refreshMs: 30000 })

    return (
        <div className='rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-white/[0.02] shadow-[0_1px_3px_rgba(15,42,68,0.04),0_12px_30px_-22px_rgba(15,42,68,0.30)] p-2.5 flex flex-col gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
                <span className='inline-flex items-center rounded-full bg-gradient-to-r from-[#12456f] to-[#1f5f95] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.11em] text-white truncate'>
                    {chart.name}
                </span>
            </div>

            <FiltersChart id_chart={chart.id} setFilters={setFilters} compact />

            <div className='h-[280px]'>
                {loader ? (
                    <div className='flex h-full items-center justify-center text-[12px] text-slate-400 dark:text-slate-500'>
                        Cargando serie...
                    </div>
                ) : (
                    <LineChart
                        yType='value'
                        xSeries={chartData?.xSeries || []}
                        ySeries={chartData?.ySeries || []}
                        onZoomRange={handleZoomRange}
                        onRestore={handleRestore}
                    />
                )}
            </div>
        </div>
    )
}

/**
 * Drawer colapsable de históricos asociados a un elemento del tablero.
 * Renderiza un panel por cada gráfico asociado: LineChart con filtros, o la
 * tarjeta Gralf de energía si el gráfico asociado es de ese tipo.
 */
const BoardHistoryDrawer = memo(({ open, charts = [] }) => {
    if (!charts.length) return null
    return (
        <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                open ? 'max-h-[4000px]' : 'max-h-0'
            }`}
        >
            <div className='flex flex-col gap-2 pt-2'>
                {charts.map((chart) => {
                    if (chart.type === 'GralfChart') {
                        const varId = (chart.ChartData || []).find(
                            (d) => d.key === 'value'
                        )?.InfluxVars?.id
                        return (
                            <GralfChart
                                key={chart.id}
                                varId={varId}
                                title={chart.name}
                                active={open}
                            />
                        )
                    }
                    return <BoardHistoryPanel key={chart.id} chart={chart} active={open} />
                })}
            </div>
        </div>
    )
})

export default BoardHistoryDrawer
