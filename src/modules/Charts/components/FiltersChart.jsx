import { Button, MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import CardCustom from '../../../components/CardCustom'

const samplingOptions = {
  '<1d': ['1s', '5s', '10s', '1m', '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1d'],
  '1d-7d': ['15m', '30m', '1h', '3h', '6h', '12h', '1d'],
  '8d-1mo': ['30m', '1h', '3h', '6h', '12h', '1d', '15d', '1mo'],
  '1mo-6mo': ['3h', '6h', '12h', '1d', '15d', '1mo'],
  '>6mo': ['12h', '1d', '15d', '1mo'],
}

const getSamplingOptions = (dateRange, mode) => {
  if (mode === 'absolute') return samplingOptions['<1d']
  if (dateRange === '-1d') return samplingOptions['<1d']
  if (['-7d'].includes(dateRange)) return samplingOptions['1d-7d']
  if (['-30d'].includes(dateRange)) return samplingOptions['8d-1mo']
  if (['-3mo', '-6mo'].includes(dateRange)) return samplingOptions['1mo-6mo']
  return samplingOptions['>6mo']
}

const relativeSamplingMap = {
  '-1d': '1m',   
  '-7d': '5m',   
  '-30d': '15m',  
  '-3mo': '15m', 
  '-6mo': '1h',  
  '-1y': '1h',  
}

// `compact`: variante para espacios chicos (widgets del home) — ancho completo
// y grilla de 2 columnas en lugar del layout horizontal de los dashboards.
const FiltersChart = ({ id_chart, setFilters, actions, compact = false }) => {
  const [mode, setMode] = useState('relative')
  const [dateRange, setDateRange] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [samplingPeriod, setSamplingPeriod] = useState('')

  useEffect(() => {
    if (mode !== 'relative') return

    if (!dateRange) {
      setSamplingPeriod('')
      return
    }

    const autoSampling = relativeSamplingMap[dateRange] || ''
    setSamplingPeriod(autoSampling)
  }, [mode, dateRange])

  const applyFilters = () => {
    if (!samplingPeriod) {
      Swal.fire('Error', 'Seleccione tiempo de muestreo', 'error')
      return
    }

    if (mode === 'relative' && !dateRange) {
      Swal.fire('Error', 'Seleccione un rango relativo', 'error')
      return
    }

    if (mode === 'absolute' && (!dateFrom || !dateTo)) {
      Swal.fire('Error', 'Seleccione fecha desde y hasta', 'error')
      return
    }

    if (mode === 'absolute' && dateFrom >= dateTo) {
      Swal.fire('Error', 'La fecha desde debe ser menor a la fecha hasta', 'error')
      return
    }

    setFilters((prev) => ({
      ...prev,
      [id_chart]: {
        type: mode,
        dateRange,
        dateFrom,
        dateTo,
        samplingPeriod,
      },
    }))
  }

  const clearFilters = () => {
    setMode('relative')
    setDateRange('')
    setDateFrom('')
    setDateTo('')
    setSamplingPeriod('')

    setFilters((prev) => ({
      ...prev,
      [id_chart]: {},
    }))
  }

  return (
    <>
      <CardCustom
        className={
          compact
            ? 'w-full p-2.5 rounded-lg border border-slate-300/80 dark:border-zinc-600'
            : 'w-5/6 bg-slate-100 p-3 rounded-md border-2 border-slate-200 shadow-md shadow-slate-100 items-center'
        }
      >
        {compact && (
          <div className='flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-200 dark:border-zinc-600 text-slate-500 dark:text-slate-300'>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
              <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
            </svg>
            <span className='text-[10px] font-semibold uppercase tracking-[0.08em]'>
              Filtros del gráfico
            </span>
          </div>
        )}
        <div
          className={
            compact
              ? 'flex flex-wrap items-center gap-2'
              : `grid sm:grid-cols-1 ${
                  mode === 'relative' ? 'md:grid-cols-4' : 'md:grid-cols-5'
                } gap-2 items-center`
          }
        >
          <TextField
            select
            label="Tipo de rango"
            value={mode}
            onChange={(e) => {
              const newMode = e.target.value
              setMode(newMode)

              setDateRange('')
              setDateFrom('')
              setDateTo('')
              setSamplingPeriod('')
            }}
            fullWidth={!compact}
            sx={compact ? { flex: '1 1 150px', minWidth: 140 } : undefined}
            size="small"
          >
            <MenuItem value="relative">Predefinido</MenuItem>
            <MenuItem value="absolute">Específico</MenuItem>
          </TextField>

          {mode === 'relative' ? (
            <TextField
              select
              label="Valores desde"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
              }}
              fullWidth={!compact}
              sx={compact ? { flex: '1 1 180px', minWidth: 160 } : undefined}
              size="small"
            >
              <MenuItem value="-1d">Últimas 24hs</MenuItem>
              <MenuItem value="-7d">Últimos 7 días</MenuItem>
              <MenuItem value="-30d">Últimos 30 días</MenuItem>
              <MenuItem value="-3mo">Últimos 3 meses</MenuItem>
              <MenuItem value="-6mo">Últimos 6 meses</MenuItem>
              <MenuItem value="-1y">Último año</MenuItem>
            </TextField>
          ) : (
            <>
              <TextField
                type="datetime-local"
                label="Fecha desde"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth={!compact}
                sx={compact ? { flex: '1 1 195px', minWidth: 180 } : undefined}
                size="small"
              />
              <TextField
                type="datetime-local"
                label="Fecha hasta"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth={!compact}
                sx={compact ? { flex: '1 1 195px', minWidth: 180 } : undefined}
                size="small"
              />
            </>
          )}

          <TextField
            select
            label="Tiempo de muestreo"
            value={samplingPeriod}
            onChange={(e) => setSamplingPeriod(e.target.value)}
            fullWidth={!compact}
            sx={compact ? { flex: '1 1 170px', minWidth: 150 } : undefined}
            size="small"
            disabled={mode === 'relative'}
          >
            {mode === 'relative' ? (
              samplingPeriod ? (
                <MenuItem value={samplingPeriod}>{samplingPeriod}</MenuItem>
              ) : (
                <MenuItem value="" disabled>
                  Seleccione rango primero
                </MenuItem>
              )
            ) : (
              getSamplingOptions(dateRange, mode).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))
            )}
          </TextField>

          <div
            className={
              compact
                ? 'flex gap-2 items-center ml-auto shrink-0'
                : 'flex gap-3 items-center justify-center flex-wrap'
            }
          >
            <Button size="small" variant="contained" color="primary" onClick={applyFilters}>
              Aplicar
            </Button>
            <Button size="small" variant="outlined" color="primary" onClick={clearFilters}>
              Limpiar
            </Button>
            {actions && (
              <>
                <div className="h-6 w-px bg-slate-300" />
                {actions}
              </>
            )}
          </div>
        </div>
      </CardCustom>
    </>
  )
}

export default FiltersChart
