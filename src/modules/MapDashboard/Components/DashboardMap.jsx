import Map, { NavigationControl, FullscreenControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import SensorMarker from './SensorMarker'

const DashboardMap = ({
    markers,
    snapshot,
    activeFilters,
    initialViewState,
    onPinClick = null,
    selectedId = null,
}) => {
    const [viewState, setViewState] = useState(
        initialViewState || {
            longitude: -62.005196,
            latitude: -30.716256,
            zoom: 14,
            bearing: 0,
            pitch: 0,
        }
    )

    const visible = markers.filter((m) => {
        const status = snapshot[m.id]?.status || 'off'
        return activeFilters.has(status)
    })

    return (
        <Map
            {...viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle='https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO'
            onMove={(e) => setViewState(e.viewState)}
        >
            <NavigationControl position='top-left' />
            <FullscreenControl position='top-left' />
            {visible.map((m) => (
                <SensorMarker
                    key={m.id}
                    marker={m}
                    snapshot={snapshot[m.id]}
                    onClick={onPinClick}
                    selected={selectedId === m.id}
                />
            ))}
        </Map>
    )
}

export default DashboardMap
