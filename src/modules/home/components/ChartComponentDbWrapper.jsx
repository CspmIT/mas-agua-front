import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PumpControl from '../../Charts/views/ConfigBombs'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { Parser } from 'expr-eval'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'

export const ChartComponentDbWrapper = ({
    chartId,
    ChartComponent,
    initialProps,
    initialData,
}) => {
    const [chartData, setChartData] = useState(initialData)
    const [loading, setLoading] = useState(true) // Estado para controlar la carga

    // Función para obtener los datos de gráficos y actualizarlos
    const fetchChartData = async (influxVar) => {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/dataInflux`,
                'POST',
                influxVar
            )

            // El backend ahora devuelve directamente el valor final o los datos
            if (influxVar?.calc) {
                // Si es calculada, el backend devuelve { value: ... }
                return { value: data?.value ?? null }
            } else {
                // Si no es calculada, el backend devuelve el objeto influx formateado
                const field = Object.values(influxVar.varsInflux)[0].calc_field
                return { value: data?.[field]?.value ?? null }
            }
        } catch (error) {
            console.error(error)
            return null
        }
    }

    const fetchPumpOrStateValues = async (items) => {
        const updatedItems = await Promise.all(
            items.map(async (item) => {
                try {
                    const influxVar = item.value
                    const payload = influxVar.varsInflux ? influxVar : { varsInflux: influxVar }

                    const { data } = await request(
                        `${backend['Mas Agua']}/dataInflux`,
                        'POST',
                        payload
                    )
                    const accessKey = Object.values(item.value).shift()
                    return {
                        ...item,
                        value:
                            data?.[accessKey.calc_field]?.value ?? 'Sin datos',
                    }
                } catch (error) {
                    console.error(error)
                    return { ...item, value: 'Error' } // Devuelve el item con un estado de error
                }
            })
        )
        return updatedItems
    }

    useEffect(() => {
        const fetchData = async () => {
            if (ChartComponent === PumpControl) {
                // Si el componente es PumpControl, actualiza bombas y estados
                const { initialPumps, initialStates } = initialData

                // Actualiza valores de bombas (pumps)
                const updatedPumps = await fetchPumpOrStateValues(initialPumps)

                // Actualiza valores de estados
                const updatedStates = await fetchPumpOrStateValues(
                    initialStates
                )

                // Actualiza el estado del chartData con los valores obtenidos
                setChartData((prevData) => {
                    return {
                        ...prevData,
                        initialPumps: updatedPumps,
                        initialStates: updatedStates,
                    }
                })
            }

            if (initialData?.value) {
                const data = await fetchChartData(initialData.value)

                if (data) {
                    setChartData((prevData) => ({
                        ...prevData,
                        value: data.value, // Actualizamos el valor correctamente
                    }))
                }
            }

            // Cuando los datos estén listos, setLoading a false
            setLoading(false)
        }

        fetchData()
        const intervalId = setInterval(fetchData, 15000) // Refresca los datos cada 15 segundos
        return () => clearInterval(intervalId)
    }, [chartId, ChartComponent, initialData]) // Dependencias ajustadas para asegurar la actualización

    // Si los datos aún no están listos, muestra un mensaje de carga
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
