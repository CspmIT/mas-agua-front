import React, { useEffect, useState } from 'react'
import {
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SelectVars from '../../modules/Charts/components/SelectVars'

const GraphVariableSelector = ({
    setValue,
    setCustomColorProp,
    setLineStyleProp,
    setAreaStyleProp,
    dataChart = false,
}) => {
    const [valueState, setValueState] = useState(null)
    const [customName, setCustomName] = useState('')
    const [customColor, setCustomColor] = useState('#000000')
    const [lineStyle, setLineStyle] = useState('line')
    const [useAreaStyle, setUseAreaStyle] = useState(false)
    const [xAxisConfig, setXAxisConfig] = useState({
        dateTimeType: 'relative',
        dateRange: '',
        dateFrom: '',
        dateTo: '',
        samplingPeriod: '',
    })

    const [yAxisData, setYAxisData] = useState([])

    useEffect(() => {
        if (dataChart) {
            const series = dataChart.getYSeries()
            const yData = series.map((serie, index) => ({
                id: `y${index}`,
                name: serie.name,
                line: serie.type,
                source_id: serie.idVar.id,
                smooth: serie.smooth,
                color: serie.color,
                areaStyle: serie.areaStyle
            }))
            setYAxisData(yData)
        }
    }, [dataChart])

    useEffect(() => {
        setValue('xAxisConfig', xAxisConfig)
        setValue('yData', yAxisData)
    }, [xAxisConfig, yAxisData])

    const handleAddVariable = () => {
        if (valueState) {
            const newVariable = {
                id: `y${yAxisData.length + 1}`,
                source_id: valueState.id,
                name: customName || valueState.name,
                line: lineStyle,
                smooth: lineStyle === 'smooth',
                color: customColor,
                areaStyle: useAreaStyle
            }
            setYAxisData([...yAxisData, newVariable])
            setValueState(null)
            setCustomName('')
        }
    }

    const handleRemoveVariable = (id) => {
        setYAxisData(yAxisData.filter((item) => item.id !== id))
    }

    return (
        <div className="p-3 w-full">
            <h2 className="text-xl font-bold mb-4 text-center">
                Selector de Variables para Gráfico
            </h2>
            <div className="flex w-full flex-wrap gap-3">
                <SelectVars
                    setValue={setValue}
                    label={'Seleccione una variable'}
                    setValueState={setValueState}
                />
                <TextField
                    label="Nombre personalizado"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    fullWidth
                    className="mb-3"
                />
                <TextField
                    label="Color de la variable"
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                        setCustomColor(e.target.value)
                        setCustomColorProp(e.target.value)
                    }}
                    fullWidth
                    className="mb-3"
                />
                <Select
                    value={lineStyle}
                    onChange={(e) => {
                        setLineStyle(e.target.value)
                        setLineStyleProp(e.target.value)
                    }}
                    fullWidth
                >
                    <MenuItem value="line">Sólida</MenuItem>
                    <MenuItem value="smooth">Línea suavizada</MenuItem>
                    <MenuItem value="bar">Barra</MenuItem>
                    <MenuItem value="scatter">Punto único</MenuItem>
                </Select>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useAreaStyle}
                            onChange={(e) => {
                                const checked = e.target.checked
                                setUseAreaStyle(checked)
                                setAreaStyleProp(checked) // ← CLAVE
                            }}
                        />
                    }
                    label="Mostrar área bajo la curva"
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVariable}
                    disabled={!valueState}
                    fullWidth
                >
                    Agregar Variable al Eje Y
                </Button>
                <Card className="flex-grow">
                    <CardContent className="flex flex-col gap-3">
                        <Typography variant="h6" align="center">
                            Configuración del Eje X
                        </Typography>

                        <RadioGroup
                            row
                            value={xAxisConfig.dateTimeType}
                            onChange={(e) =>
                                setXAxisConfig({
                                    ...xAxisConfig,
                                    dateTimeType: e.target.value,
                                    dateRange: '',
                                    dateFrom: '',
                                    dateTo: '',
                                })
                            }
                        >
                            <FormControlLabel value="relative" control={<Radio />} label="Relativo" />
                            <FormControlLabel value="absolute" control={<Radio />} label="Personalizado" />
                        </RadioGroup>

                        {xAxisConfig.dateTimeType === 'relative' ? (
                            <TextField
                                select
                                label="Valores desde"
                                value={xAxisConfig.dateRange}
                                onChange={(e) =>
                                    setXAxisConfig({ ...xAxisConfig, dateRange: e.target.value })
                                }
                                fullWidth
                            >
                                <MenuItem value="-1d">Últimas 24hs</MenuItem>
                                <MenuItem value="-7d">Últimos 7 días</MenuItem>
                                <MenuItem value="-30d">Últimos 30 días</MenuItem>
                                <MenuItem value="-3mo">Últimos 3 meses</MenuItem>
                                <MenuItem value="-6mo">Últimos 6 meses</MenuItem>
                                <MenuItem value="-1y">Último año</MenuItem>
                            </TextField>
                        ) : (
                            <>
                                <TextField
                                    type="datetime-local"
                                    label="Fecha desde"
                                    value={xAxisConfig.dateFrom}
                                    onChange={(e) =>
                                        setXAxisConfig({ ...xAxisConfig, dateFrom: e.target.value })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                                <TextField
                                    type="datetime-local"
                                    label="Fecha hasta"
                                    value={xAxisConfig.dateTo}
                                    onChange={(e) =>
                                        setXAxisConfig({ ...xAxisConfig, dateTo: e.target.value })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </>
                        )}

                        <TextField
                            select
                            label="Tiempo de muestreo"
                            value={xAxisConfig.samplingPeriod}
                            onChange={(e) =>
                                setXAxisConfig({ ...xAxisConfig, samplingPeriod: e.target.value })
                            }
                            fullWidth
                        >
                            <MenuItem value="1s">1 segundo</MenuItem>
                            <MenuItem value="5s">5 segundos</MenuItem>
                            <MenuItem value="10s">10 segundos</MenuItem>
                            <MenuItem value="1m">1 minuto</MenuItem>
                            <MenuItem value="5m">5 minutos</MenuItem>
                            <MenuItem value="15m">15 minutos</MenuItem>
                            <MenuItem value="30m">30 minutos</MenuItem>
                            <MenuItem value="1h">1 hora</MenuItem>
                            <MenuItem value="3h">3 horas</MenuItem>
                            <MenuItem value="6h">6 horas</MenuItem>
                            <MenuItem value="12h">12 horas</MenuItem>
                            <MenuItem value="1d">1 día</MenuItem>
                        </TextField>
                    </CardContent>
                </Card>

                <Card className="flex-grow">
                    <CardContent>
                        <Typography
                            variant="h6"
                            align="center"
                            component="div"
                            className="mb-2"
                        >
                            Serie de datos Eje Y
                        </Typography>
                        <List>
                            {yAxisData.map((item) => (
                                <ListItem
                                    key={item.id}
                                    className="flex justify-between items-center"
                                >
                                    <ListItemText primary={item.name} />
                                    <IconButton
                                        onClick={() =>
                                            handleRemoveVariable(item.id)
                                        }
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default GraphVariableSelector
