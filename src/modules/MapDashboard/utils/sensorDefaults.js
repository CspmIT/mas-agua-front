// Defaults sugeridos por tipo de sensor.
// Se usan para precargar el modal del marker cuando el operador elige un sensor_type.
export const DEFAULT_THRESHOLDS = {
    presion: { unit: 'bar', warn_low: 1.8, crit_low: 1.2, warn_high: 3.5, crit_high: 4.5, stale_after_minutes: 10 },
    caudal:  { unit: 'L/s', warn_low: 80,  crit_low: 50,  warn_high: 200, crit_high: 250, stale_after_minutes: 10 },
    nivel:   { unit: '%',   warn_low: 50,  crit_low: 30,  warn_high: 90,  crit_high: 95,  stale_after_minutes: 15 },
    bombeo:  { unit: 'bar', warn_low: 2.0, crit_low: 1.0, warn_high: 5.0, crit_high: 6.0, stale_after_minutes: 10 },
}

export const SENSOR_TYPE_OPTIONS = [
    { value: 'presion', label: 'Presión' },
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
    ok:    '#22c55e',
    warn:  '#f59e0b',
    crit:  '#ef4444',
    stale: '#a78bfa',
    off:   '#94a3b8',
}

export const STATUS_LABELS = {
    ok: 'OK',
    warn: 'Alerta',
    crit: 'Crítico',
    stale: 'Datos viejos',
    off: 'Sin datos',
}

export const TRENDS = { up: '↑', down: '↓', stable: '→' }
