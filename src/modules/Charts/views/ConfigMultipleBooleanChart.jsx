import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import {
    Button,
    Card,
    IconButton,
    TextField,
    Typography,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useForm } from 'react-hook-form'
import SelectVars from '../components/SelectVars.jsx'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

const MultipleBooleanChart = lazy(() =>
    import('../components/MultipleBooleanChart.jsx')
)

const emptyLed = () => ({
    key: `led_${Date.now()}`,
    title: '',
    textOn: 'Encendido',
    textOff: 'Apagado',
    colorOn: '#00ff00',
    colorOff: '#444444',
    idVar: null,
})

const ConfigMultipleBooleanChart = () => {
    const { id = false } = useParams()
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)

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
            chartData: [emptyLed()],
        },
    })

    const leds = watch('chartData')
    const MAX_LEDS = 6

    /* =========================
       HELPERS
    ========================= */
    const updateLed = (index, field, value) => {
        const updated = [...getValues('chartData')]
        updated[index][field] = value
        setValue('chartData', updated)
    }

    const setLedVar = (index, variable) => {
        updateLed(index, 'idVar', variable?.id)
    }

    const addLed = () => {
        const current = getValues('chartData')

        if (current.length >= MAX_LEDS) {
            Swal.fire(
                'Límite alcanzado',
                `Solo se permiten hasta ${MAX_LEDS} LEDs`,
                'warning'
            )
            return
        }

        setValue('chartData', [...current, emptyLed()])
    }

    const removeLed = index => {
        const updated = [...getValues('chartData')]
        updated.splice(index, 1)
        setValue('chartData', updated)
    }

    /* =========================
       CREATE / UPDATE
    ========================= */
    const createChart = async () => {
        const dataSave = getValues()
        dataSave.type = 'MultipleBooleanChart'

        try {
            await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/charts`,
                'POST',
                dataSave
            )
            await Swal.fire('Guardado', 'Gráfico creado correctamente', 'success')
            return true
        } catch {
            await Swal.fire('Error', 'Error al guardar el gráfico', 'error')
            return false
        }
    }

    const updateChart = async () => {
        const dataSave = getValues()
        dataSave.type = 'MultipleBooleanChart'
        console.log(dataSave)
        try {
            await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`,
                'POST',
                dataSave
            )
            await Swal.fire('Editado', 'Gráfico editado correctamente', 'success')
            return true
        } catch {
            await Swal.fire('Error', 'Error al editar el gráfico', 'error')
            return false
        }
    }

    const send = async () => {
        const leds = getValues('chartData')

        if (!leds.length) {
            await Swal.fire('Error', 'Debe configurar al menos un LED', 'error')
            return
        }

        if (leds.length > MAX_LEDS) {
            await Swal.fire(
                'Error',
                `No se pueden guardar más de ${MAX_LEDS} LEDs`,
                'error'
            )
            return
        }        

        for (const led of leds) {
            if (!led.idVar) {
                await Swal.fire(
                    'Error',
                    'Todos los LEDs deben tener una variable asignada',
                    'error'
                )
                return
            }
        }

        const result = id ? await updateChart() : await createChart()
        if (result) navigate('/config/allGraphic')
    }

    /* =========================
       FETCH (EDICIÓN)
    ========================= */
    const fetchChartData = async () => {
        if (!id) return

        try {
            const { data } = await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`,
                'GET'
            )

            // 1) Agrupar configuraciones por LED
            const configByLed = data.ChartConfig.reduce((acc, c) => {
                const [ledKey, prop] = c.key.split('.')
                if (!acc[ledKey]) acc[ledKey] = {}
                acc[ledKey][prop] = c.value
                return acc
            }, {})

            // 2) Reconstruir LEDs
            const ledsFormatted = data.ChartData.map(d => {
                const cfg = configByLed[d.key] || {}

                return {
                    key: d.key,
                    title: cfg.title || d.label || '',
                    textOn: cfg.textOn || 'Encendido',
                    textOff: cfg.textOff || 'Apagado',
                    colorOn: cfg.colorOn || '#00ff00',
                    colorOff: cfg.colorOff || '#444444',
                    idVar: d.InfluxVars?.id || null,
                }
            })

            reset({
                title: data.name || '',
                order: data.order,
                chartData: ledsFormatted,
            })

        } catch (e) {
            await Swal.fire('Error', 'Error al cargar el gráfico', 'error')
        } finally {
            setLoader(false)
        }
    }


    useEffect(() => {
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

    return (
        <VarsProvider>
            <div className="w-full bg-white p-5 rounded-lg shadow-md">
                <div className="flex justify-end">
                    <IconButton onClick={() => navigate('/config/allGraphic')}>
                        <ArrowBack />
                    </IconButton>
                </div>

                <Typography variant="h4" align="center" className="mb-5">
                    {id ? 'Edición de LEDs Múltiples' : 'Configuración de LEDs Múltiples'}
                </Typography>

                <form onSubmit={handleSubmit(send)} className="flex gap-3 max-sm:flex-col">
                    {/* CONFIG */}
                    <Card className="w-2/3 max-sm:w-full p-3 flex flex-col gap-3">
                        <TextField
                            label="Título del grupo"
                            size="small"
                            {...register('title')}
                        />

                        <TextField
                            label="Orden en el dashboard"
                            size='small'
                            {...register('order')}
                        />

                        {leds.map((led, index) => (
                            <Card key={led.key} className="p-3 border flex flex-col gap-3 mx-2 !rounded-xl !bg-slate-50 text-center ">
                                <Typography variant="subtitle1">
                                    LED {index + 1}
                                </Typography>
                                <div className='!bg-white'>
                                    <TextField
                                        label="Nombre del LED"
                                        value={led.title}
                                        onChange={e =>
                                            updateLed(index, 'title', e.target.value)
                                        }
                                        size="small"
                                        fullWidth
                                    />
                                </div>
                                <div className="flex gap-4 max-sm:flex-col">
                                    <div className='w-1/2 max-sm:w-full'>
                                        <div className='!bg-white mb-3'>
                                            {/* ON */}
                                            <TextField
                                                label="Texto ON"
                                                value={led.textOn}
                                                onChange={e =>
                                                    updateLed(index, 'textOn', e.target.value)
                                                }
                                                size="small"
                                                fullWidth
                                            />
                                        </div>
                                        <div className='!bg-white'>
                                            <TextField
                                                type="color"
                                                label="Color ON"
                                                value={led.colorOn}
                                                onChange={e =>
                                                    updateLed(index, 'colorOn', e.target.value)
                                                }
                                                size="small"
                                                fullWidth
                                            />
                                        </div>
                                    </div>
                                    <div className='w-1/2 max-sm:w-full'>
                                        <div className='!bg-white mb-3'>
                                            {/* OFF */}
                                            <TextField
                                                label="Texto OFF"
                                                value={led.textOff}
                                                onChange={e =>
                                                    updateLed(index, 'textOff', e.target.value)
                                                }
                                                size="small"
                                                fullWidth
                                            />
                                        </div>
                                        <div className='!bg-white'>
                                            <TextField
                                                type="color"
                                                label="Color OFF"
                                                value={led.colorOff}
                                                onChange={e =>
                                                    updateLed(index, 'colorOff', e.target.value)
                                                }
                                                size="small"
                                                fullWidth
                                            />
                                        </div>
                                    </div>




                                </div>
                                <div className='!bg-white'>
                                    <SelectVars
                                        setValueState={v => setLedVar(index, v)}
                                        label="Variable del LED"
                                    />
                                </div>

                                <Button
                                    color="error"
                                    className='!bg-white w-[25%]'
                                    size='small'
                                    variant="outlined"
                                    onClick={() => removeLed(index)}
                                >
                                    Eliminar LED
                                </Button>

                            </Card>
                        ))}

                        <Button
                            variant="outlined"
                            onClick={addLed}
                            disabled={leds.length >= MAX_LEDS}
                        >
                            Agregar LED ({leds.length}/{MAX_LEDS})
                        </Button>

                        <Button type="submit" variant="contained">
                            Guardar
                        </Button>
                    </Card>

                    {/* PREVIEW */}
                    <Card className="w-2/5 max-sm:w-full !rounded-lg h-[42dvh] 2xl:h-[35dvh]">
                        <Suspense fallback={<div>Cargando preview...</div>}>
                            <MultipleBooleanChart
                                title={getValues('title')}
                                items={leds.map(l => ({
                                    ...l,
                                    value: false,
                                }))}
                            />
                        </Suspense>
                    </Card>
                </form>
            </div>
        </VarsProvider>
    )
}

export default ConfigMultipleBooleanChart