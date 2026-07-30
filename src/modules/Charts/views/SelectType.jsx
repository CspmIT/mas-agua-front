'use client'

import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import PageHeader from '../../../components/PageHeader'

const chartTypes = [
    {
        id: 1,
        title: 'Indicador circular con olas',
        image: '/assets/img/charts/echarts.png?height=300&width=300',
        description:
            'Círculo que se llena como un líquido con el valor actual de una variable, en porcentaje o valor absoluto, con un valor secundario opcional (ej: caudal y presión de un pozo). Color personalizable.',
    },
    {
        id: 2,
        title: 'Anillo de porcentaje',
        image: '/assets/img/charts/porcentaje.png?height=300&width=300',
        description:
            'Anillo que se completa según el porcentaje actual de la variable. Típico: nivel de cloro o porcentaje de llenado de una cisterna.',
    },
    {
        id: 3,
        title: 'Torta de distribución',
        image: '/assets/img/charts/graficoTorta.png?height=300&width=300',
        description:
            'Reparto proporcional entre varias variables, cada porción con su color. Típico: comparar el aporte de cada pozo o bomba al total.',
        pie: true,
    },
    {
        id: 4,
        title: 'Indicador rectangular con olas',
        image: '/assets/img/charts/echartsrectangle.png?height=300&width=300',
        description:
            'Igual al indicador circular con olas pero con forma de tanque: el nivel de llenado representa el valor actual. Típico: nivel de cisterna o reserva.',
    },
    {
        id: 6,
        title: 'Líneas históricas',
        image: '/assets/img/charts/StepLine.png?height=200&width=200',
        description:
            'Evolución en el tiempo de una o más variables superpuestas, con filtros de rango y muestreo, zoom y exportación. Es el gráfico que se asocia a dashboards, minigráficos e históricos de los tableros.',
    },
    {
        id: 7,
        title: 'Panel de información',
        image: '/assets/img/charts/Bombas.png?height=200&width=200',
        description:
            'Mini tablero con estados destacados y tarjetas de label + valor actual de cada variable (números, textos, booleanos o bits). Pensado para bombas, pero sirve para agrupar cualquier información importante.',
        bomb: true,
        disabled: false,
    },
    {
        id: 8,
        title: 'Reloj de aguja',
        image: '/assets/img/charts/gauge-speed.png?height=200&width=200',
        description:
            'Aguja sobre una escala graduada, tipo velocímetro, con el valor actual de la variable. Típico: presión de red urbana en los puntos de medición.',
    },
    {
        id: 9,
        title: 'LED de estado',
        image: '/assets/img/charts/boolean-chart.png?height=200&width=200',
        description:
            'Indicador de encendido/apagado para una variable booleana, con colores y textos personalizables. Típico: marcha de bomba, energía o conectividad.',
        boolean: true,
    },
    {
        id: 10,
        title: 'Múltiples LEDs de estado',
        image: '/assets/img/charts/MultipleBooleanChart.png?height=300&width=300',
        description:
            'Varios indicadores de encendido/apagado en una misma tarjeta, cada uno con su variable, colores y textos propios.',
        multipleBoolean: true,
    },
    {
        id: 11,
        title: 'Tablero de pozo',
        image: '/assets/img/charts/boardchart.png?height=300&width=300',
        description:
            'Minivista completa de un pozo: gráficos de valor actual, nivel de pozo, bombeo y sala, con minigráficos históricos al costado e históricos desplegables por cada elemento.',
        board: true,
    },
    {
        id: 12,
        title: 'Totalizado por período',
        image: '/assets/img/charts/totalizado-periodo.png?height=300&width=300',
        description:
            'Barras con el consumo mensual de los últimos 12 meses, calculado como la diferencia del totalizador entre mes y mes. Admite varias variables.',
    },
    {
        id: 13,
        title: 'Gralf: monitoreo de energía',
        image: '/assets/img/charts/gralfchart.png?height=300&width=300',
        description:
            'Tarjeta de energía del medidor trifásico: tensiones y corrientes por fase, potencias, factor de potencia, demanda, máximos/mínimos y la curva de potencia de las últimas 24 h. Sólo requiere elegir la variable Gralf del medidor.',
        gralf: true,
    },
]

const backPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
}

const chartCardSx = (index = 0, disabled = false) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition:
        'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.2s ease',
    opacity: disabled ? 0.55 : 0,
    transform: 'translateY(8px)',
    animation: `chartCardIn 0.35s ${index * 0.04}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
    '@keyframes chartCardIn': {
        '0%': { opacity: 0, transform: 'translateY(8px)' },
        '100%': { opacity: disabled ? 0.55 : 1, transform: 'translateY(0)' },
    },
    '&:hover': disabled
        ? {}
        : {
              transform: 'translateY(-3px)',
              borderColor: 'rgba(44, 106, 160, 0.3)',
              boxShadow:
                  '0 4px 10px rgba(15, 42, 68, 0.06), 0 24px 46px -14px rgba(44, 106, 160, 0.35)',
              '& .chart-type-thumb': { transform: 'scale(1.04)' },
          },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow:
            '0 2px 6px rgba(0, 0, 0, 0.25), 0 12px 32px -12px rgba(0, 0, 0, 0.5)',
    },
})

function SelectType() {
    const navigate = useNavigate()

    const selectedChart = (chart) => {
        if (chart?.bomb) return navigate('/config/pumps')
        if (chart?.boolean) return navigate('/config/graphic/boolean')
        if (chart?.multipleBoolean) return navigate('/config/graphic/multipleBoolean')
        if (chart?.pie) return navigate('/config/graphic/pie')
        if (chart?.board) return navigate('/config/graphic/board')
        if (chart?.gralf) return navigate('/config/graphic/gralf')
        navigate(`/config/graphic/${chart.id}`)
    }

    return (
        <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
            <PageHeader
                title='Seleccione el tipo de gráfico'
                action={
                    <Button
                        onClick={() => navigate('/config/allGraphic')}
                        variant='contained'
                        disableElevation
                        startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                        sx={backPillSx}
                    >
                        Volver
                    </Button>
                }
            />

            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {chartTypes.map((chart, index) => (
                    <Box
                        key={chart.id}
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
                        sx={chartCardSx(index, !!chart.disabled)}
                    >
                        <div className='relative h-44 overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 flex items-center justify-center'>
                            <img
                                src={chart.image}
                                alt={chart.title}
                                className='chart-type-thumb max-h-36 object-contain transition-transform duration-300 ease-out'
                            />
                            <div className='absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#2c6aa0] text-white text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm'>
                                Tipo {chart.id}
                            </div>
                        </div>

                        <div className='flex flex-col flex-1 gap-1.5 px-3.5 py-3'>
                            <h3 className='text-sm font-semibold tracking-tight text-slate-800 dark:text-gray-100'>
                                {chart.title}
                            </h3>
                            <p className='text-xs text-slate-500 dark:text-gray-400 leading-snug'>
                                {chart.description}
                            </p>
                        </div>
                    </Box>
                ))}
            </div>
        </Container>
    )
}

export default SelectType
