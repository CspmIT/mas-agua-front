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
import { useState } from 'react'
import FiltersChart from '../../Charts/components/FiltersChart'
import { ChartFactory } from './ChartFactory'
import { useLineChartData } from '../../../hooks/useLineChartData'
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

const ChartAccordion = ({ chart }) => {
  const [expanded, setExpanded] = useState(false)
  const [exportAnchor, setExportAnchor] = useState(null)

  const { loader, chartData, setFilters, handleZoomRange, handleRestore } =
    useLineChartData(chart, { active: expanded, refreshMs: 15000 })

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded)
  }

  const handleExport = (exportFn) => {
    setExportAnchor(null)
    if (!hasExportableData(chartData)) return
    exportFn(chartData, chart.name)
  }

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
