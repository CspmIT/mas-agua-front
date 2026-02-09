import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import {
  Button,
  Card,
  Divider,
  IconButton,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import SelectVars from '../components/SelectVars.jsx'

const BoardChart = lazy(() => import('../components/BoardChart.jsx'))

const ConfigBoardChart = () => {
  const { id = false } = useParams()
  const navigate = useNavigate()

  const [loader, setLoader] = useState(true)
  const [charts, setCharts] = useState([])

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

      // BOMBEO
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

      // SALA (4 items)
      roomItem0Label: 'Status electricidad',
      roomItem0VarId: null,
      roomItem1Label: 'Status internet',
      roomItem1VarId: null,
      roomItem2Label: 'Temperatura',
      roomItem2VarId: null,
      roomItem3Label: 'Humedad',
      roomItem3VarId: null,
    },
  })

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

    const push = (key, value, type = 'string') =>
      cfg.push({ key, value, type })
    // ===== GRAFICOS =====
    push('board.top.leftChartId', d.topLeftChartId ?? '', 'number')
    push('board.top.rightChartId', d.topRightChartId ?? '', 'number')
    // ===== BOMBEO =====
    push('board.pumping.runtime.label', d.pumpingRuntimeLabel)
    push('board.pumping.starts.label', d.pumpingStartsLabel)
    push('board.pumping.currentL1.label', d.pumpingCurrentL1Label)
    push('board.pumping.currentL2.label', d.pumpingCurrentL2Label)
    push('board.pumping.currentL3.label', d.pumpingCurrentL3Label)
    push('board.pumping.status.key', d.pumpingStatusVarId)
    push('board.pumping.runtime.key', d.pumpingRuntimeVarId)
    push('board.pumping.starts.key', d.pumpingStartsVarId)
    push('board.pumping.currentL1.key', d.pumpingCurrentL1VarId)
    push('board.pumping.currentL2.key', d.pumpingCurrentL2VarId)
    push('board.pumping.currentL3.key', d.pumpingCurrentL3VarId)
    // ===== SALA =====
    push('board.room.item0.label', d.roomItem0Label)
    push('board.room.item0.key', d.roomItem0VarId)
    push('board.room.item1.label', d.roomItem1Label)
    push('board.room.item1.key', d.roomItem1VarId)
    push('board.room.item2.label', d.roomItem2Label)
    push('board.room.item2.key', d.roomItem2VarId)
    push('board.room.item3.label', d.roomItem3Label)
    push('board.room.item3.key', d.roomItem3VarId)

    return cfg
  }

  const previewChartData = useMemo(() => {
    const items = []

    // ===== BOMBEO =====
    if (watch('pumpingStatusVarId')) {
      items.push({
        key: 'board.pumping.status',
        value: null,
        InfluxVars: {
          id: watch('pumpingStatusVarId'),
        },
      })
    }

    if (watch('pumpingRuntimeVarId')) {
      items.push({
        key: 'board.pumping.runtime',
        value: null,
        label: watch('pumpingRuntimeLabel'),
        InfluxVars: {
          id: watch('pumpingRuntimeVarId'),
        },
      })
    }

    if (watch('pumpingStartsVarId')) {
      items.push({
        key: 'board.pumping.starts',
        value: null,
        label: watch('pumpingStartsLabel'),
        InfluxVars: {
          id: watch('pumpingStartsVarId'),
        },
      })
    }

    if (watch('pumpingCurrentL1VarId')) {
      items.push({
        key: 'board.pumping.currentL1',
        value: null,
        label: watch('pumpingCurrentL1Label'),
        InfluxVars: {
          id: watch('pumpingCurrentL1VarId'),
        },
      })
    }

    if (watch('pumpingCurrentL2VarId')) {
      items.push({
        key: 'board.pumping.currentL2',
        value: null,
        label: watch('pumpingCurrentL2Label'),
        InfluxVars: {
          id: watch('pumpingCurrentL2VarId'),
        },
      })
    }

    if (watch('pumpingCurrentL3VarId')) {
      items.push({
        key: 'board.pumping.currentL3',
        value: null,
        label: watch('pumpingCurrentL3Label'),
        InfluxVars: {
          id: watch('pumpingCurrentL3VarId'),
        },
      })
    }

    // ===== SALA =====
    if (watch('roomItem0VarId')) {
      items.push({
        key: 'board.room.item0',
        value: null,
        label: watch('roomItem0Label'),
        InfluxVars: {
          id: watch('roomItem0VarId'),
        },
      })
    }

    if (watch('roomItem1VarId')) {
      items.push({
        key: 'board.room.item1',
        value: null,
        label: watch('roomItem1Label'),
        InfluxVars: {
          id: watch('roomItem1VarId'),
        },
      })
    }

    if (watch('roomItem2VarId')) {
      items.push({
        key: 'board.room.item2',
        value: null,
        label: watch('roomItem2Label'),
        InfluxVars: {
          id: watch('roomItem2VarId'),
        },
      })
    }

    if (watch('roomItem3VarId')) {
      items.push({
        key: 'board.room.item3',
        value: null,
        label: watch('roomItem3Label'),
        InfluxVars: {
          id: watch('roomItem3VarId'),
        },
      })
    }
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

      await Swal.fire(
        'OK',
        id ? 'Tablero editado' : 'Tablero creado',
        'success'
      )

      navigate('/config/allGraphic')
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
        if (id && data[id] === undefined) {
          data[id] = 'Sin Datos'
        }
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
      reset({
        title: data.name || '',
        order: data.order ?? '',

        // ===== TOP =====
        topLeftChartId: getConfigValue(cfg, 'board.top.leftChartId', ''),
        topRightChartId: getConfigValue(cfg, 'board.top.rightChartId', ''),

        // ===== BOMBEO =====
        pumpingStatusVarId: getVarIdFromData(chartData, 'board.pumping.status'),
        pumpingRuntimeVarId: getVarIdFromData(chartData, 'board.pumping.runtime'),
        pumpingStartsVarId: getVarIdFromData(chartData, 'board.pumping.starts'),
        pumpingCurrentL1VarId: getVarIdFromData(chartData, 'board.pumping.currentL1'),
        pumpingCurrentL2VarId: getVarIdFromData(chartData, 'board.pumping.currentL2'),
        pumpingCurrentL3VarId: getVarIdFromData(chartData, 'board.pumping.currentL3'),

        pumpingStatusLabel: getLabelFromData(
          chartData,
          'board.pumping.status',
          'Estado'
        ),
        pumpingRuntimeLabel: getLabelFromData(
          chartData,
          'board.pumping.runtime',
          'Tiempo de funcionamiento'
        ),
        pumpingStartsLabel: getLabelFromData(
          chartData,
          'board.pumping.starts',
          'Cantidad de arranques'
        ),
        pumpingCurrentL1Label: getLabelFromData(
          chartData,
          'board.pumping.currentL1',
          'I_L1'
        ),
        pumpingCurrentL2Label: getLabelFromData(
          chartData,
          'board.pumping.currentL2',
          'I_L2'
        ),
        pumpingCurrentL3Label: getLabelFromData(
          chartData,
          'board.pumping.currentL3',
          'I_L3'
        ),

        // ===== SALA =====
        roomItem0Label: getLabelFromData(chartData, 'board.room.item0', 'Normal'),
        roomItem0VarId: getVarIdFromData(chartData, 'board.room.item0'),

        roomItem1Label: getLabelFromData(chartData, 'board.room.item1', 'Online'),
        roomItem1VarId: getVarIdFromData(chartData, 'board.room.item1'),

        roomItem2Label: getLabelFromData(chartData, 'board.room.item2', '°C'),
        roomItem2VarId: getVarIdFromData(chartData, 'board.room.item2'),

        roomItem3Label: getLabelFromData(chartData, 'board.room.item3', '%'),
        roomItem3VarId: getVarIdFromData(chartData, 'board.room.item3'),
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
      <div className="w-full p-5 flex justify-center">
        <Typography variant="h5">Cargando...</Typography>
      </div>
    )
  }

  const selectedLeftChart =
    charts.find((c) => String(c.id) === String(watch('topLeftChartId'))) || null
  const selectedRightChart =
    charts.find((c) => String(c.id) === String(watch('topRightChartId'))) || null

  return (
    <VarsProvider>
      <div className="w-full bg-white p-5 rounded-lg shadow-md">
        <div className="grid grid-cols-3 items-center mb-5">
          <div />
          <Typography variant="h4" align="center" className="justify-self-center">
            {id ? 'Edición del Tablero' : 'Configuración del Tablero'}
          </Typography>
          <IconButton
            className="justify-self-end"
            onClick={() => navigate('/config/allGraphic')}
          >
            <ArrowBack />
          </IconButton>
        </div>


        <form
          onSubmit={handleSubmit(send)}
          className="flex gap-3 max-sm:flex-col"
        >
          {/* CONFIG */}
          <Card className="w-1/2 max-sm:w-full p-3 flex flex-col gap-3 !rounded-lg shadow-lg ">
            <TextField
              label="Título del tablero"
              size="small"
              {...register('title')}
            />

            <TextField
              label="Orden en el dashboard"
              size="small"
              {...register('order')}
            />

            <Divider />

            {/* Top charts */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Gráficos
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormControl size="small" fullWidth>
                <InputLabel>Gráfico superior izquierdo</InputLabel>
                <Select
                  label="Gráfico superior izquierdo"
                  value={watch('topLeftChartId')}
                  onChange={(e) => setValue('topLeftChartId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>

                  {charts.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Gráfico superior derecho</InputLabel>
                <Select
                  label="Gráfico superior derecho"
                  value={watch('topRightChartId')}
                  onChange={(e) => setValue('topRightChartId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>

                  {charts.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <Divider />

            {/* BOMBEO */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Bombeo
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className='md:col-span-2'>
                <div className="!bg-white">
                  <SelectVars
                    initialVar={watch('pumpingStatusVarId')}

                    setValue={(v) =>
                      setValue('pumpingStatusVarId', v?.id ?? null)
                    }
                    label="-Seleccionar variable-"
                  />
                </div>
              </div>

              <div className='md:col-span-1'>
                <Card className='p-2 mb-2 border-2 !shadow-sm'>
                  <div className="!bg-white">
                    <TextField
                      label="Label Tiempo"
                      size="small"
                      {...register('pumpingRuntimeLabel')}
                      fullWidth
                      className='!mb-2'
                    />
                    <SelectVars
                      initialVar={watch('pumpingRuntimeVarId')}
                      setValue={(v) =>
                        setValue('pumpingRuntimeVarId', v?.id ?? null)
                      }
                      label="-Seleccionar variable-"
                    />
                  </div>
                </Card>

                <Card className='p-2 border-2 !shadow-sm'>
                  <div className="!bg-white">
                    <TextField
                      label="Label Arranques"
                      size="small"
                      {...register('pumpingStartsLabel')}
                      fullWidth
                      className='!mb-2'
                    />
                    <SelectVars
                      initialVar={watch('pumpingStartsVarId')}
                      setValue={(v) =>
                        setValue('pumpingStartsVarId', v?.id ?? null)
                      }
                      label="-Seleccionar variable-"
                    />
                  </div>
                </Card>
              </div>

              <div className='col-span-1'>
                <Card className='p-2 mb-2 border-2 !shadow-sm'>
                  <div className="!bg-white">
                    <TextField
                      label="Label I_L1"
                      size="small"
                      {...register('pumpingCurrentL1Label')}
                      fullWidth
                      className='!mb-2'
                    />
                    <SelectVars
                      initialVar={watch('pumpingCurrentL1VarId')}
                      setValue={(v) =>
                        setValue('pumpingCurrentL1VarId', v?.id ?? null)
                      }
                      label="-Seleccionar variable-"
                    />
                  </div>
                </Card>

                <Card className='p-2 mb-2 border-2 !shadow-sm'>
                  <div className="!bg-white">
                    <TextField
                      label="Label I_L2"
                      size="small"
                      {...register('pumpingCurrentL2Label')}
                      fullWidth
                      className='!mb-2'
                    />
                    <SelectVars
                      initialVar={watch('pumpingCurrentL2VarId')}
                      setValue={(v) =>
                        setValue('pumpingCurrentL2VarId', v?.id ?? null)
                      }
                      label="-Seleccionar variable-"
                    />
                  </div>
                </Card>

                <Card className='p-2 mb-2 border-2 !shadow-sm'>
                  <div className="!bg-white">
                    <TextField
                      label="Label I_L3"
                      size="small"
                      {...register('pumpingCurrentL3Label')}
                      fullWidth
                    />
                    <SelectVars
                      initialVar={watch('pumpingCurrentL3VarId')}
                      setValue={(v) =>
                        setValue('pumpingCurrentL3VarId', v?.id ?? null)
                      }
                      label="-Seleccionar variable-"
                    />
                  </div>
                </Card>
              </div>
            </div>

            <Divider />

            {/* SALA */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Sala
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Label item 1"
                size="small"
                {...register('roomItem0Label')}
              />
              <div className="!bg-white">
                <SelectVars
                  initialVar={watch('roomItem0VarId')}
                  setValue={(v) => setValue('roomItem0VarId', v?.id ?? null)}
                  label="-Seleccionar variable-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Label item 2"
                size="small"
                {...register('roomItem1Label')}
              />
              <div className="!bg-white">
                <SelectVars
                  initialVar={watch('roomItem1VarId')}
                  setValue={(v) => setValue('roomItem1VarId', v?.id ?? null)}
                  label="-Seleccionar variable-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Label item 3"
                size="small"
                {...register('roomItem2Label')}
              />
              <div className="!bg-white">
                <SelectVars
                  initialVar={watch('roomItem2VarId')}
                  setValue={(v) => setValue('roomItem2VarId', v?.id ?? null)}
                  label="-Seleccionar variable-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Label item 4"
                size="small"
                {...register('roomItem3Label')}
              />
              <div className="!bg-white">
                <SelectVars
                  initialVar={watch('roomItem3VarId')}
                  setValue={(v) => setValue('roomItem3VarId', v?.id ?? null)}
                  label="-Seleccionar variable-"
                />
              </div>
            </div>

            <Button type="submit" variant="contained">
              Guardar
            </Button>
          </Card>

          {/* PREVIEW */}
          <Card className="w-1/2 max-sm:w-full h-fit !rounded-lg">
            <Suspense fallback={<div className="p-3">Cargando preview...</div>}>
              <BoardChart
                title={getValues('title')}
                ChartData={previewChartData}
                ChartConfig={buildChartConfig()}
                topLeftChart={selectedLeftChart}
                topRightChart={selectedRightChart}
                inflValues={previewInflValues}
              />
            </Suspense>
          </Card>
        </form>
      </div>
    </VarsProvider>
  )
}

export default ConfigBoardChart
