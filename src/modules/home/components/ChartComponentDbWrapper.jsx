import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PumpControl from '../../Charts/views/ConfigBombs'
import LiquidFillBottomInfo from './LiquidFillBottomInfo'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import MultipleBooleanChart from '../../Charts/components/MultipleBooleanChart'
import { Chart } from 'highcharts'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import GaugeSpeed from '../../Charts/components/GaugeSpeed'

const BOTTOM_KEYS = ['bottom1', 'bottom2', 'bottom3', 'bottom4', 'bottom5', 'bottom6']

export const ChartComponentDbWrapper = ({
    chartId,
    ChartComponent,
    initialProps,
    initialData,
    inflValues,
}) => {

    const [chartData, setChartData] = useState(initialData)
    const [LiquidButtomData, setLiquidButtomData] = useState({})
    const [loading, setLoading] = useState(true)
    const isLiquidFill =
        ChartComponent === LiquidFillPorcentaje ||
        ChartComponent === CirclePorcentaje ||
        ChartComponent === GaugeSpeed

    // Extrae valor simple desde inflValues (gráficos normales)
    const resolveSimpleValue = (influxVar) => {
        if (!influxVar?.id) return null
        return inflValues[influxVar.id] ?? null
    }

    // PumpControl: resuelve múltiples valores
    const resolvePumpOrState = (items) => {
        return items.map((item) => {
            const id = item.varId
            return {
                ...item,
                value: inflValues[id] ?? 'Sin datos'
            }
        })
    }

    const resolveLiquidProps = (data) => {
        const result = { ...data }

        const slots = ['value', 'secondary', 'bottom1', 'bottom2', 'bottom3', 'bottom4', 'bottom5', 'bottom6', 'maxValue']

        slots.forEach((k) => {
            const infl = data[k]
            if (!infl?.id) {
                result[k] = infl ?? ''
                return
            }

            result[k] = {
                ...infl,
                value: inflValues[infl.id] ?? 0,
            }
        })
        return result
    }

    const resolveMultipleBooleanItems = (items) => {
        return items.map((item) => {
            const infl = item.influxVar
            const value = infl?.id ? inflValues[infl.id] ?? 'Sin datos' : 'Sin datos'
            return {
                ...item,
                value,
            }
        })
    }

    useEffect(() => {

        if (!inflValues || Object.keys(inflValues).length === 0) return

        if (ChartComponent === PumpControl) {
            const updatedPumps = resolvePumpOrState(initialData.initialPumps)
            const updatedStates = resolvePumpOrState(initialData.initialStates)

            setChartData({
                ...initialData,
                initialPumps: updatedPumps,
                initialStates: updatedStates,
            })

            setLoading(false)
            return
        }
        // adapter por slots
        if (isLiquidFill) {
            const multipleValues = resolveLiquidProps(initialData)
            setChartData({ ...initialData, multipleValues })
            setLiquidButtomData(multipleValues)
            setLoading(false)
            return
        }

        if (ChartComponent === MultipleBooleanChart) {
            const resolvedItems = resolveMultipleBooleanItems(initialData.items)
            setChartData({
                items: resolvedItems,
            })
            setLoading(false)
            return
        }

        if (initialData?.value?.id) {
            const value = resolveSimpleValue(initialData.value)
            setChartData({ ...initialData, value })
            setLoading(false)
        }

    }, [inflValues])


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <img
                    src={logo}
                    alt="Logo"
                    className="w-20 h-20 filter grayscale animate-pulse"
                />
                <Typography
                    variant="subtitle1"
                    align="center"
                    className="mt-3 text-gray-500"
                >
                    Cargando datos...
                </Typography>
            </div>
        )
    }

    if (!isLiquidFill) {
        return <ChartComponent {...initialProps} {...chartData} />
    } else {

        return (
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 flex items-center justify-center">
                    <ChartComponent {...initialProps} {...chartData} />
                </div>
                <div className='w-full px-1 flex items-center justify-center'>
                    <LiquidFillBottomInfo
                        items={BOTTOM_KEYS
                            .map(key => LiquidButtomData?.[key])
                            .filter(item => item?.id)
                        }
                        chart={ChartComponent}
                    />
                </div>
            </div>
        )
    }

}
