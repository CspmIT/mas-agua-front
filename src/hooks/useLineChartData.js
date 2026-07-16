import { useCallback, useEffect, useRef, useState } from 'react'
import { chartQueryBuilderMap } from '../modules/dashBoard/factories/chartQueryBuilderMap'

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

// Datos de un gráfico de series (LineChart/TotalizadoPeriodo/PieChart) con
// refresco periódico y refetch al hacer zoom. `active` pausa el ciclo (ej:
// acordeón colapsado o dashboard en modo edición).
export const useLineChartData = (chart, { active = true, refreshMs = 15000 } = {}) => {
  const [loader, setLoader] = useState(true)
  const [filters, setFilters] = useState({})
  const [chartData, setChartData] = useState(undefined)

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

  //ZOOM: recalculamos filtros y re-consultamos
  const handleZoomRange = useCallback(
    ({ startMs, endMs }) => {
      if (!active) return
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
    [active, chart.id]
  )

  const handleRestore = useCallback(() => {
    if (!active) return

    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)

    setLoader(true)

    setFilters((prev) => {
      const copy = { ...(prev || {}) }
      delete copy[chart.id] // volvés al default
      return copy
    })
  }, [active, chart.id])

  useEffect(() => {
    if (active) {
      fetchChartData()

      const intervalId = setInterval(fetchChartData, refreshMs)

      return () => {
        clearInterval(intervalId)
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)
      }
    } else {
      setChartData(undefined)
      setLoader(true)
    }
  }, [active, fetchChartData, refreshMs])

  return {
    loader,
    chartData,
    setFilters,
    handleZoomRange,
    handleRestore,
  }
}
