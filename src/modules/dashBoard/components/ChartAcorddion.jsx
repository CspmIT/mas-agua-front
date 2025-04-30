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

const ChartAccordion = ({ chart }) => {
    const [loader, setLoader] = useState(true)
    const [filters, setFilters] = useState(false)
    const [chartData, setChartData] = useState(undefined)
    const [expanded, setExpanded] = useState(false) // Controlar el estado del acordeón

    const fetchChartData = async () => {
        const basicChart = {
            id: chart.id,
            type: chart.type,
            title: chart.name,
        }
        try {
            const lineChart = new LineChartRepository(
                basicChart,
                chart.ChartSeriesData,
                chart.ChartConfig
            )

            const query = lineChart.generateQuery(filters)

            const { data } = await request(
                `${backend['Mas Agua']}/seriesDataInflux`,
                'POST',
                query
            )

            // Encontrar la primera serie que tenga datos
            let referenceSeries = Object.keys(data).find(
                (key) => data[key].length > 0
            )

            const xSeries = referenceSeries
                ? data[referenceSeries].map((item) => item.time)
                : []
            const ySeries = lineChart.getYSeries().map((series) => ({
                ...series,
                data:
                    data[series.idVar.id]?.map((point) =>
                        point.value !== null && point.value !== undefined
                            ? parseFloat(point.value).toFixed(3)
                            : '-'
                    ) || [],
            }))

            setChartData({
                xSeries,
                ySeries,
            })

            setLoader(false)
        } catch (error) {
            console.error('Error construyendo el gráfico:', error)
            setChartData({ xSeries: [], ySeries: [] })
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
            className="w-full"
            key={chart.id}
            expanded={expanded} // Controlar si el acordeón está abierto o cerrado
            onChange={handleAccordionChange} // Controlar el cambio de estado
        >
            <AccordionSummary
                expandIcon={<ArrowDownward />}
                aria-controls={`panel-${chart.id}-content`}
                id={`panel-${chart.id}-header`}
            >
                <Typography variant="h5">{chart.name}</Typography>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col items-center justify-center gap-5 h-fit">
                <FiltersChart id_chart={chart.id} setFilters={setFilters} />
                {loader ? (
                    'Cargando...'
                ) : (
                    <div className="h-80 w-full">
                        <LineChart
                            xType={'category'}
                            yType={'value'}
                            xSeries={chartData?.xSeries || []}
                            ySeries={chartData?.ySeries || []}
                        />
                    </div>
                )}
            </AccordionDetails>
        </Accordion>
    )
}

export default ChartAccordion
