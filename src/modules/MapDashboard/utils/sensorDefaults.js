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

// Escala del rango normal: celeste (valor cerca de advertencia baja) a
// azul oscuro (cerca de advertencia alta). Misma escala que muestra el
// gauge de umbrales del editor de marcadores.
export const NORMAL_RANGE_COLORS = { low: '#7dd3fc', high: '#1e40af' }

const hexToRgb = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
]

// Color interpolado para un valor dentro del rango normal [warnLow, warnHigh].
// Devuelve null si faltan datos: el llamador cae al color de estado clásico.
export const normalRangeColor = (value, warnLow, warnHigh) => {
    const v = Number(value)
    const lo = Number(warnLow)
    const hi = Number(warnHigh)
    if (!Number.isFinite(v) || !Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) {
        return null
    }
    const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
    const from = hexToRgb(NORMAL_RANGE_COLORS.low)
    const to = hexToRgb(NORMAL_RANGE_COLORS.high)
    const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t))
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`
}
