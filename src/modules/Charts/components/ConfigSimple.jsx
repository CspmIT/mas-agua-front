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
import LiquidFillBottomInfo from '../../home/components/LiquidFillBottomInfo'
import CardCustom from '../../../components/CardCustom/index'

const BOTTOM_KEYS = ['bottom1', 'bottom2', 'bottom3', 'bottom4', 'bottom5', 'bottom6']

const initialBottoms = BOTTOM_KEYS.reduce((acc, key) => ({
    ...acc,
    [key]: { enabled: false, label: '' },
}), {})

const ConfigSimple = ({ register, errors, id, setValue, chartData, getValues }) => {
    const [chartType] = useState(configs[id].typeGraph)
    const isMultipleValues = ['LiquidFillPorcentaje', 'CirclePorcentaje', 'GaugeSpeed'].includes(configs[id].typeGraph)
    const isLiquid = chartType === 'LiquidFillPorcentaje'

    const [secondaryEnabled, setSecondaryEnabled] = useState(false)
    const [bottoms, setBottoms] = useState(initialBottoms)

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

    const setBottom = (key, field, value) =>
        setBottoms(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

    useEffect(() => {
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

        setBottoms(
            BOTTOM_KEYS.reduce((acc, key) => {
                const found = formattedChartData.find(d => d.key === key)
                return {
                    ...acc,
                    [key]: {
                        enabled: !!found,
                        label: found?.label || '',
                    },
                }
            }, {})
        )

        const maxValue = chartData.ChartData.find(d => d.key === 'maxValue')?.value
        const unidad = chartData.ChartData.find(d => d.key === 'unidad')?.value

        if (maxValue !== undefined) { setValue('maxValue', maxValue) }
        if (unidad !== undefined) { setValue('unidad', unidad) }
    }, [chartData])

    const upsertChartData = entry => {
        const prev = getValues('chartData') || []
        const filtered = prev.filter(e => e.key !== entry.key)
        setValue('chartData', [...filtered, entry])
    }

    useEffect(() => {
        BOTTOM_KEYS.forEach(key => {
            if (!bottoms[key].enabled) return
            const current = (getValues('chartData') || []).find(e => e.key === key)
            if (current) upsertChartData({ ...current, label: bottoms[key].label })
        })
    }, [bottoms])

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
        <div className="flex max-sm:flex-col w-[97%] gap-3">
            <Card className="max-sm:w-full w-2/3">
                <CardContent>
                    <Typography variant="h6" component="div" align="center" className="mb-2">
                        Seleccione los valores para el gráfico
                    </Typography>
                    <div className="flex flex-col gap-3 mb-3">
                        <TextField
                            type="text"
                            className="w-full"
                            label="Titulo del gráfico"
                            {...register('title', {
                                required: 'Este campo es requerido',
                            })}
                            error={errors.title}
                            helperText={errors.title && errors.title.message}
                            onChange={(e) => setTitle(e.target.value)}
                            size="small"
                        />

                        <div className='flex gap-4 max-sm:flex-col'>
                            <div className='w-1/2 max-sm:w-full'>
                                {configs[id].typeValue && (
                                    <TextField
                                        className="w-full !mb-2"
                                        label="Tipo de valor"
                                        {...register('porcentage')}
                                        onChange={handleChange}
                                        error={errors.porcentage}
                                        helperText={
                                            errors.porcentage &&
                                            errors.porcentage.message
                                        }
                                        value={String(config.porcentage)}
                                        select
                                        size="small"
                                    >
                                        <MenuItem value="true">Porcentaje</MenuItem>
                                        <MenuItem value="false">Valor</MenuItem>
                                    </TextField>
                                )}

                                {!config.porcentage && configs[id].typeUnity && (
                                    <TextField
                                        type="text"
                                        className="w-full"
                                        label="Unidad del gráfico"
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
                            </div>
                            <div className='w-1/2 max-sm:w-full '>
                                {configs[id].format && (
                                    <TextField
                                        select
                                        className="w-full !mb-2"
                                        label="Tipo de gráfico"
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

                                {configs[id].typeBorder && (
                                    <TextField
                                        select
                                        className="w-full"
                                        label="Borde"
                                        {...register('border')}
                                        onChange={handleChange}
                                        value={String(config.border)}
                                        size="small"
                                    >
                                        <MenuItem value="true">Sí</MenuItem>
                                        <MenuItem value="false">No</MenuItem>
                                    </TextField>
                                )}
                            </div>
                        </div>

                        {isMultipleValues && (
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

                                {isLiquid && (
                                    <>
                                        {/* VARIABLE SECUNDARIA */}
                                        <CardCustom className="p-2 !bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm">
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
                                        </CardCustom>

                                    </>)}
                                {/* BOTTOM 1 - 6 */}
                                {BOTTOM_KEYS.map((key, i) => (
                                    <CardCustom key={key} className="p-2 !bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={bottoms[key].enabled}
                                                    onChange={e => setBottom(key, 'enabled', e.target.checked)}
                                                />
                                            }
                                            label={`Mostrar valor inferior ${i + 1}`}
                                        />
                                        {bottoms[key].enabled && (
                                            <>
                                                <div className="!bg-white mb-2">
                                                    <TextField
                                                        label="Texto a mostrar"
                                                        value={bottoms[key].label}
                                                        onChange={e => setBottom(key, 'label', e.target.value)}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                </div>
                                                <div className="!bg-white">
                                                    <SelectVars
                                                        label="Variable inferior"
                                                        initialVar={chartData?.ChartData?.find(d => d.key === key)?.InfluxVars}
                                                        onSelect={v => upsertChartData({ key, label: bottoms[key].label, idVar: v.id })}
                                                        setValue={setValue}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </CardCustom>
                                ))}
                            </>
                        )}

                        {!isMultipleValues && (
                            <SelectVars
                                setValue={setValue}
                                label="Seleccione una variable"
                            />
                        )}

                        {configs[id].maxValue !== false ? (
                            <TextField
                                type="number"
                                className="w-full"
                                label="Valor maximo del gráfico"
                                inputProps={{ pattern: '^[0-9]+$' }}
                                {...register('maxValue', {
                                    required: 'Este campo es requerido',
                                })}
                                onKeyDown={(e) => {
                                    if (e.key === 'e' || e.key === '+' || e.key === '-') {
                                        e.preventDefault()
                                    }
                                }}
                                onChange={handleChange}
                                error={!!errors.maxValue}
                                helperText={errors.maxValue?.message}
                                size="small"
                            />
                        ) : (
                            <input type="hidden" {...register('maxValue')} value={0} />
                        )}

                        {configs[id].description && (
                            <TextField
                                type="text"
                                className="w-full"
                                label="Descripción"
                                {...register('description')}
                                onChange={handleChange}
                                size="small"
                            />
                        )}
                        {/* {configs[id].description2 && (
                            <TextField
                                type="text"
                                className="w-full"
                                label="Descripción 2"
                                {...register('description2')}
                                onChange={handleChange}
                                size="small"
                            />
                        )} */}
                        <TextField
                            defaultValue={config.color}
                            type="color"
                            className="w-full"
                            label="Color del gráfico"
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
                            label="Orden del gráfico en el dashboard"
                            {...register('order')}
                            onChange={handleChange}
                            size="small"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className={`w-1/3 max-sm:w-full p-3 flex-col`}>
                <div className='h-[42dvh] 2xl:h-[35dvh]'>
                    <Typography variant="h6" component="div" align="center" className="mb-2">
                        {title}
                    </Typography>
                    <Suspense fallback={<div>Cargando...</div>}>

                        <ChartComponent {...config} />
                        {isMultipleValues && (
                            <LiquidFillBottomInfo
                                items={BOTTOM_KEYS
                                    .filter(key => bottoms[key].enabled)
                                    .map(key => ({
                                        label: bottoms[key].label,
                                        value: 0,
                                        unit: '',
                                    }))
                                }
                            />
                        )}

                    </Suspense>
                </div>
            </Card>
        </div >
    )
}

export default ConfigSimple
