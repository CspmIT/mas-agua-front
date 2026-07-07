import { ArrowDownward, FileDownloadOutlined } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { useEffect, useRef, useState, useCallback } from 'react'
import FiltersChart from '../../Charts/components/FiltersChart'
import { ChartFactory } from './ChartFactory'
import { chartQueryBuilderMap } from '../factories/chartQueryBuilderMap'
import {
  exportChartToCsv,
  exportChartToMd,
  exportChartToXlsx,
  hasExportableData,
} from '../utils/exportChartData'

const accordionTitlePillSx = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 2.5,
  py: 0.75,
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
  boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
    transform: 'translateY(-1px)',
  },
}

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
  const [exportAnchor, setExportAnchor] = useState(null)

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

  const handleExport = (exportFn) => {
    setExportAnchor(null)
    if (!hasExportableData(chartData)) return
    exportFn(chartData, chart.name)
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
        expandIcon={<ArrowDownward sx={{ color: '#2c6aa0' }} />}
        aria-controls={`panel-${chart.id}-content`}
        id={`panel-${chart.id}-header`}
        className="!border-transparent !rounded-2xl"
      >
        <Box component='span' sx={accordionTitlePillSx}>
          <span className='text-[12px] font-semibold uppercase tracking-[0.08em] text-white leading-none'>
            {chart.name}
          </span>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="flex flex-col items-center justify-center gap-4 h-auto !rounded-2xl !border-transparent">
        {chart.type === 'LineChart' && (
          <>
            <FiltersChart
              id_chart={chart.id}
              setFilters={setFilters}
              actions={
                <Tooltip title="Exportar datos">
                  <span>
                    <IconButton
                      size="small"
                      disabled={loader || !hasExportableData(chartData)}
                      onClick={(e) => setExportAnchor(e.currentTarget)}
                      sx={{
                        color: '#2c6aa0',
                        '&:hover': {
                          backgroundColor: 'rgba(44, 106, 160, 0.08)',
                        },
                      }}
                    >
                      <FileDownloadOutlined />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            />
            <Menu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={() => setExportAnchor(null)}
            >
              <MenuItem onClick={() => handleExport(exportChartToXlsx)}>
                Excel (.xlsx)
              </MenuItem>
              <MenuItem onClick={() => handleExport(exportChartToCsv)}>
                CSV (.csv)
              </MenuItem>
              <MenuItem onClick={() => handleExport(exportChartToMd)}>
                Markdown (.md)
              </MenuItem>
            </Menu>
          </>
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
