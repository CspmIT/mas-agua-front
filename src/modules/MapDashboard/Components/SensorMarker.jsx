import { Marker } from 'react-map-gl/maplibre'
import SensorPin from './SensorPin'
import StatusFloatingLabel from './StatusFloatingLabel'

// Mapeo de anchor (string del back) → offset (dx, dy) en píxeles para el label.
// La opción elegida es la posición VISUAL del label respecto del pin
// (no la semántica de anchor de MapLibre, que es la inversa).
// El pin ocupa y ∈ [-42, 0] respecto del punto del marker.
const ANCHOR_TO_OFFSET = {
    '':             [45, -38],   // automático: derecha-arriba
    'top':          [0, -58],    // arriba del pin
    'bottom':       [0, 12],     // abajo del pin
    'left':         [-45, -21],  // a la izquierda
    'right':        [45, -21],   // a la derecha
    'top-left':     [-38, -52],  // arriba-izquierda
    'top-right':    [38, -52],   // arriba-derecha
    'bottom-left':  [-38, 6],    // abajo-izquierda
    'bottom-right': [38, 6],     // abajo-derecha
    'center':       [0, -21],    // centro sobre el pin
}

const truncateLabel = (name) => {
    if (!name) return ''
    return String(name).slice(0, 3).toUpperCase().padStart(2, '0').slice(0, 3)
}

const SensorMarker = ({ marker, snapshot, onClick = null, selected = false }) => {
    const s = snapshot || { status: 'off', value: null, kind: null, trend: null }
    const status = s.status || 'off'
    const offset = ANCHOR_TO_OFFSET[marker.anchor ?? ''] || ANCHOR_TO_OFFSET['']

    return (
        <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor='bottom'
        >
            <div style={{ position: 'relative', width: 0, height: 0, pointerEvents: 'none' }}>
                <div
                    onClick={onClick ? (e) => {
                        e.stopPropagation()
                        onClick(marker, s)
                    } : undefined}
                    style={{
                        pointerEvents: onClick ? 'auto' : 'none',
                        transform: selected ? 'scale(1.18)' : 'scale(1)',
                        transformOrigin: 'center bottom',
                        transition: 'transform 0.18s ease',
                        filter: selected
                            ? 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(54,139,237,0.6))'
                            : 'none',
                    }}
                >
                    <SensorPin
                        type={marker.sensor_type}
                        status={status}
                        label={truncateLabel(marker.name)}
                    />
                </div>
                <StatusFloatingLabel
                    type={marker.sensor_type}
                    status={status}
                    value={s.value}
                    unit={marker.unit}
                    trend={s.trend}
                    ageMinutes={s.age_minutes}
                    kind={s.kind}
                    offset={offset}
                />
            </div>
        </Marker>
    )
}

export default SensorMarker
