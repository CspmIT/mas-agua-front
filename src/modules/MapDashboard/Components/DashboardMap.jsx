import Map, { NavigationControl, FullscreenControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useContext, useState } from 'react'
import { MainContext } from '../../../context/MainContext'
import SensorMarker from './SensorMarker'
import { DEFAULT_STYLE, styleUrl } from '../utils/mapStyles'

const DashboardMap = ({
    markers,
    snapshot,
    activeFilters,
    initialViewState,
    onPinClick = null,
    selectedId = null,
    fullscreenContainerId = null,
    styleId = null, // estilo elegido por el usuario; si no hay, según el tema
}) => {
    const { darkMode } = useContext(MainContext)
    const effectiveStyle = styleId || (darkMode ? DEFAULT_STYLE.dark : DEFAULT_STYLE.light)
    const initial = initialViewState || {
        longitude: -62.005196,
        latitude: -30.716256,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    }
    const [viewState, setViewState] = useState(initial)

    const visible = markers.filter((m) => {
        const status = snapshot[m.id]?.status || 'off'
        return activeFilters.has(status)
    })


    return (
        <Map
            {...viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={styleUrl(effectiveStyle)}
            onMove={(e) => setViewState(e.viewState)}
        >
            <NavigationControl position='top-left' />
            <FullscreenControl
                position='top-left'
                containerId={fullscreenContainerId || undefined}
            />
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
