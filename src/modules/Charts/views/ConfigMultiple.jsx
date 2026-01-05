import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import GraphVariableSelector from '../../../components/SelectorVars/GraphVariableSelector'
import { Card, TextField, Typography } from '@mui/material'
import { configs } from '../configs/configs'
import { LineChartRepository } from '../../../class/LineChart'
import LoaderComponent from '../../../components/Loader'

const ConfigMultiple = ({ id, setValue, chartData = false }) => {
    const [chartType, setType] = useState(configs[id].typeGraph)
    const [data, setData] = useState({})
    const [loader, setLoader] = useState(true)
    const [customColor, setCustomColorProp] = useState('#f0f0f0')
    const [lineStyle, setLineStyleProp] = useState('line')
    const [title, setTitle] = useState('')
    const [areaStyle, setAreaStyleProp] = useState(false)
    const [order, setOrder] = useState('')
    const [lineChart, setLineChart] = useState(false)
    const ChartComponent = lazy(() => import(`../components/${chartType}.jsx`))

    // Función para actualizar solo el estilo y color de la línea sin recargar todo
    const updateStyleAndColor = useCallback(() => {
        if (data && data.ySeries) {
            const updatedYSeries = [...data.ySeries];

            // Actualizar solo la serie de "Estilos" o "Product A" según corresponda
            const styleIndex = chartData
                ? updatedYSeries.findIndex(series => series.name === 'Estilos')
                : updatedYSeries.findIndex(series => series.name === 'Product A');

            if (styleIndex !== -1) {
                updatedYSeries[styleIndex] = {
                    ...updatedYSeries[styleIndex],
                    type: lineStyle === 'smooth' ? 'line' : lineStyle,
                    smooth: lineStyle === 'smooth',
                    color: customColor,
                    areaStyle: areaStyle ? {} : undefined
                };

                setData(prevData => ({
                    ...prevData,
                    ySeries: updatedYSeries
                }));
            }
        }
    }, [customColor, lineStyle, areaStyle]);

    // Efecto para actualizar estilo y color cuando cambien
    useEffect(() => {
        if (!loader && data.ySeries) {
            updateStyleAndColor();
        }
    }, [customColor, lineStyle, areaStyle, updateStyleAndColor, loader]);

    // Cargar datos iniciales con chartData
    useEffect(() => {
        const getDataChart = async () => {
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
            const xType = 'category' // Tipo de datos en el eje X
            const yType = 'value' // Tipo de datos en el eje Y
            if (chartData && Object.keys(chartData).length > 0) {
                const chart = {
                    id: chartData.id,
                    type: chartData.type,
                    title: chartData.name,
                    order: chartData.order
                }
                const chartLine = new LineChartRepository(
                    chart,
                    chartData.ChartSeriesData,
                    chartData.ChartConfig
                )
                const ySeries = chartLine.getYSeries(true)
                ySeries.push({
                    name: 'Estilos', // Nombre del producto
                    type: lineStyle === 'smooth' ? 'line' : lineStyle, // Tipo de gráfico
                    data: [15, 25, 20, 4, 5, 30, 37, 45], // Ventas de Producto A
                    smooth: lineStyle === 'smooth',
                    color: customColor,
                    areaStyle: areaStyle || false,
                })
                setOrder(chart.order !== undefined ? String(chart.order) : '')
                setTitle(chart.title)
                setData({ xType, xSeries, yType, ySeries })
                setLineChart(chartLine)
                setLoader(false)
                return true
            }
        }
        if (chartData) {
            getDataChart()
        }
    }, [chartData]) // Solo depende de chartData, no de customColor o lineStyle

    // Simula la obtención de variables desde la base de datos
    useEffect(() => {
        const fetchVariables = async () => {
            try {
                if (!chartData) {
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
                    const xType = 'category' // Tipo de datos en el eje X
                    const yType = 'value' // Tipo de datos en el eje Y
                    const ySeries = [
                        {
                            name: 'Product A', // Nombre del producto
                            type: lineStyle === 'smooth' ? 'line' : lineStyle, // Tipo de gráfico
                            data: [15, 25, 20, 4, 5, 30, 37, 45], // Ventas de Producto A
                            smooth: lineStyle === 'smooth',
                            color: customColor,
                            areaStyle: areaStyle || false,
                        },
                        {
                            name: 'Product B', // Nombre del producto
                            type: 'line', // Tipo de gráfico
                            data: [5, 30, 10, 23, 46, 3, 20, 4], // Ventas de Producto B
                            smooth: true,
                        },
                    ]

                    setData({ xType, xSeries, yType, ySeries })
                    setLoader(false)
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchVariables()
    }, [chartData]) // Solo depende de chartData inicialmente

    useEffect(() => {
        setValue('title', title)
    }, [title])

    useEffect(() => {
        setValue('order', order)
    }, [order])

    if (loader) {
        return <LoaderComponent />
    }

    return (
        <div className="flex max-sm:flex-col w-full gap-3">
            <Card className="w-full max-sm:w-full p-3 mb-4">
                <TextField
                    className="w-full"
                    placeholder="Titulo"
                    defaultValue={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
                <GraphVariableSelector
                    id={id}
                    setValue={setValue}
                    setCustomColorProp={setCustomColorProp}
                    setLineStyleProp={setLineStyleProp}
                    dataChart={lineChart}
                    setAreaStyleProp={setAreaStyleProp}
                />
                <TextField
                    className="w-full"
                    placeholder="Posicion en el dashboard de graficos"
                    value={order}
                    onChange={(e) => {
                        setOrder(e.target.value)
                    }}
                />
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
