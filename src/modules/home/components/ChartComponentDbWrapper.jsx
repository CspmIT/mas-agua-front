import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PumpControl from '../../Charts/views/ConfigBombs'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'

export const ChartComponentDbWrapper = ({
    chartId,
    ChartComponent,
    initialProps,
    initialData,
    inflValues,          
}) => {

    const [chartData, setChartData] = useState(initialData)
    const [loading, setLoading] = useState(true)

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

    useEffect(() => {
        if (!inflValues || Object.keys(inflValues).length === 0) return

        // PumpControl
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

        // Gráficos simples
        if (initialData?.value) {
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

    return <ChartComponent {...initialProps} {...chartData} />
}
