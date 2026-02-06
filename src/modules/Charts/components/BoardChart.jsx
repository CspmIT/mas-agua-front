import { memo, useMemo } from 'react'
import { Card } from '@mui/material'
import { ChartComponentDbWrapper } from '../../home/components/ChartComponentDbWrapper'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
}


const formatValue = (value) => {
    if (value === null || value === undefined) return 'Sin Datos'
    if (typeof value === 'boolean') return value ? 'Encendido' : 'Apagado'
    if (typeof value === 'number')
        return Number.isFinite(value) ? Number(value.toFixed(2)) : '-'
    return String(value)
}

const formatUnit = (item) => {
    const unit = item?.InfluxVars?.unit
    return unit ? ` ${unit}` : ''
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

const LabelValueRow = ({ label, value, suffix }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-md text-slate-700">{label}</span>
        <span className="text-md font-semibold text-slate-900">
            {formatValue(value)}
            {suffix ?? ''}
        </span>
    </div>
)

const MetricChip = ({ label, value, suffix }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-md text-slate-700">{label}</span>
        <span className="text-md font-semibold text-slate-900">
            {formatValue(value)}
            {suffix ?? ''}
        </span>
    </div>
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

        const pumpingStatusColor =
            pumpingStatusText === 'ENCENDIDO'
                ? 'text-green-600'
                : pumpingStatusText === 'APAGADO'
                    ? 'text-red-600'
                    : 'text-slate-700'

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
                return <div className="text-sm text-slate-500">No hay gráfico seleccionado</div>
            }

            const ChartComponent = chartComponents[chart.type]
            if (!ChartComponent) {
                return (
                    <div className="text-sm text-red-500">
                        Tipo no soportado: <b>{chart.type}</b>
                    </div>
                )
            }

            return (
                <div className="flex flex-col justify-center w-full h-full">
                    <div className="text-center text-sm mb-2">{chart.name}</div>

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

        return (
            <Card
                sx={{
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    height: '100%',
                    width: '100%',
                }}
                className='!shadow-md !shadow-gray-400 pb-1'
            >
                {/* HEADER */}
                <div className="p-3 border-b bg-[#2c6aa0] border-slate-200 ">
                    <h1 className="text-xl leading-tight line-clamp-2 text-center text-white">
                        {title || 'Tablero'}
                    </h1>
                </div>

                <div className="p-2 flex flex-col gap-2">
                    {/* TOP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-white border-2 rounded-md p-1 h-[35dvh] flex items-center justify-center shadow-sm">
                            {renderTopChart(topLeftChart)}
                        </div>
                        <div className="bg-white border-2 rounded-md p-1 h-[35dvh] flex items-center justify-center shadow-sm">
                            {renderTopChart(topRightChart)}
                        </div>
                    </div>

                    {/* BOMBEO */}
                    <div className="bg-white rounded-lg">
                        <div className="px-3 py-1 !rounded-t-md bg-blue-200">
                            <span className="text-sm font-semibold">Bombeo</span>
                        </div>

                        <div className='border-x-2 border-b-2 rounded-b-lg pt-2'>
                            <div className="flex justify-center gap-2">
                                <span>{pumpingStatusLabel}:</span>
                                <span className={`font-bold ${pumpingStatusColor}`}>
                                    {pumpingStatusText}
                                </span>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 pt-1 px-3">
                                <div className="border rounded-lg p-3 shadow-sm">
                                    <LabelValueRow
                                        label={pumpingRuntimeLabel}
                                        value={resolveValue(pumpingRuntimeItem, inflValues)}
                                        suffix={formatUnit(pumpingRuntimeItem)}
                                    />
                                    <LabelValueRow
                                        label={pumpingStartsLabel}
                                        value={resolveValue(pumpingStartsItem, inflValues)}
                                        suffix={formatUnit(pumpingStartsItem)}
                                    />
                                </div>

                                <div className="border rounded-lg px-3 py-1 shadow-sm">
                                    <MetricChip
                                        label={pumpingL1Label}
                                        value={resolveValue(pumpingL1Item, inflValues)}
                                        suffix={formatUnit(pumpingL1Item) || ' A'}
                                    />
                                    <MetricChip
                                        label={pumpingL2Label}
                                        value={resolveValue(pumpingL2Item, inflValues)}
                                        suffix={formatUnit(pumpingL2Item) || ' A'}
                                    />
                                    <MetricChip
                                        label={pumpingL3Label}
                                        value={resolveValue(pumpingL3Item, inflValues)}
                                        suffix={formatUnit(pumpingL3Item) || ' A'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SALA */}
                    <div className="bg-white rounded-lg">
                        <div className="px-3 py-1 rounded-t-md bg-blue-200">
                            <span className="text-sm font-semibold">Sala</span>
                        </div>

                        <div className='border-x-2 border-b-2 rounded-b-lg'>
                            <div className="p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {roomItems.map((item, idx) => {
                                    const value = resolveValue(item, inflValues)
                                    return (
                                        <div key={idx} className="border rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-600">{item.label}</div>
                                            <div className="text-base font-semibold">
                                                {formatValue(value)}
                                                {formatUnit(item)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }
)

export default BoardChart
