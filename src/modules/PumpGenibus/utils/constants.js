// Constantes compartidas del modulo de control de bombas Genibus

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const PROGRAMMING_LABELS = {
    1: 'Diaria',
    2: 'Fecha',
    3: 'Nivel de Cisterna',
}

export const SET_POINT_MIN = 0.1
export const SET_POINT_MAX = 2.0

// Estado general del sistema segun led_contr del CU352 (mismo mapeo que el legacy)
export const GENERAL_STATUS = {
    0: { label: 'Apagada', tone: 'neutral' },
    1: { label: 'Normal', tone: 'success', pulse: true },
    2: { label: 'Paradas', tone: 'warning' },
    4: { label: 'Alarma', tone: 'error' },
    5: { label: 'Alarma', tone: 'error' },
    6: { label: 'Alarma y Detenido', tone: 'error' },
}

export const generalStatus = (value) =>
    GENERAL_STATUS[value] ?? { label: `Desconocido (${value})`, tone: 'warning' }

// "0,1,2" -> "Lunes, Martes..." / los 7 dias -> "Todos los días"
export const formatDays = (daysToDo) => {
    if (!daysToDo) return '-'
    const days = daysToDo.split(',').map(Number)
    if (days.length === 7) return 'Todos los días'
    return days.map((d) => DAY_NAMES[d]).join(', ')
}

export const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })
}

export const formatTime = (value) => (value ? value.slice(0, 5) : '-')
