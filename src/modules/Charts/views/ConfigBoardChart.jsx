import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { Add, DeleteOutline } from '@mui/icons-material'
import { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import SelectVars from '../components/SelectVars.jsx'
import HeaderForms from '../components/HeaderForms'

const BoardChart = lazy(() => import('../components/BoardChart.jsx'))

const shellSx = {
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(15, 42, 68, 0.06)',
  boxShadow:
    '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.12)',
  p: { xs: 2, sm: 2.5 },
  'body.dark &': {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
}

const sectionSx = {
  borderRadius: '14px',
  border: '1px solid rgba(15, 42, 68, 0.06)',
  backgroundColor: 'transparent',
  p: { xs: 1.75, sm: 2 },
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const subCardSx = {
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(15, 42, 68, 0.08)',
  borderLeft: '3px solid #2c6aa0',
  p: 1.5,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  'body.dark &': {
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderLeft: '3px solid #2c6aa0',
  },
}

const previewCardSx = {
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(15, 42, 68, 0.08)',
  boxShadow:
    '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
  backgroundColor: '#ffffff',
  'body.dark &': {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
}

const submitPillSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 500,
  px: 3,
  py: 1,
  minHeight: 0,
  background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
  boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
    transform: 'translateY(-1px)',
  },
}

const SectionTitle = ({ children }) => (
  <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 px-1 -mt-0.5'>
    {children}
  </div>
)

// Multi-select de gráficos históricos (LineChart) para asociar a un elemento
// del tablero. A nivel de módulo por la misma razón que PumpingSlot.
const MultiChartSelect = ({ label, value = [], onChange, options }) => (
  <FormControl size='small' fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select
      multiple
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      renderValue={(selected) =>
        selected
          .map((id) => options.find((o) => String(o.id) === String(id))?.name ?? id)
          .join(', ')
      }
    >
      {options.map((c) => (
        <MenuItem key={c.id} value={c.id} dense>
          <Checkbox
            size='small'
            checked={value.some((id) => String(id) === String(c.id))}
          />
          <ListItemText primary={c.name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)

// A nivel de módulo para que su identidad sea estable entre renders: definido
// dentro del componente, React lo remonta en cada render (la vista se
// re-renderiza con cada tecla por watch()) y el TextField pierde el foco
// mientras SelectVars revierte a initialVar.
const PumpingSlot = ({ label, labelField, register, initialVar, onVarSelect }) => (
  <Box sx={subCardSx}>
    <TextField
      label={label}
      size='small'
      {...register(labelField)}
      fullWidth
    />
    <SelectVars
      initialVar={initialVar}
      onSelect={onVarSelect}
      label='-Seleccionar variable-'
    />
  </Box>
)

const ConfigBoardChart = () => {
  const { id = false } = useParams()
  const navigate = useNavigate()

  const [loader, setLoader] = useState(true)
  const [charts, setCharts] = useState([])
  const [lineCharts, setLineCharts] = useState([])
  const [varObjects, setVarObjects] = useState({})
  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      order: '',
      topLeftChartId: '',
      topRightChartId: '',
      miniChartIds: [],
      levelLabel: 'Profundidad al agua',
      levelVarId: null,
      drawerTopLeft: [],
      drawerTopRight: [],
      drawerLevel: [],
      drawerPumping: [],
      roomItem0Drawer: [],
      roomItem1Drawer: [],
      roomItem2Drawer: [],
      roomItem3Drawer: [],
      pumpingStatusLabel: 'Estado',
      pumpingRuntimeLabel: 'Tiempo de funcionamiento',
      pumpingStartsLabel: 'Cantidad de arranques',
      pumpingCurrentL1Label: 'I_L1',
      pumpingCurrentL2Label: 'I_L2',
      pumpingCurrentL3Label: 'I_L3',
      pumpingStatusVarId: null,
      pumpingRuntimeVarId: null,
      pumpingStartsVarId: null,
      pumpingCurrentL1VarId: null,
      pumpingCurrentL2VarId: null,
      pumpingCurrentL3VarId: null,
      roomItem0Label: 'Energia',
      roomItem0VarId: null,
      roomItem1Label: 'Conectividad',
      roomItem1VarId: null,
      roomItem2Label: 'Temperatura',
      roomItem2VarId: null,
      roomItem3Label: 'Humedad',
      roomItem3VarId: null,
    },
  })

  // Guarda el id en el form y el objeto en varObjects, así initialVar de
  // SelectVars queda en sync con lo último seleccionado.
  const handleVarSelect = (field) => (v) => {
    setValue(field, v?.id ?? null)
    setVarObjects((prev) => ({ ...prev, [field]: v ?? null }))
  }

  const safeGet = (fn, fallback = null) => {
    try {
      const v = fn()
      return v ?? fallback
    } catch {
      return fallback
    }
  }

  const getConfigValue = (configArr, key, fallback = '') =>
    safeGet(() => configArr.find((c) => c.key === key)?.value, fallback)

  const getDataItem = (dataArr, key) =>
    dataArr?.find((d) => d.key === key) ?? null

  const getVarIdFromData = (dataArr, key, fallback = null) =>
    getDataItem(dataArr, key)?.InfluxVars ?? fallback

  const getLabelFromData = (dataArr, key, fallback = '') =>
    getDataItem(dataArr, key)?.label ?? fallback

  const buildChartConfig = () => {
    const d = getValues()
    const cfg = []
    const push = (key, value, type = 'string') => cfg.push({ key, value, type })
    const getVarId = (v) => v?.id ?? v ?? null

    push('board.top.leftChartId', d.topLeftChartId ?? '', 'number')
    push('board.top.rightChartId', d.topRightChartId ?? '', 'number')
    push('board.mini.chartIds', JSON.stringify((d.miniChartIds || []).filter(Boolean)))
    push('board.drawer.topLeft', JSON.stringify(d.drawerTopLeft || []))
    push('board.drawer.topRight', JSON.stringify(d.drawerTopRight || []))
    push('board.drawer.level', JSON.stringify(d.drawerLevel || []))
    push('board.drawer.pumping', JSON.stringify(d.drawerPumping || []))
    push('board.level.value.label', d.levelLabel)
    push('board.level.value.key', getVarId(d.levelVarId))
    push('board.drawer.room.item0', JSON.stringify(d.roomItem0Drawer || []))
    push('board.drawer.room.item1', JSON.stringify(d.roomItem1Drawer || []))
    push('board.drawer.room.item2', JSON.stringify(d.roomItem2Drawer || []))
    push('board.drawer.room.item3', JSON.stringify(d.roomItem3Drawer || []))
    push('board.pumping.runtime.label', d.pumpingRuntimeLabel)
    push('board.pumping.starts.label', d.pumpingStartsLabel)
    push('board.pumping.currentL1.label', d.pumpingCurrentL1Label)
    push('board.pumping.currentL2.label', d.pumpingCurrentL2Label)
    push('board.pumping.currentL3.label', d.pumpingCurrentL3Label)
    push('board.pumping.status.key', getVarId(d.pumpingStatusVarId))
    push('board.pumping.runtime.key', getVarId(d.pumpingRuntimeVarId))
    push('board.pumping.starts.key', getVarId(d.pumpingStartsVarId))
    push('board.pumping.currentL1.key', getVarId(d.pumpingCurrentL1VarId))
    push('board.pumping.currentL2.key', getVarId(d.pumpingCurrentL2VarId))
    push('board.pumping.currentL3.key', getVarId(d.pumpingCurrentL3VarId))
    push('board.room.item0.label', d.roomItem0Label)
    push('board.room.item0.key', getVarId(d.roomItem0VarId))
    push('board.room.item1.label', d.roomItem1Label)
    push('board.room.item1.key', getVarId(d.roomItem1VarId))
    push('board.room.item2.label', d.roomItem2Label)
    push('board.room.item2.key', getVarId(d.roomItem2VarId))
    push('board.room.item3.label', d.roomItem3Label)
    push('board.room.item3.key', getVarId(d.roomItem3VarId))

    return cfg
  }

  const previewChartData = useMemo(() => {
    const items = []
    const maybePush = (key, varIdField, labelField) => {
      if (watch(varIdField)) {
        items.push({
          key,
          value: null,
          label: labelField ? watch(labelField) : undefined,
          InfluxVars: { id: watch(varIdField) },
        })
      }
    }
    maybePush('board.level.value', 'levelVarId', 'levelLabel')
    maybePush('board.pumping.status', 'pumpingStatusVarId')
    maybePush('board.pumping.runtime', 'pumpingRuntimeVarId', 'pumpingRuntimeLabel')
    maybePush('board.pumping.starts', 'pumpingStartsVarId', 'pumpingStartsLabel')
    maybePush('board.pumping.currentL1', 'pumpingCurrentL1VarId', 'pumpingCurrentL1Label')
    maybePush('board.pumping.currentL2', 'pumpingCurrentL2VarId', 'pumpingCurrentL2Label')
    maybePush('board.pumping.currentL3', 'pumpingCurrentL3VarId', 'pumpingCurrentL3Label')
    maybePush('board.room.item0', 'roomItem0VarId', 'roomItem0Label')
    maybePush('board.room.item1', 'roomItem1VarId', 'roomItem1Label')
    maybePush('board.room.item2', 'roomItem2VarId', 'roomItem2Label')
    maybePush('board.room.item3', 'roomItem3VarId', 'roomItem3Label')
    return items
  }, [watch()])

  const send = async () => {
    const data = getValues()
    if (!data.title) {
      await Swal.fire('Error', 'Debe ingresar un título', 'error')
      return
    }

    const payload = {
      title: data.title,
      order: data.order,
      type: 'BoardChart',
      chartConfig: buildChartConfig(),
    }
    try {
      await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/charts${id ? `/${id}` : ''}`,
        'POST',
        payload
      )
      await Swal.fire('OK', id ? 'Tablero editado' : 'Tablero creado', 'success')
      navigate('/boards')
    } catch {
      await Swal.fire('Error', 'No se pudo guardar el tablero', 'error')
    }
  }

  const previewInflValues = useMemo(() => {
    const data = {}
    previewChartData.forEach((item) => {
      const id = item?.InfluxVars?.id
      if (!id) return
      data[id] = 'Sin Datos'
    })
    charts.forEach((c) => {
      c?.ChartData?.forEach((d) => {
        const id = d?.InfluxVars?.id
        if (id && data[id] === undefined) data[id] = 'Sin Datos'
      })
    })
    return data
  }, [previewChartData, charts])

  const fetchAllCharts = async () => {
    try {
      const { data } = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/indicatorCharts`,
        'GET'
      )
      const filtered = (data || []).filter(
        (c) => c.type === 'LiquidFillPorcentaje' || c.type === 'CirclePorcentaje'
      )
      setCharts(filtered)
    } catch (e) {
      console.error(e)
      await Swal.fire('Error', 'No se pudieron cargar los gráficos', 'error')
    }

    // LineCharts para los minigráficos (los excluye /indicatorCharts)
    try {
      const { data } = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/dashboardCharts`,
        'GET'
      )
      setLineCharts((data || []).filter((c) => c.type === 'LineChart'))
    } catch (e) {
      console.error('Error cargando charts de series:', e)
    }
  }

  const fetchChartData = async () => {
    if (!id) return
    try {
      const { data } = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`,
        'GET'
      )
      const cfg = data.ChartConfig || []
      const chartData = data.ChartData || []

      const levelVar = getVarIdFromData(chartData, 'board.level.value')
      const pumpingStatus = getVarIdFromData(chartData, 'board.pumping.status')
      const pumpingRuntime = getVarIdFromData(chartData, 'board.pumping.runtime')
      const pumpingStarts = getVarIdFromData(chartData, 'board.pumping.starts')
      const pumpingCurrentL1 = getVarIdFromData(chartData, 'board.pumping.currentL1')
      const pumpingCurrentL2 = getVarIdFromData(chartData, 'board.pumping.currentL2')
      const pumpingCurrentL3 = getVarIdFromData(chartData, 'board.pumping.currentL3')
      const roomItem0 = getVarIdFromData(chartData, 'board.room.item0')
      const roomItem1 = getVarIdFromData(chartData, 'board.room.item1')
      const roomItem2 = getVarIdFromData(chartData, 'board.room.item2')
      const roomItem3 = getVarIdFromData(chartData, 'board.room.item3')

      const parseIdList = (key) => {
        try {
          const ids = JSON.parse(getConfigValue(cfg, key, '[]'))
          return Array.isArray(ids) ? ids : []
        } catch {
          return []
        }
      }

      reset({
        title: data.name || '',
        order: data.order ?? '',
        topLeftChartId: getConfigValue(cfg, 'board.top.leftChartId', ''),
        topRightChartId: getConfigValue(cfg, 'board.top.rightChartId', ''),
        miniChartIds: parseIdList('board.mini.chartIds'),
        levelVarId: levelVar?.id ?? null,
        levelLabel: getLabelFromData(chartData, 'board.level.value', 'Profundidad al agua'),
        drawerTopLeft: parseIdList('board.drawer.topLeft'),
        drawerTopRight: parseIdList('board.drawer.topRight'),
        drawerLevel: parseIdList('board.drawer.level'),
        drawerPumping: parseIdList('board.drawer.pumping'),
        roomItem0Drawer: parseIdList('board.drawer.room.item0'),
        roomItem1Drawer: parseIdList('board.drawer.room.item1'),
        roomItem2Drawer: parseIdList('board.drawer.room.item2'),
        roomItem3Drawer: parseIdList('board.drawer.room.item3'),
        pumpingStatusVarId: pumpingStatus?.id ?? null,
        pumpingRuntimeVarId: pumpingRuntime?.id ?? null,
        pumpingStartsVarId: pumpingStarts?.id ?? null,
        pumpingCurrentL1VarId: pumpingCurrentL1?.id ?? null,
        pumpingCurrentL2VarId: pumpingCurrentL2?.id ?? null,
        pumpingCurrentL3VarId: pumpingCurrentL3?.id ?? null,
        pumpingStatusLabel: getLabelFromData(chartData, 'board.pumping.status', 'Estado'),
        pumpingRuntimeLabel: getLabelFromData(chartData, 'board.pumping.runtime', 'Tiempo de funcionamiento'),
        pumpingStartsLabel: getLabelFromData(chartData, 'board.pumping.starts', 'Cantidad de arranques'),
        pumpingCurrentL1Label: getLabelFromData(chartData, 'board.pumping.currentL1', 'I_L1'),
        pumpingCurrentL2Label: getLabelFromData(chartData, 'board.pumping.currentL2', 'I_L2'),
        pumpingCurrentL3Label: getLabelFromData(chartData, 'board.pumping.currentL3', 'I_L3'),
        roomItem0Label: getLabelFromData(chartData, 'board.room.item0', 'Normal'),
        roomItem1Label: getLabelFromData(chartData, 'board.room.item1', 'Online'),
        roomItem2Label: getLabelFromData(chartData, 'board.room.item2', '°C'),
        roomItem3Label: getLabelFromData(chartData, 'board.room.item3', '%'),
        roomItem0VarId: roomItem0?.id ?? null,
        roomItem1VarId: roomItem1?.id ?? null,
        roomItem2VarId: roomItem2?.id ?? null,
        roomItem3VarId: roomItem3?.id ?? null,
      })

      setVarObjects({
        levelVarId: levelVar,
        pumpingStatusVarId: pumpingStatus,
        pumpingRuntimeVarId: pumpingRuntime,
        pumpingStartsVarId: pumpingStarts,
        pumpingCurrentL1VarId: pumpingCurrentL1,
        pumpingCurrentL2VarId: pumpingCurrentL2,
        pumpingCurrentL3VarId: pumpingCurrentL3,
        roomItem0VarId: roomItem0,
        roomItem1VarId: roomItem1,
        roomItem2VarId: roomItem2,
        roomItem3VarId: roomItem3,
      })
    } catch (e) {
      await Swal.fire('Error', 'Error al cargar el tablero', 'error')
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    fetchAllCharts()
    if (id) fetchChartData()
    else setLoader(false)
  }, [id])

  if (loader) {
    return (
      <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
        <Box sx={shellSx}>
          <Typography variant='body1' align='center' color='textSecondary'>
            Cargando...
          </Typography>
        </Box>
      </Container>
    )
  }

  const selectedLeftChart =
    charts.find((c) => String(c.id) === String(watch('topLeftChartId'))) || null
  const selectedRightChart =
    charts.find((c) => String(c.id) === String(watch('topRightChartId'))) || null
  const resolveLineCharts = (ids = []) =>
    ids
      .map((id) => lineCharts.find((c) => String(c.id) === String(id)))
      .filter(Boolean)

  const selectedMiniCharts = resolveLineCharts(watch('miniChartIds'))
  const selectedDrawers = {
    topLeft: resolveLineCharts(watch('drawerTopLeft')),
    topRight: resolveLineCharts(watch('drawerTopRight')),
    level: resolveLineCharts(watch('drawerLevel')),
    pumping: resolveLineCharts(watch('drawerPumping')),
    room: [0, 1, 2, 3].map((i) => resolveLineCharts(watch(`roomItem${i}Drawer`))),
  }

  return (
    <VarsProvider>
      <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
        <HeaderForms
          idChart={id}
          chart={{ name: watch('title') }}
          backTo='/config/graphic'
        />

        <Box sx={shellSx}>
          <form
            onSubmit={handleSubmit(send)}
            className='flex flex-col lg:flex-row gap-4 w-full'
          >
            <div className='flex flex-col gap-3 w-full lg:w-7/12'>
              <Box sx={sectionSx}>
                <SectionTitle>Información</SectionTitle>
                <div className='flex flex-wrap gap-2'>
                  <div style={{ flex: '2 1 260px' }}>
                    <TextField
                      fullWidth
                      size='small'
                      label='Título del tablero'
                      {...register('title')}
                    />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <TextField
                      fullWidth
                      size='small'
                      label='Orden'
                      {...register('order')}
                    />
                  </div>
                </div>
              </Box>

              <Box sx={sectionSx}>
                <SectionTitle>Gráficos superiores</SectionTitle>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Gráfico superior izquierdo</InputLabel>
                    <Select
                      label='Gráfico superior izquierdo'
                      value={watch('topLeftChartId')}
                      onChange={(e) => setValue('topLeftChartId', e.target.value)}
                    >
                      <MenuItem value=''><em>Ninguno</em></MenuItem>
                      {charts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size='small' fullWidth>
                    <InputLabel>Gráfico superior derecho</InputLabel>
                    <Select
                      label='Gráfico superior derecho'
                      value={watch('topRightChartId')}
                      onChange={(e) => setValue('topRightChartId', e.target.value)}
                    >
                      <MenuItem value=''><em>Ninguno</em></MenuItem>
                      {charts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <MultiChartSelect
                    label='Históricos al desplegar (izquierdo)'
                    value={watch('drawerTopLeft') || []}
                    onChange={(v) => setValue('drawerTopLeft', v)}
                    options={lineCharts}
                  />
                  <MultiChartSelect
                    label='Históricos al desplegar (derecho)'
                    value={watch('drawerTopRight') || []}
                    onChange={(v) => setValue('drawerTopRight', v)}
                    options={lineCharts}
                  />
                </div>
              </Box>

              <Box sx={sectionSx}>
                <SectionTitle>Minigráficos históricos (columna derecha)</SectionTitle>
                {(watch('miniChartIds') || []).map((chartId, idx) => (
                  <div key={idx} className='flex items-center gap-2'>
                    <FormControl size='small' fullWidth>
                      <InputLabel>{`Minigráfico ${idx + 1}`}</InputLabel>
                      <Select
                        label={`Minigráfico ${idx + 1}`}
                        value={chartId ?? ''}
                        onChange={(e) => {
                          const arr = [...(getValues('miniChartIds') || [])]
                          arr[idx] = e.target.value
                          setValue('miniChartIds', arr)
                        }}
                      >
                        <MenuItem value=''><em>Ninguno</em></MenuItem>
                        {lineCharts.map((c) => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      size='small'
                      aria-label='Quitar minigráfico'
                      onClick={() => {
                        const arr = [...(getValues('miniChartIds') || [])]
                        arr.splice(idx, 1)
                        setValue('miniChartIds', arr)
                      }}
                    >
                      <DeleteOutline fontSize='small' />
                    </IconButton>
                  </div>
                ))}
                <div>
                  <Button
                    size='small'
                    startIcon={<Add />}
                    sx={{ textTransform: 'none' }}
                    onClick={() =>
                      setValue('miniChartIds', [...(getValues('miniChartIds') || []), ''])
                    }
                  >
                    Agregar minigráfico
                  </Button>
                </div>
                {lineCharts.length === 0 && (
                  <Typography variant='caption' color='textSecondary'>
                    No hay gráficos de tipo LineChart disponibles: creá uno desde
                    Configuración → Gráficos para poder asociarlo al tablero.
                  </Typography>
                )}
              </Box>

              <Box sx={sectionSx}>
                <SectionTitle>Nivel de pozo</SectionTitle>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
                  <TextField
                    label='Label del valor'
                    size='small'
                    {...register('levelLabel')}
                  />
                  <SelectVars
                    initialVar={varObjects.levelVarId ?? null}
                    onSelect={handleVarSelect('levelVarId')}
                    label='-Variable de nivel-'
                  />
                  <MultiChartSelect
                    label='Históricos al desplegar'
                    value={watch('drawerLevel') || []}
                    onChange={(v) => setValue('drawerLevel', v)}
                    options={lineCharts}
                  />
                </div>
                <Typography variant='caption' color='textSecondary'>
                  Si no se elige variable, la sección no se muestra en el tablero.
                </Typography>
              </Box>

              <Box sx={sectionSx}>
                <SectionTitle>Bombeo</SectionTitle>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 items-center'>
                  <SelectVars
                    initialVar={varObjects.pumpingStatusVarId ?? null}
                    onSelect={handleVarSelect('pumpingStatusVarId')}
                    label='Variable de estado'
                  />
                  <MultiChartSelect
                    label='Históricos al desplegar'
                    value={watch('drawerPumping') || []}
                    onChange={(v) => setValue('drawerPumping', v)}
                    options={lineCharts}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  <PumpingSlot
                    label='Label tiempo'
                    labelField='pumpingRuntimeLabel'
                    register={register}
                    initialVar={varObjects.pumpingRuntimeVarId ?? null}
                    onVarSelect={handleVarSelect('pumpingRuntimeVarId')}
                  />
                  <PumpingSlot
                    label='Label arranques'
                    labelField='pumpingStartsLabel'
                    register={register}
                    initialVar={varObjects.pumpingStartsVarId ?? null}
                    onVarSelect={handleVarSelect('pumpingStartsVarId')}
                  />
                  <PumpingSlot
                    label='Label I_L1'
                    labelField='pumpingCurrentL1Label'
                    register={register}
                    initialVar={varObjects.pumpingCurrentL1VarId ?? null}
                    onVarSelect={handleVarSelect('pumpingCurrentL1VarId')}
                  />
                  <PumpingSlot
                    label='Label I_L2'
                    labelField='pumpingCurrentL2Label'
                    register={register}
                    initialVar={varObjects.pumpingCurrentL2VarId ?? null}
                    onVarSelect={handleVarSelect('pumpingCurrentL2VarId')}
                  />
                  <PumpingSlot
                    label='Label I_L3'
                    labelField='pumpingCurrentL3Label'
                    register={register}
                    initialVar={varObjects.pumpingCurrentL3VarId ?? null}
                    onVarSelect={handleVarSelect('pumpingCurrentL3VarId')}
                  />
                </div>
              </Box>

              <Box sx={sectionSx}>
                <SectionTitle>Sala</SectionTitle>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
                    <TextField
                      label={`Label item ${i + 1}`}
                      size='small'
                      {...register(`roomItem${i}Label`)}
                    />
                    <SelectVars
                      initialVar={varObjects[`roomItem${i}VarId`] ?? null}
                      onSelect={handleVarSelect(`roomItem${i}VarId`)}
                      label='-Seleccionar variable-'
                    />
                    <MultiChartSelect
                      label='Históricos al desplegar'
                      value={watch(`roomItem${i}Drawer`) || []}
                      onChange={(v) => setValue(`roomItem${i}Drawer`, v)}
                      options={lineCharts}
                    />
                  </div>
                ))}
              </Box>

              <div className='flex justify-end pt-1'>
                <Button type='submit' variant='contained' disableElevation sx={submitPillSx}>
                  Guardar
                </Button>
              </div>
            </div>

            <div className='w-full lg:w-5/12'>
              <Box sx={previewCardSx}>
                <Suspense fallback={<div className='p-3 text-sm text-slate-500'>Cargando preview...</div>}>
                  <BoardChart
                    title={getValues('title') || 'Vista previa'}
                    ChartData={previewChartData}
                    ChartConfig={buildChartConfig()}
                    topLeftChart={selectedLeftChart}
                    topRightChart={selectedRightChart}
                    miniCharts={selectedMiniCharts}
                    drawers={selectedDrawers}
                    singleColumn
                    inflValues={previewInflValues}
                  />
                </Suspense>
              </Box>
            </div>
          </form>
        </Box>
      </Container>
    </VarsProvider>
  )
}

export default ConfigBoardChart
