import { memo, useMemo } from 'react'
import { ChartComponentDbWrapper } from '../../home/components/ChartComponentDbWrapper'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
}


const formatValue = (value) => {
    if (value === null || value === undefined) return 'Sin datos'
    if (typeof value === 'boolean') return value ? 'Encendido' : 'Apagado'
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : '-'
    return String(value)
}

const formatUnit = (item, value) => {
    if (value == 'Sin datos') return ''
    const unit = item?.InfluxVars?.unit
    if (!unit ) return ''
    if (unit.trim().toLowerCase() === 'bool') return ''
    return ` ${unit}`
  }

const resolveValue = (item, inflValues) => {
    if (!item) return null

    if (item.value !== null && item.value !== undefined) {
        return item.value
    }

    const influxId = item?.InfluxVars?.id
    if (influxId !== undefined && influxId !== null) {
        return inflValues?.[influxId] ?? null
    }

    return null
}

const normalizeInitialData = (chartDataArray) => {
    return chartDataArray.reduce((acc, item) => {
        acc[item.key] =
            item.value !== null
                ? item.value
                : {
                    ...item.InfluxVars,
                    label: item.label,
                }
        return acc
    }, {})
}

const normalizeChartProps = (chartConfig = []) => {
    return chartConfig.reduce((acc, item) => {
        if (!item?.key) return acc

        let value = item.value
        if (item.type === 'boolean') {
            value = Boolean(Number(item.value))
        }

        acc[item.key] = value
        return acc
    }, {})
}

// ── Primitivas visuales del nuevo estilo ──────────────────────────────────
// Reutilizan los tokens del módulo Assistant: navy #1f4e79, azul #368bed,
// verde de estado #10B981, superficies redondeadas, tipografía con tracking
// y tabular-nums, y variantes dark.

/** Etiqueta de sección: uppercase, tracking amplio, color de acento. */
const Eyebrow = ({ children }) => (
    <span className='text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#368bed] dark:text-[#7fb6ef]'>
        {children}
    </span>
)

/** Panel base con título tipo eyebrow y borde/superficie suaves. */
const SectionPanel = ({ title, action, children, className = '' }) => (
    <section
        className={`rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-[0_1px_3px_rgba(15,42,68,0.04),0_14px_34px_-26px_rgba(15,42,68,0.35)] overflow-hidden ${className}`}
    >
        <div className='flex items-center justify-between gap-2 px-3.5 py-1.5 border-b border-[#1f4e79]/8 dark:border-white/5'>
            <div className='flex items-center gap-2 min-w-0'>
                <span className='inline-block w-1.5 h-1.5 rounded-full bg-[#368bed]' aria-hidden />
                <Eyebrow>{title}</Eyebrow>
            </div>
            {action}
        </div>
        {children}
    </section>
)

/** Fila métrica: label a la izquierda, valor tabular a la derecha. */
const MetricRow = ({ label, value, suffix }) => (
    <div className='flex items-baseline justify-between gap-3 py-1'>
        <span className='text-[13px] text-slate-500 dark:text-slate-400 truncate'>{label}</span>
        <span className='text-[14px] font-semibold tabular-nums text-slate-800 dark:text-slate-100 shrink-0'>
            {formatValue(value)}
            {suffix ?? ''}
        </span>
    </div>
)

/** Tile compacto para los ítems de Sala. */
const RoomTile = ({ label, value, suffix }) => {
    const hasData = value !== null && value !== undefined && value !== 'Sin datos'
    return (
        <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.025] px-2.5 py-2 text-center transition-colors hover:border-[#368bed]/35 hover:bg-[#368bed]/[0.04]'>
            <div className='text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 truncate'>
                {label}
            </div>
            <div
                className={[
                    'mt-1 text-[18px] font-semibold tabular-nums leading-none',
                    hasData ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600',
                ].join(' ')}
            >
                {formatValue(value)}
                {suffix ?? ''}
            </div>
        </div>
    )
}

/** Pill protagonista del estado de bombeo. */
const StatusPill = ({ text }) => {
    const isOn = text === 'ENCENDIDO'
    const isOff = text === 'APAGADO'
    const tone = isOn
        ? 'bg-[#10B981]/12 border-[#10B981]/40 text-[#047857] dark:text-[#34d399]'
        : isOff
        ? 'bg-rose-500/10 border-rose-300/50 text-rose-600 dark:border-rose-500/30 dark:text-rose-300'
        : 'bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
    const dot = isOn ? 'bg-[#10B981]' : isOff ? 'bg-rose-500' : 'bg-slate-400'
    return (
        <span
            className={`inline-flex items-center gap-1.5 pl-2 pr-3 h-7 rounded-full border text-[12px] font-semibold tracking-tight ${tone}`}
        >
            <span className='relative flex w-2 h-2'>
                {isOn && (
                    <span className='absolute inline-flex w-full h-full rounded-full bg-[#10B981]/40 animate-ping' />
                )}
                <span className={`relative inline-flex w-2 h-2 rounded-full ${dot}`} />
            </span>
            {text}
        </span>
    )
}

