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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SelectVars from '../../modules/Charts/components/SelectVars'

const GraphVariableSelector = ({
    setValue,
    setCustomColorProp,
    setLineStyleProp,
}) => {
    const [valueState, setValueState] = useState(null)
    const [customName, setCustomName] = useState('')
    const [customColor, setCustomColor] = useState('#000000')
    const [lineStyle, setLineStyle] = useState('line')
    const [xAxisConfig, setXAxisConfig] = useState({
        dateTimeType: 'date',
        dateRange: '',
        timeRange: '',
        samplingPeriod: '',
    })
    const [yAxisData, setYAxisData] = useState([])

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
                        <Typography
                            variant="h6"
                            align="center"
                            component="div"
                            className="mb-2"
                        >
                            Configuración del Eje X
                        </Typography>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">
                                Tipo de Rango
                            </FormLabel>
                            <RadioGroup
                                row
                                value={xAxisConfig.dateTimeType}
                                onChange={(e) => {
                                    setXAxisConfig({
                                        ...xAxisConfig,
                                        dateTimeType: e.target.value,
                                    })
                                }}
                            >
                                <FormControlLabel
                                    value="date"
                                    control={<Radio />}
                                    label="Fecha"
                                />
                                <FormControlLabel
                                    value="time"
                                    control={<Radio />}
                                    label="Horas"
                                />
                            </RadioGroup>
                        </FormControl>
                        {xAxisConfig.dateTimeType === 'date' ? (
                            <TextField
                                label="Valores desde"
                                select
                                value={xAxisConfig.dateRange}
                                onChange={(e) =>
                                    setXAxisConfig({
                                        ...xAxisConfig,
                                        dateRange: e.target.value,
                                    })
                                }
                                fullWidth
                                className="mb-3"
                            >
                                <MenuItem value={'-2d'}>
                                    Últimos 2 días
                                </MenuItem>
                                <MenuItem value={'-7d'}>
                                    Últimos 7 días
                                </MenuItem>
                                <MenuItem value={'-30d'}>
                                    Últimos 30 días
                                </MenuItem>
                                <MenuItem value={'-3mo'}>
                                    Últimos 3 meses
                                </MenuItem>
                                <MenuItem value={'-6mo'}>
                                    Últimos 6 meses
                                </MenuItem>
                                <MenuItem value={'-1y'}>Último 1 año</MenuItem>
                                <MenuItem value={'-2y'}>
                                    Últimos 2 años
                                </MenuItem>
                            </TextField>
                        ) : (
                            <TextField
                                select
                                value={xAxisConfig.timeRange}
                                onChange={(e) =>
                                    setXAxisConfig({
                                        ...xAxisConfig,
                                        timeRange: e.target.value,
                                    })
                                }
                                fullWidth
                                label={'Horas del rango'}
                            >
                                {[...Array(25)].map((_, i) => (
                                    <MenuItem
                                        key={i + 1}
                                        value={`-${i + 1}h`}
                                    >{`${i + 1} horas`}</MenuItem>
                                ))}
                            </TextField>
                        )}
                        <TextField
                            select
                            value={xAxisConfig.samplingPeriod}
                            onChange={(e) =>
                                setXAxisConfig({
                                    ...xAxisConfig,
                                    samplingPeriod: e.target.value,
                                })
                            }
                            fullWidth
                            label={'Tiempo de muestreo'}
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
                            <MenuItem value="1d">1 dia</MenuItem>
                            <MenuItem value="15d">15 dias</MenuItem>
                            <MenuItem value="1mo">1 mes</MenuItem>
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
