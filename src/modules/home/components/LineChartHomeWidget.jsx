import { useState } from 'react'
import { IconButton, Tooltip, Typography } from '@mui/material'
import LineChart from '../../Charts/components/LineChart'
import FiltersChart from '../../Charts/components/FiltersChart'
import { useLineChartData } from '../../../hooks/useLineChartData'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'

const IconFilter = () => (
    <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
    </svg>
)

// Widget de series históricas para el dashboard del home. A diferencia del
// resto de los widgets (que resuelven últimos valores desde el batch de
// /multipleDataInflux), consulta /seriesDataInflux por su cuenta.
const LineChartHomeWidget = ({ chart, editMode }) => {
    const { loader, chartData, setFilters, handleZoomRange, handleRestore } =
        useLineChartData(chart, { refreshMs: 30000 })
    const [showFilters, setShowFilters] = useState(false)

    if (loader) {
        return (
            <div className='flex flex-col items-center justify-center h-full w-full'>
                <img
                    src={logo}
                    alt='Logo'
                    className='w-20 h-20 filter grayscale animate-pulse'
                />
                <Typography
                    variant='subtitle1'
                    align='center'
                    className='mt-3 text-gray-500'
                >
                    Cargando datos...
                </Typography>
            </div>
        )
    }

    return (
        <div className='relative h-full w-full px-3 pt-2 pb-1.5'>
            <LineChart
                yType='value'
                xSeries={chartData?.xSeries || []}
                ySeries={chartData?.ySeries || []}
                onZoomRange={handleZoomRange}
                onRestore={handleRestore}
            />

            {!editMode && (
                <Tooltip title={showFilters ? 'Ocultar filtros' : 'Filtros'} placement='top'>
                    <IconButton
                        size='small'
                        onClick={() => setShowFilters(v => !v)}
                        className='no-drag'
                        sx={{
                            position: 'absolute',
                            top: 2,
                            left: 4,
                            zIndex: 20,
                            color: showFilters ? '#2c6aa0' : 'rgb(148 163 184)',
                            '&:hover': {
                                color: '#2c6aa0',
                                backgroundColor: 'rgba(44, 106, 160, 0.08)',
                            },
                        }}
                    >
                        <IconFilter />
                    </IconButton>
                </Tooltip>
            )}

            {!editMode && showFilters && (
                <div className='no-drag absolute top-9 left-2 right-2 z-30 shadow-xl rounded-lg'>
                    <FiltersChart
                        id_chart={chart.id}
                        setFilters={setFilters}
                        compact
                    />
                </div>
            )}

            {/* En edición, el pan del dataZoom (moveOnMouseMove) pelea con el
                drag de la grilla: tapamos el canvas para que la card se pueda
                arrastrar desde cualquier punto. */}
            {editMode && <div className='absolute inset-0 z-10' />}
        </div>
    )
}

export default LineChartHomeWidget
