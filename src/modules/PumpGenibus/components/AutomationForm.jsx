import { useEffect, useState } from 'react'
import {
    Box,
    Button,
    MenuItem,
    TextField,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'
import { saveAutomation } from '../services/api'
import { DAY_NAMES, SET_POINT_MIN, SET_POINT_MAX } from '../utils/constants'

const round1 = (value) => Math.round(value * 10) / 10

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

// Dias en orden lunes-primero con su inicial (el valor sigue siendo 0=domingo)
const DAY_CHIPS = [
    { value: 1, initial: 'L' },
    { value: 2, initial: 'M' },
    { value: 3, initial: 'X' },
    { value: 4, initial: 'J' },
    { value: 5, initial: 'V' },
    { value: 6, initial: 'S' },
    { value: 0, initial: 'D' },
]

// Cuadradito seleccionable de un dia (o el "Todos")
const DayChip = ({ label, title, selected, onClick, wide = false }) => (
    <Tooltip title={title}>
        <button
            type="button"
            onClick={onClick}
            className={`border p-0 h-9 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                wide ? 'px-3' : 'w-9'
            } ${
                selected
                    ? 'bg-primary border-primary text-white'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary'
            }`}
        >
            {label}
        </button>
    </Tooltip>
)

const stepBtnSx = {
    border: '1px solid rgba(148, 163, 184, 0.4)',
    width: 28,
    height: 28,
}

// Stepper numerico con flechas (presiones, nivel de cisterna, intervalo)
const Stepper = ({ label, value, onChange, min, max, step = 0.1, format = (v) => v.toFixed(1), unit }) => (
    <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-1.5">
            <IconButton size="small" sx={stepBtnSx} onClick={() => onChange(Math.max(min, round1(value - step)))}>
                <RemoveIcon fontSize="small" />
            </IconButton>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100 min-w-16 text-center">
                {format(value)}
                {unit && <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>}
            </span>
            <IconButton size="small" sx={stepBtnSx} onClick={() => onChange(Math.min(max, round1(value + step)))}>
                <AddIcon fontSize="small" />
            </IconButton>
        </div>
    </div>
)

// Selector hora + minutos (paso de 5 min, igual que el legacy)
const TimeSelect = ({ label, value, onChange }) => {
    const [hh, mm] = value.split(':')
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
            <div className="flex gap-1.5">
                <TextField select size="small" value={hh} onChange={(e) => onChange(`${e.target.value}:${mm}`)} sx={{ width: 76 }}>
                    {HOURS.map((h) => (
                        <MenuItem key={h} value={h}>{h}</MenuItem>
                    ))}
                </TextField>
                <TextField select size="small" value={mm} onChange={(e) => onChange(`${hh}:${e.target.value}`)} sx={{ width: 76 }}>
                    {MINUTES.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                </TextField>
            </div>
        </div>
    )
}

const emptyForm = {
    programming: 1,
    days: [],
    time_start: '00:00',
    time_finish: '06:00',
    date_start: '',
    date_finish: '',
    starting_pressure: 1.2,
    end_pressure: 1.2,
    cistern_level: 10,
    time_interval_ejecution: 1,
    repeat_action: 2,
    status: 1,
}

// Convierte una fila del backend al estado del formulario
const fromRecord = (record) => ({
    programming: record.programming,
    days: record.days_to_do ? record.days_to_do.split(',').map(Number) : [],
    time_start: record.time_start ? record.time_start.slice(0, 5) : '00:00',
    time_finish: record.time_finish ? record.time_finish.slice(0, 5) : '06:00',
    date_start: record.date_start ? record.date_start.slice(0, 16) : '',
    date_finish: record.date_finish ? record.date_finish.slice(0, 16) : '',
    starting_pressure: Number(record.starting_pressure),
    end_pressure: record.end_pressure ? Number(record.end_pressure) : 1.2,
    cistern_level: record.cistern_level ?? 10,
    time_interval_ejecution: record.time_interval_ejecution ?? 1,
    repeat_action: record.repeat_action ?? 2,
    status: record.status,
})

const warn = (html) =>
    Swal.fire({
        title: '¡Atención!',
        html,
        icon: 'warning',
        showConfirmButton: false,
        showCloseButton: true,
    })

// Alta / edicion de una programacion de bombas (Diaria / Fecha / Nivel de Cisterna)
const AutomationForm = ({ open, onClose, record, onSaved }) => {
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) setForm(record ? fromRecord(record) : emptyForm)
    }, [open, record])

    const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

    const toggleDay = (day) =>
        setForm((prev) => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day].sort(),
        }))

    const allDays = form.days.length === 7
    const toggleAllDays = () =>
        setForm((prev) => ({ ...prev, days: prev.days.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6] }))

    const validate = () => {
        if (form.programming === 1) {
            if (form.days.length === 0) {
                warn('Debe seleccionar por lo menos <b>un día</b> a realizar la acción.')
                return false
            }
            if (form.time_finish <= form.time_start) {
                warn('La <b>hora de inicio</b> debe ser anterior a la <b>hora de fin</b>.')
                return false
            }
        }
        if (form.programming === 2) {
            if (!form.date_start || !form.date_finish) {
                warn('Debe ingresar la <b>fecha de inicio</b> y la <b>fecha de fin</b>.')
                return false
            }
            if (new Date(form.date_finish) <= new Date(form.date_start)) {
                warn('La <b>fecha de inicio</b> debe ser anterior a la <b>fecha de fin</b>.')
                return false
            }
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return

        const payload = {
            id: record?.id,
            programming: form.programming,
            starting_pressure: form.starting_pressure,
            time_interval_ejecution: form.time_interval_ejecution,
            status: form.status,
        }
        if (form.programming === 1) {
            payload.days_to_do = form.days.join(',')
            payload.time_start = `${form.time_start}:00`
            payload.time_finish = `${form.time_finish}:00`
            payload.end_pressure = form.end_pressure
            payload.repeat_action = form.repeat_action
        }
        if (form.programming === 2) {
            payload.date_start = form.date_start
            payload.date_finish = form.date_finish
            payload.end_pressure = form.end_pressure
        }
        if (form.programming === 3) {
            payload.cistern_level = form.cistern_level
        }

        try {
            setSaving(true)
            await saveAutomation(payload)
            Swal.fire({
                title: '¡Correcto!',
                html: 'Los datos se guardaron correctamente.',
                icon: 'success',
                timer: 1600,
                showConfirmButton: false,
            })
            onSaved()
            onClose()
        } catch (error) {
            const data = error?.response?.data
            const message = Array.isArray(data)
                ? data.map((e) => e.message).join('<br>')
                : data?.message || String(error)
            Swal.fire({ title: 'Error', html: message, icon: 'error', showConfirmButton: false, showCloseButton: true })
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            maxWidth={620}
            title={record ? 'Editar programación de bombas' : 'Nueva programación de bombas'}
            eyebrow="Bombeo urbano"
        >
            <Box className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap gap-4 items-end justify-center">
                    <TextField
                        select
                        size="small"
                        label="Programación"
                        value={form.programming}
                        onChange={(e) => set('programming')(Number(e.target.value))}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value={1}>Diaria</MenuItem>
                        <MenuItem value={2}>Fecha</MenuItem>
                        <MenuItem value={3}>Nivel de Cisterna</MenuItem>
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Estado"
                        value={form.status}
                        onChange={(e) => set('status')(Number(e.target.value))}
                        sx={{ minWidth: 130 }}
                    >
                        <MenuItem value={1}>Activo</MenuItem>
                        <MenuItem value={2}>Inactivo</MenuItem>
                    </TextField>

                    {form.programming === 1 && (
                        <TextField
                            select
                            size="small"
                            label="Repetir"
                            value={form.repeat_action}
                            onChange={(e) => set('repeat_action')(Number(e.target.value))}
                            sx={{ minWidth: 130 }}
                        >
                            <MenuItem value={1}>Una vez</MenuItem>
                            <MenuItem value={2}>Siempre</MenuItem>
                        </TextField>
                    )}
                </div>

                {form.programming === 1 && (
                    <>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                Días a realizar
                            </span>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                <DayChip
                                    label="Todos"
                                    title="Todos los días"
                                    wide
                                    selected={allDays}
                                    onClick={toggleAllDays}
                                />
                                {DAY_CHIPS.map(({ value, initial }) => (
                                    <DayChip
                                        key={value}
                                        label={initial}
                                        title={DAY_NAMES[value]}
                                        selected={form.days.includes(value)}
                                        onClick={() => toggleDay(value)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <TimeSelect label="Hora de inicio" value={form.time_start} onChange={set('time_start')} />
                            <TimeSelect label="Hora de fin" value={form.time_finish} onChange={set('time_finish')} />
                        </div>
                    </>
                )}

                {form.programming === 2 && (
                    <div className="flex flex-wrap justify-center gap-4">
                        <TextField
                            size="small"
                            type="datetime-local"
                            label="Fecha de inicio"
                            value={form.date_start}
                            onChange={(e) => set('date_start')(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            size="small"
                            type="datetime-local"
                            label="Fecha de fin"
                            value={form.date_finish}
                            onChange={(e) => set('date_finish')(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-6 justify-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    {form.programming === 3 && (
                        <Stepper
                            label="Nivel de cisterna"
                            value={form.cistern_level}
                            onChange={set('cistern_level')}
                            min={2}
                            max={99}
                            step={1}
                            format={(v) => String(v)}
                            unit="%"
                        />
                    )}
                    <Stepper
                        label={form.programming === 3 ? 'Reducir presión a' : 'Presión de inicio'}
                        value={form.starting_pressure}
                        onChange={set('starting_pressure')}
                        min={SET_POINT_MIN}
                        max={SET_POINT_MAX}
                        unit="bar"
                    />
                    {form.programming !== 3 && (
                        <Stepper
                            label="Presión de fin"
                            value={form.end_pressure}
                            onChange={set('end_pressure')}
                            min={SET_POINT_MIN}
                            max={SET_POINT_MAX}
                            unit="bar"
                        />
                    )}
                    <Stepper
                        label="Intervalo de ejecución"
                        value={form.time_interval_ejecution}
                        onChange={set('time_interval_ejecution')}
                        min={1}
                        max={15}
                        step={1}
                        format={(v) => String(v)}
                        unit={form.time_interval_ejecution === 1 ? 'minuto' : 'minutos'}
                    />
                </div>

                <div className="flex justify-center pt-1">
                    <Button
                        variant="contained"
                        color="success"
                        disabled={saving}
                        onClick={handleSubmit}
                        sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600, px: 4 }}
                    >
                        {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Guardar'}
                    </Button>
                </div>
            </Box>
        </ModalShell>
    )
}

export default AutomationForm