/** Indicador "en vivo" del header (refresh cada 30s). */
const LiveBadge = () => (
    <span className='inline-flex items-center gap-1.5 h-6 pl-2 pr-2.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm'>
        <span className='relative flex w-1.5 h-1.5'>
            <span className='absolute inline-flex w-full h-full rounded-full bg-white/70 animate-ping' />
            <span className='relative inline-flex w-1.5 h-1.5 rounded-full bg-white' />
        </span>
        En vivo
    </span>
)

const BoardChart = memo(
    ({
        title,
        inflValues = {},

        topLeftChart = null,
        topRightChart = null,

        ChartData = [],
        ChartConfig = [],
    }) => {

        const cfg = useMemo(() => normalizeChartProps(ChartConfig), [ChartConfig])

        const dataByKey = useMemo(() => {
            const map = new Map()
                ; (ChartData || []).forEach((item) => {
                    if (!item?.key) return
                    map.set(item.key, item)
                })
            return map
        }, [ChartData])

        const getItem = (key) => {
            if (!key) return null
            return dataByKey.get(key) || null
        }

        const pumpingStatusItem = getItem('board.pumping.status')
        const pumpingRuntimeItem = getItem('board.pumping.runtime')
        const pumpingStartsItem = getItem('board.pumping.starts')
        const pumpingL1Item = getItem('board.pumping.currentL1')
        const pumpingL2Item = getItem('board.pumping.currentL2')
        const pumpingL3Item = getItem('board.pumping.currentL3')

        const pumpingStatusValue = resolveValue(pumpingStatusItem, inflValues)

        const pumpingStatusText =
            typeof pumpingStatusValue === 'boolean'
                ? pumpingStatusValue
                    ? 'ENCENDIDO'
                    : 'APAGADO'
                : formatValue(pumpingStatusValue)

        const pumpingStatusLabel = cfg['board.pumping.status.label'] ?? 'Estado'

        // Labels fallback desde config si todavía no hay ChartData
        const pumpingRuntimeLabel =
            pumpingRuntimeItem?.label ?? cfg['board.pumping.runtime.label'] ?? '-'
        const pumpingStartsLabel =
            pumpingStartsItem?.label ?? cfg['board.pumping.starts.label'] ?? '-'
        const pumpingL1Label =
            pumpingL1Item?.label ?? cfg['board.pumping.currentL1.label'] ?? '-'
        const pumpingL2Label =
            pumpingL2Item?.label ?? cfg['board.pumping.currentL2.label'] ?? '-'
        const pumpingL3Label =
            pumpingL3Item?.label ?? cfg['board.pumping.currentL3.label'] ?? '-'

        const roomItems = useMemo(() => {
            const arr = []
            for (let i = 0; i < 4; i++) {
                const key = `board.room.item${i}`
                const item = getItem(key)

                if (item) {
                    arr.push(item)
                    continue
                }

                // Fallback virtual desde config
                arr.push({
                    key,
                    value: null,
                    label: cfg[`board.room.item${i}.label`] ?? `Item ${i + 1}`,
                    InfluxVars: cfg[`board.room.item${i}.key`]
                        ? { id: cfg[`board.room.item${i}.key`] }
                        : null,
                })
            }
            return arr
        }, [ChartData, ChartConfig])

        const renderTopChart = (chart) => {
            if (!chart) {
                return (
                    <div className='text-[12.5px] text-slate-400 dark:text-slate-500 italic'>
                        No hay gráfico seleccionado
                    </div>
                )
            }

            const ChartComponent = chartComponents[chart.type]
            if (!ChartComponent) {
                return (
                    <div className='text-[12.5px] text-rose-500 dark:text-rose-400'>
                        Tipo no soportado: <b>{chart.type}</b>
                    </div>
                )
            }

            return (
                <div className='flex flex-col justify-center w-full h-full'>
                    <div className='text-center mb-1'>
                        <Eyebrow>{chart.name}</Eyebrow>
                    </div>

                    <ChartComponentDbWrapper
                        chartId={chart.id}
                        ChartComponent={ChartComponent}
                        initialProps={normalizeChartProps(chart.ChartConfig || [])}
                        initialData={normalizeInitialData(chart.ChartData || [])}
                        inflValues={inflValues}
                    />
                </div>
            )
        }

        // Altura bloqueada a ~una pantalla para que el tablero entre completo en 720p.
        // El offset (~100px) cubre el navbar (pt-16 = 64px) + el gutter superior del
        // Grid, dejando un respiro abajo. La fila de charts es flex-1 y absorbe todo el
        // espacio restante; Bombeo/Sala conservan su alto natural. Subir/bajar el offset
        // es el único dial: menos px = charts más grandes (con menos respiro abajo).
        return (
            <div className='w-full md:h-[calc(100dvh-100px)] min-h-[420px] rounded-3xl border border-[#1f4e79]/8 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-[0_2px_8px_rgba(15,42,68,0.05),0_24px_56px_-30px_rgba(15,42,68,0.28)] overflow-hidden flex flex-col'>
                {/* HEADER */}
                <div className='relative px-3.5 py-2.5 bg-gradient-to-br from-[#2c6aa0] to-[#1f4e79] overflow-hidden'>
                    {/* Textura de puntos sutil */}
                    <div
                        className='pointer-events-none absolute inset-0 opacity-[0.12]'
                        aria-hidden
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                            maskImage: 'radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.8), transparent 70%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.8), transparent 70%)',
                        }}
                    />
                    <div className='relative flex items-center justify-between gap-3'>
                        <h1 className='text-[16px] font-medium tracking-tight leading-tight line-clamp-2 text-white'>
                            {title || 'Tablero'}
                        </h1>
                    </div>
                </div>

                <div className='p-2.5 flex flex-col gap-2 md:flex-1 md:min-h-0'>
                    {/* TOP — gráficos (absorben el espacio vertical sobrante) */}
                    <div className='flex flex-col md:flex-row gap-2 md:flex-1 md:min-h-0'>
                        {[topLeftChart, topRightChart].map((chart, idx) => (
                            <div
                                key={idx}
                                className='h-[220px] md:h-auto md:flex-1 min-w-0 md:min-h-0 overflow-hidden rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900/40 dark:to-slate-900/10 shadow-[0_1px_3px_rgba(15,42,68,0.04),0_12px_30px_-22px_rgba(15,42,68,0.30)] p-1.5 flex items-center justify-center'
                            >
                                {renderTopChart(chart)}
                            </div>
                        ))}
                    </div>

                    {/* BOMBEO */}
                    <SectionPanel
                        title='Bombeo'
                        action={
                            <div className='flex items-center gap-2 min-w-0'>
                                <span className='hidden sm:inline text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate'>
                                    {pumpingStatusLabel}
                                </span>
                                <StatusPill text={pumpingStatusText} />
                            </div>
                        }
                    >
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3'>
                            <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-1 divide-y divide-[#1f4e79]/8 dark:divide-white/5'>
                                <MetricRow
                                    label={pumpingRuntimeLabel}
                                    value={resolveValue(pumpingRuntimeItem, inflValues)}
                                    suffix={formatUnit(pumpingRuntimeItem)}
                                />
                                <MetricRow
                                    label={pumpingStartsLabel}
                                    value={resolveValue(pumpingStartsItem, inflValues)}
                                    suffix={formatUnit(pumpingStartsItem)}
                                />
                            </div>

                            <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-1 divide-y divide-[#1f4e79]/8 dark:divide-white/5'>
                                <MetricRow
                                    label={pumpingL1Label}
                                    value={resolveValue(pumpingL1Item, inflValues)}
                                    suffix={formatUnit(pumpingL1Item)}
                                />
                                <MetricRow
                                    label={pumpingL2Label}
                                    value={resolveValue(pumpingL2Item, inflValues)}
                                    suffix={formatUnit(pumpingL2Item)}
                                />
                                <MetricRow
                                    label={pumpingL3Label}
                                    value={resolveValue(pumpingL3Item, inflValues)}
                                    suffix={formatUnit(pumpingL3Item)}
                                />
                            </div>
                        </div>
                    </SectionPanel>

                    {/* SALA */}
                    <SectionPanel title='Sala'>
                        <div className='p-2.5 grid grid-cols-2 md:grid-cols-4 gap-2'>
                            {roomItems.map((item, idx) => {
                                const value = resolveValue(item, inflValues)
                                return (
                                    <RoomTile
                                        key={idx}
                                        label={item.label}
                                        value={value}
                                        suffix={formatUnit(item, value)}
                                    />
                                )
                            })}
                        </div>
                    </SectionPanel>
                </div>
            </div>
        )
    }
)

export default BoardChart
