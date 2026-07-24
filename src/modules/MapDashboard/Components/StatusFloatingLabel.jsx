import { TRENDS, STATUS_COLORS } from '../utils/sensorDefaults'

// Label blanco casi sólido con punto del color del estado.
// El tipo de sensor ya lo indica la forma del pin, así que no se repite acá.
const TEXT_COLOR = {
    apagado: '#475569',
    off: '#94a3b8',
}

const renderValue = ({ kind, value, unit, status }) => {
    // Binaria: el back manda status 'off' con value 0 para decir "Apagado" (hay dato),
    // no "Sin datos". Por eso se resuelve antes que el corte de no-dato.
    if (kind === 'binary' && value !== null && value !== undefined) {
        return (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>
                {Number(value) === 1 ? 'Encendido' : 'Apagado'}
            </span>
        )
    }
    // Calc binaria: value es el label del estado calculado ("Encendida", "En falla", ...)
    if (kind === 'calc_binary' && value) {
        return (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>
                {value}
            </span>
        )
    }
    if (status === 'off' || value === null || value === undefined || value === 'Sin datos') {
        return <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Sin datos</span>
    }
    return (
        <>
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </span>
            <span style={{ fontSize: 9, color: '#6b7280', marginLeft: 2 }}>{unit}</span>
        </>
    )
}

const StatusFloatingLabel = ({
    status,
    value,
    unit,
    trend,
    ageMinutes,
    kind,
    offset,
    visible = true,
    highlight = false,
}) => {
    const color = STATUS_COLORS[status] || STATUS_COLORS.off
    const [dx, dy] = offset || [55, -45]
    const isStale = status === 'stale'
    const isOff = status === 'off'

    return (
        <div
            style={{
                position: 'absolute',
                left: `${dx}px`,
                top: `${dy}px`,
                transform: `translate(-50%, -50%)${highlight ? ' scale(1.06)' : ''}`,
                background: 'rgba(255,255,255,0.95)',
                borderWidth: 1,
                borderStyle: isStale ? 'dashed' : 'solid',
                borderColor: highlight ? color : 'rgba(15, 42, 68, 0.16)',
                borderRadius: 6,
                padding: '2px 7px',
                fontSize: 10,
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                boxShadow: highlight
                    ? '0 3px 10px rgba(15, 42, 68, 0.28)'
                    : '0 1px 3px rgba(0,0,0,0.10)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease',
                pointerEvents: visible ? 'auto' : 'none',
                color: TEXT_COLOR[status] || '#0f172a',
            }}
        >
            <span
                aria-hidden
                style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 0 2px ${color}26`,
                    marginRight: 5,
                    verticalAlign: 'middle',
                }}
            />
            {renderValue({ kind, value, unit, status })}
            {!isOff && trend && (
                <span style={{ marginLeft: 3, fontSize: 10 }}>{TRENDS[trend]}</span>
            )}
            {isStale && ageMinutes != null && (
                <span style={{ fontSize: 7.5, color: '#94a3b8', display: 'block', marginTop: 1 }}>
                    hace {ageMinutes} min
                </span>
            )}
        </div>
    )
}

export default StatusFloatingLabel
