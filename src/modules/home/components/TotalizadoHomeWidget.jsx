import { useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import GrafBarra from '../../../components/Graphs/barchart'
import { useLineChartData } from '../../../hooks/useLineChartData'
import logo from '../../../assets/img/Logo/MasAgua_hexagonal.png'

// Widget de totalizado por periodo para el dashboard del home. Igual que el
// LineChart, consulta sus datos por su cuenta (una query mensual por variable)
// en lugar de entrar al batch de /multipleDataInflux.
const TotalizadoHomeWidget = ({ chart, editMode }) => {
    const { loader, chartData } = useLineChartData(chart, { refreshMs: 60000 })

    // Highcharts no observa su contenedor: medimos el alto disponible y se lo
    // pasamos en px, así el gráfico se adapta a la card (y a sus resizes).
    const containerRef = useRef(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new ResizeObserver(([entry]) => {
            setHeight(Math.floor(entry.contentRect.height))
        })

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className='relative h-full w-full px-2 pt-1 pb-1'>
            {loader ? (
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
            ) : (
                <>
                    {height > 0 && (
                        <GrafBarra
                            title=' '
                            categories={chartData?.categories ?? []}
                            series={chartData?.series ?? []}
                            seriesName='Consumo (m³)'
                            height={height}
                        />
                    )}

                    {/* En edición tapamos el canvas para que la card se pueda
                        arrastrar desde cualquier punto. */}
                    {editMode && <div className='absolute inset-0 z-10' />}
                </>
            )}
        </div>
    )
}

export default TotalizadoHomeWidget
