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
import HeaderForms from '../components/HeaderForms'

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
        return (
            type === 'CirclePorcentaje' ||
            type === 'GaugeSpeed'
        )
    }

    function isValidXConfig(xAxisConfig) {
        if (xAxisConfig.dateTimeType === 'relative') {
            return (
                xAxisConfig.dateRange !== '' &&
                xAxisConfig.samplingPeriod !== ''
            )
        }
        if (xAxisConfig.dateTimeType === 'absolute') {
            return (
                xAxisConfig.dateFrom !== '' &&
                xAxisConfig.dateTo !== ''
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
        let endpoint = `${url}/chartSeries`
        if (idChart) {
            endpoint = `${url}/chartSeries/${idChart}`
        }

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
            console.error(error.message)
        }
    }

    const saveLiquidChart = async (data) => {
        
        const { title, chartData, maxValue, color, shape, border, porcentage, order, unidad } = data
    
        if (!title?.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: 'El título no puede estar vacío',
            })
            return
        }
    
        if (!chartData || chartData.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: 'Debe configurar al menos una variable',
            })
            return
        }
    
        const payload = {
            id: idChart ?? undefined,
            title,
            type: 'LiquidFillPorcentaje',
            maxValue: Number(maxValue),
            color,
            shape,
            order: Number(order),
            unidad,
            border: border === true || border === 'true',
            porcentage: porcentage === true || porcentage === 'true',
            chartData: chartData,
        }
    
        
        const baseUrl = backend['Mas Agua']
        const endpoint = idChart
            ? `${baseUrl}/charts/${idChart}`
            : `${baseUrl}/charts`
    
        try {
            const response = await request(endpoint, 'POST', payload)
    
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
                title: 'Error',
                html: 'No se pudo guardar el gráfico',
            })
            console.error(error)
        }
    }
    

    const saveSimpleChart = async (data) => {
     
        data.porcentage = data.porcentage === 'true' || data.porcentage === true
        data.border = data.border === 'true' || data.border === true
        data.maxValue = parseFloat(data.maxValue)
        data.order = Number(data.order)
        data.chartData = data.chartData ?? []
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

    const saveTotalizadoChart = async (data) => {
        if (data?.idVar === undefined) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: 'Debe seleccionar una variable para el gráfico',
            })
            return
        }
    
        const payload = {
            title: data.title,
            type: 'TotalizadoPeriodo',
            idVar: Number(data.idVar),
            color: data.color,
            order: Number(data.order),
        }
    
        const url = backend[import.meta.env.VITE_APP_NAME]
        const endpoint = idChart ? `${url}/chartSeries/${idChart}` : `${url}/chartSeries`
    
        try {
            const response = await request(endpoint, 'POST', payload)
            if (response) {
                Swal.fire({ icon: 'success', title: '¡Éxito!', html: 'Se guardó correctamente la configuración' })
                navigate('/')
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', html: 'No se pudo guardar el gráfico' })
            console.error(error)
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
        if (type === 'LiquidFillPorcentaje') {
            saveLiquidChart(data)
        }
        if (type === 'TotalizadoPeriodo') { 
            await saveTotalizadoChart(data)
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
            <div className="w-full bg-white p-3 rounded-lg shadow-md h-fit">
                <HeaderForms idChart={idChart} chartName={idChart ? chart : false}/>

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
                        <ConfigMultiple
                            id={id}
                            setValue={setValue}
                            chartData={idChart ? chart : false} // Pasar los datos del gráfico si está en modo edición
                        />
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
