import React, { lazy, Suspense, useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    MenuItem,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { configs } from '../configs/configs'

const ConfigSimple = ({ register, errors, id }) => {
    const [chartType, setChartType] = useState(configs[id].typeGraph)
    const [config, setConfig] = useState(configs[id].preConfig)

    useEffect(() => {
        // Validar y corregir el formato del color al inicializar
        if (!/^#[0-9A-F]{6}$/i.test(config.color)) {
            setConfig((prevConfig) => ({
                ...prevConfig,
                color: '#000000', // Valor por defecto si el formato es incorrecto
            }))
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        // Validar y corregir el formato del color
        let newValue = value
        if (name === 'color' && !/^#[0-9A-F]{6}$/i.test(value)) {
            newValue = '#000000' // Valor por defecto si el formato es incorrecto
        }

        setConfig((prevConfig) => ({
            ...prevConfig,
            [name]: newValue,
        }))
    }

    const ChartComponent = lazy(() => import(`./${chartType}`))
    return (
        <div className="flex max-sm:flex-col w-full gap-3">
            <Card className="mb-4 max-sm:w-full w-1/2">
                <CardContent>
                    <Typography
                        variant="h6"
                        component="div"
                        align="center"
                        className="mb-2"
                    >
                        Seleccione los valores para el grafico
                    </Typography>
                    <div className="flex flex-col gap-3 mb-3">
                        <TextField
                            type="text"
                            className="w-full"
                            label="Titulo del grafico"
                            {...register('title', {
                                required: 'Este campo es requerido',
                            })}
                            error={errors.title}
                            helperText={errors.title && errors.title.message}
                        />
                        <TextField
                            select
                            className="w-full"
                            label="Tipo de grafico"
                            {...register('type', {
                                required: 'Este campo es requerido',
                            })}
                            onChange={handleChange}
                            value={config.type}
                        >
                            <MenuItem value={'circle'}>Círculo</MenuItem>
                            <MenuItem value={'rect'}>Rectángulo</MenuItem>
                            <MenuItem value={'roundRect'}>
                                Rectángulo redondeado
                            </MenuItem>
                            <MenuItem value={'triangle'}>Triangulo</MenuItem>
                            <MenuItem value={'diamond'}>Diamante</MenuItem>
                            <MenuItem value={'arrow'}>Flecha</MenuItem>
                            <MenuItem value={'pin'}>Gota</MenuItem>
                        </TextField>
                        <TextField
                            type="text"
                            className="w-full"
                            label="Tipo de valor"
                            {...register('porcentage', {
                                required: 'Este campo es requerido',
                            })}
                            onChange={handleChange}
                            error={errors.asvalue}
                            helperText={
                                errors.asvalue && errors.asvalue.message
                            }
                            value={config.porcentage}
                            select
                        >
                            <MenuItem value={true}>Porcentaje</MenuItem>
                            <MenuItem value={false}>Valor</MenuItem>
                        </TextField>
                        <TextField
                            select
                            className="w-full"
                            label="Borde"
                            {...register('border')}
                            onChange={handleChange}
                            value={config.border}
                        >
                            <MenuItem value={true}>Si</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </TextField>
                        <TextField
                            type="text"
                            className="w-full"
                            label="Valor del grafico"
                            {...register('value', {
                                required: 'Este campo es requerido',
                            })}
                            onChange={handleChange}
                            error={errors.value}
                            helperText={errors.value && errors.value.message}
                        />
                        <Tooltip
                            arrow
                            title="Este campo se usa para calcular el porcentaje/nivel del grafico."
                        >
                            <TextField
                                type="text"
                                className="w-full"
                                label="Valor maximo del grafico"
                                {...register('maxValue', {
                                    required: 'Este campo es requerido',
                                })}
                                onChange={handleChange}
                                error={errors.maxValue}
                                helperText={
                                    errors.maxValue && errors.maxValue.message
                                }
                            />
                        </Tooltip>
                        {!config.porcentage && (
                            <TextField
                                type="text"
                                className="w-full"
                                label="Unidad del grafico"
                                {...register('unidad', {
                                    required: 'Este campo es requerido',
                                })}
                                onChange={handleChange}
                                error={errors.unidad}
                                helperText={
                                    errors.unidad && errors.unidad.message
                                }
                            />
                        )}

                        <TextField
                            defaultValue={config.color}
                            type="color"
                            className="w-full"
                            label="Color del grafico"
                            {...register('color', {
                                required: 'Este campo es requerido',
                            })}
                            error={errors.color}
                            onChange={handleChange}
                            helperText={errors.color && errors.color.message}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="w-1/2 max-sm:w-full p-3 mb-4">
                <Suspense fallback={<div>Cargando...</div>}>
                    <ChartComponent {...config} />
                </Suspense>
            </Card>
        </div>
    )
}

export default ConfigSimple
