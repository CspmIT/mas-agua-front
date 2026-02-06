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
        pie: true
    },
    {
        id: 4,
        title: 'Porcentaje rectangular',
        image: '/assets/img/charts/echartsrectangle.png?height=300&width=300',
        description:
            'Visualización de porcentaje con olas, ideal para indicadores. El valor se puede mostrar en porcentaje o en valor absoluto. El color del gráfico se puede personalizar.',
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
        description: 'some description',
    },
    {
        id: 9,
        title: 'Boolean chart',
        image: '/assets/img/charts/boolean-chart.png?height=200&width=200',
        description: 'Led de encendido o apagado con colores y palabras personalizables',
        boolean: true
    },
    {
        id: 10,
        title: 'Múltiple Boolean chart',
        image: '/assets/img/charts/MultipleBooleanChart.png?height=300&width=300',
        description: 'Múltiple LEDs de encendido o apagado con colores y palabras personalizables',
        multipleBoolean: true
    },
    {
        id: 11,
        title: 'Board chart',
        image: '/assets/img/charts/boardchart.png?height=300&width=300',
        description: 'Tablero para visualizacion de gráficos, estados de bombas y estado de sala.',
        board: true
    },
]

function SelectType() {
    const navigate = useNavigate()
    const selectedChart = (chart) => {
        if (chart?.bomb) {
            navigate('/config/pumps')
            return
        }
        if(chart?.boolean){
            navigate('/config/graphic/boolean')
            return 
        }
        if(chart?.multipleBoolean){
            navigate('/config/graphic/multipleBoolean')
            return 
        }
        if(chart?.pie){
            navigate('/config/graphic/pie')
            return
        }
        if(chart?.board){
            navigate('/config/graphic/board')
            return
        }
        navigate(`/config/graphic/${chart.id}`)
    }
    return (
        <Box className="p-6 min-[90vh]">
            <div className="grid grid-cols-3 justify-between items-center">
                <div />
                <Typography variant="h4" className="text-gray-800 justify-self-center">
                    Seleccione el tipo de grafico
                </Typography>
                <IconButton
                    className='justify-self-end'
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
