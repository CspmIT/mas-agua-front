import { useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MainContext } from '../../../context/MainContext'
import { Close, HelpOutline } from '@mui/icons-material'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import LoaderComponent from '../../../components/Loader'
import StatusFilterBar from '../Components/StatusFilterBar'
import DashboardMap from '../Components/DashboardMap'
import { useSensorSnapshot } from '../hooks/useSensorSnapshot'
import CardCustom from '../../../components/CardCustom'
import {
    STATUS_COLORS,
    STATUS_LABELS,
    SENSOR_TYPE_OPTIONS,
    TRENDS,
} from '../utils/sensorDefaults'
import {
    PresionPin,
    CaudalPin,
    NivelPin,
    BombeoPin,
} from '../utils/sensorPins'
import VariableHistoryChart from '../../DrawDiagram/components/VariableHistoryPopup/VariableHistoryChart'
import BasemapSelector from '../Components/BasemapSelector'
import { DEFAULT_STYLE } from '../utils/mapStyles'
import '../Style/PressureDashboard.css'

const MAP_STYLE_STORAGE_KEY = 'dashboard.mapStyle'

const ALL_STATUSES = new Set(['ok', 'warn', 'crit', 'stale', 'apagado', 'off'])

const STATUS_HELP = [
    { key: 'ok',      description: 'Lectura dentro del rango normal.' },
    { key: 'warn',    description: 'Valor cercano al límite — requiere atención.' },
    { key: 'crit',    description: 'Valor fuera del rango aceptable.' },
    { key: 'stale',   description: 'No se reciben lecturas hace tiempo (el pin parpadea).' },
    { key: 'apagado', description: 'Bombeo detenido (el sensor reporta apagado).' },
    { key: 'off',     description: 'El sensor no envió un valor.' },
]

const SENSOR_TYPE_SHAPES = {
    presion: PresionPin,
    caudal:  CaudalPin,
    nivel:   NivelPin,
    bombeo:  BombeoPin,
}

const SENSOR_TYPE_ICONS = {
    presion: '💧',
    caudal:  '➤',
    nivel:   '▮',
    bombeo:  '⚙',
}

const SENSOR_TYPE_DESCRIPTIONS = {
    presion: 'Presión hidrostática de la red',
    caudal:  'Caudal volumétrico de paso',
    nivel:   'Nivel de cisterna o tanque',
    bombeo:  'Estado/operación de bombeo',
}

const closeBtnStyle = {
    width: 28,
    height: 28,
    background: 'rgba(255, 255, 255, 0.18)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
}

