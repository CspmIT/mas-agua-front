import { Marker } from 'react-map-gl/maplibre'
import SensorPin from './SensorPin'
import StatusFloatingLabel from './StatusFloatingLabel'

// Mapeo de anchor (string del back) → offset (dx, dy) en píxeles para el label.
// Coordenadas relativas a la posición del pin.
const ANCHOR_TO_OFFSET = {
    '':             [55, -45],   // automático
    'top':          [0, -55],     // popup abajo del pin
    'bottom':       [0, 15],    // popup arriba del pin
    'left':         [55, -25],   // popup a la derecha
    'right':        [-55, -25],  // popup a la izquierda
    'top-left':     [40, 25],    // abajo-derecha
    'top-right':    [-40, 25],   // abajo-izquierda
    'bottom-left':  [40, -55],   // arriba-derecha
    'bottom-right': [-40, -55],  // arriba-izquierda
    'center':       [0, -25],    // centro encima del pin
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
