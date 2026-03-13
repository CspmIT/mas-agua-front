import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useRef, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import PumpControl from '../../Charts/views/ConfigBombs'
import GaugeSpeed from '../../Charts/components/GaugeSpeed'
import BooleanChart from '../../Charts/components/BooleanChart'
import MultipleBooleanChart from '../../Charts/components/MultipleBooleanChart'
import { ChartComponentDbWrapper } from '../components/ChartComponentDbWrapper'
import AddChartDialog from '../components/AddChartDialog'
import EmptyDashboard from '../components/EmptyDashboard'
import LoaderComponent from '../../../components/Loader'
import { Responsive } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

import { IconButton, Tooltip } from "@mui/material"

const IconEdit = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const IconCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const IconAdd = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
)

const chartComponents = {
    LiquidFillPorcentaje,
    CirclePorcentaje,
    BarDataSet,
    PieChart: DoughnutChart,
    PumpControl,
    GaugeSpeed,
    BooleanChart,
    MultipleBooleanChart
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

const Home = ({ targetUserId = null }) => {
    const [loading, setLoading] = useState(true)
    const [charts, setCharts] = useState([])
    const [layouts, setLayouts] = useState({})
    const [inflValues, setInflValues] = useState({})
    const intervalRef = useRef(null)
    const [editMode, setEditMode] = useState(false)
    const [openAddChart, setOpenAddChart] = useState(false)
    const [availableCharts, setAvailableCharts] = useState([])
    const isLayoutReady = useRef(false)
    const [containerWidth, setContainerWidth] = useState(1200)
    const containerRef = useRef(null)
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg')
    const isAdminMode = targetUserId !== null

    const dashboardUrl = isAdminMode
        ? `${backend['Mas Agua']}/admin/dashboard/${targetUserId}`
        : `${backend['Mas Agua']}/dashboard`

    const layoutUrl = isAdminMode
        ? `${backend['Mas Agua']}/admin/dashboard/layout`
        : `${backend['Mas Agua']}/dashboard/layout`

    const addChartUrl = isAdminMode
        ? `${backend['Mas Agua']}/admin/dashboard/addChart`
        : `${backend['Mas Agua']}/dashboard/addChart`

    const removeChartUrl = isAdminMode
        ? `${backend['Mas Agua']}/admin/dashboard/removeChart`
        : `${backend['Mas Agua']}/dashboard/removeChart`


    useEffect(() => {
        if (!containerRef.current) return

        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width)
        })

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // -------------------------
    // EXTRAER VARIABLES INFLUX
    // -------------------------

    function extractInfluxVars(chartsData) {

        const vars = []

        chartsData.forEach((chart) => {
            if (chart.component === 'PumpControl') {
                const normalizePumpVar = (item) => ({
                    dataInflux: {
                        id: item.varId,
                        name: item.name,
                        unit: item.unit ?? null,
                        type: 'last',
                        calc: item.calc || false,
                        varsInflux: item.value,
                        equation: item.equation || null,
                        status: true
                    }
                })
                chart.data.initialPumps.forEach(pump => vars.push(normalizePumpVar(pump)))
                chart.data.initialStates.forEach(state => vars.push(normalizePumpVar(state)))

                return
            }

            if (chart.component === 'MultipleBooleanChart') {
                chart.data.items.forEach(item => {
                    if (item.influxVar) {
                        vars.push({ dataInflux: item.influxVar })
                    }
                })
                return
            }
            Object.values(chart.data).forEach(value => {
                if (value && value.varsInflux) {
                    vars.push({ dataInflux: value })
                }
            })
        })
        return vars
    }

    // -------------------------
    // FETCH INFLUX MULTIPLE
    // -------------------------

    async function fetchMultipleData(allVars) {

        try {

            const { data } = await request(
                `${backend['Mas Agua']}/multipleDataInflux`,
                'POST',
                allVars
            )

            setInflValues(data)

        } catch (error) {

            console.error('Error multipleDataInflux:', error)

        }

    }

    // -------------------------
    // OBTENER DASHBOARD
    // -------------------------

    async function getDashboard() {
        setLoading(true)
        try {
            const { data } = await request(dashboardUrl, 'GET')

            const chartsFormatted = data.map((layoutItem) => {

                const chart = layoutItem.Chart
                const type = chart.type
                const propsReduce = (chart.ChartConfig || []).reduce((acc, config) => {

                    const { key, value, type } = config

                    return {
                        ...acc,
                        [key]:
                            type === 'boolean'
                                ? Boolean(parseInt(value))
                                : value
                    }

                }, {})

                if (type === 'PumpControl') {

                    const { initialPumps, initialStates } =
                        (chart.BombsData || []).reduce((acc, item) => {

                            const bombData = {
                                id: item.id,
                                name: item.name,
                                varId: item.varId,
                                value: item.InfluxVars.varsInflux,
                                unit: item.InfluxVars.unit,
                                type: item.type
                            }

                            if (item.type === 'pump') acc.initialPumps.push(bombData)
                            if (item.type === 'status') acc.initialStates.push(bombData)

                            return acc

                        }, { initialPumps: [], initialStates: [] })

                    return {
                        id: layoutItem.id,
                        component: type,
                        props: propsReduce,
                        data: {
                            initialPumps,
                            initialStates
                        },
                        layout: {
                            x: layoutItem.x,
                            y: layoutItem.y,
                            w: layoutItem.w,
                            h: layoutItem.h
                        }
                    }
                }

                if (type === 'MultipleBooleanChart') {

                    const ledsConfig = {}
                    chart.ChartConfig.forEach(({ key, value }) => {
                        const [ledKey, prop] = key.split('.')
                        if (!ledsConfig[ledKey]) ledsConfig[ledKey] = { key: ledKey }
                        ledsConfig[ledKey][prop] = value
                    })

                    const items = Object.values(ledsConfig).map((led) => {
                        const influx = chart.ChartData.find(d => d.key === led.key)

                        return {
                            key: led.key,
                            title: led.title,
                            textOn: led.textOn,
                            textOff: led.textOff,
                            colorOn: led.colorOn,
                            colorOff: led.colorOff,
                            value: null,
                            influxVar: influx?.InfluxVars ?? null
                        }
                    })

                    return {
                        id: layoutItem.id,
                        component: type,
                        props: {
                            title: chart.name,
                            columns: 2
                        },
                        data: { items },
                        layout: {
                            x: layoutItem.x,
                            y: layoutItem.y,
                            w: layoutItem.w,
                            h: layoutItem.h
                        }
                    }
                }

                const dataReduce = (chart.ChartData || []).reduce((acc, data) => {
                    const { key, value, label, InfluxVars } = data
                    return {
                        ...acc,
                        [key]: value !== null
                            ? value
                            : {
                                ...InfluxVars,
                                label
                            }
                    }
                }, {})

                return {
                    id: layoutItem.id,
                    component: type,
                    props: propsReduce,
                    data: dataReduce,
                    layout: {
                        x: layoutItem.x,
                        y: layoutItem.y,
                        w: layoutItem.w,
                        h: layoutItem.h
                    }
                }
            })

            setCharts(chartsFormatted)

            const layoutFormatted = chartsFormatted.map(c => ({
                i: String(c.id),
                x: c.layout.x,
                y: c.layout.y,
                w: c.layout.w,
                h: c.layout.h
            }))
            setLayouts({
                lg: layoutFormatted,
                md: layoutFormatted,
                sm: layoutFormatted.map(l => ({ ...l, w: Math.min(l.w, 6) })),
                xs: layoutFormatted.map(l => ({ ...l, x: 0, w: 4 })),
                xxs: layoutFormatted.map(l => ({ ...l, x: 0, w: 2 })),
            })
            isLayoutReady.current = true

            const allVars = extractInfluxVars(chartsFormatted)

            fetchMultipleData(allVars)

            if (intervalRef.current) clearInterval(intervalRef.current)

            if (!editMode) {
                intervalRef.current = setInterval(
                    () => fetchMultipleData(allVars),
                    30000
                )
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getDashboard()
        return () => clearInterval(intervalRef.current)
    }, [])

    // -------------------------
    // GUARDAR LAYOUT
    // -------------------------
    async function saveLayout(currentLayout) {
        try {
            await request(layoutUrl, 'POST', {
                layouts: currentLayout.map(({ i, x, y, w, h }) => ({ id: i, x, y, w, h })),
                ...(isAdminMode && { userId: targetUserId })
            })
        } catch (error) {
            console.error("Error guardando layout", error)
        }
    }

    async function removeWidget(layoutId) {
        console.log(layoutId)
        try {
            await request(removeChartUrl, 'POST', {
                chart_id: layoutId,
                ...(isAdminMode && { userId: targetUserId })
            })

            setCharts(prev => prev.filter(c => c.id !== layoutId))
            setLayouts(prev => {
                const updated = {}
                Object.keys(prev).forEach(bp => {
                    updated[bp] = prev[bp].filter(l => l.i !== String(layoutId))
                })
                return updated
            })
            Swal.fire({
                icon: 'success',
                title: 'Widget eliminado',
                toast: true,
                position: 'top-end',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            })
    
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo eliminar el widget',
                toast: true,
                position: 'top-end',
                timer: 3500,
                timerProgressBar: true,
                showConfirmButton: false
            })
        }
    }

    async function handleOpenAddChart() {
        await getAvailableCharts()
        setOpenAddChart(true)
    }

    async function getAvailableCharts() {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/allCharts`,
                'GET'
            )

            const validTypes = Object.keys(chartComponents)
            const activeChartIds = new Set(charts.map(c => c.chart_id))

            const filteredData = data.filter(chart =>
                validTypes.includes(chart.type) && !activeChartIds.has(chart.id)
            )

            setAvailableCharts(filteredData)

        } catch (error) {
            console.error(error)
        }
    }

    async function addChart(chartId) {
        try {
            await request(addChartUrl, 'POST', {
                chartId,
                ...(isAdminMode && { userId: targetUserId })
            })
    
            setOpenAddChart(false)
            await getDashboard()
            Swal.fire({
                icon: 'success',
                title: 'Widget agregado',
                toast: true,
                position: 'top-end',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            })
    
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo agregar el widget',
                toast: true,
                position: 'top-end',
                timer: 3500,
                timerProgressBar: true,
                showConfirmButton: false
            })
        }
    }

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <div ref={containerRef} style={{ width: '100%', minWidth: 0 }}>
            {/* Banner visible cuando el admin edita un usuario */}
            {isAdminMode && (
                <div style={{
                    background: "#fef9c3",
                    border: "1px solid #fde047",
                    borderRadius: 8,
                    padding: "4px 7px",
                    marginBottom: 2,
                    fontSize: 13,
                    color: "#854d0e",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Estás editando el dashboard de otro usuario.
                </div>
            )}

            {loading && !editMode ? (
                <LoaderComponent />
            ) : charts.length === 0 && !editMode ? (
                <EmptyDashboard onAddChart={handleOpenAddChart} />
            ) : (
                <>
                    <Responsive
                        className="layout"
                        width={containerWidth}
                        layouts={layouts}
                        breakpoints={BREAKPOINTS}
                        cols={COLS}
                        rowHeight={95}
                        margin={[5, 5]}
                        isDraggable={editMode}
                        isResizable={editMode}
                        draggableCancel=".no-drag"
                        onLayoutChange={(currentLayout, allLayouts) => {
                            if (!isLayoutReady.current) return
                            setLayouts(allLayouts)
                            if (editMode) saveLayout(allLayouts.lg ?? currentLayout)
                        }}
                        onBreakpointChange={(bp) => setCurrentBreakpoint(bp)}
                        onResizeStop={(layout) => setLayouts(prev => ({ ...prev, [currentBreakpoint]: layout }))}
                    >
                        {charts.map(chart => {
                            const currentLayout = layouts[currentBreakpoint] ?? []
                            const layoutItem = currentLayout.find(l => l.i === String(chart.id))
                            const sizeKey = `${chart.id}-${layoutItem?.w ?? 0}-${layoutItem?.h ?? 0}`
                            const ChartComponentDb = chartComponents[chart.component]
                            const isMultipleBoolean = chart.component === 'MultipleBooleanChart'
                            return (
                                <div key={String(chart.id)}>
                                    {editMode && (
                                        <button
                                            className='no-drag'
                                            onClick={() => removeWidget(chart.id)}
                                            style={{
                                                position: "absolute",
                                                top: 6,
                                                right: 6,
                                                background: "#ef4444",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "2px 6px",
                                                zIndex: 20
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <CardCustom className="flex flex-col rounded-xl h-full overflow-hidden border-[1.75px] border-gray-300">
                                        {!isMultipleBoolean &&
                                            <div className="max-h-[5dvh] flex items-center justify-center text-center mt-2">
                                                <h1 className="text-xl leading-tight line-clamp-2">
                                                    {chart?.props?.title}
                                                </h1>
                                            </div>
                                        }
                                        <div className="flex-1 flex items-center justify-center">
                                            <ChartComponentDbWrapper
                                                key={sizeKey}
                                                chartId={chart.id}
                                                ChartComponent={ChartComponentDb}
                                                initialProps={chart.props}
                                                initialData={chart.data}
                                                inflValues={inflValues}
                                            />
                                        </div>
                                    </CardCustom>
                                </div>
                            )
                        })}
                    </Responsive>

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        position: "sticky",
                        bottom: 16,
                        zIndex: 30,
                        padding: "8px 4px",
                        pointerEvents: "none",
                        opacity: isAdminMode ? 1 : 0.3,
                        transition: "opacity 0.2s ease",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = isAdminMode ? 1 : 0.3}
                    >
                        {editMode && (
                            <Tooltip title="Agregar widget" placement="top">
                                <IconButton
                                    onClick={handleOpenAddChart}
                                    size="small"
                                    sx={{
                                        pointerEvents: "all",
                                        color: "#374151",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        background: "#fff",
                                        "&:hover": {
                                            background: "#f3f4f6",
                                            borderColor: "#9ca3af"
                                        }
                                    }}
                                >
                                    <IconAdd />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title={editMode ? "Confirmar cambios" : "Editar dashboard"} placement="top">
                            <IconButton
                                onClick={() => setEditMode(!editMode)}
                                size="small"
                                sx={{
                                    pointerEvents: "all",
                                    color: editMode ? "#16a34a" : "#374151",
                                    border: `1px solid ${editMode ? "#86efac" : "#d1d5db"}`,
                                    borderRadius: "8px",
                                    background: editMode ? "#f0fdf4" : "#fff",
                                    "&:hover": {
                                        background: editMode ? "#dcfce7" : "#f3f4f6",
                                        borderColor: editMode ? "#4ade80" : "#9ca3af"
                                    }
                                }}
                            >
                                {editMode ? <IconCheck /> : <IconEdit />}
                            </IconButton>
                        </Tooltip>
                    </div>
                </>
            )}

            <AddChartDialog
                open={openAddChart}
                onClose={() => setOpenAddChart(false)}
                availableCharts={availableCharts}
                onAdd={addChart}
            />
        </div>
    )
}

export default Home