import { PIN_BY_TYPE } from '../utils/sensorPins'
import { STATUS_COLORS } from '../utils/sensorDefaults'

const SensorPin = ({ type, status, label }) => {
    const Shape = PIN_BY_TYPE[type] || PIN_BY_TYPE.presion
    const color = STATUS_COLORS[status] || STATUS_COLORS.off
    const isStale = status === 'stale'

    return (
        <div
            style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
                transition: 'transform .15s ease',
                animation: isStale ? 'stalePulse 2.4s ease-in-out infinite' : 'none',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1.1)'
                e.currentTarget.style.zIndex = '1000'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1)'
                e.currentTarget.style.zIndex = ''
            }}
        >
            <Shape color={color} label={label} />
        </div>
    )
}

export default SensorPin
