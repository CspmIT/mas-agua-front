import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import { Box, Button, Container, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import BooleanChart from '../components/BooleanChart'
import SelectVars from '../components/SelectVars'
import { zodResolver } from '@hookform/resolvers/zod'
import { BooleanChartSchema } from '../schemas/BooleanChartSchema'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import HeaderForms from '../components/HeaderForms'

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

const previewCardSx = {
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
    overflow: 'hidden',
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
    letterSpacing: '0.01em',
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

const SectionTitle = ({ children }) => (
    <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 px-1 -mt-0.5'>
        {children}
    </div>
)

const ConfigBooleanChart = () => {
    const [loader, setLoader] = useState(true)
    const { id = false } = useParams()
    const [influxVar, setInfluxVar] = useState(null)
    const [initialData, setInitialData] = useState({
        title: '',
        textOn: 'Encendido',
        textOff: 'Apagado',
        colorOn: '#00ff00',
        colorOff: '#444444',
        order: undefined,
    })
    const navigate = useNavigate()

    const {
        handleSubmit,
        register,
        setValue,
        getValues,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(BooleanChartSchema),
        mode: 'onChange',
        defaultValues: initialData,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setInitialData({ ...initialData, [name]: value })
    }

    const createChart = async () => {
        const dataSave = getValues()
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts`
        try {
            await request(url, 'POST', dataSave)
            await Swal.fire({ title: 'Guardado', text: 'Grafico guardado correctamente', icon: 'success' })
            return true
        } catch (error) {
            await Swal.fire({ title: 'Error', text: 'Error al guardar el grafico', icon: 'error' })
            return false
        }
    }

    const updateChart = async () => {
        const dataSave = getValues()
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`
        try {
            await request(url, 'POST', dataSave)
            await Swal.fire({ title: 'Editado', text: 'Grafico editado correctamente', icon: 'success' })
            return true
        } catch (error) {
            await Swal.fire({ title: 'Error', text: 'Error al editar el grafico', icon: 'error' })
            return false
        }
    }

    const send = async () => {
        setValue('type', 'BooleanChart')
        if (!influxVar) {
            await Swal.fire({ title: 'Error', text: 'Debe seleccionar una variable', icon: 'error' })
            return false
        }
        setValue('idVar', influxVar?.id)

        const result = id ? await updateChart() : await createChart()
        if (!result) return false
        navigate('/config/allGraphic')
    }

    const fetchChartData = async () => {
        if (!id) return
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`
        try {
            const { data } = await request(url, 'GET')
            const chartData = {
                title: '',
                textOn: 'Encendido',
                textOff: 'Apagado',
                colorOn: '#00ff00',
                colorOff: '#444444',
                order: undefined,
            }
            data.ChartConfig.forEach(config => {
                if (config.key && config.value !== undefined) chartData[config.key] = config.value
            })
            if (data.order !== undefined) chartData.order = data.order
            if (data.name) chartData.title = data.name

            setInitialData(chartData)
            reset(chartData)

            if (data.ChartData && data.ChartData.length > 0 && data.ChartData[0].InfluxVars) {
                setInfluxVar(data.ChartData[0].InfluxVars)
            }
        } catch (error) {
            console.error(error)
            await Swal.fire({ title: 'Error', text: 'Error al cargar los datos del gráfico', icon: 'error' })
            navigate('/config/allGraphic')
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        if (id) fetchChartData()
        setLoader(false)
    }, [id])

    if (loader) {
        return (
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <Box sx={shellSx}>
                    <Typography variant='body1' align='center' color='textSecondary'>
                        Cargando datos del gráfico...
                    </Typography>
                </Box>
            </Container>
        )
    }

    return (
        <VarsProvider>
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <HeaderForms idChart={id} chart={{ name: initialData?.title }} />

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
                                            label='Título del gráfico'
                                            {...register('title', { onChange: handleChange })}
                                            error={!!errors.title}
                                            helperText={errors.title && errors.title.message}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 160px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Orden'
                                            {...register('order', { onChange: handleChange })}
                                            error={!!errors.order}
                                            helperText={errors.order && errors.order.message}
                                        />
                                    </div>
                                </div>
                            </Box>

                            <Box sx={sectionSx}>
                                <SectionTitle>Estados</SectionTitle>
                                <div className='flex flex-wrap gap-2'>
                                    <div style={{ flex: '2 1 220px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Texto ON'
                                            {...register('textOn', { onChange: handleChange })}
                                            error={!!errors.textOn}
                                            helperText={errors.textOn && errors.textOn.message}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 140px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            type='color'
                                            label='Color ON'
                                            {...register('colorOn', { onChange: handleChange })}
                                            defaultValue={initialData.colorOn || '#00ff00'}
                                            error={!!errors.colorOn}
                                            helperText={errors.colorOn && errors.colorOn.message}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    <div style={{ flex: '2 1 220px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            label='Texto OFF'
                                            {...register('textOff', { onChange: handleChange })}
                                            error={!!errors.textOff}
                                            helperText={errors.textOff && errors.textOff.message}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 140px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            type='color'
                                            label='Color OFF'
                                            {...register('colorOff', { onChange: handleChange })}
                                            defaultValue={initialData.colorOff || '#444444'}
                                            error={!!errors.colorOff}
                                            helperText={errors.colorOff && errors.colorOff.message}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                </div>
                            </Box>

                            <Box sx={sectionSx}>
                                <SectionTitle>Variable</SectionTitle>
                                <SelectVars
                                    setValue={setValue}
                                    setValueState={setInfluxVar}
                                    label='Seleccione una variable para el gráfico'
                                    initialVar={influxVar}
                                />
                            </Box>

                            <div className='flex justify-end pt-1'>
                                <Button type='submit' variant='contained' disableElevation sx={submitPillSx}>
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        <div className='w-full lg:w-5/12'>
                            <Box sx={previewCardSx}>
                                <div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10'>
                                    <h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
                                        {initialData.title || 'Vista previa'}
                                    </h2>
                                </div>
                                <div className='flex-1 flex items-center justify-center p-4'>
                                    <BooleanChart
                                        estado={1}
                                        labelOn={initialData.textOn}
                                        labelOff={initialData.textOff}
                                        colorOff={initialData.colorOff}
                                        colorOn={initialData.colorOn}
                                    />
                                </div>
                            </Box>
                        </div>
                    </form>
                </Box>
            </Container>
        </VarsProvider>
    )
}

export default ConfigBooleanChart
