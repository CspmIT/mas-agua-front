// Defaults sugeridos por tipo de sensor.
// Se usan para precargar el modal del marker cuando el operador elige un sensor_type.
export const DEFAULT_THRESHOLDS = {
    presion:     { unit: 'bar', warn_low: 1.8, crit_low: 1.2, warn_high: 3.5, crit_high: 4.5, stale_after_minutes: 10 },
    presion_red: { unit: 'bar', warn_low: 1.8, crit_low: 1.2, warn_high: 3.5, crit_high: 4.5, stale_after_minutes: 10 },
    caudal:  { unit: 'L/s', warn_low: 80,  crit_low: 50,  warn_high: 200, crit_high: 250, stale_after_minutes: 10 },
    nivel:   { unit: '%',   warn_low: 50,  crit_low: 30,  warn_high: 90,  crit_high: 95,  stale_after_minutes: 15 },
    bombeo:  { unit: 'bar', warn_low: 2.0, crit_low: 1.0, warn_high: 5.0, crit_high: 6.0, stale_after_minutes: 10 },
}

export const SENSOR_TYPE_OPTIONS = [
    { value: 'presion',     label: 'Presión' },
    { value: 'presion_red', label: 'Presión de red' },
    { value: 'caudal',  label: 'Caudal' },
    { value: 'nivel',   label: 'Nivel' },
    { value: 'bombeo',  label: 'Bombeo' },
]

export const ANCHOR_OPTIONS = [
    { value: '',             label: 'Automático' },
    { value: 'top',          label: 'Arriba' },
    { value: 'bottom',       label: 'Abajo' },
    { value: 'left',         label: 'Izquierda' },
    { value: 'right',        label: 'Derecha' },
    { value: 'top-left',     label: 'Arriba-Izquierda' },
    { value: 'top-right',    label: 'Arriba-Derecha' },
    { value: 'bottom-left',  label: 'Abajo-Izquierda' },
    { value: 'bottom-right', label: 'Abajo-Derecha' },
    { value: 'center',       label: 'Centro' },
]

export const STATUS_COLORS = {
    ok:      '#22c55e',
    warn:    '#f59e0b',
    crit:    '#ef4444',
    stale:   '#a78bfa',
    apagado: '#64748b',
    off:     '#94a3b8',
}

export const STATUS_LABELS = {
    ok: 'OK',
    warn: 'Alerta',
    crit: 'Crítico',
    stale: 'Datos viejos',
    apagado: 'Apagado',
    off: 'Sin datos',
}

export const TRENDS = { up: '↑', down: '↓', stable: '→' }

// Color base del rango normal de los pines. Cada marcador puede elegir el suyo
// (marker.normal_color); sin elección se usa el azul de la marca.
export const DEFAULT_NORMAL_COLOR = '#2563eb'
export const NORMAL_COLOR_PRESETS = [
    { value: DEFAULT_NORMAL_COLOR, label: 'Azul +Agua' },
    { value: '#16a34a', label: 'Verde semáforo' },
]

// Claridad de los extremos del gradiente (HSL): claro cerca de advertencia
// baja, oscuro cerca de advertencia alta
const LIGHT_L = 76
const DARK_L = 30

const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, Math.round(l * 100)]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h
    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        default: h = (r - g) / d + 4
    }
    return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)]
}

const baseHueSat = (baseColor) => {
    const hex = /^#[0-9a-fA-F]{6}$/.test(baseColor || '') ? baseColor : DEFAULT_NORMAL_COLOR
    const [h, s] = hexToHsl(hex)
    // Con saturación muy baja el gradiente no se lee: se asegura un piso
    return [h, Math.max(45, s)]
}

// Color interpolado para un valor dentro del rango normal [warnLow, warnHigh],
// sobre el tono del color base elegido (claro → oscuro).
// Devuelve null si faltan datos: el llamador cae al color de estado clásico.
export const normalRangeColor = (value, warnLow, warnHigh, baseColor) => {
    const v = Number(value)
    const lo = Number(warnLow)
    const hi = Number(warnHigh)
    if (!Number.isFinite(v) || !Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) {
        return null
    }
    const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
    const [h, s] = baseHueSat(baseColor)
    const lightness = Math.round(LIGHT_L - t * (LIGHT_L - DARK_L))
    return `hsl(${h}, ${s}%, ${lightness}%)`
}

// Gradiente (oscuro arriba → claro abajo) para el gauge de umbrales del editor
export const normalRangeGradient = (baseColor) => {
    const [h, s] = baseHueSat(baseColor)
    return `linear-gradient(180deg, hsl(${h}, ${s}%, ${DARK_L}%) 0%, hsl(${h}, ${s}%, 53%) 50%, hsl(${h}, ${s}%, ${LIGHT_L}%) 100%)`
}
