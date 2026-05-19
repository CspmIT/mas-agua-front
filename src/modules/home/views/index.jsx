import LiquidFillPorcentaje from '../../Charts/components/LiquidFillPorcentaje'
import CirclePorcentaje from '../../Charts/components/CirclePorcentaje'
import BarDataSet from '../../Charts/components/BarDataSet'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import CardCustom from '../../../components/CardCustom'
import React, { useEffect, useRef, useState } from 'react'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { storage } from '../../../storage/storage'
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
    const userId = storage.get('usuario')?.sub

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
                            value: influx
                                ? null // se resuelve luego con inflValues
                                : null,
                            influxVar: influx?.InfluxVars ?? null,
                            id_bit:  influx?.id_bit          ?? null,
                            varId:   influx?.InfluxVars?.id  ?? null,
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
        const resolvedUserId = isAdminMode ? targetUserId : userId
        await getAvailableCharts(resolvedUserId)
        setOpenAddChart(true)
    }

    async function getAvailableCharts(userId) {
        try {
            const { data } = await request(
                `${backend['Mas Agua']}/chartbyuser/${userId}`,
                'GET'
            )
    
            const validTypes = Object.keys(chartComponents)
            const filteredData = data.filter(chart => validTypes.includes(chart.type))
    
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
        <div ref={containerRef} className='w-full min-w-0'>
            <style>{`
                @keyframes removeBtnIn {
                    0% { opacity: 0; transform: scale(0.6); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
            {/* Banner visible cuando el admin edita un usuario */}
            {isAdminMode && (
                <div className='mb-2 flex items-center gap-2.5 rounded-lg border border-amber-200/70 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-sm px-3 py-1.5 text-[13px] text-amber-800 dark:text-amber-200'>
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-200/80 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0'>
                        <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                            <line x1='12' y1='9' x2='12' y2='13' />
                            <line x1='12' y1='17' x2='12.01' y2='17' />
                        </svg>
                    </div>
                    <span className='font-medium tracking-tight'>Estás editando el dashboard de otro usuario</span>
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
                                <div key={String(chart.id)} className='group relative'>
                                    {editMode && (
                                        <button
                                            className='no-drag absolute top-1.5 right-1.5 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.45)] ring-2 ring-white dark:ring-gray-900 transition-all hover:bg-red-600 hover:scale-110 hover:shadow-[0_6px_18px_rgba(239,68,68,0.6)]'
                                            style={{
                                                animation: 'removeBtnIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                                            }}
                                            onClick={() => removeWidget(chart.id)}
                                            aria-label='Eliminar widget'
                                        >
                                            X
                                        </button>
                                    )}
                                    <CardCustom className={`flex flex-col rounded-2xl h-full overflow-hidden border border-gray-200 dark:border-gray-700/70 !shadow-[0_1px_2px_rgba(15,42,68,0.04)] hover:!shadow-[0_8px_24px_rgba(15,42,68,0.08)] dark:hover:!shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-shadow duration-200 ${editMode ? 'ring-1 ring-primary/30 dark:ring-primary/40' : ''}`}>
                                        {!isMultipleBoolean &&
                                            <div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10'>
                                                <h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
                                                    {chart?.props?.title}
                                                </h2>
                                            </div>
                                        }
                                        <div className='flex-1 flex items-center justify-center'>
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

                    <div className='sticky bottom-4 z-30 flex justify-end py-2 px-1 pointer-events-none'>
                        <div className={`pointer-events-auto flex items-center gap-0.5 rounded-full border border-gray-200/80 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg shadow-gray-900/5 dark:shadow-black/30 p-1 transition-opacity duration-200 ${isAdminMode ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                            {editMode && (
                                <>
                                    <Tooltip title='Agregar widget' placement='top'>
                                        <IconButton
                                            onClick={handleOpenAddChart}
                                            size='small'
                                            sx={{
                                                color: 'rgb(75 85 99)',
                                                '.dark &': { color: 'rgb(209 213 219)' },
                                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                                                '.dark &:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                                            }}
                                        >
                                            <IconAdd />
                                        </IconButton>
                                    </Tooltip>
                                    <div className='h-5 w-px bg-gray-200/80 dark:bg-gray-700/60' />
                                </>
                            )}

                            <Tooltip title={editMode ? 'Confirmar cambios' : 'Editar dashboard'} placement='top'>
                                <IconButton
                                    onClick={() => setEditMode(!editMode)}
                                    size='small'
                                    sx={{
                                        color: editMode ? '#10B981' : 'rgb(75 85 99)',
                                        '.dark &': { color: editMode ? '#10B981' : 'rgb(209 213 219)' },
                                        '&:hover': {
                                            backgroundColor: editMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.04)',
                                        },
                                        '.dark &:hover': {
                                            backgroundColor: editMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
                                        },
                                    }}
                                >
                                    {editMode ? <IconCheck /> : <IconEdit />}
                                </IconButton>
                            </Tooltip>
                        </div>
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