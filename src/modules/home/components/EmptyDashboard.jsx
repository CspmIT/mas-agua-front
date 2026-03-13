import { useEffect, useState } from "react"

const FloatingWidget = ({ style, children }) => (
    <div style={{
        position: "absolute",
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(54,63,156,0.08)",
        fontSize: 11,
        color: "#64748b",
        whiteSpace: "nowrap",
        ...style
    }}>
        {children}
    </div>
)

export default function EmptyDashboard({ onAddChart }) {

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100)
        return () => clearTimeout(t)
    }, [])

    return (
        <div style={{
            width: "100%",
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>

            <div style={{ position: "relative", width: 280, height: 180, marginBottom: 40 }}>

                <svg width="280" height="180" style={{ position: "absolute", inset: 0 }}>
                    <defs>
                        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                        </pattern>
                    </defs>
                    <rect width="280" height="180" fill="url(#grid)" rx="16" />
                </svg>

                {/* Widget 1 — CirclePorcentaje (top left) */}
                <FloatingWidget style={{
                    top: 8, left: 52, width: 82, height: 78, opacity: 0.45,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg viewBox="0 0 80 80" fill="none" width="58" height="58">
                        <circle cx="40" cy="40" r="28" stroke="#e2e8f0" strokeWidth="8" />
                        <circle cx="40" cy="40" r="28" stroke="#363f9c" strokeWidth="8"
                            strokeDasharray="105 70" strokeDashoffset="35" strokeLinecap="round" />
                        <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">75%</text>
                    </svg>
                </FloatingWidget>

                {/* Widget 2 — MultipleBooleanChart (top right) */}
                <FloatingWidget style={{
                    top: 10, right: 24, width: 110, height: 78, opacity: 0.4,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg viewBox="0 0 80 80" fill="none" width="80" height="64">
                        {[
                            { x: 2, y: 14, on: true }, { x: 44, y: 14, on: false },
                            { x: 2, y: 34, on: true }, { x: 44, y: 34, on: true },
                            { x: 2, y: 56, on: false }, { x: 44, y: 56, on: true },
                        ].map((led, i) => (
                            <g key={i}>
                                <circle cx={led.x + 8} cy={led.y + 8} r="7"
                                    fill={led.on ? "#22c55e" : "#475569"} opacity={led.on ? 1 : 0.5} />
                                <rect x={led.x + 18} y={led.y + 4} width="20" height="4" rx="2"
                                    fill={led.on ? "#363f9c" : "#cbd5e1"} />
                                <rect x={led.x + 18} y={led.y + 11} width="14" height="3" rx="1.5" fill="#e2e8f0" />
                            </g>
                        ))}
                    </svg>
                </FloatingWidget>

                {/* Widget 3 — GaugeSpeed (bottom left) */}
                <FloatingWidget style={{
                    bottom: 14, left: 28, width: 100, height: 74, opacity: 0.45,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg viewBox="0 0 80 80" fill="none" width="68" height="58">
                        <path d="M12 58 A30 30 0 0 1 68 58" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M12 58 A30 30 0 0 1 52 22" stroke="#363f9c" strokeWidth="8" strokeLinecap="round" />
                        <line x1="40" y1="58" x2="55" y2="30" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="40" cy="58" r="4" fill="#1e293b" />
                    </svg>
                </FloatingWidget>

                {/* Widget 4 — BooleanChart (bottom right) */}
                <FloatingWidget style={{
                    bottom: 10, right: 50, width: 82, height: 74, opacity: 0.4,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg viewBox="0 0 80 80" fill="none" width="100" height="100">
                        <circle cx="40" cy="35" r="22" fill="#22c55e" opacity="0.2" />
                        <circle cx="40" cy="35" r="15" fill="#22c55e" />
                        <text x="40" y="72" textAnchor="middle" fontSize="14" fill="#64748b">Encendido</text>
                    </svg>
                </FloatingWidget>

                {/* Signo + central */}
                <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: "#2c6aa0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(54,63,156,0.3)",
                    zIndex: 10
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>

            </div>

            {/* Texto */}
            <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 8px 0",
                letterSpacing: "-0.3px"
            }}>
                Tu dashboard está vacío
            </h2>

            <p style={{
                fontSize: 14,
                color: "#64748b",
                margin: "0 0 28px 0",
                textAlign: "center",
                maxWidth: 320,
                lineHeight: 1.6
            }}>
                Agregá gráficos para visualizar tus datos en tiempo real. Podés personalizar el tamaño y posición de cada uno.
            </p>

            {/* CTA */}
            <button
                onClick={onAddChart}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background: "#2c6aa0",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(54,63,156,0.3)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(54,63,156,0.4)"
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "none"
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(54,63,156,0.3)"
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Agregar mi primer widget
            </button>

        </div>
    )
}