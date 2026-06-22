import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material'
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useForm } from 'react-hook-form'
import SelectVars from '../components/SelectVars.jsx'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import HeaderForms from '../components/HeaderForms'

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
    isBinaryCompressed: false,
    isCalcBinary: false,
    bits: [],
    idBit: null,
})

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

const ledCardSx = (index = 0) => ({
    position: 'relative',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    borderLeft: '3px solid #2c6aa0',
    p: 1.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    opacity: 0,
    transform: 'translateY(6px)',
    animation: `ledConfigIn 0.3s ${index * 0.03}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
    '@keyframes ledConfigIn': {
        '0%': { opacity: 0, transform: 'translateY(6px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 14px -4px rgba(15, 42, 68, 0.14)',
        borderColor: 'rgba(44, 106, 160, 0.3)',
        borderLeftColor: '#2c6aa0',
    },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: '3px solid #2c6aa0',
    },
})

const previewCardSx = {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
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
    '&:active': { transform: 'translateY(0)' },
}

const addPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(44, 106, 160, 0.4)',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.04)',
    '&:hover': {
        borderColor: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.1)',
    },
    '&.Mui-disabled': { opacity: 0.5 },
}

const SectionTitle = ({ children, right }) => (
    <div className='flex items-center justify-between px-1 -mt-0.5'>
        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
            {children}
        </div>
        {right}
    </div>
)

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

    const updateLed = (index, field, value) => {
        const updated = [...getValues('chartData')]
        updated[index][field] = value
        setValue('chartData', updated)
    }

    const setLedVar = (index, variable) => {
        const updated = [...getValues('chartData')]
        updated[index].idVar = variable?.id ?? null
        updated[index].isBinaryCompressed = variable?.binary_compressed ?? false
        updated[index].isCalcBinary = variable?.calc_binary_compressed ?? false
        updated[index].bits = variable?.bits ?? []
        updated[index].idBit = null
        setValue('chartData', updated)
    }

    const addLed = () => {
        const current = getValues('chartData')
        setValue('chartData', [...current, emptyLed()])
    }

    const removeLed = (index) => {
        const updated = [...getValues('chartData')]
        updated.splice(index, 1)
        setValue('chartData', updated)
    }

    const createChart = async () => {
        const dataSave = getValues()
        dataSave.type = 'MultipleBooleanChart'
        try {
            await request(`${backend[import.meta.env.VITE_APP_NAME]}/charts`, 'POST', dataSave)
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
        try {
            await request(`${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`, 'POST', dataSave)
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

        for (const led of leds) {
            if (!led.idVar) {
                await Swal.fire('Error', 'Todos los LEDs deben tener una variable asignada', 'error')
                return
            }
            // calc_binary también es binary_compressed pero no usa bit puntual
            if (led.isBinaryCompressed && !led.isCalcBinary && !led.idBit) {
                await Swal.fire('Error', 'Todos los LEDs con variable binaria comprimida deben tener un bit asignado', 'error')
                return
            }
        }
        const result = id ? await updateChart() : await createChart()
        if (result) navigate('/config/allGraphic')
    }

    const fetchChartData = async () => {
        if (!id) return
        try {
            const { data } = await request(`${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`, 'GET')
            const configByLed = data.ChartConfig.reduce((acc, c) => {
                const [ledKey, prop] = c.key.split('.')
                if (!acc[ledKey]) acc[ledKey] = {}
                acc[ledKey][prop] = c.value
                return acc
            }, {})

            const ledsFormatted = data.ChartData.map(d => {
                const cfg = configByLed[d.key] || {}
                const variable = d.InfluxVars || {}
                return {
                    key: d.key,
                    title: cfg.title || d.label || '',
                    textOn: cfg.textOn || 'Encendido',
                    textOff: cfg.textOff || 'Apagado',
                    colorOn: cfg.colorOn || '#00ff00',
                    colorOff: cfg.colorOff || '#444444',
                    idVar: variable.id || null,
                    isBinaryCompressed: variable.binary_compressed ?? false,
                    isCalcBinary: variable.calc_binary_compressed ?? false,
                    bits: variable.bits ?? [],
                    idBit: d.id_bit ?? null,
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
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <Box sx={shellSx}>
                    <Typography variant='body1' align='center' color='textSecondary'>
                        Cargando...
                    </Typography>
                </Box>
            </Container>
        )
    }

    return (
        <VarsProvider>
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <HeaderForms idChart={id} chart={{ name: watch('title') }} />

                <Box sx={shellSx}>
                    <form onSubmit={handleSubmit(send)} className='flex flex-col lg:flex-row gap-4 w-full'>
                        <div className='flex flex-col gap-3 w-full lg:w-7/12'>
                            <Box sx={sectionSx}>
                                <SectionTitle>Información</SectionTitle>
                                <div className='flex flex-wrap gap-2'>
                                    <div style={{ flex: '2 1 260px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Título del grupo'
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
                                <SectionTitle
                                    right={
                                        <span className='text-[11px] font-semibold text-slate-500 dark:text-gray-400'>
                                            {leds.length} {leds.length === 1 ? 'LED' : 'LEDs'}
                                        </span>
                                    }
                                >
                                    LEDs configurados
                                </SectionTitle>

                                <div className='flex flex-col gap-2.5'>
                                    {leds.map((led, index) => (
                                        <Box key={led.key} sx={ledCardSx(index)}>
                                            <div className='flex items-center justify-between gap-2'>
                                                <div className='inline-flex items-center gap-2'>
                                                    <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-white bg-[#2c6aa0] px-2 py-0.5 rounded-full'>
                                                        LED {index + 1}
                                                    </span>
                                                </div>
                                                <Button
                                                    size='small'
                                                    variant='text'
                                                    color='error'
                                                    startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                                                    onClick={() => removeLed(index)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        minHeight: 0,
                                                        px: 1,
                                                        py: 0.25,
                                                    }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>

                                            <TextField
                                                fullWidth
                                                size='small'
                                                label='Nombre del LED'
                                                value={led.title}
                                                onChange={e => updateLed(index, 'title', e.target.value)}
                                            />

                                            {/* Texto/Color ON-OFF: no aplican para calc_binary (estado y color salen del results de la variable) */}
                                            {!led.isCalcBinary && (
                                                <>
                                                    <div className='flex flex-wrap gap-2'>
                                                        <div style={{ flex: '2 1 200px' }}>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                label='Texto ON'
                                                                value={led.textOn}
                                                                onChange={e => updateLed(index, 'textOn', e.target.value)}
                                                            />
                                                        </div>
                                                        <div style={{ flex: '1 1 120px' }}>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                type='color'
                                                                label='Color ON'
                                                                value={led.colorOn}
                                                                onChange={e => updateLed(index, 'colorOn', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='flex flex-wrap gap-2'>
                                                        <div style={{ flex: '2 1 200px' }}>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                label='Texto OFF'
                                                                value={led.textOff}
                                                                onChange={e => updateLed(index, 'textOff', e.target.value)}
                                                            />
                                                        </div>
                                                        <div style={{ flex: '1 1 120px' }}>
                                                            <TextField
                                                                fullWidth
                                                                size='small'
                                                                type='color'
                                                                label='Color OFF'
                                                                value={led.colorOff}
                                                                onChange={e => updateLed(index, 'colorOff', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <SelectVars
                                                setValueState={v => setLedVar(index, v)}
                                                label='Variable del LED'
                                            />

                                            {/* Selector de bit: solo binaria comprimida no calculada */}
                                            {led.isBinaryCompressed && !led.isCalcBinary && (
                                                <FormControl fullWidth size='small'>
                                                    <InputLabel>Bit de la variable</InputLabel>
                                                    <Select
                                                        value={led.idBit ?? ''}
                                                        label='Bit de la variable'
                                                        onChange={e => updateLed(index, 'idBit', e.target.value)}
                                                    >
                                                        <MenuItem value='' disabled>
                                                            Seleccioná un bit
                                                        </MenuItem>
                                                        {led.bits.map(b => (
                                                            <MenuItem key={b.id} value={b.id}>
                                                                {b.name} (bit {b.bit})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </Box>
                                    ))}
                                </div>

                                <Button
                                    variant='outlined'
                                    sx={addPillSx}
                                    startIcon={<AddCircleOutline sx={{ fontSize: 18 }} />}
                                    onClick={addLed}
                                >
                                    Agregar LED
                                </Button>
                            </Box>

                            <div className='flex justify-end pt-1'>
                                <Button type='submit' variant='contained' disableElevation sx={submitPillSx}>
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        <div className='w-full lg:w-5/12'>
                            <Box sx={{ ...previewCardSx, minHeight: 340 }}>
                                <Suspense fallback={<div className='p-3 text-sm text-slate-500'>Cargando preview...</div>}>
                                    <MultipleBooleanChart
                                        title={getValues('title') || 'Vista previa'}
                                        items={leds.map(l => ({
                                            ...l,
                                            // calc_binary: estado de ejemplo para el preview; booleano: apagado
                                            value: l.isCalcBinary
                                                ? { index: 0, bitValues: [], image: 'success', label: 'Estado de ejemplo' }
                                                : false,
                                        }))}
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

export default ConfigMultipleBooleanChart
