import Map, {
    NavigationControl,
    Marker,
    FullscreenControl,
    Popup,
    GeolocateControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../Style/MarkerPopup.css'
import Pin from './Pin'
import { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

// Offset por anchor para que el popup no se pise con el pin.
// El pin se dibuja ~43px por encima de la coordenada y ~24px de ancho.
const POPUP_OFFSET = {
    top: [0, 0],
    'top-left': [0, 0],
    'top-right': [0, 0],
    bottom: [0, -42],
    'bottom-left': [0, -42],
    'bottom-right': [0, -42],
    left: [18, -22],
    right: [-18, -22],
    center: [-8, -58],
}

const MapBase = ({
    navigationcontrol = true,
    height = '100%',
    width = '100%',
    fullScreen = true,
    geolocation = true,
    markers = false,
    setMarkers = false,
    viewState,
    setViewState,
    draggable = false,
    withInfo = false, // si true, hace polling a /multipleDataInflux (modo edición)
    onEditMarker = null,
}) => {
    function extractInfluxVarsFromMarkers(markers) {
        return markers.map((m) => ({
            dataInflux: m.popupInfo.data,
        }))
    }

    const fetchMultipleInfluxValues = async () => {
        if (!markers || markers.length === 0) return

        const vars = extractInfluxVarsFromMarkers(markers)

        try {
            const { data } = await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/multipleDataInflux`,
                'POST',
                vars
            )

            const updated = markers.map((marker) => {
                const id = marker.popupInfo.data.id
                const id_bit = marker.popupInfo.id_bit
                const rawData = data[id]

                let value

                if (Array.isArray(rawData)) {
                    const match = rawData.find((b) => b.id_bit === id_bit)
                    value = match !== undefined ? match.value : 'Sin datos'
                } else {
                    value = rawData ?? 'Sin datos'
                }

                return {
                    ...marker,
                    popupInfo: {
                        ...marker.popupInfo,
                        value,
                    },
                }
            })

            setMarkers(updated)
        } catch (error) {
            console.error('Error múltiples influx en mapa:', error)
        }
    }

    const renderValueBlock = (marker) => {
        const text = formatMarkerValue(marker)
        if (text === 'Sin datos') {
            return (
                <span className='text-xs font-semibold uppercase tracking-[0.075em] text-slate-400'>
                    Sin datos
                </span>
            )
        }
        if (text === 'Encendido') {
            return (
                <div className='inline-flex items-center gap-1.5 leading-none'>
                    <span
                        className='w-2 h-2 rounded-full'
                        style={{
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                        }}
                    />
                    <span
                        className='text-base font-extrabold uppercase tracking-[0.1em]'
                        style={{ color: '#047857' }}
                    >
                        Encendido
                    </span>
                </div>
            )
        }
        if (text === 'Apagado') {
            return (
                <div className='inline-flex items-center gap-1.5 leading-none'>
                    <span
                        className='w-2 h-2 rounded-full'
                        style={{
                            backgroundColor: '#ef4444',
                            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
                        }}
                    />
                    <span
                        className='text-base font-extrabold uppercase tracking-[0.1em]'
                        style={{ color: '#b91c1c' }}
                    >
                        Apagado
                    </span>
                </div>
            )
        }
        const parts = String(text).trim().split(/\s+/)
        if (parts.length >= 2) {
            const unit = parts[parts.length - 1]
            const value = parts.slice(0, -1).join(' ')
            return (
                <div className='inline-flex items-baseline gap-1 leading-none'>
                    <span
                        className='text-lg font-semibold text-slate-900'
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {value}
                    </span>
                    <span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500'>
                        {unit}
                    </span>
                </div>
            )
        }
        return <span className='text-lg font-semibold text-slate-900'>{text}</span>
    }

    const formatMarkerValue = (marker) => {
        const rawValue = marker.popupInfo.value
        const data = marker.popupInfo.data
        const kind = marker.popupInfo.kind   // hint del snapshot del dashboard

        if (rawValue == null || rawValue === 'Sin datos') return 'Sin datos'

        // El snapshot del back identificó la variable como binaria (kind='binary')
        if (kind === 'binary') {
            return Number(rawValue) === 1 ? 'Encendido' : 'Apagado'
        }

        if (data?.binary_compressed && marker.popupInfo.id_bit != null) {
            return rawValue ? 'Encendido' : 'Apagado'
        }

        const dataUnit = data?.unit?.toLowerCase() ?? ''
        if (['booleano', 'bool', 'binario'].includes(dataUnit)) {
            return Number(rawValue) === 1 ? 'Encendido' : 'Apagado'
        }

        const calcField = Object.values(data?.varsInflux ?? {})[0]?.calc_field ?? ''
        if (calcField === 'status' || calcField.includes('estado')) {
            return Number(rawValue) === 1 ? 'Encendido' : 'Apagado'
        }

        // Preferir la unit del marker (configurada por el operador) sobre la del InfluxVar
        const unit = marker.unit ?? data?.unit ?? ''
        return `${rawValue} ${unit}`.trim()
    }

    useEffect(() => {
        if (!withInfo) return

        fetchMultipleInfluxValues()

        const interval = setInterval(fetchMultipleInfluxValues, 15000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ position: 'relative', width, height }}>
            <Map
                {...viewState}
                style={{ width, height }}
                mapStyle='https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO'
                onMove={(e) => setViewState(e.viewState)}
            >
                {navigationcontrol && <NavigationControl position='top-left' />}
                {fullScreen && <FullscreenControl position='top-left' />}
                {geolocation && <GeolocateControl position='top-left' />}
                {markers.map((marker, index) => {
                    const hasValue = marker.popupInfo?.value !== undefined
                    return (
                        <Marker
                            key={`marker-${index}`}
                            draggable={draggable}
                            longitude={marker.longitude}
                            latitude={marker.latitude}
                            anchor='bottom'
                            onDragEnd={(e) => {
                                const { lng, lat } = e.lngLat
                                const updatedMarkers = markers.map((m, i) =>
                                    i === index
                                        ? { ...m, longitude: lng, latitude: lat }
                                        : m
                                )
                                setMarkers(updatedMarkers)
                            }}
                        >
                            {onEditMarker ? (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEditMarker(marker, index)
                                    }}
                                    style={{ cursor: 'pointer', display: 'inline-block', lineHeight: 0 }}
                                >
                                    <Pin
                                        label={marker.name}
                                        color='#2c6aa0'
                                        active={withInfo}
                                        status={marker.status}
                                    />
                                </span>
                            ) : (
                                <Pin
                                    label={marker.name}
                                    color='#2c6aa0'
                                    active={withInfo}
                                    status={marker.status}
                                />
                            )}
                            {hasValue && marker.popupInfo && marker.popupInfo.data && (
                                <Popup
                                    key={`popup-${index}`}
                                    anchor={marker.popupInfo.anchor || undefined}
                                    offset={POPUP_OFFSET}
                                    closeButton={false}
                                    latitude={Number(marker.popupInfo.lat)}
                                    longitude={Number(marker.popupInfo.lng)}
                                    closeOnClick={false}
                                    className='scada-marker-popup'
                                >
                                    <div
                                        className='overflow-hidden rounded-lg bg-white border inline-flex flex-col'
                                        style={{
                                            maxWidth: 240,
                                            borderColor: 'rgba(15, 42, 68, 0.1)',
                                            boxShadow:
                                                '0 8px 24px rgba(15, 42, 68, 0.18), 0 2px 6px rgba(15, 42, 68, 0.08)',
                                        }}
                                    >
                                        <div
                                            className='px-1.5 py-1'
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                                            }}
                                        >
                                            <div className='text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 leading-[1.4] truncate'>
                                                {(marker.popupInfo.data.binary_compressed
                                                    ? marker.popupInfo.data.bits?.find(
                                                          (b) =>
                                                              b.id === marker.popupInfo.id_bit
                                                      )?.name ?? marker.popupInfo.data.name
                                                    : marker.popupInfo.data.name) || marker.name}
                                            </div>
                                        </div>
                                        <div className='px-2 py-1 flex items-center justify-center'>
                                            {renderValueBlock(marker)}
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    )
                })}
            </Map>
        </div>
    )
}

export default MapBase
