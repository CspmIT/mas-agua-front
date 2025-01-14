import React, { lazy, Suspense, useState, useEffect, memo } from 'react'
import {
    Card,
    CardContent,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material'
import { configs } from '../configs/configs'
import SelectVars from './SelectVars'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'

const ConfigSimple = ({ register, errors, id, setValue }) => {
    const [chartType, setChartType] = useState(configs[id].typeGraph)
    const [config, setConfig] = useState(configs[id].preConfig)
    const [title, setTitle] = useState('')

    useEffect(() => {
        // Validar y corregir el formato del color al inicializar
        if (!/^#[0-9A-F]{6}$/i.test(config.color)) {
            setConfig((prevConfig) => ({
                ...prevConfig,
                color: '#000000', // Valor por defecto si el formato es incorrecto
            }))
        }

        // Establecer valores iniciales en el estado del formulario
        setValue('porcentage', config.porcentage)
        setValue('border', config.border)
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        // Validar y corregir el formato del color
        let newValue = value
        if (name === 'color' && !/^#[0-9A-F]{6}$/i.test(value)) {
            newValue = '#000000' // Valor por defecto si el formato es incorrecto
        }
        if (name === 'maxValue') {
            const mitad = value / 2 || 0
            newValue = value || 1
            setConfig((prevConfig) => ({
                ...prevConfig,
                ['value']: mitad,
            }))
        }

        setConfig((prevConfig) => ({
            ...prevConfig,
            [name]: newValue,
        }))

    }
    const ChartComponent = lazy(() => import(`../components/${chartType}.jsx`))
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
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {configs[id].format && (
                            <TextField
                                select
                                className="w-full"
                                label="Tipo de grafico"
                                {...register('shape', {
                                    required: 'Este campo es requerido',
                                })}
                                onChange={handleChange}
                                value={config.shape}
                            >
                                <MenuItem value={'circle'}>Círculo</MenuItem>
                                <MenuItem value={'rect'}>Rectángulo</MenuItem>
                                <MenuItem value={'roundRect'}>
                                    Rectángulo redondeado
                                </MenuItem>
                                <MenuItem value={'triangle'}>
                                    Triangulo
                                </MenuItem>
                                <MenuItem value={'diamond'}>Diamante</MenuItem>
                                <MenuItem value={'arrow'}>Flecha</MenuItem>
                                <MenuItem value={'pin'}>Gota</MenuItem>
                            </TextField>
                        )}

                        {configs[id].typeValue && (
                            <TextField
                                className="w-full"
                                label="Tipo de valor"
                                {...register('porcentage')}
                                onChange={handleChange}
                                error={errors.porcentage}
                                helperText={
                                    errors.porcentage &&
                                    errors.porcentage.message
                                }
                                value={config.porcentage}
                                select
                            >
                                <MenuItem value={true}>Porcentaje</MenuItem>
                                <MenuItem value={false}>Valor</MenuItem>
                            </TextField>
                        )}

                        {configs[id].typeBorder && (
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
                        )}

                        <SelectVars
                            setValue={setValue}
                            label={'Seleccione una variable para el grafico'}
                            //! Agregar un parametro para el valor seleccionado
                        />
                        {/* <Tooltip
                            arrow
                            title="Este campo se usa para calcular el porcentaje/nivel del grafico."
                        > */}
                        <TextField
                            type="number"
                            className="w-full"
                            label="Valor maximo del grafico"
                            inputProps={{
                                pattern: '^[0-9]+$',
                            }}
                            {...register('maxValue', {
                                required: 'Este campo es requerido',
                            })}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'e' ||
                                    e.key === '+' ||
                                    e.key === '-'
                                ) {
                                    e.preventDefault()
                                }
                            }}
                            onChange={handleChange}
                            error={!!errors.maxValue}
                            helperText={errors.maxValue?.message}
                        />
                        {/* </Tooltip> */}
                        {!config.porcentage && configs[id].typeUnity && (
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
                <Typography
                    variant="h6"
                    component="div"
                    align="center"
                    className="mb-2"
                >
                    {title}
                </Typography>
                <Suspense fallback={<div>Cargando...</div>}>
                    <ChartComponent {...config} />
                </Suspense>
            </Card>
        </div>
    )
}

export default ConfigSimple
