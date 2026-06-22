import { TRENDS } from '../utils/sensorDefaults'

const LABEL_BG = {
    ok:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#0f172a' },
    warn:  { bg: '#fffbeb', border: '#fde68a', text: '#0f172a' },
    crit:  { bg: '#fef2f2', border: '#fecaca', text: '#0f172a' },
    stale:   { bg: '#f5f3ff', border: '#ddd6fe', text: '#0f172a' },
    apagado: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
    off:     { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8' },
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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {Number(value) === 1 ? 'Encendido' : 'Apagado'}
            </span>
        )
    }
    if (status === 'off' || value === null || value === undefined || value === 'Sin datos') {
        return <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Sin datos</span>
    }
    return (
        <>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</span>
            <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 2 }}>{unit}</span>
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
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                pointerEvents: 'auto',
                color: palette.text,
            }}
        >
            <span style={{ marginRight: 4 }}>{TYPE_ICON[type] || ''}</span>
            {renderValue({ kind, value, unit, status })}
            {!isOff && trend && (
                <span style={{ marginLeft: 4, fontSize: 11 }}>{TRENDS[trend]}</span>
            )}
            {isStale && ageMinutes != null && (
                <span style={{ fontSize: 9, color: '#94a3b8', display: 'block', marginTop: 1 }}>
                    hace {ageMinutes} min
                </span>
            )}
        </div>
    )
}

export default StatusFloatingLabel
