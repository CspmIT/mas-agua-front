import { ArrowDownward } from '@mui/icons-material'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import FiltersChart from '../../Charts/components/FiltersChart'
import LineChart from '../../Charts/components/LineChart'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { LineChartRepository } from '../../../class/LineChart'
import LoaderComponent from '../../../components/Loader'
import { ChartFactory } from './ChartFactory'
import { chartQueryBuilderMap } from '../factories/chartQueryBuilderMap'
import CardCustom from '../../../components/CardCustom'

const ChartAccordion = ({ chart }) => {
    const [loader, setLoader] = useState(true)
    const [filters, setFilters] = useState(false)
    const [chartData, setChartData] = useState(undefined)
    const [expanded, setExpanded] = useState(false) // Controlar el estado del acordeón

    const fetchChartData = async () => {
        try {
            const fetchChartFunction = chartQueryBuilderMap[chart?.type]
            if (!fetchChartFunction) {
                console.warn(
                    `No existe una funcion de busqueda para ${chart.type}`
                )
                setLoader(false)
                return
            }

            const data = await fetchChartFunction(chart, filters)
            setChartData(data)
            setLoader(false)
        } catch (error) {
            console.error('Error construyendo el grafico', error)
            setChartData(undefined)
            setLoader(false)
        }
    }

    const handleAccordionChange = (event, isExpanded) => {
        setExpanded(isExpanded)
    }

    useEffect(() => {
        if (expanded) {
            fetchChartData() // Llamada a la función para construir el gráfico

            // Intervalo para actualizar los datos cada 15 segundos
            const intervalId = setInterval(fetchChartData, 15000)

            // Limpiar el intervalo al cerrar el acordeón
            return () => clearInterval(intervalId)
        } else {
            // Limpiar los datos y volver a mostrar el cargador cuando el acordeón se cierra
            setChartData(undefined)
            setLoader(true)
        }
    }, [expanded, chart, filters])

    return (
        <Accordion
        key={chart.id}
        expanded={expanded} // Controlar si el acordeón está abierto o cerrado
        onChange={handleAccordionChange} // Controlar el cambio de estado
        sx={{
            border: "none",
            "&:before": {
                display: "none",
            },
            gap: 2
        }}
        className="w-full !rounded-xl mb-2 !shadow-md"
        >
            <AccordionSummary
                expandIcon={<ArrowDownward className='text-blue-500'/>}
                aria-controls={`panel-${chart.id}-content`}
                id={`panel-${chart.id}-header`}
                className='!border-transparent !rounded-2xl'
            >
                <CardCustom className="w-fit bg-slate-100 rounded-2xl border-2 border-blue-400 py-1 px-4">
                    <Typography variant="h6" className='text-blue-600'>{chart.name}</Typography>
                </CardCustom>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col items-center justify-center gap-5 h-fit !rounded-2xl !border-transparent">
                {chart.type === 'LineChart' && (
                    <FiltersChart id_chart={chart.id} setFilters={setFilters} />
                )}

                <ChartFactory
                    loader={loader}
                    type={chart.type}
                    chartData={chartData}
                    chart={chart}
                />
            </AccordionDetails>
        </Accordion>
    )
}

export default ChartAccordion
