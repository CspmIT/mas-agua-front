import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PumpControl from '../../Charts/views/ConfigBombs'
import LiquidFillBottomInfo from './LiquidFillBottomInfo'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import MultipleBooleanChart from '../../Charts/components/MultipleBooleanChart'
import { Chart } from 'highcharts'

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
    const isLiquidPorcentaje = ChartComponent === LiquidFillPorcentaje

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

        const slots = ['value', 'secondary', 'bottom1', 'bottom2', 'maxValue']

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

        // 1) PumpControl — igual que antes
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
        // 2) LIQUID — adapter por slots
        if (isLiquidPorcentaje) {
            const multipleValues = resolveLiquidProps(initialData)
            setChartData({ ...initialData, multipleValues })
            setLiquidButtomData(multipleValues)
            setLoading(false)
            return
        }

        // 3) MultipleBooleanChart
        if (ChartComponent === MultipleBooleanChart) {
            const resolvedItems = resolveMultipleBooleanItems(initialData.items)
            setChartData({
                items: resolvedItems,
            })
            setLoading(false)
            return
        }

        // 4) Simples clásicos
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

    if (!isLiquidPorcentaje) {
        return <ChartComponent {...initialProps} {...chartData} />
    } else {
        const bottom1 = LiquidButtomData?.bottom1
        const bottom2 = LiquidButtomData?.bottom2

        return (
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 flex items-center justify-center">
                    <ChartComponent {...initialProps} {...chartData} />
                </div>
                <div className='w-full px-1 flex items-center justify-center'>
                    <LiquidFillBottomInfo bottom1={bottom1} bottom2={bottom2} />
                </div>
            </div>
        )
    }

}
