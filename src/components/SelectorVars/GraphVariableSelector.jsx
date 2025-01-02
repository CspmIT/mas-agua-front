import React, { useState, useEffect } from 'react'
import {
    Select,
    MenuItem,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Card,
    CardContent,
    Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const GraphVariableSelector = () => {
    const [variables, setVariables] = useState([])
    const [selectedVariable, setSelectedVariable] = useState('')
    const [xAxisData, setXAxisData] = useState([])
    const [yAxisData, setYAxisData] = useState([])

    // Simula la obtención de variables desde la base de datos
    useEffect(() => {
        const fetchVariables = async () => {
            // Simulamos variables de ejemplo
            const fetchedVariables = ['Ventas', 'Costos', 'Ganancias', 'Tiempo']
            setVariables(fetchedVariables)
        }

        fetchVariables()
    }, [])

    const handleVariableChange = (event) => {
        setSelectedVariable(event.target.value)
    }

    const handleAddXAxis = () => {
        if (selectedVariable) {
            const newId = `x${xAxisData.length + 1}`
            setXAxisData([...xAxisData, { id: newId, name: selectedVariable }])
            setSelectedVariable('')
        }
    }
    const handleRemoveXAxis = (id) => {
        setXAxisData(xAxisData.filter((item) => item.id !== id))
    }

    const handleAddYAxis = () => {
        if (selectedVariable) {
            const newId = `y${yAxisData.length + 1}`
            setYAxisData([...yAxisData, { id: newId, name: selectedVariable }])
            setSelectedVariable('')
        }
    }

    const handleRemoveYAxis = (id) => {
        setYAxisData(yAxisData.filter((item) => item.id !== id))
    }

    const renderAxisCard = (title, data, onAdd, onRemove) => (
        <Card className="mb-4 max-sm:w-full">
            <CardContent>
                <Typography variant="h6" component="div" className="mb-2">
                    {title}
                </Typography>
                <List>
                    {data.map((item) => (
                        <ListItem
                            key={item.id}
                            className="flex justify-between items-center"
                        >
                            <ListItemText primary={item.name} />
                            {onRemove && (
                                <IconButton
                                    onClick={() => onRemove(item.id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </ListItem>
                    ))}
                </List>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onAdd}
                    disabled={!selectedVariable}
                    fullWidth
                >
                    Agregar al {title}
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">
                Selector de Variables para Gráfico
            </h2>

            <Select
                value={selectedVariable}
                onChange={handleVariableChange}
                displayEmpty
                fullWidth
                className="mb-4"
            >
                <MenuItem value="" disabled>
                    Selecciona una variable
                </MenuItem>
                {variables.map((variable, index) => (
                    <MenuItem key={index} value={variable}>
                        {variable}
                    </MenuItem>
                ))}
            </Select>
            <div className="flex w-full flex-wrap">
                {renderAxisCard(
                    'Eje X',
                    xAxisData,
                    handleAddXAxis,
                    handleRemoveXAxis
                )}
                {renderAxisCard(
                    'Eje Y',
                    yAxisData,
                    handleAddYAxis,
                    handleRemoveYAxis
                )}
            </div>
        </div>
    )
}

export default GraphVariableSelector
