import Map, {
    NavigationControl,
    Marker,
    FullscreenControl,
    Popup,
    GeolocateControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import ControlPanel from './ControlPanel'
import Pin from './Pin'
import { Typography } from '@mui/material'
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
                        <Pin label={marker.name} color="#3498db" />
                        {withInfo && marker.popupInfo && marker.popupInfo.data && (

                            <Popup
                                key={`popup-${index}`}
                                anchor="top-left"
                                closeButton={false}
                                latitude={Number(marker.popupInfo.lat)}
                                longitude={Number(marker.popupInfo.lng)}
                                closeOnClick={false}
                                className='!rounded-xl !shadow-md'
                            >
                                <Typography variant="body3">
                                    {marker.popupInfo.data.binary_compressed
                                        ? marker.popupInfo.data.bits?.find(b => b.id === marker.popupInfo.id_bit)?.name
                                        ?? marker.popupInfo.data.name
                                        : marker.popupInfo.data.name ?? 'No hay datos'
                                    }
                                </Typography>
                                <Typography variant="body2">
                                    {formatMarkerValue(marker)}
                                </Typography>
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
