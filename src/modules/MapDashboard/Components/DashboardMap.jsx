import Map, { NavigationControl, FullscreenControl, AttributionControl, useControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useContext, useState } from 'react'
import { MainContext } from '../../../context/MainContext'
import SensorMarker from './SensorMarker'
import { DEFAULT_STYLE, styleUrl } from '../utils/mapStyles'

// Botones de zoom con paso reducido (0.5 en vez de 1 nivel entero) y easing,
// para que el salto entre un zoom y otro sea menos brusco que el control nativo
class SmoothZoom {
    constructor(step) {
        this.step = step
    }

    onAdd(map) {
        this.container = document.createElement('div')
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

        const makeButton = (label, ariaLabel, delta) => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.setAttribute('aria-label', ariaLabel)
            btn.textContent = label
            btn.style.fontSize = '18px'
            btn.style.fontWeight = '600'
            btn.style.color = '#333'
            btn.addEventListener('click', () => {
                map.easeTo({ zoom: map.getZoom() + delta, duration: 250 })
            })
            this.container.appendChild(btn)
        }

        makeButton('+', 'Acercar', this.step)
        makeButton('−', 'Alejar', -this.step)
        return this.container
    }

    onRemove() {
        this.container.remove()
    }
}

const SmoothZoomControl = ({ step = 0.25 }) => {
    useControl(() => new SmoothZoom(step), { position: 'top-left' })
    return null
}

const DashboardMap = ({
    markers,
    snapshot,
    activeFilters,
    activeTypes = null, // Set de tipos visibles ('none' = sin tipo); null = sin filtro
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
        if (!activeFilters.has(status)) return false
        if (activeTypes && !activeTypes.has(m.sensor_type || 'none')) return false
        return true
    })


    return (
        <Map
            {...viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={styleUrl(effectiveStyle)}
            onMove={(e) => setViewState(e.viewState)}
            attributionControl={false}
            onLoad={(e) => {
                // MapLibre muestra la atribución compacta expandida al inicio y no
                // ofrece opción para arrancar colapsada: se cierra a mano acá
                const attrib = e.target.getContainer().querySelector('.maplibregl-ctrl-attrib')
                if (attrib) {
                    attrib.classList.remove('maplibregl-compact-show')
                    attrib.removeAttribute('open')
                }
            }}
        >
            {/* Atribución colapsada en un ícono ⓘ: los créditos OSM/MapTiler son
                requisito de licencia, pero no hace falta la barra completa */}
            <AttributionControl compact position='top-left' />
            <SmoothZoomControl />
            <NavigationControl position='top-left' showZoom={false} />
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
