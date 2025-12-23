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
        console.log(markers)
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

            // Actualizamos los markers con los valores nuevos
            const updated = markers.map((marker) => {
                const id = marker.popupInfo.data.id
                const value = data[id] ?? 'Sin datos'

                return {
                    ...marker,
                    popupInfo: {
                        ...marker.popupInfo,
                        value: `${value} ${marker.popupInfo.data.unit ?? ''}`
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

        if (rawValue == null) return "No hay datos"

        // obtener calc_field
        const influxConfig = Object.values(marker.popupInfo.data.varsInflux)[0]
        const calcField = influxConfig.calc_field

        // si el campo es status interpretamos 0/1
        if (calcField === "status" || calcField === "estados_0" || calcField.includes("estado")) {
            const numeric = Number(rawValue)
            return numeric === 1 ? "Encendido" : "Apagado"
        }

        // para todo lo demás, devolver el valor normal
        return rawValue
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
                                    {marker.popupInfo.data.name ?? 'No hay datos'}
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
