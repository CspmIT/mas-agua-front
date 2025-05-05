import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import { Button, Card, IconButton, TextField, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import BooleanChart from '../components/BooleanChart'
import SelectVars from '../components/SelectVars'
import { zodResolver } from '@hookform/resolvers/zod'
import { BooleanChartSchema } from '../schemas/BooleanChartSchema'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

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
        order: undefined
    })
    const navigate = useNavigate()

    const {
        handleSubmit,
        register,
        setValue,
        getValues,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(BooleanChartSchema),
        mode: 'onChange',
        defaultValues: initialData,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setInitialData({
            ...initialData,
            [name]: value
        })
    }

    const createChart = async () => {
        const dataSave = getValues()
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts`

        try {
            await request(url, 'POST', dataSave)
            await Swal.fire({
                title: 'Guardado',
                text: 'Grafico guardado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok',
            })
            return true
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: 'Error al guardar el grafico',
                icon: 'error',
            })
            return false
        }
    }

    const updateChart = async () => {
        const dataSave = getValues()
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`
        try {
            await request(url, 'POST', dataSave)
            await Swal.fire({
                title: 'Editado',
                text: 'Grafico editado correctamente',
                icon:'success', 
            })
            return true
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: 'Error al editar el grafico',
                icon: 'error', 
            })
            return false
        }
    }

    const send = async (data) => {
        setValue('type', 'BooleanChart')
        if (!influxVar) {
            await Swal.fire({
                title: 'Error',
                text: 'Debe seleccionar una variable',
                icon: 'error',
            })
            return false
        }
        setValue('idVar', influxVar?.id)

        let result = false
        if (id) {
            result = await updateChart() // Si hay un id, editar el gráfico existente
        } else {
            result = await createChart()
        }

        if (!result) return false
        navigate('/config/allGraphic')
    }

    // Función para obtener los datos del gráfico a editar
    const fetchChartData = async () => {
        if (!id) return

        const url = `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`

        try {
            const { data } = await request(url, 'GET')

            // Inicializar objeto para almacenar los valores de configuración
            const chartData = {
                title: '',
                textOn: 'Encendido',
                textOff: 'Apagado',
                colorOn: '#00ff00',
                colorOff: '#444444',
                order: undefined
            }

            // Procesar ChartConfig para obtener los valores de configuración
            data.ChartConfig.forEach(config => {
                if (config.key && config.value !== undefined) {
                    chartData[config.key] = config.value;
                }
            });

            // Añadir el orden y nombre como título si existe
            if (data.order !== undefined) {
                chartData.order = data.order;
            }

            // Si hay un nombre, usarlo como título
            if (data.name) {
                chartData.title = data.name;
            }

            setInitialData(chartData)
            reset(chartData) // Reset form with chart data

            // Si hay datos de la variable asociada, obtener sus datos
            if (data.ChartData && data.ChartData.length > 0 && data.ChartData[0].InfluxVars) {
                const varData = data.ChartData[0].InfluxVars;
                setInfluxVar(varData);
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({
                title: 'Error',
                text: 'Error al cargar los datos del gráfico',
                icon: 'error',
            })
            navigate('/config/allGraphic')
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchChartData()
        }
        setLoader(false)
    }, [id])

    if (loader) {
        return (
            <div className="w-full bg-white p-5 rounded-lg shadow-md h-fit flex justify-center items-center">
                <Typography variant="h5">Cargando datos del gráfico...</Typography>
            </div>
        )
    }
    return (
        <VarsProvider>
            <div className="w-full bg-white p-5 rounded-lg shadow-md h-fit">
                <div className="flex justify-end">
                    <IconButton
                        sx={{
                            color: 'black',
                            marginRight: 2,
                            padding: '8px',
                        }}
                        aria-label="volver atrás"
                        onClick={() => {
                            id
                                ? navigate('/config/allGraphic')
                                : navigate('/config/graphic')
                        }}
                    >
                        <ArrowBack sx={{ fontSize: '1.5rem' }} />
                    </IconButton>
                </div>
                <Typography className="text-center !mb-5" variant="h3">
                    {id
                        ? `Edición del gráfico "${initialData?.title || ''}"`
                        : 'Configuración de gráfico'}
                </Typography>
                <form
                    onSubmit={handleSubmit(send)}
                    className="flex max-sm:flex-col w-full gap-3"
                >
                    <Card className="flex flex-col w-full max-sm:w-full p-3 mb-4 gap-3">
                        <TextField
                            type="text"
                            className="w-full"
                            label="Titulo del grafico"
                            {...register('title', {
                                onChange: handleChange
                            })}
                            error={errors.title}
                            helperText={errors.title && errors.title.message}
                        />
                        <TextField
                            className="w-full"
                            {...register('textOn', { onChange: handleChange })}
                            label={'Texto On'}
                            error={errors.textOn}
                            helperText={errors.textOn && errors.textOn.message}
                        />
                        <TextField
                            className="w-full"
                            {...register('textOff', { onChange: handleChange })}
                            label={'Texto Off'}
                            error={errors.textOff}
                            helperText={errors.textOff && errors.textOff.message}
                        />
                        <TextField
                            type="color"
                            className="w-full"
                            label="Color del grafico cuando esta en ON"
                            {...register('colorOn', { onChange: handleChange })}
                            defaultValue={initialData.colorOn || '#00ff00'}
                            error={errors.colorOn}
                            helperText={
                                errors.colorOn && errors.colorOn.message
                            }
                        />
                        <TextField
                            type="color"
                            className="w-full"
                            label="Color del grafico cuando esta en OFF"
                            {...register('colorOff', { onChange: handleChange })}
                            defaultValue={initialData.colorOff || '#444444'}
                            error={errors.colorOff}
                            helperText={
                                errors.colorOff && errors.colorOff.message
                            }
                        />
                        <SelectVars
                            setValue={setValue}
                            setValueState={setInfluxVar}
                            label={'Seleccione una variable para el grafico'}
                            initialVar={influxVar}
                        />
                        <TextField
                            type="text"
                            className="w-full"
                            label="Orden en el dashboard"
                            {...register('order', { onChange: handleChange })}
                            error={errors.order}
                            helperText={
                                errors.order && errors.order.message
                            }
                        />
                        <Button type='submit' variant='contained' color='primary'>Guardar</Button>
                    </Card>

                    <Card className="w-full max-sm:w-full p-3 mb-4">
                        <Typography variant="h4" component="div" align="center">
                            {initialData.title}
                        </Typography>
                        <BooleanChart estado={1} labelOn={initialData.textOn} labelOff={initialData.textOff} colorOff={initialData.colorOff} colorOn={initialData.colorOn} />
                    </Card>
                </form>
            </div>
        </VarsProvider>
    )
}

export default ConfigBooleanChart
