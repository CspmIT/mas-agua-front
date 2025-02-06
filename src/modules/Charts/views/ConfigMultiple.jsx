import React, { lazy, Suspense, useEffect, useState } from 'react'
import GraphVariableSelector from '../../../components/SelectorVars/GraphVariableSelector'
import { Card, TextField, Typography } from '@mui/material'
import { configs } from '../configs/configs'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

const ConfigMultiple = ({ id, setValue }) => {
    const [chartType, setType] = useState(configs[id].typeGraph)
    const [data, setData] = useState({})
    const [customColor, setCustomColorProp] = useState('#f0f0f0')
    const [lineStyle, setLineStyleProp]= useState('line')
    const [title, setTitle] = useState('')
    const ChartComponent = lazy(() =>
        import(`/src/modules/Charts/components/${chartType}.jsx`)
    )
    // Simula la obtención de variables desde la base de datos
    useEffect(() => {
        const fetchVariables = async () => {
            const xType = 'category' // Tipo de datos en el eje X
            const yType = 'value' // Tipo de datos en el eje Y

            const xSeries = [
                '24/01/2025',
                '25/01/2025',
                '26/01/2025',
                '27/01/2025',
                '28/01/2025',
                '29/01/2025',
                '30/01/2025',
                '31/01/2025',
            ]
            const ySeries = [
                {
                    name: 'Product A', // Nombre del producto
                    type: lineStyle === 'smooth' ? 'line' : lineStyle, // Tipo de gráfico
                    data: [15, 25, 20, 4, 5, 30, 37, 45], // Ventas de Producto A
                    smooth: lineStyle === 'smooth',
                    color: customColor 
                },
                {
                    name: 'Product B', // Nombre del producto
                    type: 'line', // Tipo de gráfico
                    data: [5, 30, 10, 23, 46, 3, 20, 4], // Ventas de Producto B
                    smooth: true,
                },
            ]

            setData({ xType, xSeries, yType, ySeries })
        }

        fetchVariables()
    }, [customColor, lineStyle])

    useEffect(() => {
        setValue('title', title)
    }, [title])

    return (
        <div className="flex max-sm:flex-col w-full gap-3">
            <Card className="w-full max-sm:w-full p-3 mb-4">
                <TextField
                    className="w-full"
                    placeholder="Titulo"
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
                <GraphVariableSelector id={id} setValue={setValue} setCustomColorProp={setCustomColorProp} setLineStyleProp={setLineStyleProp} />
            </Card>
            <Card className="w-full max-sm:w-full p-3 mb-4">
                <Typography
                    variant="h6"
                    component="div"
                    align="center"
                    className="mb-2"
                >
                    {title}
                </Typography>
                <Suspense fallback={<div>Cargando...</div>}>
                    <ChartComponent {...data} />
                </Suspense>
            </Card>
        </div>
    )
}

export default ConfigMultiple
