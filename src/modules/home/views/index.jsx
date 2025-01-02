import { Grid, Typography, useMediaQuery } from '@mui/material'
import LiquidFill from '../../Charts/components/LiquidFillPorcentaje'
import CardCustom from '../../../components/CardCustom'
import Chart from '../../Charts/components/Chart'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import StackedAreaChart from '../../Charts/components/StackedAreaChart'
import Surface from '../../Charts/components/Surface'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import LineChart from '../../Charts/components/LineChart'

const chartData = [
    {
        title: 'Ingreso de Agua por Hora',
        component: LiquidFill,
        props: {
            value: 1.65,
            maxValue: 5,
            unidad: 'm3',
        },
    },
    {
        title: 'Cantidad de Cloro T1(%)',
        component: LiquidFill,
        props: {
            type: 'circle',
            value: 0.65,
            maxValue: 1,
            porcentage: true,
            color: '#FFEB59',
        },
    },
    {
        title: 'Cantidad de Cloro T2 (%)',
        component: LiquidFill,
        props: {
            value: 0.63,
            maxValue: 2,
            porcentage: true,
            color: '#FFEB59',
        },
    },
    {
        title: 'Cloro libre',
        component: LiquidFill,
        props: {
            value: 3.65,
            unidad: 'mg/L',
            maxValue: 10,
            color: '#eefd01',
        },
    },
    {
        title: 'Nivel de Cisterna (%)',
        component: LiquidFill,
        props: {
            value: 2.65,
            maxValue: 5,
            color: '#FFEB59',
            porcentage: true,
            type: 'rectCircle',
            border: false,
        },
    },
    {
        title: 'Nivel de Tanque (%)',
        component: CirclePorcentaje,
        props: {
            value: 6.23,
            maxValue: 10,
        },
    },
    {
        title: 'Grafico de barras',
        component: BarDataSet,
        props: {},
    },
    {
        title: 'Grafico de area',
        component: StackedAreaChart,
        props: {},
    },
    {
        title: 'Grafico de torta',
        component: DoughnutChart,
        props: {},
    },
    {
        title: 'Grafico de linea con superposicion',
        component: LineChart,
        props: {
            xType: 'category',
            xSeries: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'],
            yType: 'value',
            ySeries: [
                { name: 'T1', type: 'line', data: [120, 132, 101, 134, 90] },
                { name: 'T2', type: 'line', data: [220, 182, 191, 234, 290] },
                { name: 'T3', type: 'line', data: [150, 232, 201, 154, 190] },
                { name: 'DeadLine', type: 'line', data: [320, 332, 301, 334, 390] },
            ],
        },
    },
]

const Home = () => {
    return (
        <Grid container spacing={3}>
            {chartData.map((chart, index) => {
                const ChartComponent = chart.component
                return (
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                        <CardCustom
                            className={'flex flex-col h-80 items-center'}
                        >
                            <Typography
                                variant="h5"
                                className="text-center pt-9"
                            >
                                {chart.title}
                            </Typography>
                            <ChartComponent {...chart.props} />
                        </CardCustom>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default Home
