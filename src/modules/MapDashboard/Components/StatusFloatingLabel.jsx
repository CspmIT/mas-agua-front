import { TRENDS } from '../utils/sensorDefaults'

// Fondos con alpha: el label es secundario al pin, se ve el mapa a través.
const LABEL_BG = {
    ok:    { bg: 'rgba(240,253,244,0.85)', border: 'rgba(187,247,208,0.8)', text: '#0f172a' },
    warn:  { bg: 'rgba(255,251,235,0.85)', border: 'rgba(253,230,138,0.8)', text: '#0f172a' },
    crit:  { bg: 'rgba(254,242,242,0.85)', border: 'rgba(254,202,202,0.8)', text: '#0f172a' },
    stale:   { bg: 'rgba(245,243,255,0.85)', border: 'rgba(221,214,254,0.8)', text: '#0f172a' },
    apagado: { bg: 'rgba(241,245,249,0.85)', border: 'rgba(203,213,225,0.8)', text: '#475569' },
    off:     { bg: 'rgba(248,250,252,0.85)', border: 'rgba(226,232,240,0.8)', text: '#94a3b8' },
}

const TYPE_ICON = {
    presion: '💧',
    caudal:  '➤',
    nivel:   '▮',
    bombeo:  '⚙',
}

const renderValue = ({ kind, value, unit, status }) => {
    // Binaria: el back manda status 'off' con value 0 para decir "Apagado" (hay dato),
    // no "Sin datos". Por eso se resuelve antes que el corte de no-dato.
    if (kind === 'binary' && value !== null && value !== undefined) {
        return (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#0f172a' }}>
                {Number(value) === 1 ? 'Encendido' : 'Apagado'}
            </span>
        )
    }
    // Calc binaria: value es el label del estado calculado ("Encendida", "En falla", ...)
    if (kind === 'calc_binary' && value) {
        return (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#0f172a' }}>
                {value}
            </span>
        )
    }
    if (status === 'off' || value === null || value === undefined || value === 'Sin datos') {
        return <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Sin datos</span>
    }
    return (
        <>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#0f172a' }}>{value}</span>
            <span style={{ fontSize: 8, color: '#6b7280', marginLeft: 2 }}>{unit}</span>
        </>
    )
}

const StatusFloatingLabel = ({ type, status, value, unit, trend, ageMinutes, kind, offset }) => {
    const palette = LABEL_BG[status] || LABEL_BG.off
    const [dx, dy] = offset || [55, -45]
    const isStale = status === 'stale'
    const isOff = status === 'off'

    return (
        <div
            style={{
                position: 'absolute',
                left: `${dx}px`,
                top: `${dy}px`,
                transform: 'translate(-50%, -50%)',
                background: palette.bg,
                borderWidth: 1,
                borderStyle: isStale ? 'dashed' : 'solid',
                borderColor: palette.border,
                borderRadius: 5,
                padding: '1px 6px',
                fontSize: 9,
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(2px)',
                opacity: 0.92,
                transition: 'opacity 0.15s ease',
                pointerEvents: 'auto',
                color: palette.text,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.92' }}
        >
            <span style={{ marginRight: 3, fontSize: 8 }}>{TYPE_ICON[type] || ''}</span>
            {renderValue({ kind, value, unit, status })}
            {!isOff && trend && (
                <span style={{ marginLeft: 3, fontSize: 9 }}>{TRENDS[trend]}</span>
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
