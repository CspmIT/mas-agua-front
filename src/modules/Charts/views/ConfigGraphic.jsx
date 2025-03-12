import React, { useEffect, useState } from 'react'
import { Button, IconButton, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import { configs } from '../configs/configs'
import ConfigSimple from '../components/ConfigSimple'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { ArrowBack } from '@mui/icons-material'
import ConfigMultiple from './ConfigMultiple'

const ConfigGraphic = () => {
    const { id, idChart = false } = useParams()
    const {
        register,
        setValue,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm()
    const [chart, setChart] = useState({})
    const [loading, setLoading] = useState(!!idChart) // Estado de carga: true si hay idChart

    const navigate = useNavigate()
    function isSimpleChart(type) {
        return type === 'LiquidFillPorcentaje' || type === 'CirclePorcentaje' || type === 'GaugeSpeed'
    }

    function isValidXConfig(xAxisConfig) {
        if (xAxisConfig.dateTimeType === 'date') {
            return (
                xAxisConfig.dateRange !== '' &&
                xAxisConfig.samplingPeriod !== ''
            )
        }
        if (xAxisConfig.dateTimeType === 'time') {
            return (
                xAxisConfig.timeRange !== '' &&
                xAxisConfig.samplingPeriod !== ''
            )
        }
        return false
    }

    const saveLineChart = async (data) => {
        const { title, type, xAxisConfig, yData } = data

        if (!title.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'El titulo no puede estar vacio',
            })
            return false
        }
        if (!isValidXConfig(xAxisConfig)) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'Faltan datos en la configuracion del eje X',
            })
            return false
        }
        if (yData.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'El eje Y debe tener al menos una variable',
            })
            return false
        }
        const url = backend[import.meta.env.VITE_APP_NAME]
        const endpoint = `${url}/chartSeries`
        try {
            const response = await request(endpoint, 'POST', data)
            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    html: 'Se guardó correctamente la configuración',
                })
                navigate('/')
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const saveSimpleChart = async (data) => {
        if (data?.idVar === undefined) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: 'Debe seleccionar una variable para el gráfico',
            })
            return
        }
        data.porcentage = data.porcentage == 'true'
        data.border = data.border == 'true'
        data.maxValue = parseFloat(data.maxValue)
        const endPoint = `${backend['Mas Agua']}/charts`
        try {
            if (idChart) {
                const editEndPoint = `${backend['Mas Agua']}/charts/${idChart}`
                data.id = idChart
                const response = await request(editEndPoint, 'POST', data)
                if (response) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        html: 'Se guardó correctamente la configuración',
                    })
                    navigate('/')
                }
                return
            }
            const response = await request(endPoint, 'POST', data)
            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    html: 'Se guardó correctamente la configuración',
                })
                navigate('/')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: 'Ocurrió un error al intentar guardar la configuración',
            })
            console.error(error.message)
        }
    }

    const onSubmit = async (data) => {
        const { type } = data
        if (type === 'LineChart') {
            await saveLineChart(data)
        }

        if (isSimpleChart(type)) {
            saveSimpleChart(data)
        }
    }

    const onError = (errors) => {
        Swal.fire({
            icon: 'error',
            title: 'Atención!',
            html: 'Debe completar todos los campos',
        })
    }

    const fetchChartData = async (idChart) => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        const endpoint = `${url}/charts/${idChart}`
        try {
            const { data } = await request(endpoint, 'GET')
            setChart(data)
        } catch (error) {
            console.error('Error fetching chart data:', error)
        } finally {
            setLoading(false) // Datos cargados
        }
    }

    useEffect(() => {
        if (idChart) {
            fetchChartData(idChart)
        }
    }, [idChart])

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
                            idChart
                                ? navigate('/config/allGraphic')
                                : navigate('/config/graphic')
                        }}
                    >
                        <ArrowBack sx={{ fontSize: '1.5rem' }} />
                    </IconButton>
                </div>
                <Typography className="text-center !mb-5" variant="h3">
                    {idChart
                        ? `Edición del gráfico "${chart.name || ''}"`
                        : 'Configuración de gráfico'}
                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="flex flex-col gap-4 items-center"
                >
                    <input
                        type="hidden"
                        {...register('type')}
                        value={configs[id].typeGraph}
                    />
                    {!configs[id].singleValue ? (
                        <ConfigMultiple id={id} setValue={setValue} />
                    ) : (
                        // Muestra ConfigSimple solo si no está cargando o no hay idChart
                        (!idChart || !loading) && (
                            <ConfigSimple
                                getValues={getValues}
                                setValue={setValue}
                                register={register}
                                errors={errors}
                                id={id}
                                chartData={idChart ? chart : null} // Pasar los datos del gráfico si está en modo edición
                            />
                        )
                    )}
                    {loading && idChart && (
                        <Typography variant="body1" color="textSecondary">
                            Cargando datos del gráfico...
                        </Typography>
                    )}
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </VarsProvider>
    )
}

export default ConfigGraphic
