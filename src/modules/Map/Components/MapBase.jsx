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
}) => {
    const handleDragMarker = (e, marker) => {
        let { lng, lat } = e.lngLat
        const updateMarker = markers.map((mark) => {
            if (mark.name === marker.name) {
                return {
                    name: mark.name,
                    latitude: lat,
                    longitude: lng,
                    popupInfo: {
                        lat: lat,
                        lng: lng,
                        name: mark.popupInfo.name,
                        data: mark.popupInfo.data,
                    },
                }
            }
            return mark
        })
        setMarkers(updateMarker)
    }

    // -62.004878
    // -30.717450
    return (
        <div style={{ position: 'relative', width, height }}>
            <Map
                reuseMaps
                initialViewState={{
                    longitude: -62.005196197872266,
                    latitude: -30.716256365145455,
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                }}
                style={{ width, height }}
                mapStyle="https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO"
            >
                {navigationcontrol && <NavigationControl position="top-left" />}
                {fullScreen && <FullscreenControl position="top-left" />}
                {geolocation && <GeolocateControl position="top-left" />}
                {markers.map((marker, index) => (
                    <>
                        <Marker
                            key={`marker-${index}`}
                            draggable={true}
                            longitude={marker.longitude}
                            latitude={marker.latitude}
                            anchor="bottom"
                            onDragEnd={(e) => handleDragMarker(e, marker)}
                        >
                            <Pin label={marker.name} color="#3498db" />
                        </Marker>
                        {marker?.popupInfo && whithPopup && (
                            <Popup
                                key={`popup-${index}`}
                                anchor="top-left"
                                closeButton={false}
                                latitude={Number(marker.popupInfo.lat)}
                                longitude={Number(marker.popupInfo.lng)}
                                closeOnClick={false}
                            >
                                <Typography variant="body2">
                                    {marker.popupInfo.data === null
                                        ? marker.popupInfo.name
                                        : marker.popupInfo.data}
                                </Typography>
                            </Popup>
                        )}
                    </>
                ))}
            </Map>
            {controlPanel && (
                <ControlPanel markers={markers} setMarkers={setMarkers} />
            )}
        </div>
    )
}

export default MapBase
