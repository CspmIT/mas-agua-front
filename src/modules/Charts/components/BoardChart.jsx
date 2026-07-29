import { memo, useMemo, useState } from 'react'
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
    if (value === null || value === undefined || value === 'Sin datos') return ''
    const unit = item?.InfluxVars?.unit
    if (!unit ) return ''
    const clean = unit.trim().toLowerCase()
    if (clean === 'bool' || clean === '-' || clean === '') return ''
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

/** Flecha de sección colapsable. */
const Chevron = ({ open }) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2.4}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
        <path d='M6 9l6 6 6-6' />
    </svg>
)

/** Panel base con título tipo eyebrow, colapsable desde el header. */
const SectionPanel = ({ title, action, children, defaultOpen = true, className = '' }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <section
            className={`rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-[0_1px_3px_rgba(15,42,68,0.04),0_14px_34px_-26px_rgba(15,42,68,0.35)] overflow-hidden ${className}`}
        >
            <button
                type='button'
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-1.5 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-[#368bed]/[0.04] ${
                    open ? 'border-b border-solid border-[#1f4e79]/8 dark:border-white/5' : ''
                }`}
            >
                <div className='flex items-center gap-2 min-w-0'>
                    <span className='inline-block w-1.5 h-1.5 rounded-full bg-[#368bed]' aria-hidden />
                    <Eyebrow>{title}</Eyebrow>
                </div>
                <div className='flex items-center gap-2 min-w-0'>
                    {action}
                    <Chevron open={open} />
                </div>
            </button>
            {/* Colapso por max-height: la transición de grid-template-rows con fr
                queda colgada en Chromium embebido, así que no usamos ese truco. */}
            <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                    open ? 'max-h-[1200px]' : 'max-h-0'
                }`}
            >
                {children}
            </div>
        </section>
    )
}

/** Convierte #rrggbb + alpha (0..1) en hex de 8 dígitos. */
const hexA = (hex, alpha) =>
    `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`

const ICON_PATHS = {
    bolt: <polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2' />,
    wifi: (
        <>
            <path d='M5 12.55a11 11 0 0 1 14.08 0' />
            <path d='M1.42 9a16 16 0 0 1 21.16 0' />
            <path d='M8.53 16.11a6 6 0 0 1 6.95 0' />
            <line x1='12' y1='20' x2='12.01' y2='20' />
        </>
    ),
    thermo: <path d='M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z' />,
    drop: <path d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' />,
    clock: (
        <>
            <circle cx='12' cy='12' r='10' />
            <polyline points='12 6 12 12 16 14' />
        </>
    ),
    cycle: (
        <>
            <polyline points='23 4 23 10 17 10' />
            <path d='M20.49 15a9 9 0 1 1-2.12-9.36L23 10' />
        </>
    ),
    activity: <polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />,
}

const TileIcon = ({ name, className = 'w-4 h-4' }) => (
    <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}
    >
        {ICON_PATHS[name] ?? ICON_PATHS.activity}
    </svg>
)

/** Chip cuadrado con tinte: contiene un ícono o un texto corto (L1/L2/L3). */
const IconChip = ({ tint, small = false, children }) => (
    <span
        className={[
            'grid place-items-center shrink-0 font-bold',
            small ? 'w-6 h-6 rounded-lg text-[10px]' : 'w-7 h-7 rounded-[9px] text-[11px]',
            !tint ? 'bg-slate-400/10 text-slate-300 dark:bg-white/5 dark:text-slate-600' : '',
        ].join(' ')}
        style={tint ? { backgroundColor: hexA(tint, 0.15), color: tint } : undefined}
    >
        {children}
    </span>
)

// Identidad visual de cada ítem de Sala, resuelta por heurística sobre el label.
const resolveRoomVisual = (label = '') => {
    const l = String(label)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
    if (/energ/.test(l)) return { tint: '#f59e0b', icon: 'bolt' }
    if (/conect|senal|internet/.test(l)) return { tint: '#10B981', icon: 'wifi' }
    if (/temp/.test(l)) return { tint: '#f97316', icon: 'thermo', meter: 'temp' }
    if (/hum/.test(l)) return { tint: '#0ea5e9', icon: 'drop', meter: 'progress' }
    return { tint: '#368bed', icon: 'activity' }
}

const TEMP_METER_MAX = 40

