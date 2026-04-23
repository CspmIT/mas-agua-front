import Map, {
    NavigationControl,
    Marker,
    FullscreenControl,
    Popup,
    GeolocateControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../Style/MarkerPopup.css'
import ControlPanel from './ControlPanel'
import Pin from './Pin'
import { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

const MapBase = ({
    navigationcontrol = true,
    height = '100%',
    width = '100%',
    fullScreen = true,
    geolocation = true,
    controlPanel = true,
    markers = false,
    setMarkers = false,
    viewState,
    setViewState,
    draggable = false,
    withInfo = false, // Determina si se consulta InfluxDB
}) => {
    function extractInfluxVarsFromMarkers(markers) {
        return markers.map((m) => ({
            dataInflux: m.popupInfo.data   // el objeto entero
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
                const id_bit = marker.popupInfo.id_bit   // <-- nuevo
                const rawData = data[id]

                let value

                if (Array.isArray(rawData)) {
                    // Variable binaria comprimida → buscar el bit asignado
                    const match = rawData.find(b => b.id_bit === id_bit)
                    value = match !== undefined ? match.value : 'Sin datos'
                } else {
                    value = rawData ?? 'Sin datos'
                }

                return {
                    ...marker,
                    popupInfo: {
                        ...marker.popupInfo,
                        value,
                    }
                }
            })

            setMarkers(updated)

        } catch (error) {
            console.error("Error múltiples influx en mapa:", error)
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
        // Numérico: separa valor de unidad
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

        if (rawValue == null || rawValue === 'Sin datos') return 'Sin datos'

        // Variable binaria comprimida → mostrar nombre del bit + estado
        if (data?.binary_compressed && marker.popupInfo.id_bit != null) {
            if (rawValue === 'Sin datos' || rawValue == null) return 'Sin datos'
            return rawValue ? 'Encendido' : 'Apagado'
        }

        // Variable booleana común
        const unit = data?.unit?.toLowerCase() ?? ''
        if (['booleano', 'bool', 'binario'].includes(unit)) {
            return Number(rawValue) === 1 ? 'Encendido' : 'Apagado'
        }

        // Variable de campo status
        const calcField = Object.values(data?.varsInflux ?? {})[0]?.calc_field ?? ''
        if (calcField === 'status' || calcField.includes('estado')) {
            return Number(rawValue) === 1 ? 'Encendido' : 'Apagado'
        }

        // Valor numérico normal
        return `${rawValue} ${data?.unit ?? ''}`
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
                mapStyle="https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO"
                onMove={(e) => setViewState(e.viewState)}
            >
                {navigationcontrol && <NavigationControl position="top-left" />}
                {fullScreen && <FullscreenControl position="top-left" />}
                {geolocation && <GeolocateControl position="top-left" />}
                {markers.map((marker, index) => (
                    <Marker
                        key={`marker-${index}`}
                        draggable={draggable}
                        longitude={marker.longitude}
                        latitude={marker.latitude}
                        anchor="bottom"
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
                        <Pin label={marker.name} color="#2c6aa0" active={withInfo} />
                        {withInfo && marker.popupInfo && marker.popupInfo.data && (
                            <Popup
                                key={`popup-${index}`}
                                anchor="top-left"
                                closeButton={false}
                                latitude={Number(marker.popupInfo.lat)}
                                longitude={Number(marker.popupInfo.lng)}
                                closeOnClick={false}
                                offset={[-12, -12]}
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
                ))}
            </Map>
            {controlPanel && (
                <ControlPanel markers={markers} setMarkers={setMarkers} />
            )}
        </div>
    )
}

export default MapBase
