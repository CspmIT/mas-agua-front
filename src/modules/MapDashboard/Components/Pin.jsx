import { STATUS_COLORS } from '../utils/sensorDefaults'

// Cuerpo con bordes más redondeados: top esférico + punta suave (sin pico afilado)
const PIN_PATH =
    'M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 3.8 2.8 7.6 8.3 12 1.3 1 2.6 1 3.9 0 5.5-4.4 8.3-8.2 8.3-12 0-5.8-4.7-10.5-10.5-10.5z'

function Pin({ size = 46, label = '', color = '#2c6aa0', active = true, status = null }) {
    const effectiveColor = status ? (STATUS_COLORS[status] || color) : color
    const gradientId = `pinGradient-${effectiveColor.replace('#', '')}`
    const haloId = `pinHalo-${effectiveColor.replace('#', '')}`
    const text = String(label || '').slice(0, 3).toUpperCase()
    const isStale = status === 'stale'

    return (
        <span
            style={{
                display: 'inline-block',
                lineHeight: 0,
                animation: isStale ? 'stalePulse 2.4s ease-in-out infinite' : 'none',
            }}
        >
            <svg
                height={size}
                viewBox='0 0 24 28'
                style={{
                    overflow: 'visible',
                    filter: 'drop-shadow(0 6px 12px rgba(15, 42, 68, 0.35))',
                    cursor: 'pointer',
                }}
            >
                <defs>
                    <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#5ea5f0' />
                        <stop offset='55%' stopColor={effectiveColor} />
                        <stop offset='100%' stopColor='#1f4e79' />
                    </linearGradient>
                    <radialGradient id={haloId} cx='50%' cy='50%' r='50%'>
                        <stop offset='0%' stopColor={effectiveColor} stopOpacity='0.35' />
                        <stop offset='100%' stopColor={effectiveColor} stopOpacity='0' />
                    </radialGradient>
                </defs>

                {/* Halo pulse */}
                {active && (
                    <circle cx='12' cy='12' r='11' fill={`url(#${haloId})`}>
                        <animate
                            attributeName='r'
                            values='9;13;9'
                            dur='2.4s'
                            repeatCount='indefinite'
                        />
                        <animate
                            attributeName='opacity'
                            values='0.7;0;0.7'
                            dur='2.4s'
                            repeatCount='indefinite'
                        />
                    </circle>
                )}

                {/* Pin body — bordes suaves */}
                <path
                    d={PIN_PATH}
                    fill={`url(#${gradientId})`}
                    stroke='rgba(255, 255, 255, 0.55)'
                    strokeWidth='0.7'
                    strokeLinejoin='round'
                />

                {/* Badge blanco redondeado */}
                <circle
                    cx='12'
                    cy='12'
                    r='6.2'
                    fill='#ffffff'
                    opacity='0.96'
                    stroke={effectiveColor}
                    strokeWidth='0.4'
                    strokeOpacity='0.35'
                />

                {/* Label SCADA: nombre del marker */}
                {text && (
                    <text
                        x='12'
                        y='14'
                        textAnchor='middle'
                        style={{
                            pointerEvents: 'none',
                            fontFamily:
                                "'Inter', 'Roboto Condensed', 'Segoe UI', system-ui, sans-serif",
                            fontSize: '5.2px',
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            fill: effectiveColor,
                        }}
                    >
                        {text}
                    </text>
                )}
            </svg>
        </span>
    )
}

export default Pin
