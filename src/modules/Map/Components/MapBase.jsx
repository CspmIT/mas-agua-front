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
    whithPopup = true,
    markers = false,
    setMarkers = false,
    viewState,
    setViewState,
    draggable = false,
    withInfo = false, // Determina si se consulta InfluxDB
}) => {
    useEffect(() => {
        if (withInfo && markers.length > 0) {
            fetchInfluxData(markers)

            const interval = setInterval(() => {
                fetchInfluxData(markers)
            }, 15000)
            return () => clearInterval(interval)
        }
    }, [withInfo, markers])

    // Función para obtener los datos de gráficos y actualizarlos
    const fetchInfluxData = async (markers) => {
        try {
            const updateMarkers = await Promise.all(
                markers.map(async (marker) => {
                    const influxVar = marker.popupInfo.data.varsInflux
                    const accessKey = Object.values(
                        marker.popupInfo.data.varsInflux
                    ).shift()
                    const { data } = await request(
                        `${backend[import.meta.env.VITE_APP_NAME]}/dataInflux`,
                        'POST',
                        influxVar
                    )
                    return {
                        ...marker,
                        popupInfo: {
                            ...marker.popupInfo,
                            value: `${data[accessKey.calc_field].value} ${
                                accessKey.calc_unit
                            }`,
                        },
                    }
                })
            )
            console.log(updateMarkers)
            setMarkers(updateMarkers)
        } catch (error) {
            console.log(error)
            return null
        }
    }

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
                    >
                        <Pin label={marker.name} color="#3498db" />
                        {marker?.popupInfo &&
                            withInfo &&
                            marker.popupInfo.data && (
                                <Popup
                                    key={`popup-${index}`}
                                    anchor="top-left"
                                    closeButton={false}
                                    latitude={Number(marker.popupInfo.lat)}
                                    longitude={Number(marker.popupInfo.lng)}
                                    closeOnClick={false}
                                >
                                    <Typography variant="body2">
                                        {typeof marker.popupInfo.value ===
                                        'string'
                                            ? marker.popupInfo.value
                                            : 'No hay datos'}
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
