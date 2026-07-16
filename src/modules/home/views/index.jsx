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
import LineChartHomeWidget from '../components/LineChartHomeWidget'
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
    MultipleBooleanChart,
    LineChart: LineChartHomeWidget
}

// Tamaño mínimo en la grilla para que la serie histórica sea legible
const LINE_CHART_MIN_SIZE = { minW: 4, minH: 5 }

// Flag versionado por feature: cambiar la key para anunciar la próxima novedad
const ANNOUNCE_KEY = 'announce_linechart_v1'

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

    // Globito one-shot que anuncia los gráficos históricos sobre el botón de editar
    const [showAnnouncement, setShowAnnouncement] = useState(
        () => !isAdminMode && !storage.get(ANNOUNCE_KEY)
    )

    const dismissAnnouncement = () => {
        if (!showAnnouncement) return
        storage.set(ANNOUNCE_KEY, true)
        setShowAnnouncement(false)
    }

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
            // Los LineChart consultan series históricas por su cuenta
            // (useLineChartData), no entran en el batch de últimos valores.
            if (chart.component === 'LineChart') return

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

                if (type === 'LineChart') {
                    // Se guarda el chart crudo: el widget arma la query con
                    // ChartSeriesData + ChartConfig (igual que el dashboard general)
                    return {
                        id: layoutItem.id,
                        component: type,
                        props: { title: chart.name },
                        data: {},
                        rawChart: chart,
                        layout: {
                            x: layoutItem.x,
                            y: layoutItem.y,
                            w: layoutItem.w,
                            h: layoutItem.h
                        }
                    }
                }

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
                            isCalcBinary: influx?.InfluxVars?.calc_binary_compressed ?? false,
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
                h: c.layout.h,
                ...(c.component === 'LineChart' && LINE_CHART_MIN_SIZE)
            }))
            // En pantallas angostas apilamos los widgets uno debajo del otro,
            // respetando el orden de lectura (y, luego x). Si sólo forzamos x:0
            // manteniendo el `y` original, los widgets que estaban lado a lado
            // quedan en la misma posición y se solapan (se ven menos cards).
            const stackVertical = (items, cols) => {
                let cursorY = 0
                return [...items]
                    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
                    .map(l => {
                        const placed = { ...l, x: 0, w: cols, y: cursorY }
                        cursorY += l.h
                        return placed
                    })
            }

            setLayouts({
                lg: layoutFormatted,
                md: layoutFormatted,
                sm: layoutFormatted.map(l => ({ ...l, w: Math.min(l.w, 6) })),
                xs: stackVertical(layoutFormatted, 4),
                xxs: stackVertical(layoutFormatted, 2),
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

    // En pantallas angostas (mobile) no usamos la grilla de alto fijo: apilamos las
    // cards en una columna y dejamos que cada una crezca según su contenido. El alto
    // de la BD se usa sólo como mínimo, así nunca se recorta (ej: card de bombas).
    const isNarrow = containerWidth > 0 && containerWidth < BREAKPOINTS.sm

    const cardMinHeight = (chart) => {
        const h = chart?.layout?.h ?? 0
        return h * 50 + Math.max(0, h - 1) * 5
    }

    const renderCard = (chart, narrow) => {
        const currentLayout = layouts[currentBreakpoint] ?? []
        const layoutItem = currentLayout.find(l => l.i === String(chart.id))
        const sizeKey = narrow
            ? `${chart.id}-narrow`
            : `${chart.id}-${layoutItem?.w ?? 0}-${layoutItem?.h ?? 0}`
        const ChartComponentDb = chartComponents[chart.component]
        const isMultipleBoolean = chart.component === 'MultipleBooleanChart'
        const isLineChart = chart.component === 'LineChart'

        // Sólo las cards de bombas (MultipleBooleanChart) crecen según su contenido.
        // El resto conserva el alto fijo de la BD, como en desktop (sino se achican).
        const narrowGrow = narrow && isMultipleBoolean
        const narrowFixed = narrow && !isMultipleBoolean
        const narrowHeight = cardMinHeight(chart)

        return (
            <div
                key={String(chart.id)}
                className={`group relative ${narrow ? 'flex flex-col' : ''}`}
                style={
                    narrowGrow
                        ? { minHeight: narrowHeight }
                        : narrowFixed
                            ? { height: narrowHeight }
                            : undefined
                }
            >
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
                <CardCustom className={`flex flex-col rounded-2xl ${narrowGrow ? 'flex-1' : 'h-full'} overflow-hidden border border-gray-200 dark:border-gray-700/70 !shadow-[0_1px_2px_rgba(15,42,68,0.04)] hover:!shadow-[0_8px_24px_rgba(15,42,68,0.08)] dark:hover:!shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-shadow duration-200 ${editMode ? 'ring-1 ring-primary/30 dark:ring-primary/40' : ''}`}>
                    {!isMultipleBoolean &&
                        <div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10'>
                            <h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
                                {chart?.props?.title}
                            </h2>
                        </div>
                    }
                    <div className={`flex-1 flex items-center justify-center ${isLineChart ? 'min-h-0' : ''}`}>
                        {isLineChart ? (
                            // Sin key por tamaño: EChart se redimensiona solo
                            // (ResizeObserver) y un remount refetcharía las series
                            <LineChartHomeWidget
                                chart={chart.rawChart}
                                editMode={editMode}
                            />
                        ) : (
                            <ChartComponentDbWrapper
                                key={sizeKey}
                                chartId={chart.id}
                                ChartComponent={ChartComponentDb}
                                initialProps={chart.props}
                                initialData={chart.data}
                                inflValues={inflValues}
                            />
                        )}
                    </div>
                </CardCustom>
            </div>
        )
    }

    const narrowCharts = [...charts].sort(
        (a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x)
    )

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
                @keyframes calloutIn {
                    0% { opacity: 0; transform: translateY(8px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
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
                    {isNarrow ? (
                        <div className='flex flex-col gap-2.5'>
                            {narrowCharts.map(chart => renderCard(chart, true))}
                        </div>
                    ) : (
                        <Responsive
                            className="layout"
                            width={containerWidth}
                            layouts={layouts}
                            breakpoints={BREAKPOINTS}
                            cols={COLS}
                            rowHeight={50}
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
                            {charts.map(chart => renderCard(chart, false))}
                        </Responsive>
                    )}

                    <div className='sticky bottom-4 z-30 flex justify-end py-2 px-1 pointer-events-none'>
                        <div className={`pointer-events-auto relative flex items-center gap-0.5 rounded-full border border-gray-200/80 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg shadow-gray-900/5 dark:shadow-black/30 p-1 transition-opacity duration-200 ${isAdminMode || showAnnouncement ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                            {showAnnouncement && (
                                <div
                                    className='absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-[#2c6aa0] dark:bg-[#1f4e79] text-white shadow-xl shadow-[#2c6aa0]/30 px-3.5 py-3'
                                    style={{ animation: 'calloutIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
                                >
                                    <button
                                        className='absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-transparent border-0 p-0 text-white/70 hover:text-white hover:bg-white/10 text-[11px] leading-none cursor-pointer'
                                        onClick={dismissAnnouncement}
                                        aria-label='Cerrar aviso'
                                    >
                                        ✕
                                    </button>
                                    <p className='text-[13px] leading-snug pr-4 m-0'>
                                        ✨ <span className='font-semibold'>Nuevo:</span> ahora
                                        podés agregar gráficos históricos a tu dashboard
                                    </p>
                                    {/* Flechita apuntando al botón de editar */}
                                    <div className='absolute -bottom-1 right-4 h-2.5 w-2.5 rotate-45 bg-[#2c6aa0] dark:bg-[#1f4e79]' />
                                </div>
                            )}
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
                                    onClick={() => {
                                        dismissAnnouncement()
                                        setEditMode(!editMode)
                                    }}
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