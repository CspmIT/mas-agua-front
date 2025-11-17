import { Grid, Typography } from '@mui/material'
import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import PumpControl from '../../Charts/views/ConfigBombs'
import GaugeSpeed from '../../Charts/components/GaugeSpeed'
import BooleanChart from '../../Charts/components/BooleanChart'
import { ChartComponentDbWrapper } from '../components/ChartComponentDbWrapper'

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
    BarDataSet,
    PieChart: DoughnutChart,
    PumpControl,
    GaugeSpeed,
    BooleanChart,
}

const Home = () => {
    const [charts, setCharts] = useState([])

    async function getCharts() {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/indicatorCharts`,
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
                        [key]: value ? value : data.InfluxVars,
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
        <Grid container spacing={2}>
            {charts.map((chart, index) => {
                const ChartComponentDb = chartComponents[chart.component]

                const isPump = chart.component === 'PumpControl'

                return (
                    <Grid
                        item
                        xs={12}
                        sm={isPump ? 12 : 4}
                        lg={isPump ? 3 : 3}
                        key={index}
                    >
                        <CardCustom
                            className={`flex flex-col items-center rounded-xl 
                        ${isPump ? 'h-72' : 'h-72'}
                    `}
                        >
                            <Typography variant="h5" className="text-center pt-3">
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

export default Home
