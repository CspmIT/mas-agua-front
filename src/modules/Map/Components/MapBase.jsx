import { useEffect, useState } from 'react'
import Map, {
    NavigationControl,
    Marker,
    FullscreenControl,
    Popup,
    GeolocateControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import ControlPanel from './ControlPanel'

const MapBase = ({
    navigationcontrol = true,
    marker = true,
    height = '100%',
    width = '100%',
    fullScreen = true,
    geolocation = true,
    controlPanel = true,
}) => {
    const [latitude, setLatitude] = useState(-30.716256365145455)
    const [longitude, setLongitude] = useState(-62.005196197872266)
    const [popupInfo, setPopupInfo] = useState(null)

    const handleDrag = (e) => {
        const { lng, lat } = e.lngLat
        setLatitude(lat)
        setLongitude(lng)
    }

    useEffect(() => {
        setPopupInfo({
            titulo: 'Test',
            descripcion: 'description',
            latitude: latitude,
            longitude: longitude,
        })
    }, [latitude, longitude])
    return (
        <>
            <Map
                initialViewState={{
                    longitude: -62.005196197872266,
                    latitude: -30.716256365145455,
                    zoom: 14,
                }}
                style={{ width, height }}
                mapStyle="https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO"
            >
                {navigationcontrol && <NavigationControl position="top-left" />}
                {fullScreen && <FullscreenControl position="top-left" />}
                {geolocation && <GeolocateControl position="top-left" />}
                {marker && (
                    <>
                        <Marker
                            draggable={true}
                            longitude={longitude}
                            latitude={latitude}
                            anchor="top-right"
                            color={'#f04'}
                            onDragEnd={handleDrag}
                            onClick={(e) => {
                                e.originalEvent.stopPropagation()
                                setPopupInfo({
                                    titulo: 'Test',
                                    descripcion: 'description',
                                    latitude: latitude,
                                    longitude: longitude,
                                })
                            }}
                        ></Marker>
                        {popupInfo && (
                            <Popup
                                anchor="top-left"
                                latitude={Number(popupInfo.latitude)}
                                longitude={Number(popupInfo.longitude)}
                                onClose={() => {
                                    setPopupInfo(null)
                                }}
                            >
                                <h1>{popupInfo.titulo}</h1>
                                <p>{popupInfo.descripcion}</p>
                            </Popup>
                        )}
                    </>
                )}
            </Map>
            {controlPanel && <ControlPanel />}
        </>
    )
}

export default MapBase
