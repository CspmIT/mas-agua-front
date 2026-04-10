import {
    Dialog, DialogTitle, DialogContent, IconButton, Chip
} from "@mui/material"

// Preview SVG minimalista para cada tipo de gráfico
const ChartPreviews = {
    LiquidFillPorcentaje: () => (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="32" stroke="#cbd5e1" strokeWidth="2" />
            <clipPath id="liquidClip">
                <circle cx="40" cy="40" r="30" />
            </clipPath>
            <rect x="10" y="50" width="60" height="22" fill="#363f9c" opacity="0.85" clipPath="url(#liquidClip)" />
            <path d="M10 50 Q25 44 40 50 Q55 56 70 50" stroke="#363f9c" strokeWidth="1.5" fill="none" clipPath="url(#liquidClip)" />
            <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">62%</text>
        </svg>
    ),
    CirclePorcentaje: () => (
        <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="28" stroke="#e2e8f0" strokeWidth="8" />
            <circle cx="40" cy="40" r="28" stroke="#363f9c" strokeWidth="8"
                strokeDasharray="105 70" strokeDashoffset="35" strokeLinecap="round" />
            <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">75%</text>
        </svg>
    ),
    BarDataSet: () => (
        <svg viewBox="0 0 80 80" fill="none">
            {[
                { x: 8, h: 30, y: 42 },
                { x: 22, h: 45, y: 27 },
                { x: 36, h: 20, y: 52 },
                { x: 50, h: 38, y: 34 },
                { x: 64, h: 52, y: 20 },
            ].map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width="10" height={b.h} rx="2"
                    fill={i === 4 ? "#363f9c" : "#93c5fd"} />
            ))}
            <line x1="6" y1="72" x2="76" y2="72" stroke="#cbd5e1" strokeWidth="1.5" />
        </svg>
    ),
    PieChart: () => (
        <svg viewBox="0 0 80 80" fill="none">
            <path d="M40 40 L40 12 A28 28 0 0 1 65 55 Z" fill="#363f9c" />
            <path d="M40 40 L65 55 A28 28 0 0 1 18 60 Z" fill="#93c5fd" />
            <path d="M40 40 L18 60 A28 28 0 0 1 40 12 Z" fill="#bfdbfe" />
        </svg>
    ),
    PumpControl: () => (
        <svg viewBox="0 0 80 80" fill="none">
            {/* Barra de estado superior */}
            <rect x="6" y="6" width="68" height="14" rx="3" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
            <text x="40" y="16" textAnchor="middle" fontSize="7" fill="#64748b">Estado: Sin datos</text>
    
            {/* 3 cards de bombas */}
            {[0, 1, 2].map(i => (
                <g key={i}>
                    <rect x={6 + i * 24} y="26" width="20" height="26" rx="3"
                        fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
                    <text x={16 + i * 24} y="36" textAnchor="middle" fontSize="6" fill="#64748b">
                        -
                    </text>
                    <text x={16 + i * 24} y="46" textAnchor="middle" fontSize="6"
                        fontWeight="bold" fill="#363f9c">
                        -
                    </text>
                </g>
            ))}
        </svg>
    ),
    GaugeSpeed: () => (
        <svg viewBox="0 0 80 80" fill="none">
            <path d="M12 58 A30 30 0 0 1 68 58" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            <path d="M12 58 A30 30 0 0 1 52 22" stroke="#363f9c" strokeWidth="8" strokeLinecap="round" />
            <line x1="40" y1="58" x2="55" y2="30" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="40" cy="58" r="4" fill="#1e293b" />
        </svg>
    ),
    BooleanChart: () => (
        <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="35" r="12" fill="#22c55e" opacity="0.2" />
            <circle cx="40" cy="35" r="7" fill="#22c55e" />
            <text x="40" y="62" textAnchor="middle" fontSize="9" fill="#64748b">Encendido</text>
        </svg>
    ),
    MultipleBooleanChart: () => (
        <svg viewBox="0 0 80 80" fill="none">
            {[
                { x: 14, y: 16, on: true },
                { x: 44, y: 16, on: false },
                { x: 14, y: 38, on: true },
                { x: 44, y: 38, on: true },
                { x: 14, y: 60, on: false },
                { x: 44, y: 60, on: true },
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
    ),
}

const CHART_LABELS = {
    LiquidFillPorcentaje: { label: "Nivel líquido" },
    CirclePorcentaje: { label: "Círculo %" },
    BarDataSet: { label: "Barras" },
    PieChart: { label: "Torta" },
    PumpControl: { label: "Control de bombas" },
    GaugeSpeed: { label: "Velocímetro" },
    BooleanChart: { label: "Booleano" },
    MultipleBooleanChart: { label: "Multi-booleano" },
}

export default function AddChartDialog({ open, onClose, availableCharts, onAdd }) {

    // Agrupar por tipo para mostrar la previsualización
    const grouped = availableCharts.reduce((acc, chart) => {
        if (!acc[chart.type]) acc[chart.type] = []
        acc[chart.type].push(chart)
        return acc
    }, {})

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: "80vh"
                }
            }}
        >
            <DialogTitle sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                pb: 2,
                mb: 2
            }}>
                <span>
                    Agregar widget
                </span>
                <IconButton size="small" onClick={onClose}>
                    ✕
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {Object.entries(grouped).map(([type, charts]) => {

                    const Preview = ChartPreviews[type]
                    const meta = CHART_LABELS[type] ?? { label: type, desc: "" }

                    return (
                        <div key={type} style={{ marginBottom: 24 }}>

                            {/* Encabezado del tipo */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 5
                            }}>
                                {Preview && (
                                    <div style={{
                                        width: 40, height: 40,
                                        background: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 4,
                                        flexShrink: 0
                                    }}>
                                        <Preview />
                                    </div>
                                )}
                                <div>
                                    <div style={{ color: "#0f172a" }}>
                                        {meta.label}
                                    </div>
                                </div>
                            </div>

                            {/* Cards de instancias disponibles */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: 10
                            }}>
                                {charts.map(chart => (
                                    <button
                                        key={chart.id}
                                        onClick={() => onAdd(chart.id)}
                                        style={{
                                            background: "#fff",
                                            border: "1.5px solid #e2e8f0",
                                            borderRadius: 10,
                                            padding: "10px 14px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.15s",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = "#363f9c"
                                            e.currentTarget.style.boxShadow = "0 0 0 3px #363f9c22"
                                            e.currentTarget.style.transform = "translateY(-1px)"
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = "#e2e8f0"
                                            e.currentTarget.style.boxShadow = "none"
                                            e.currentTarget.style.transform = "none"
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                                            {chart.name}
                                        </span>
                                        <Chip
                                            label={`ID ${chart.id}`}
                                            size="small"
                                            sx={{
                                                fontSize: 10,
                                                height: 18,
                                                background: "#f1f5f9",
                                                color: "#64748b",
                                                alignSelf: "flex-start"
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>

                        </div>
                    )
                })}

                {availableCharts.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "40px 0",
                        fontSize: 14
                    }}>
                        No hay widgets disponibles para agregar
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}