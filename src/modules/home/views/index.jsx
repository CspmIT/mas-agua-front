import { Grid, Typography } from '@mui/material'
import LiquidFill from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import StackedAreaChart from '../../Charts/components/StackedAreaChart'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import LineChart from '../../Charts/components/LineChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
// import { transformTypes } from '../../../utils/js/transformTypes'

const chartComponents = {
    LiquidFill,
    CirclePorcentaje,
    BarDataSet,
    StackedAreaChart,
    DoughnutChart,
    LineChart,
}

const Home = () => {
    const [charts, setCharts] = useState([])
    async function getCharts() {
        try {
            const { data } = await request(
                'http://localhost:4000/api/charts',
                'GET'
            )

            const formatConfig = data.map((chart) => {
                const { type } = chart

                const propsReduce = chart.ChartConfig.reduce((acc, config) => {
                    const { key, value, type } = config
                    return {
                        ...acc,
                        [key]: type === 'boolean' ? Boolean(value) : value,
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
                {console.log(chart)}
                const ChartComponentDb = chartComponents[chart.component];
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
                            <ChartComponentDb {...chart.props} {...chart.data}/>
                        </CardCustom>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default Home
