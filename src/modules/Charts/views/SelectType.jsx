'use client'

import { ArrowBack } from '@mui/icons-material'
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Box,
    IconButton,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

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
        disabled: true,
    },
    {
        id: 4,
        title: 'Porcentaje rectangular',
        image: '/assets/img/charts/echartsrectangle.png?height=300&width=300',
        description:
            'Visualización de porcentaje con olas, ideal para indicadores. El valor se puede mostrar en porcentaje o en valor absoluto. El color del gráfico se puede personalizar.',
    },
    {
        id: 5,
        title: 'Grafico de barras',
        image: '/assets/img/charts/graficoBarras.png?height=200&width=200',
        description: 'Pie chart with extended label lines',
        disabled: true,
    },
    {
        id: 6,
        title: 'Grafico de linea con superposicion',
        image: '/assets/img/charts/StepLine.png?height=200&width=200',
        description: 'Multi-level pie chart visualization',
    },
    {
        id: 7,
        title: 'Porcentajes con estado',
        image: '/assets/img/charts/Bombas.png?height=200&width=200',
        description: 'Visualiza el porcentaje y el estado de x variables',
        bomb: true,
        disabled: false,
    },
    {
        id: 8, 
        title: 'Speed Gauge',
        image: '/assets/img/charts/gauge-speed.png?height=200&width=200',
        description: 'some description'
    }
]

function SelectType() {
    const navigate = useNavigate()
    const selectedChart = (chart) => {
        if (chart?.bomb) {
            navigate('/config/pumps')
            return
        }
        navigate(`/config/graphic/${chart.id}`)
    }
    return (
        <Box className="p-6 min-[90vh]">
            <div className="flex justify-between items-center">
                <Typography variant="h4" className="text-gray-800">
                    Seleccione el tipo de grafico
                </Typography>
                <IconButton
                    sx={{
                        color: 'black',
                        marginRight: 2,
                        padding: '8px',
                    }}
                    aria-label="volver atrás"
                    onClick={() => {
                        navigate('/config/allGraphic')
                    }}
                >
                    <ArrowBack sx={{ fontSize: '1.5rem' }} />
                </IconButton>
            </div>

            <Grid container spacing={3} className="pt-3">
                {chartTypes.map((chart, index) => (
                    <Grid item sm={12} md={6} lg={4} key={index}>
                        <Card
                            onClick={() => {
                                if (chart?.disabled) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: 'Esta funcionalidad no está disponible en la versión actual',
                                    })
                                    return
                                }
                                selectedChart(chart)
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
