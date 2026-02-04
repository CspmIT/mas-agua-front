import { Grid, Typography } from '@mui/material'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useRef, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import PumpControl from '../../Charts/views/ConfigBombs'
import GaugeSpeed from '../../Charts/components/GaugeSpeed'
import BooleanChart from '../../Charts/components/BooleanChart'
import { ChartComponentDbWrapper } from '../components/ChartComponentDbWrapper'
import MultipleBooleanChart from '../../Charts/components/MultipleBooleanChart'

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
    BarDataSet,
    PieChart: DoughnutChart,
    PumpControl,
    GaugeSpeed,
    BooleanChart,
    MultipleBooleanChart
}

const Home = () => {
    const [charts, setCharts] = useState([])
    const [inflValues, setInflValues] = useState({})
    const intervalRef = useRef(null)

    // Extrae todas las variables influx de todos los charts dinámicamente
    function extractInfluxVars(chartsData) {
        const vars = []

        chartsData.forEach((chart) => {
            if (chart.component === 'PumpControl') {

                const normalizePumpVar = (item) => ({
                    dataInflux: {
                        id: item.varId,
                        name: item.name,
                        unit: item.unit ?? null,
                        type: 'last',
                        calc: item.calc || false,
                        varsInflux: item.value,
                        equation: item.equation || null,
                        status: true
                    }
                })

                chart.data.initialPumps.forEach((pump) => {
                    vars.push(normalizePumpVar(pump))
                })

                chart.data.initialStates.forEach((state) => {
                    vars.push(normalizePumpVar(state))
                })

                return
            }
            
            if (chart.component === 'MultipleBooleanChart') {
                chart.data.items.forEach((item) => {
                    if (item.influxVar) {
                        vars.push({ dataInflux: item.influxVar })
                    }
                })
                return
            }

            Object.values(chart.data).forEach((value) => {
                if (value && value.varsInflux) {
                    vars.push({ dataInflux: value })
                }
            })
        })

        return vars
    }

    // Obtiene la configuración de charts desde el backend
    async function getCharts() {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/indicatorCharts`,
                'GET'
            )
           
            const formatConfig = data
            .filter(chart => chart.type !== 'BoardChart')
            .map((chart) => {
                
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

                if (type === 'MultipleBooleanChart') {

                    const ledsConfig = {}
                
                    chart.ChartConfig.forEach(({ key, value }) => {
                        const [ledKey, prop] = key.split('.')
                        if (!ledsConfig[ledKey]) ledsConfig[ledKey] = { key: ledKey }
                        ledsConfig[ledKey][prop] = value
                    })
                
                    const items = Object.values(ledsConfig).map((led) => {
                        const influx = chart.ChartData.find(d => d.key === led.key)
                
                        return {
                            key: led.key,
                            title: led.title,
                            textOn: led.textOn,
                            textOff: led.textOff,
                            colorOn: led.colorOn,
                            colorOff: led.colorOff,
                            value: influx
                                ? null // se resuelve luego con inflValues
                                : null,
                            influxVar: influx?.InfluxVars ?? null,
                        }
                    })
                
                    return {
                        id: `${chart.id}-${chart.type}`,
                        component: type,
                        props: {
                            title: chart.name,
                            columns: 2, // o configurable
                        },
                        data: {
                            items,
                        },
                    }
                }

                const dataReduce = chart.ChartData.reduce((acc, data) => {
                    const { key, value, label, InfluxVars } = data

                    return {
                        ...acc,
                        [key]: value !== null
                            ? value
                            : {
                                ...InfluxVars,
                                label,
                            },
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

            // Una vez cargados los charts → preparar la primer consulta múltiple
            const allVars = extractInfluxVars(formatConfig)
            fetchMultipleData(allVars)

            // Configurar interval
            if (intervalRef.current) clearInterval(intervalRef.current)
            intervalRef.current = setInterval(() => fetchMultipleData(allVars), 30000)

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            })
        }
    }

    // Realiza una sola llamada al backend con todas las variables
    async function fetchMultipleData(allVars) {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/multipleDataInflux`,
                'POST',
                allVars
            )
            setInflValues(data)
        } catch (error) {
            console.error('Error multipleDataInflux:', error)
        }
    }

    useEffect(() => {
        getCharts()
        return () => clearInterval(intervalRef.current)
    }, [])

    return (
        <Grid container spacing={1}>
            {charts.map((chart, index) => {
                const ChartComponentDb = chartComponents[chart.component]
                const isPump = chart.component === 'PumpControl'
                const isMultipleBoolean = chart.component === 'MultipleBooleanChart'

                return (
                    <Grid
                        item
                        xs={12}
                        sm={isPump || isMultipleBoolean ? 8 : 4}
                        lg={isPump || isMultipleBoolean ? 4 : 2}
                        key={index}
                    >
                        <CardCustom className={`flex flex-col rounded-xl h-[42dvh] 2xl:h-[35dvh] overflow-hidden border-[1.75px] border-gray-300`}>
                            {(!isMultipleBoolean) &&
                            <div className="h-[7dvh] 2xl:h-[5dvh] flex items-center justify-center text-center mt-1">
                                <h1 className="text-xl leading-tight line-clamp-2">
                                    {chart?.props?.title}
                                </h1>
                            </div>
                            }
                            

                            <div className="flex-1 flex items-center justify-center">
                                <ChartComponentDbWrapper
                                    chartId={chart.id}
                                    ChartComponent={ChartComponentDb}
                                    initialProps={chart.props}
                                    initialData={chart.data}
                                    inflValues={inflValues}
                                />
                            </div>
                        </CardCustom>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default Home
