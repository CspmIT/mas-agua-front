import React, { useEffect, useState } from 'react'
import {
    Button,
    Card,
    CardContent,
    IconButton,
    TextField,
    Typography,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import SelectVars from './SelectVars'
import TotalizadoPeriodo from './TotalizadoPeriodo'
import CardCustom from '../../../components/CardCustom/index'

const DEFAULT_COLORS = ['#363F9C', '#2E7D32', '#D8621D', '#0288D1', '#7B1FA2', '#C62828']

const emptyVariable = (index) => ({
    idVar: null,
    name: '',
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    initialVar: false,
})

const ConfigTotalizado = ({ register, errors, setValue, chartData }) => {
    const initialTitle =
        chartData?.ChartConfig?.find((c) => c.key === 'title')?.value ||
        chartData?.name ||
        ''

    const [title, setTitle] = useState(initialTitle)
    const [variables, setVariables] = useState(() => {
        if (chartData?.ChartSeriesData?.length) {
            return chartData.ChartSeriesData.map((serie, index) => ({
                idVar: serie.source_id ?? serie.InfluxVars?.id ?? null,
                name: serie.name || '',
                color: serie.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                initialVar: serie.InfluxVars || false,
            }))
        }
        return [emptyVariable(0)]
    })

    useEffect(() => {
        setValue(
            'variables',
            variables.map(({ idVar, name, color }) => ({ idVar, name, color }))
        )
    }, [variables])

    useEffect(() => {
        if (!chartData) return
        setValue('title', initialTitle)
        setValue('order', chartData.order ?? 1)
    }, [chartData])

    const updateVariable = (index, patch) =>
        setVariables((prev) =>
            prev.map((variable, i) => (i === index ? { ...variable, ...patch } : variable))
        )

    const addVariable = () => setVariables((prev) => [...prev, emptyVariable(prev.length)])

    const removeVariable = (index) =>
        setVariables((prev) => prev.filter((_, i) => i !== index))

    const titleField = register('title', { required: 'Este campo es requerido' })

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
                            defaultValue={initialTitle}
                            {...titleField}
                            onChange={(e) => {
                                titleField.onChange(e)
                                setTitle(e.target.value)
                            }}
                            error={!!errors.title}
                            helperText={errors.title && errors.title.message}
                            size="small"
                        />

                        {variables.map((variable, index) => (
                            <CardCustom
                                key={index}
                                className="p-2 !bg-slate-50 border-2 border-slate-100 rounded-md shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Typography variant="subtitle2">
                                        Variable {index + 1}
                                    </Typography>
                                    {variables.length > 1 && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeVariable(index)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="!bg-white">
                                        <SelectVars
                                            label="Seleccione una variable"
                                            initialVar={variable.initialVar}
                                            setValueState={() => {}}
                                            onSelect={(v) =>
                                                updateVariable(index, {
                                                    idVar: v.id,
                                                    name: variable.name || v.name,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-2 max-sm:flex-col">
                                        <TextField
                                            className="w-2/3 max-sm:w-full !bg-white"
                                            label="Nombre a mostrar"
                                            value={variable.name}
                                            onChange={(e) =>
                                                updateVariable(index, { name: e.target.value })
                                            }
                                            size="small"
                                        />
                                        <TextField
                                            className="w-1/3 max-sm:w-full !bg-white"
                                            type="color"
                                            label="Color"
                                            value={variable.color}
                                            onChange={(e) =>
                                                updateVariable(index, { color: e.target.value })
                                            }
                                            size="small"
                                        />
                                    </div>
                                </div>
                            </CardCustom>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addVariable}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        >
                            Agregar variable
                        </Button>

                        <TextField
                            defaultValue={chartData?.order ?? 1}
                            type="text"
                            className="w-full"
                            label="Orden del gráfico en el dashboard"
                            {...register('order')}
                            size="small"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="w-1/3 max-sm:w-full p-3 flex-col">
                <div className="h-[42dvh] 2xl:h-[35dvh]">
                    <Typography variant="h6" component="div" align="center" className="mb-2">
                        {title}
                    </Typography>
                    <TotalizadoPeriodo variables={variables} />
                </div>
            </Card>
        </div>
    )
}

export default ConfigTotalizado