const clampPct = (num, max) => `${(Math.min(Math.max(num, 0), max) / max) * 100}%`

/** Fila métrica: chip de color + label a la izquierda, valor tabular a la derecha. */
const MetricRow = ({ label, value, suffix, tint, icon, chipText }) => {
    const hasData = value !== null && value !== undefined && value !== 'Sin datos'
    return (
        <div className='flex items-center gap-2.5 py-1'>
            <IconChip tint={tint} small>
                {chipText ?? <TileIcon name={icon} className='w-3.5 h-3.5' />}
            </IconChip>
            <span className='flex-1 min-w-0 text-[13px] text-slate-500 dark:text-slate-400 truncate'>{label}</span>
            <span
                className={[
                    'text-[14px] font-semibold tabular-nums shrink-0',
                    hasData ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600',
                ].join(' ')}
            >
                {formatValue(value)}
                {hasData && suffix ? (
                    <span className='ml-0.5 text-[11px] text-slate-400 dark:text-slate-500'>{suffix.trim()}</span>
                ) : null}
            </span>
        </div>
    )
}

/** Tile de Sala: chip identitario, valor protagonista y medidor según variable. */
const RoomTile = ({ label, value, suffix }) => {
    const hasData = value !== null && value !== undefined && value !== 'Sin datos'
    const { tint, icon, meter } = resolveRoomVisual(label)
    const isBool = typeof value === 'boolean'
    const boolOn = isBool && value === true
    const num = typeof value === 'number' && Number.isFinite(value) ? value : null

    const valueClass = !hasData
        ? 'text-[17px] text-slate-300 dark:text-slate-600'
        : isBool
        ? boolOn
            ? 'text-[19px] text-[#047857] dark:text-[#34d399]'
            : 'text-[19px] text-[#be123c] dark:text-[#fb7185]'
        : 'text-[21px] text-slate-800 dark:text-slate-100'

    return (
        <div
            className={[
                'relative overflow-hidden rounded-xl border bg-white dark:bg-white/[0.025] px-3 py-2',
                'transition-transform duration-150 hover:-translate-y-px',
                hasData
                    ? 'border-[#1f4e79]/10 dark:border-white/10'
                    : 'border-dashed border-[#1f4e79]/15 dark:border-white/15',
            ].join(' ')}
        >
            {/* Lavado de color en la esquina superior izquierda */}
            {hasData && (
                <div
                    className='pointer-events-none absolute inset-0'
                    aria-hidden
                    style={{
                        background: `radial-gradient(120% 90% at 0% 0%, ${hexA(tint, 0.12)}, transparent 60%)`,
                    }}
                />
            )}

            <div className='relative flex items-center gap-2'>
                <IconChip tint={hasData ? tint : null}>
                    <TileIcon name={icon} />
                </IconChip>
                <span className='text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 dark:text-slate-500 truncate'>
                    {label}
                </span>
            </div>

            <div className={`relative mt-1.5 flex items-baseline leading-none font-semibold tabular-nums ${valueClass}`}>
                {isBool && (
                    <span className='relative flex w-2 h-2 mr-1.5 self-center'>
                        {boolOn && (
                            <span className='absolute inline-flex w-full h-full rounded-full bg-[#10B981]/40 animate-ping' />
                        )}
                        <span
                            className={`relative inline-flex w-2 h-2 rounded-full ${boolOn ? 'bg-[#10B981]' : 'bg-rose-500'}`}
                        />
                    </span>
                )}
                {formatValue(value)}
                {hasData && suffix ? (
                    <span className='ml-1 text-[12.5px] font-semibold text-slate-400 dark:text-slate-500'>
                        {suffix.trim()}
                    </span>
                ) : null}
            </div>

            {/* Medidor: escala frío→calor para temperatura, progreso 0-100 para humedad */}
            {meter === 'temp' && num !== null && (
                <div className='relative mt-1.5'>
                    <div
                        className='relative h-1 rounded-full opacity-80'
                        style={{ background: 'linear-gradient(90deg, #38bdf8, #34d399 35%, #fbbf24 65%, #ef4444)' }}
                    >
                        <span
                            className='absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 shadow -translate-x-1/2 -translate-y-1/2'
                            style={{ left: clampPct(num, TEMP_METER_MAX), border: `2.5px solid ${tint}` }}
                        />
                    </div>
                    <div className='mt-0.5 flex justify-between text-[9.5px] font-medium tabular-nums text-slate-300 dark:text-slate-600'>
                        <span>0°</span>
                        <span>{TEMP_METER_MAX}°</span>
                    </div>
                </div>
            )}
            {meter === 'progress' && num !== null && (
                <div className='relative mt-1.5'>
                    <div className='h-1 rounded-full bg-slate-500/15 dark:bg-white/10 overflow-hidden'>
                        <div
                            className='h-full rounded-full'
                            style={{
                                width: clampPct(num, 100),
                                background: `linear-gradient(90deg, ${hexA(tint, 0.7)}, ${tint})`,
                            }}
                        />
                    </div>
                    <div className='mt-0.5 flex justify-between text-[9.5px] font-medium tabular-nums text-slate-300 dark:text-slate-600'>
                        <span>0</span>
                        <span>100</span>
                    </div>
                </div>
            )}
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
        const pumpingRuntimeValue = resolveValue(pumpingRuntimeItem, inflValues)
        const pumpingStartsValue = resolveValue(pumpingStartsItem, inflValues)
        const pumpingL1Value = resolveValue(pumpingL1Item, inflValues)
        const pumpingL2Value = resolveValue(pumpingL2Item, inflValues)
        const pumpingL3Value = resolveValue(pumpingL3Item, inflValues)

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

        // Minivista de pozo: altura natural (la página scrollea). Deja de bloquearse
        // a una pantalla porque el tablero ahora crece con drawers y minigráficos.
        return (
            <div className='w-full rounded-3xl border border-[#1f4e79]/8 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-[0_2px_8px_rgba(15,42,68,0.05),0_24px_56px_-30px_rgba(15,42,68,0.28)] overflow-hidden'>
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

                {/* Layout minivista: columna principal a la izquierda; la columna
                    derecha de minigráficos históricos se suma en la fase 1b. */}
                <div className='p-2.5 grid grid-cols-1 gap-2.5'>
                    <div className='flex flex-col gap-2 min-w-0'>
                    {/* TOP — gráficos de valor actual */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        {[topLeftChart, topRightChart].map((chart, idx) => (
                            <div
                                key={idx}
                                className='h-[260px] min-w-0 overflow-hidden rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900/40 dark:to-slate-900/10 shadow-[0_1px_3px_rgba(15,42,68,0.04),0_12px_30px_-22px_rgba(15,42,68,0.30)] p-1.5 flex items-center justify-center'
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
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 p-2'>
                            <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-0.5 divide-y divide-[#1f4e79]/8 dark:divide-white/5'>
                                <MetricRow
                                    tint='#368bed'
                                    icon='clock'
                                    label={pumpingRuntimeLabel}
                                    value={pumpingRuntimeValue}
                                    suffix={formatUnit(pumpingRuntimeItem, pumpingRuntimeValue)}
                                />
                                <MetricRow
                                    tint='#8b5cf6'
                                    icon='cycle'
                                    label={pumpingStartsLabel}
                                    value={pumpingStartsValue}
                                    suffix={formatUnit(pumpingStartsItem, pumpingStartsValue)}
                                />
                            </div>

                            <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-0.5 divide-y divide-[#1f4e79]/8 dark:divide-white/5'>
                                <MetricRow
                                    tint='#6366f1'
                                    chipText='L1'
                                    label={pumpingL1Label}
                                    value={pumpingL1Value}
                                    suffix={formatUnit(pumpingL1Item, pumpingL1Value)}
                                />
                                <MetricRow
                                    tint='#6366f1'
                                    chipText='L2'
                                    label={pumpingL2Label}
                                    value={pumpingL2Value}
                                    suffix={formatUnit(pumpingL2Item, pumpingL2Value)}
                                />
                                <MetricRow
                                    tint='#6366f1'
                                    chipText='L3'
                                    label={pumpingL3Label}
                                    value={pumpingL3Value}
                                    suffix={formatUnit(pumpingL3Item, pumpingL3Value)}
                                />
                            </div>
                        </div>
                    </SectionPanel>

                    {/* SALA */}
                    <SectionPanel title='Sala'>
                        <div className='p-2 grid grid-cols-2 md:grid-cols-4 gap-2'>
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
            </div>
        )
    }
)

export default BoardChart
