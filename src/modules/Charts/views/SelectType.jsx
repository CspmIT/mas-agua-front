'use client'

import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Box,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

// Chart type definitions
const chartTypes = [
    {
        id: 1,
        title: 'Porcentaje con Olas',
        image: '/assets/img/charts/echarts.png?height=300&width=300',
        description:
            'Visualización de porcentaje con olas, ideal para indicadores. El valor se puede mostrar en porcentaje o en valor absoluto. El color del gráfico se puede personalizar.',
    },
    {
        id: 2,
        title: 'Porcentaje Circular',
        image: '/assets/img/charts/porcentaje.png?height=300&width=300',
        description:
            'Visualización de porcentaje circular, ideal para indicadores. El color del gráfico se puede personalizar.',
    },
    {
        id: 3,
        title: 'Grafico de torta',
        image: '/assets/img/charts/graficoTorta.png?height=300&width=300',
        description: 'Grafico de torta con bordes redondeados.',
    },
    {
        id: 4,
        title: 'Porcentaje rectangular',
        image: '/assets/img/charts/echartsrectangle.png?height=300&width=300',
        description: 'Visualización de porcentaje con olas, ideal para indicadores. El valor se puede mostrar en porcentaje o en valor absoluto. El color del gráfico se puede personalizar.',
    },
    {
        id: 5,
        title: 'Grafico de barras',
        image: '/assets/img/charts/graficoBarras.png?height=200&width=200',
        description: 'Pie chart with extended label lines',
    },
    {
        id: 6,
        title: 'Grafico de linea con superposicion',
        image: '/assets/img/charts/StepLine.png?height=200&width=200',
        description: 'Multi-level pie chart visualization',
    },
    // {
    //     id: 7,
    //     title: 'Calendar Pie',
    //     image: '/?height=200&width=200',
    //     description: 'Time-based pie chart arrangement',
    // },
    // {
    //     id: 8,
    //     title: 'Geographical Pie',
    //     image: '/placeholder.svg?height=200&width=200',
    //     description: 'Region-based pie chart distribution',
    // },
    // {
    //     id: 9,
    //     title: 'Geographical Pie',
    //     image: '/placeholder.svg?height=200&width=200',
    //     description: 'Region-based pie chart distribution',
    // },
]

function SelectType() {
    const navigate = useNavigate()
    const selectedChart = (chart) => {
        navigate(`/config/graphic/${chart}`)
    }
    return (
        <Box className="p-6 min-[90vh]">
            <Typography variant="h4" className="text-gray-800">
                Seleccione el tipo de grafico
            </Typography>
            <Grid container spacing={3} className="pt-3">
                {chartTypes.map((chart, index) => (
                    <Grid item sm={12} md={6} lg={4} key={index}>
                        <Card
                            onClick={() => {
                                selectedChart(chart.id)
                            }}
                            className="hover:shadow-lg transition-shadow duration-200 h-80 cursor-pointer w-full"
                        >
                            <CardMedia
                                component="img"
                                height="300"
                                image={chart.image}
                                alt={chart.title}
                                className="bg-white p-4 h-48 object-contain"
                            />
                            <CardContent className="relative pb-12">
                                <Typography
                                    variant="h6"
                                    className="font-medium mb-2"
                                >
                                    {chart.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-gray-600 mb-4"
                                >
                                    {chart.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
export default SelectType
