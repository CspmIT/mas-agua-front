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
import StackedAreaChart from '../../Charts/components/StackedAreaChart'
import FiltersChart from '../../Charts/components/FiltersChart'

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
    const [filters, setFilters] = useState({})

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

                // Si el gráfico es LineChart, procesamos xSeries e ySeries
                if (type === 'LineChart') {
                    const ySeries = chart.ChartSeriesData.map((series) => ({
                        name: series.name,
                        type: series.line,
                        data: [], // Se llenará con datos de InfluxDB
                        idVar: series.InfluxVars,
                        smooth: series.smooth,
                        color: series.color,
                    }))

                    return {
                        id: `${chart.id}-${chart.type}`,
                        component: type,
                        props: {
                            title: propsReduce.title,
                            xType: 'category',
                            yType: 'value',
                        },
                        data: {
                            xConfig: propsReduce,
                            xSeries: [], // Se llenará con datos de InfluxDB
                            ySeries,
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
                    <Grid
                        item
                        xs={12}
                        sm={ChartComponentDb === LineChart ? 12 : 6}
                        lg={ChartComponentDb === LineChart ? 12 : 4}
                        key={index}
                    >
                        <CardCustom
                            className={`flex flex-col items-center ${
                                ChartComponentDb === PumpControl
                                    ? 'h-fit'
                                    : 'h-80'
                            } ${
                                ChartComponentDb === LineChart
                                    ? 'h-[33rem]'
                                    : ''
                            }`}
                        >
                            {ChartComponentDb === LineChart && (
                                <FiltersChart
                                    id_chart={chart.id}
                                    setFilters={setFilters}
                                />
                            )}
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
                                filters={filters}
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
    filters = false,
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

    const fetchChartSeriesData = async (ySeries, xConfig, idChart, filters) => {
        try {
            const queries = ySeries.map((series) => {
                const influxVars = Object.values(
                    series.idVar.varsInflux
                ).shift() // Extrae la primera clave de varsInflux

                return {
                    varId: series.idVar.id,
                    field: influxVars.calc_field, // 'pres'
                    topic: influxVars.calc_topic, // 'coop/agua/red/presion/SPR003/status'
                    name: series.name,
                    dateRange:
                        xConfig.dateTimeType === 'date'
                            ? filters[idChart]?.dateRange || xConfig.dateRange
                            : filters[idChart]?.dateRange || xConfig.timeRange, // '-7d'
                    samplingPeriod: filters[idChart]?.samplingPeriod ||xConfig.samplingPeriod, // '6h'
                    typePeriod: influxVars.calc_type_period,
                    render: true,
                    type: 'history',
                }
            })

            const { data } = await request(
                `${backend['Mas Agua']}/seriesDataInflux`,
                'POST',
                queries
            )

            const xSeries =
                data[ySeries[0].idVar.id].map((item) =>
                    xConfig.dateTimeType == 'date'
                        ? item.time
                        : item.time
                ) || [] // Suponiendo que InfluxDB devuelve timestamps
            const updatedYSeries = ySeries.map((series) => ({
                ...series,
                data:
                    data[series.idVar.id].map((data) =>
                        data.value !== null && data.value !== undefined ? parseFloat(data.value).toFixed(3) : '-'
                    ) || [],
            }))

            return {
                ySeries: updatedYSeries,
                xSeries,
            }
        } catch (error) {
            console.log(error)
            return {
                xSeries: [],
                ySeries: ySeries.map((series) => ({ ...series, data: [] })),
            }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (ChartComponent === LineChart) {
                const updatedData = await fetchChartSeriesData(
                    initialData.ySeries,
                    initialData.xConfig,
                    chartId,
                    filters
                )

                setChartData((prevData) => {
                    // Solo actualiza el estado si los valores realmente cambiaron
                    const hasChanged =
                        JSON.stringify(prevData.xSeries) !==
                            JSON.stringify(updatedData.xSeries) ||
                        JSON.stringify(prevData.ySeries) !==
                            JSON.stringify(updatedData.ySeries)

                    return hasChanged
                        ? {
                              ...prevData,
                              xSeries: updatedData.xSeries,
                              ySeries: updatedData.ySeries,
                          }
                        : prevData
                })
            }

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
    }, [chartId, ChartComponent, initialData, filters]) // Dependencias ajustadas para asegurar la actualización

    // Si los datos aún no están listos, muestra un mensaje de carga
    if (loading) {
        return (
            <Typography variant="h6" align="center">
                Cargando datos...
            </Typography>
        )
    }

    return <ChartComponent {...initialProps} {...chartData} />
}

export default Home
