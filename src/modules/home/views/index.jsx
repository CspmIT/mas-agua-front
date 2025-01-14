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

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
    BarDataSet,
    DoughnutChart,
    LineChart,
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

                const dataReduce = chart.ChartData.reduce((acc, config) => {
                    const { key, value } = config
                    return {
                        ...acc,
                        [key]: value ? value : config.InfluxVars.varsInflux,
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
                            className={'flex flex-col h-80 items-center'}
                        >
                            <Typography
                                variant="h5"
                                className="text-center pt-9"
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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            })
            return null
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchChartData(initialData.value)
            if (data) {
                setChartData((prevData) => ({
                    ...initialData,
                    value: data.value,
                }))
            }
        }
        fetchData()
        const intervalId = setInterval(fetchData, 15000)
        return () => clearInterval(intervalId)
    }, [chartId])

    return <ChartComponent {...initialProps} {...chartData} />
}

export default Home
