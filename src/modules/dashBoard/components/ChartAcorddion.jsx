import { ArrowDownward } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState, useCallback } from 'react'
import FiltersChart from '../../Charts/components/FiltersChart'
import { ChartFactory } from './ChartFactory'
import { chartQueryBuilderMap } from '../factories/chartQueryBuilderMap'
import CardCustom from '../../../components/CardCustom'

const pickSamplingPeriod = (rangeMs) => {
  const sec = 1000
  const min = 60 * sec
  const hour = 60 * min
  const day = 24 * hour

  if (rangeMs <= 15 * min) return '5s'
  if (rangeMs <= 30 * min) return '10s'
  if (rangeMs <= 1 * hour) return '1m'
  if (rangeMs <= 6 * hour) return '1m'
  if (rangeMs <= 12 * hour) return '5m'
  if (rangeMs <= 2 * day) return '5m'
  if (rangeMs <= 7 * day) return '5m'
  if (rangeMs <= 30 * day) return '30m'
  if (rangeMs <= 90 * day) return '1h'
  if (rangeMs <= 365 * day) return '1h'
  return '12h'
}

const msToDatetimeLocal = (ms) => {
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, '0')

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

const ChartAccordion = ({ chart }) => {
  const [loader, setLoader] = useState(true)
  const [filters, setFilters] = useState({})
  const [chartData, setChartData] = useState(undefined)
  const [expanded, setExpanded] = useState(false)

  const zoomTimeoutRef = useRef(null)

  const fetchChartData = useCallback(async () => {
    try {
      const fetchChartFunction = chartQueryBuilderMap[chart?.type]
      if (!fetchChartFunction) {
        console.warn(`No existe una funcion de busqueda para ${chart.type}`)
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
  }, [chart, filters])

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded)
  }

  //ZOOM: recalculamos filtros y re-consultamos
  const handleZoomRange = useCallback(
    ({ startMs, endMs }) => {
      if (!expanded) return
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return
      if (endMs <= startMs) return

      const rangeMs = endMs - startMs
      const newSampling = pickSamplingPeriod(rangeMs)

      const dateFrom = msToDatetimeLocal(startMs)
      const dateTo = msToDatetimeLocal(endMs)

      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)

      zoomTimeoutRef.current = setTimeout(() => {
        setLoader(true)
        setFilters((prev) => ({
          ...(prev || {}),
          [chart.id]: {
            type: 'absolute',
            dateFrom,
            dateTo,
            samplingPeriod: newSampling,
          },
        }))
      }, 250)
    },
    [expanded, chart.id]
  )

  const handleRestore = useCallback(() => {
    if (!expanded) return

    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)

    setLoader(true)

    setFilters((prev) => {
      const copy = { ...(prev || {}) }
      delete copy[chart.id] // volvés al default
      return copy
    })
  }, [expanded, chart.id])

  useEffect(() => {
    if (expanded) {
      fetchChartData()

      const intervalId = setInterval(fetchChartData, 15000)

      return () => {
        clearInterval(intervalId)
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)
      }
    } else {
      setChartData(undefined)
      setLoader(true)
    }
  }, [expanded, fetchChartData])

  return (
    <Accordion
      key={chart.id}
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{
        border: 'none',
        '&:before': { display: 'none' },
        gap: 2,
      }}
      className="w-full !rounded-xl mb-2 !shadow-md"
    >
      <AccordionSummary
        expandIcon={<ArrowDownward className="text-blue-500" />}
        aria-controls={`panel-${chart.id}-content`}
        id={`panel-${chart.id}-header`}
        className="!border-transparent !rounded-2xl"
      >
        <CardCustom className="w-fit bg-slate-100 rounded-2xl border-2 border-blue-400 py-1 px-4">
          <Typography variant="h6" className="text-blue-600">
            {chart.name}
          </Typography>
        </CardCustom>
      </AccordionSummary>

      <AccordionDetails className="flex flex-col items-center justify-center gap-4 h-auto !rounded-2xl !border-transparent">
        {chart.type === 'LineChart' && (
          <FiltersChart id_chart={chart.id} setFilters={setFilters} />
        )}

        <ChartFactory
          loader={loader}
          type={chart.type}
          chartData={chartData}
          chart={chart}
          onZoomRange={handleZoomRange}
          onRestore={handleRestore}
        />
      </AccordionDetails>
    </Accordion>
  )
}

export default ChartAccordion
