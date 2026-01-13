import React, { lazy, Suspense, useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    MenuItem,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
} from '@mui/material'
import { configs } from '../configs/configs'
import SelectVars from './SelectVars'


const ConfigSimple = ({ register, errors, id, setValue, chartData, getValues }) => {
    const [chartType, setChartType] = useState(configs[id].typeGraph)
    const isLiquid = configs[id].typeGraph === 'LiquidFillPorcentaje'

    const [secondaryEnabled, setSecondaryEnabled] = useState(false)
    const [bottom1Enabled, setBottom1Enabled] = useState(false)
    const [bottom2Enabled, setBottom2Enabled] = useState(false)

    const [bottom1Label, setBottom1Label] = useState('')
    const [bottom2Label, setBottom2Label] = useState('')

    const [config, setConfig] = useState(
        chartData
            ? chartData.ChartConfig.reduce(
                (acc, item) => ({
                    ...acc,
                    [item.key]:
                        item.type === 'boolean' ? item.value === '1' : item.value,
                }),
                {}
            )
            : configs[id].preConfig
    )

    const [title, setTitle] = useState(
        chartData?.ChartConfig.find(c => c.key === 'title')?.value || ''
    )

    useEffect(() => {
        console.log(chartData)
        if (!chartData) return

        setValue('description', chartData.description)
        setValue('description2', chartData.description2)
        setValue('color', chartData.color)
        setValue('order', chartData.order)

        chartData.ChartConfig.forEach(({ key, value, type }) => {
            setValue(key, type === 'boolean' ? value === '1' : value)
        })

        const formattedChartData = chartData.ChartData.map(d => ({
            key: d.key,
            label: d.label,
            idVar: d.InfluxVars?.id,
        }))

        setValue('chartData', formattedChartData)

        setSecondaryEnabled(!!formattedChartData.find(d => d.key === 'secondary'))
        setBottom1Enabled(!!formattedChartData.find(d => d.key === 'bottom1'))
        setBottom2Enabled(!!formattedChartData.find(d => d.key === 'bottom2'))

        setBottom1Label(
            formattedChartData.find(d => d.key === 'bottom1')?.label || ''
        )
        setBottom2Label(
            formattedChartData.find(d => d.key === 'bottom2')?.label || ''
        )

        const maxValue = chartData.ChartData.find(d => d.key === 'maxValue')?.value
        const unidad = chartData.ChartData.find(d => d.key === 'unidad')?.value

        if (maxValue !== undefined) {
            setValue('maxValue', maxValue)
        }

        if (unidad !== undefined) {
            setValue('unidad', unidad)
        }
    }, [chartData])


    const upsertChartData = entry => {
        const prev = getValues('chartData') || []
        const filtered = prev.filter(e => e.key !== entry.key)
        setValue('chartData', [...filtered, entry])
    }

    useEffect(() => {
        if (!bottom1Enabled) return
        const current = (getValues('chartData') || []).find(e => e.key === 'bottom1')
        if (current) {
            upsertChartData({ ...current, label: bottom1Label })
        }
    }, [bottom1Label])

    useEffect(() => {
        if (!bottom2Enabled) return
        const current = (getValues('chartData') || []).find(e => e.key === 'bottom2')
        if (current) {
            upsertChartData({ ...current, label: bottom2Label })
        }
    }, [bottom2Label])

    const handleChange = e => {
        const { name, value } = e.target
        setConfig(prev => ({
            ...prev,
            [name]:
                name === 'porcentage' || name === 'border'
                    ? value === 'true'
                    : value,
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
                            size="small"
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
                                size="small"
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
                                value={String(config.porcentage)} // Convertir el valor a string para asegurar compatibilidad
                                select
                                size="small"
                            >
                                <MenuItem value="true">Porcentaje</MenuItem>
                                <MenuItem value="false">Valor</MenuItem>
                            </TextField>
                        )}

                        {configs[id].typeBorder && (
                            <TextField
                                select
                                className="w-full"
                                label="Borde"
                                {...register('border')}
                                onChange={handleChange}
                                value={String(config.border)} // Convertir el valor a string para asegurar compatibilidad
                                size="small"
                            >
                                <MenuItem value="true">Sí</MenuItem>
                                <MenuItem value="false">No</MenuItem>
                            </TextField>
                        )}

                        {isLiquid && (
                            <>
                                {/* VARIABLE PRINCIPAL */}
                                <SelectVars
                                    label="Variable principal"
                                    initialVar={
                                        chartData?.ChartData?.find(
                                            (d) => d.key === 'value'
                                        )?.InfluxVars
                                    }
                                    onSelect={(v) =>
                                        upsertChartData({
                                            key: 'value',
                                            label: 'value',
                                            idVar: v.id,
                                        })
                                    }
                                    setValue={setValue}
                                />

                                {/* VARIABLE SECUNDARIA */}
                                <CardContent className=" bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={secondaryEnabled}
                                                onChange={(e) =>
                                                    setSecondaryEnabled(
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Mostrar variable secundaria"
                                    />

                                    {secondaryEnabled && (
                                        <div className='!bg-white'>
                                            <SelectVars
                                                label="Variable secundaria"
                                                initialVar={
                                                    chartData?.ChartData?.find(
                                                        (d) => d.key === 'secondary'
                                                    )?.InfluxVars
                                                }
                                                onSelect={(v) =>
                                                    upsertChartData({
                                                        key: 'secondary',
                                                        label: 'secondary',
                                                        idVar: v.id,
                                                    })
                                                }
                                                setValue={setValue}
                                            />
                                        </div>
                                    )}
                                </CardContent>

                                <CardContent className=" bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm">
                                    {/* BOTTOM 1 */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={bottom1Enabled}
                                                onChange={(e) =>
                                                    setBottom1Enabled(
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Mostrar valor inferior 1"
                                    />

                                    {bottom1Enabled && (
                                        <>
                                            <div className='!bg-white mb-2'>
                                                <TextField
                                                    label="Texto a mostrar"
                                                    value={bottom1Label}
                                                    onChange={(e) => setBottom1Label(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </div>
                                            <div className='!bg-white'>
                                                <SelectVars
                                                    label="Variable inferior"
                                                    initialVar={
                                                        chartData?.ChartData?.find(
                                                            (d) => d.key === 'bottom1'
                                                        )?.InfluxVars
                                                    }
                                                    onSelect={(v) =>
                                                        upsertChartData({
                                                            key: 'bottom1',
                                                            label: bottom1Label,
                                                            idVar: v.id,
                                                        })
                                                    }
                                                    setValue={setValue}
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>

                                <CardContent className=" bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm">
                                    {/* BOTTOM 2 */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={bottom2Enabled}
                                                onChange={(e) =>
                                                    setBottom2Enabled(
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Mostrar valor inferior 2"
                                    />

                                    {bottom2Enabled && (
                                        <>
                                            <div className='!bg-white mb-2'>
                                                <TextField
                                                    label="Texto a mostrar"
                                                    value={bottom2Label}
                                                    onChange={(e) => setBottom2Label(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </div>
                                            <div className='!bg-white'>
                                                <SelectVars
                                                    label="Variable inferior"
                                                    initialVar={
                                                        chartData?.ChartData?.find(
                                                            (d) => d.key === 'bottom2'
                                                        )?.InfluxVars
                                                    }
                                                    onSelect={(v) =>
                                                        upsertChartData({
                                                            key: 'bottom2',
                                                            label: bottom2Label,
                                                            idVar: v.id,
                                                        })
                                                    }
                                                    setValue={setValue}
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>


                            </>
                        )}

                        {!isLiquid && (
                            <SelectVars
                                setValue={setValue}
                                label="Seleccione una variable"
                            />
                        )}



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
                            size="small"
                        />
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
                                size="small"
                            />
                        )}

                        {configs[id].description && (
                            <TextField
                                type="text"
                                className="w-full"
                                label="Descripcion"
                                {...register('description')}
                                onChange={handleChange}
                                size="small"
                            />
                        )}
                        {configs[id].description2 && (
                            <TextField
                                type="text"
                                className="w-full"
                                label="Descripcion 2"
                                {...register('description2')}
                                onChange={handleChange}
                                size="small"
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
                            size="small"
                        />
                        <TextField
                            defaultValue={config.order}
                            type="text"
                            className="w-full"
                            label="Orden del grafico en el dashboard"
                            {...register('order')}
                            onChange={handleChange}
                            size="small"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className={`w-1/2 max-sm:w-full p-3 mb-4 `}>
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
