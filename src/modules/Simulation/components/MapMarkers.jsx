import { Marker } from 'react-map-gl/maplibre'
import { ElementIcon } from './elementIcons'

// Halo blanco para que la etiqueta se lea sobre cualquier fondo de mapa
const labelHalo = {
    textShadow: '0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff',
}

// Escala controlada por el zoom del mapa (ver updateMarkerScale en el editor):
// los marcadores se achican al alejar el mapa, como los POIs de un mapa web
const zoomScale = {
    transform: 'scale(var(--marker-scale, 1))',
    transformOrigin: 'center center',
}

/** Devuelve el color del tramo de la rampa al que pertenece el valor */
export const stopColor = (stops, value) => {
    let color = stops[0].color
    for (const s of stops) if (value >= s.value) color = s.color
    return color
}

/** Punto medio del trazado de un tramo (considerando vértices intermedios) */
export const pathMidpoint = (from, to, vertices = []) => {
    const path = [from, ...(vertices || []), to]
    const i = Math.floor((path.length - 1) / 2)
    return {
        latitude: (path[i].latitude + path[i + 1].latitude) / 2,
        longitude: (path[i].longitude + path[i + 1].longitude) / 2,
    }
}

/**
 * Marcador de nodo con icono según su tipo. En modo resultados el fondo
 * toma el color de la rampa de presión y el icono pasa a blanco.
 */
export const NodeMarker = ({ node, color, resultColor, selected, pending, draggable, onClick, onDragEnd }) => {
    const ring = pending
        ? '0 0 0 3px rgba(216, 98, 29, 0.85)'
        : selected
        ? '0 0 0 3px rgba(54, 139, 237, 0.85)'
        : '0 1px 4px rgba(15, 42, 68, 0.35)'

    return (
        <Marker
            latitude={node.latitude}
            longitude={node.longitude}
            anchor='center'
            draggable={draggable}
            onDragEnd={(e) => onDragEnd(node.tag, e.lngLat)}
            onClick={(e) => {
                e.originalEvent.stopPropagation()
                onClick(node.tag, e.originalEvent.shiftKey)
            }}
        >
            <div className='flex flex-col items-center cursor-pointer select-none' style={zoomScale}>
                <div
                    className='w-6 h-6 rounded-full flex items-center justify-center border-2 transition-shadow'
                    style={{
                        backgroundColor: resultColor ?? '#ffffff',
                        borderColor: resultColor ? '#ffffff' : color,
                        boxShadow: ring,
                    }}
                >
                    <ElementIcon kind='node' type={node.type} size={13} color={resultColor ? '#ffffff' : color} />
                </div>
                <span className='text-[9px] font-semibold text-slate-700 mt-0.5 leading-none' style={labelHalo}>
                    {node.tag}
                </span>
            </div>
        </Marker>
    )
}

/**
 * Insignia con icono sobre el trazado de un tramo especial (bomba o válvula),
 * clickeable para seleccionarlo.
 */
export const LinkBadge = ({ link, position, color, selected, onClick }) => (
    <Marker
        latitude={position.latitude}
        longitude={position.longitude}
        anchor='center'
        onClick={(e) => {
            e.originalEvent.stopPropagation()
            onClick(link.tag, e.originalEvent.shiftKey)
        }}
    >
        <div
            className='w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 cursor-pointer'
            style={{
                ...zoomScale,
                borderColor: color,
                boxShadow: selected ? '0 0 0 3px rgba(54, 139, 237, 0.85)' : '0 1px 4px rgba(15, 42, 68, 0.35)',
            }}
        >
            <ElementIcon kind='link' type={link.type} size={12} color={color} />
        </div>
    </Marker>
)

/**
 * Vértice editable del trazado de la tubería seleccionada:
 * se arrastra para ajustar el recorrido.
 */
export const VertexMarker = ({ vertex, index, onDragEnd }) => (
    <Marker
        latitude={vertex.latitude}
        longitude={vertex.longitude}
        anchor='center'
        draggable
        onDragEnd={(e) => onDragEnd(index, e.lngLat)}
        onClick={(e) => e.originalEvent.stopPropagation()}
    >
        <div
            className='w-3.5 h-3.5 rounded-full bg-white border-2 cursor-grab'
            style={{ ...zoomScale, borderColor: '#368bed', boxShadow: '0 1px 3px rgba(15, 42, 68, 0.4)' }}
        />
    </Marker>
)