const PressureDashboard = () => {
    const [params] = useSearchParams()
    const mapId = params.get('id')

    const [mapData, setMapData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState(ALL_STATUSES)

    const [selectedId, setSelectedId] = useState(null)
    const [helpOpen, setHelpOpen] = useState(false)

    // Mapa base elegido por el usuario (persistido); sin elección se usa el del tema
    const { darkMode } = useContext(MainContext)
    const [mapStyleId, setMapStyleId] = useState(
        () => localStorage.getItem(MAP_STYLE_STORAGE_KEY) || null
    )
    const handleStyleChange = (id) => {
        setMapStyleId(id)
        localStorage.setItem(MAP_STYLE_STORAGE_KEY, id)
    }
    const effectiveStyleId =
        mapStyleId || (darkMode ? DEFAULT_STYLE.dark : DEFAULT_STYLE.light)

    useEffect(() => {
        if (!mapId) {
            setLoading(false)
            return
        }
        setLoading(true)
        const load = async () => {
            try {
                const { data } = await request(
                    `${backend[import.meta.env.VITE_APP_NAME]}/map?id=${mapId}`,
                    'GET',
                )
                setMapData(data?.[0] || null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [mapId])

    const markers = useMemo(() => {
        if (!mapData?.MarkersMaps) return []
        return mapData.MarkersMaps.map((mm) => ({
            id: mm.id,
            name: mm.name,
            longitude: Number(mm.longitude),
            latitude: Number(mm.latitude),
            sensor_type: mm.sensor_type,
            unit: mm.unit,
            anchor: mm.PopUpsMarkers?.anchor ?? '',
            warn_low: mm.warn_low,
            crit_low: mm.crit_low,
            warn_high: mm.warn_high,
            crit_high: mm.crit_high,
            stale_after_minutes: mm.stale_after_minutes,
            varName: mm.PopUpsMarkers?.InfluxVar?.name ?? null,
            varData: mm.PopUpsMarkers?.InfluxVar ?? null,
        }))
    }, [mapData])

    const initialViewState = useMemo(() => {
        if (!mapData) return null
        return {
            longitude: Number(mapData.longitude),
            latitude: Number(mapData.latitude),
            zoom: Number(mapData.zoom),
            bearing: Number(mapData.bearing),
            pitch: Number(mapData.pitch),
        }
    }, [mapData])

    const { snapshot, lastUpdate } = useSensorSnapshot(markers)

    const counts = useMemo(() => {
        const c = { ok: 0, warn: 0, crit: 0, stale: 0, apagado: 0, off: 0 }
        Object.values(snapshot).forEach((s) => {
            if (c[s.status] !== undefined) c[s.status]++
        })
        return c
    }, [snapshot])

    const selectedMarker = useMemo(
        () => (selectedId != null ? markers.find((m) => m.id === selectedId) : null),
        [selectedId, markers],
    )
    const selectedSnapshot = selectedId != null ? snapshot[selectedId] : null

    if (loading) return <LoaderComponent />

    return (
        <div className='w-full px-2 sm:px-3 pt-2 pb-4'>
            <CardCustom className='p-1 rounded-xl w-full flex flex-col overflow-hidden'>
                {/* Contenedor que se fullscreenea: incluye filtros y overlays */}
                <div id='pressure-dashboard-fs' className='pressure-dashboard-fs flex flex-col'>
                    <StatusFilterBar
                        title={mapData?.name || 'Dashboard de presión'}
                        counts={counts}
                        activeFilters={activeFilters}
                        setActiveFilters={setActiveFilters}
                        lastUpdate={lastUpdate}
                    />
                    {/* Map area: 9:16 portrait on mobile, fills viewport on desktop */}
                    <div
                        className='dashboard-map-area relative w-full mx-auto aspect-[9/16] max-h-[calc(100vh-180px)] sm:aspect-auto sm:h-[calc(88vh-80px)] sm:max-h-none'
                    >
                        <DashboardMap
                            key={mapId}
                            markers={markers}
                            snapshot={snapshot}
                            activeFilters={activeFilters}
                            initialViewState={initialViewState}
                            onPinClick={(m) => {
                                setSelectedId(m.id)
                                setHelpOpen(false)
                            }}
                            selectedId={selectedId}
                            fullscreenContainerId='pressure-dashboard-fs'
                            styleId={mapStyleId}
                        />

                        <MarkerDetailCard
                            marker={selectedMarker}
                            snapshot={selectedSnapshot}
                            onClose={() => setSelectedId(null)}
                        />
                        {/* Botones flotantes del mapa (esq. inferior izquierda) */}
                        <div
                            className='absolute z-[5] flex items-end gap-2'
                            style={{ left: 12, bottom: 12 }}
                        >
                            <MapHelpPanel
                                open={helpOpen}
                                onToggle={() => setHelpOpen((v) => !v)}
                            />
                            <BasemapSelector
                                value={effectiveStyleId}
                                onChange={handleStyleChange}
                                center={initialViewState}
                            />
                        </div>
                    </div>
                </div>
            </CardCustom>
        </div>
    )
}

// ── Overlay: panel de ayuda con leyenda de pines ───────────────────────────
// Se ancla dentro del contenedor de botones flotantes del mapa
const MapHelpPanel = ({ open, onToggle }) => (
    <div className='relative flex flex-col items-start'>
        {open && (
            <div
                className='absolute bottom-full mb-2 left-0 rounded-xl bg-white border overflow-hidden'
                style={{
                    width: 300,
                    maxWidth: 'calc(100vw - 32px)',
                    borderColor: 'rgba(15, 42, 68, 0.12)',
                    boxShadow:
                        '0 12px 32px rgba(15, 42, 68, 0.22), 0 2px 6px rgba(15, 42, 68, 0.08)',
                }}
            >
                <div
                    className='flex items-center justify-between px-3 py-2'
                    style={{
                        background:
                            'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                    }}
                >
                    <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-white'>
                        Guía de pines
                    </span>
                    <button
                        type='button'
                        onClick={onToggle}
                        className='inline-flex items-center justify-center rounded-full transition-colors'
                        style={closeBtnStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.32)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                        }}
                        aria-label='Cerrar ayuda'
                    >
                        <Close sx={{ fontSize: 18, color: '#ffffff' }} />
                    </button>
                </div>
                <div className='px-3 py-2.5 max-h-[60vh] overflow-y-auto'>
                    <div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5'>
                        Forma = tipo de sensor
                    </div>
                    <div className='flex flex-col gap-2 mb-3'>
                        {SENSOR_TYPE_OPTIONS.map((o) => {
                            const Shape = SENSOR_TYPE_SHAPES[o.value]
                            return (
                                <div key={o.value} className='flex items-center gap-2.5'>
                                    <div style={{ width: 26, height: 32, flexShrink: 0 }}>
                                        {Shape && <Shape color='#2c6aa0' label='' />}
                                    </div>
                                    <div className='leading-tight'>
                                        <div className='text-[11.5px] font-semibold text-slate-800'>
                                            {o.label}
                                        </div>
                                        <div className='text-[10.5px] text-slate-500'>
                                            {SENSOR_TYPE_DESCRIPTIONS[o.value]}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div
                        className='border-t pt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5'
                        style={{ borderColor: 'rgba(15, 42, 68, 0.08)' }}
                    >
                        Color = estado del sensor
                    </div>
                    <div className='flex flex-col gap-1.5 mb-2.5'>
                        {STATUS_HELP.map((s) => (
                            <div key={s.key} className='flex items-start gap-2'>
                                <span
                                    className='inline-block rounded-full flex-shrink-0 mt-[3px]'
                                    style={{
                                        width: 10,
                                        height: 10,
                                        background: STATUS_COLORS[s.key],
                                        boxShadow: `0 0 0 2px ${STATUS_COLORS[s.key]}33`,
                                    }}
                                />
                                <div className='leading-tight'>
                                    <div className='text-[11px] font-semibold text-slate-800'>
                                        {STATUS_LABELS[s.key]}
                                    </div>
                                    <div className='text-[10.5px] text-slate-500'>
                                        {s.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className='text-[10.5px] text-slate-600 rounded-md px-2 py-1.5'
                        style={{
                            background: 'rgba(54, 139, 237, 0.07)',
                            border: '1px solid rgba(54, 139, 237, 0.18)',
                        }}
                    >
                        <strong>Tip:</strong> hacé click sobre un pin para ver
                        los detalles completos del sensor.
                    </div>
                </div>
            </div>
        )}

        <button
            type='button'
            onClick={onToggle}
            className='inline-flex items-center gap-1.5 rounded-full text-white transition-transform hover:scale-[1.03] active:scale-[0.98]'
            style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                boxShadow:
                    '0 6px 18px rgba(44, 106, 160, 0.4), 0 2px 4px rgba(15, 42, 68, 0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
            }}
            aria-label='Mostrar ayuda del mapa'
        >
            <HelpOutline sx={{ fontSize: 16 }} />
            <span className='text-[11px] font-semibold uppercase tracking-[0.14em]'>
                {open ? 'Cerrar' : 'Ayuda'}
            </span>
        </button>
    </div>
)

// ── Overlay: card con detalle del pin seleccionado ─────────────────────────
const MarkerDetailCard = ({ marker, snapshot, onClose }) => {
    if (!marker) return null

    const status = snapshot?.status || 'off'
    const statusColor = STATUS_COLORS[status] || STATUS_COLORS.off

    const value = snapshot?.value
    const isBinary = snapshot?.kind === 'binary'
    // En binaria, status 'off' = Apagado (hay dato); solo es "Sin datos" si no hay value.
    const hasValue =
        value !== undefined && value !== null && value !== 'Sin datos' &&
        (isBinary || status !== 'off')
    const statusLabel =
        isBinary && hasValue
            ? Number(value) === 1
                ? 'Encendido'
                : 'Apagado'
            : STATUS_LABELS[status] || STATUS_LABELS.off

    const hasThresholds =
        marker.crit_low != null || marker.warn_low != null ||
        marker.warn_high != null || marker.crit_high != null

    // Historia sólo para variables no binarias (mismo criterio que en diagramas)
    const canShowHistory =
        marker.varData &&
        !marker.varData.binary_compressed &&
        !marker.varData.calc_binary_compressed &&
        marker.varData.unit !== 'calc_binary' &&
        !isBinary

    return (
        <div
            className='absolute z-[6] rounded-xl bg-white overflow-hidden flex flex-col'
            style={{
                top: 12,
                right: 12,
                width: 310,
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 'calc(100% - 24px)',
                border: '1px solid rgba(15, 42, 68, 0.12)',
                boxShadow:
                    '0 16px 40px rgba(15, 42, 68, 0.22), 0 4px 10px rgba(15, 42, 68, 0.08)',
            }}
        >
            {/* Header */}
            <div
                className='px-3 py-2 flex items-center justify-between gap-2'
                style={{
                    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                }}
            >
                <div className='min-w-0 flex-1 flex items-center gap-2'>
                    {SENSOR_TYPE_ICONS[marker.sensor_type] && (
                        <div
                            className='inline-flex items-center justify-center rounded-md flex-shrink-0'
                            style={{
                                width: 30,
                                height: 30,
                                background: 'rgba(255, 255, 255, 0.18)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                color: '#ffffff',
                                fontSize: 16,
                                lineHeight: 1,
                            }}
                        >
                            <span>{SENSOR_TYPE_ICONS[marker.sensor_type]}</span>
                        </div>
                    )}
                    <div className='min-w-0 flex-1'>
                        <div className='text-[9px] font-bold uppercase tracking-[0.18em] text-white/85 mb-0.5'>
                            Marcador
                        </div>
                        <div className='text-[14px] font-semibold text-white leading-tight truncate'>
                            {marker.name}
                        </div>
                    </div>
                </div>
                <button
                    type='button'
                    onClick={onClose}
                    className='inline-flex items-center justify-center rounded-full transition-colors flex-shrink-0'
                    style={closeBtnStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.32)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                    }}
                    aria-label='Cerrar detalle'
                >
                    <Close sx={{ fontSize: 18, color: '#ffffff' }} />
                </button>
            </div>

            {/* Cuerpo scrolleable: en pantallas bajas la card no debe superar el mapa */}
            <div className='flex-1 min-h-0 overflow-y-auto'>

            {/* Valor en vivo */}
            <div
                className='px-3 py-2.5 flex items-center gap-2.5'
                style={{
                    background: `linear-gradient(180deg, ${statusColor}15 0%, ${statusColor}05 100%)`,
                    borderBottom: '1px solid rgba(15, 42, 68, 0.06)',
                }}
            >
                <span
                    className='inline-block rounded-full flex-shrink-0'
                    style={{
                        width: 12,
                        height: 12,
                        background: statusColor,
                        boxShadow: `0 0 0 3px ${statusColor}33`,
                    }}
                />
                <div className='flex-1 min-w-0'>
                    <div
                        className='text-[9px] font-bold uppercase tracking-[0.16em]'
                        style={{ color: statusColor }}
                    >
                        {statusLabel}
                    </div>
                    {hasValue ? (
                        isBinary ? (
                            <div
                                className='text-[18px] font-extrabold uppercase tracking-[0.06em]'
                                style={{ color: Number(value) === 1 ? '#047857' : '#0f172a' }}
                            >
                                {Number(value) === 1 ? 'Encendido' : 'Apagado'}
                            </div>
                        ) : (
                            <div className='inline-flex items-baseline gap-1 leading-tight'>
                                <span
                                    className='text-[18px] font-bold text-slate-900'
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {value}
                                </span>
                                {marker.unit && (
                                    <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
                                        {marker.unit}
                                    </span>
                                )}
                                {snapshot?.trend && TRENDS[snapshot.trend] && (
                                    <span className='text-[14px] text-slate-500 ml-1'>
                                        {TRENDS[snapshot.trend]}
                                    </span>
                                )}
                            </div>
                        )
                    ) : (
                        <div className='text-[14px] font-semibold text-slate-400'>
                            Sin datos
                        </div>
                    )}
                </div>
                {snapshot?.age_minutes != null && status === 'stale' && (
                    <div className='text-right flex-shrink-0'>
                        <div className='text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500'>
                            Hace
                        </div>
                        <div className='text-[13px] font-bold text-slate-700'>
                            {snapshot.age_minutes} min
                        </div>
                    </div>
                )}
            </div>

            {/* Variable asociada */}
            {marker.varName && (
                <div className='px-3 py-1'>
                    <DetailRow label='Variable' value={marker.varName} />
                </div>
            )}

            {/* Umbrales */}
            {hasThresholds && (
                <div
                    className='px-3 py-1.5 border-t'
                    style={{ borderColor: 'rgba(15, 42, 68, 0.06)' }}
                >
                    <div className='text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1'>
                        Umbrales
                    </div>
                    <div className='grid grid-cols-4 gap-1'>
                        <ThresholdCell label='Crít.↓' value={marker.crit_low} color={STATUS_COLORS.crit} />
                        <ThresholdCell label='Alert.↓' value={marker.warn_low} color={STATUS_COLORS.warn} />
                        <ThresholdCell label='Alert.↑' value={marker.warn_high} color={STATUS_COLORS.warn} />
                        <ThresholdCell label='Crít.↑' value={marker.crit_high} color={STATUS_COLORS.crit} />
                    </div>
                </div>
            )}

            {/* Histórico */}
            {canShowHistory && (
                <div
                    className='px-3 py-2 border-t flex flex-col gap-1.5'
                    style={{ borderColor: 'rgba(15, 42, 68, 0.06)' }}
                >
                    <div className='text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500'>
                        Histórico
                    </div>
                    <VariableHistoryChart
                        dataInflux={marker.varData}
                        heightClass='h-36'
                        onWhite
                    />
                </div>
            )}
            </div>
        </div>
    )
}

const DetailRow = ({ label, value, mono = false }) => (
    <div className='flex items-baseline justify-between gap-2 text-[11.5px]'>
        <span className='text-slate-500 font-medium flex-shrink-0'>{label}</span>
        <span
            className='text-slate-800 font-semibold text-right truncate'
            style={mono ? { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: '11px' } : undefined}
        >
            {value}
        </span>
    </div>
)

const ThresholdCell = ({ label, value, color }) => (
    <div
        className='rounded-md px-0.5 py-1 text-center'
        style={{
            background: value != null ? `${color}10` : 'rgba(148,163,184,0.08)',
            border: `1px solid ${value != null ? `${color}40` : 'rgba(148,163,184,0.2)'}`,
        }}
    >
        <div
            className='text-[8.5px] font-bold uppercase tracking-[0.08em] leading-tight'
            style={{ color: value != null ? color : '#94a3b8' }}
        >
            {label}
        </div>
        <div
            className='text-[11px] font-bold text-slate-800 leading-tight'
            style={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {value != null ? value : '—'}
        </div>
    </div>
)

export default PressureDashboard
