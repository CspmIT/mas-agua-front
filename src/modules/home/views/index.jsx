import { Grid, Typography } from '@mui/material'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import LineChart from '../../Charts/components/LineChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import PumpControl from '../../Charts/views/ConfigBombs'

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
    BarDataSet,
    DoughnutChart,
    LineChart,
    PumpControl,
}

const Home = () => {
    const [charts, setCharts] = useState([])

    async function getCharts() {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/charts`,
                'GET'
            )

            const formatConfig = data.map((chart) => {
                const { type } = chart

                const propsReduce = chart.ChartConfig.reduce((acc, config) => {
                    const { key, value, type } = config

                    return {
                        ...acc,
                        [key]:
                            type === 'boolean'
                                ? Boolean(parseInt(value))
                                : value,
                    }
                }, {})

                if (type === 'PumpControl') {
                    // Clasifica BombsData en initialPumps y initialStates
                    const { initialPumps, initialStates } =
                        chart.BombsData.reduce(
                            (acc, item) => {
                                const bombData = {
                                    id: item.id,
                                    name: item.name,
                                    varId: item.varId,
                                    value: item.InfluxVars.varsInflux,
                                    unit: item.InfluxVars.unit,
                                    type: item.type,
                                }

                                if (item.type === 'pump') {
                                    acc.initialPumps.push(bombData)
                                } else if (item.type === 'status') {
                                    acc.initialStates.push(bombData)
                                }

                                return acc
                            },
                            { initialPumps: [], initialStates: [] }
                        )

                    return {
                        id: `${chart.id}-${chart.type}`,
                        component: type,
                        props: propsReduce,
                        data: {
                            initialPumps,
                            initialStates,
                        },
                    }
                }

                const dataReduce = chart.ChartData.reduce((acc, data) => {
                    const { key, value } = data
                    return {
                        ...acc,
                        [key]: value ? value : data.InfluxVars.varsInflux,
                    }
                }, {})
                return {
                    id: `${chart.id}-${chart.type}`,
                    component: type,
                    props: propsReduce,
                    data: dataReduce,
                }
            })
            setCharts(formatConfig)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            })
        }
    }

    useEffect(() => {
        getCharts()
    }, [])

    return (
        <Grid container spacing={3}>
            {charts.map((chart, index) => {
                const ChartComponentDb = chartComponents[chart.component]
                return (
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                        <CardCustom
                            className={`flex flex-col items-center ${ChartComponentDb === PumpControl ? 'h-fit': 'h-80'}`}
                        >
                            <Typography
                                variant="h5"
                                className="text-center pt-3"
                            >
                                {chart?.props?.title}
                            </Typography>
                            <ChartComponentDbWrapper
                                chartId={chart.id}
                                ChartComponent={ChartComponentDb}
                                initialProps={chart.props}
                                initialData={chart.data}
                            />
                        </CardCustom>
                    </Grid>
                )
            })}
        </Grid>
    )
}

const ChartComponentDbWrapper = ({
    chartId,
    ChartComponent,
    initialProps,
    initialData,
}) => {
    const [chartData, setChartData] = useState(initialData)
    const [loading, setLoading] = useState(true) // Estado para controlar la carga

    // Función para obtener los datos de las bombas o estados desde la API
    const fetchPumpOrStateValues = async (items) => {
        const updatedItems = await Promise.all(
            items.map(async (item) => {
                try {
                    const influxVar = item.value
                    const { data } = await request(
                        `${backend['Mas Agua']}/dataInflux`,
                        'POST',
                        influxVar // Ajusta el payload según lo que la API necesite
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

    // Función para obtener los datos de gráficos y actualizarlos
    const fetchChartData = async (influxVar) => {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/dataInflux`,
                'POST',
                influxVar
            )
            const accessKey = Object.values(initialData.value).shift()
            return {
                value: data?.[accessKey.calc_field]?.value,
            }
        } catch (error) {
            console.log(error)
            return null
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (ChartComponent === PumpControl) {
                // Si el componente es PumpControl, actualiza bombas y estados
                const { initialPumps, initialStates } = initialData

                // Actualiza valores de bombas (pumps)
                const updatedPumps = await fetchPumpOrStateValues(initialPumps)

                // Actualiza valores de estados
                const updatedStates = await fetchPumpOrStateValues(initialStates)

                // Actualiza el estado del chartData con los valores obtenidos
                setChartData((prevData) => {
                    return {
                        ...prevData,
                        initialPumps: updatedPumps,
                        initialStates: updatedStates,
                    }
                })
            } else {
                // Si no es PumpControl, obtiene los datos del gráfico normal
                if (initialData?.value) {
                    const data = await fetchChartData(initialData.value)
                    if (data) {
                        setChartData((prevData) => ({
                            ...prevData,
                            value: data.value, // Actualizamos el valor correctamente
                        }))
                    }
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
        return <Typography variant="h6" align="center">Cargando datos...</Typography>
    }

    return <ChartComponent {...initialProps} {...chartData} />
}


export default Home
