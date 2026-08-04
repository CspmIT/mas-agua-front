import { Checkbox, TextField, Tooltip } from '@mui/material'
import { FaDiscord } from 'react-icons/fa'
import {
    DEFAULT_NORMAL_COLOR,
    NORMAL_COLOR_PRESETS,
    normalRangeGradient,
} from '../utils/sensorDefaults'

// Definición de zonas del gauge, de arriba hacia abajo.
// condition es la que usa la alarma creada desde el check de cada umbral.
export const THRESHOLD_ZONES = [
    { key: 'crit_high', label: 'Crítico alto', condition: '>=', color: '#ef4444' },
    { key: 'warn_high', label: 'Advertencia alta', condition: '>=', color: '#facc15' },
    { key: 'warn_low', label: 'Advertencia baja', condition: '<=', color: '#facc15' },
    { key: 'crit_low', label: 'Crítico bajo', condition: '<=', color: '#ef4444' },
]

// Nombre determinístico de la alarma de un pin/umbral: permite reencontrarla
// para actualizarla cuando el usuario cambia el valor del umbral
export const zoneAlarmName = (markerName, zone) => `${markerName} - ${zone.label}`

const ROW_HEIGHT = 52
const NORMAL_HEIGHT = 96
const BAR_WIDTH = 18

const DISCORD_BLURPLE = '#5865F2'

// Estados del toggle: 'new' (crea alarma), 'update' (ya hay una alarma de este
// pin/umbral con otro valor: al guardar se actualiza) y 'existing' (idéntica, bloqueado)
const TOGGLE_TOOLTIPS = {
    disabled: 'Asigná una variable al marcador para poder crear la alarma',
    existing: 'Ya existe una alarma con este valor (se administra en Configuración → Alarmas)',
    new: 'Crear alarma con este valor al guardar el mapa',
}

const AlarmToggle = ({ checked, onChange, disabled, mode, previousValue }) => {
    const title = disabled
        ? TOGGLE_TOOLTIPS.disabled
        : mode === 'existing'
            ? TOGGLE_TOOLTIPS.existing
            : mode === 'update'
                ? `Ya hay una alarma para este umbral (valor ${previousValue}): marcá para actualizarla al guardar el mapa`
                : TOGGLE_TOOLTIPS.new

    const isExisting = mode === 'existing'
    const iconColor = isExisting || (checked && !disabled)
        ? DISCORD_BLURPLE
        : mode === 'update'
            ? '#d97706'
            : '#94a3b8'

    return (
        <Tooltip title={title} arrow placement='top'>
            <span className='inline-flex items-center'>
                <FaDiscord
                    size={18}
                    color={iconColor}
                    style={{ transition: 'color 0.15s ease' }}
                />
                <Checkbox
                    size='small'
                    checked={isExisting || checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled || isExisting}
                    sx={{
                        p: 0.5,
                        '&.Mui-checked': { color: DISCORD_BLURPLE },
                        '&.Mui-disabled.Mui-checked': { color: DISCORD_BLURPLE, opacity: 0.75 },
                    }}
                />
            </span>
        </Tooltip>
    )
}

// Barra vertical de umbrales estilo "termómetro": cada zona de color queda
// alineada con su input, y el rango normal muestra el gradiente celeste→azul
const ThresholdGauge = ({
    register,
    watch,
    alarmChecks,
    setAlarmChecks,
    canCreateAlarms,
    existingAlarms = [],
    linkedAlarms = {},
    normalColor = '',
    onNormalColorChange = () => {},
}) => {
    const setCheck = (key, value) =>
        setAlarmChecks((prev) => ({ ...prev, [key]: value }))

    // Estado de alarma de un umbral:
    // - 'existing': la alarma vinculada (o una idéntica de la variable) ya tiene
    //   la misma condición y valor
    // - 'update': el umbral tiene una alarma (vinculada por id, o legada por
    //   nombre) con otro valor: al guardar se actualiza
    // - 'new': no hay nada, el check crea una alarma nueva
    const getZoneAlarmState = (zone) => {
        const raw = watch ? watch(zone.key) : undefined
        const hasValue = raw !== '' && raw !== null && raw !== undefined

        const linked = linkedAlarms[zone.key]
        if (linked) {
            const unchanged =
                hasValue &&
                linked.condition === zone.condition &&
                Number(linked.value) === Number(raw)
            if (unchanged) return { mode: 'existing' }
            return { mode: 'update', previousValue: linked.value }
        }

        if (hasValue) {
            const identical = existingAlarms.some(
                (a) =>
                    a.condition === zone.condition &&
                    a.value !== null &&
                    a.value !== undefined &&
                    Number(a.value) === Number(raw)
            )
            if (identical) return { mode: 'existing' }
        }
        const markerName = watch ? watch('markerName') : ''
        const byName = markerName
            ? existingAlarms.find((a) => a.name === zoneAlarmName(markerName, zone))
            : null
        if (byName) return { mode: 'update', previousValue: byName.value }
        return { mode: 'new' }
    }

    const segments = [
        { zone: THRESHOLD_ZONES[0], height: ROW_HEIGHT },
        { zone: THRESHOLD_ZONES[1], height: ROW_HEIGHT },
        { zone: null, height: NORMAL_HEIGHT }, // rango normal
        { zone: THRESHOLD_ZONES[2], height: ROW_HEIGHT },
        { zone: THRESHOLD_ZONES[3], height: ROW_HEIGHT },
    ]

    return (
        <div className='flex flex-col gap-3'>
            <div className='flex gap-3 justify-center'>
                {/* Barra */}
                <div
                    className='flex flex-col flex-shrink-0 overflow-hidden'
                    style={{
                        width: BAR_WIDTH,
                        borderRadius: '8px 8px 0 0',
                        border: '2px solid #334155',
                        borderBottom: '4px solid #334155',
                    }}
                >
                    {segments.map((s, i) => (
                        <div
                            key={s.zone?.key || 'normal'}
                            style={{
                                height: s.height,
                                background: s.zone ? s.zone.color : normalRangeGradient(normalColor),
                                borderTop: i === 0 ? 'none' : '1px solid rgba(15, 23, 42, 0.35)',
                            }}
                        />
                    ))}
                </div>

                {/* Inputs alineados a cada zona */}
                <div className='flex flex-col'>
                    {segments.map((s) =>
                        s.zone ? (
                            <div
                                key={s.zone.key}
                                className='flex items-center gap-1.5'
                                style={{ height: ROW_HEIGHT }}
                            >
                                <TextField
                                    size='small'
                                    type='number'
                                    label={s.zone.label}
                                    inputProps={{ step: 0.1 }}
                                    sx={{ width: 200 }}
                                    {...register(s.zone.key)}
                                />
                                <AlarmToggle
                                    checked={!!alarmChecks[s.zone.key]}
                                    onChange={(v) => setCheck(s.zone.key, v)}
                                    disabled={!canCreateAlarms}
                                    {...getZoneAlarmState(s.zone)}
                                />
                            </div>
                        ) : (
                            <div
                                key='normal'
                                className='flex flex-col justify-center gap-1.5'
                                style={{ height: NORMAL_HEIGHT }}
                            >
                                <span className='text-[11px] leading-snug text-slate-500 dark:text-gray-400' style={{ maxWidth: 230 }}>
                                    Rango normal: el pin varía de claro a oscuro
                                    según dónde caiga el valor.
                                </span>
                                <div className='flex items-center gap-1.5'>
                                    <Tooltip title='Elegir color del rango normal' arrow placement='top'>
                                        <input
                                            type='color'
                                            value={normalColor || DEFAULT_NORMAL_COLOR}
                                            onChange={(e) => onNormalColorChange(e.target.value)}
                                            className='w-8 h-7 rounded-md border border-slate-300 dark:border-gray-600 cursor-pointer p-0 bg-transparent'
                                        />
                                    </Tooltip>
                                    {NORMAL_COLOR_PRESETS.map((preset) => (
                                        <Tooltip key={preset.value} title={preset.label} arrow placement='top'>
                                            <button
                                                type='button'
                                                onClick={() => onNormalColorChange(preset.value)}
                                                className='rounded-full cursor-pointer p-0'
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    background: normalRangeGradient(preset.value),
                                                    border:
                                                        (normalColor || DEFAULT_NORMAL_COLOR) === preset.value
                                                            ? '2px solid #0f172a'
                                                            : '1px solid rgba(15, 23, 42, 0.25)',
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Unidad y minutos a offline */}
            <div className='flex flex-wrap gap-2'>
                <div style={{ flex: '1 1 150px' }}>
                    <TextField
                        fullWidth
                        size='small'
                        label='Unidad'
                        placeholder='bar / L/s / %'
                        {...register('unit')}
                    />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                    <Tooltip
                        title='Si no llegan datos durante estos minutos, el pin pasa a "Datos viejos"'
                        arrow
                        placement='top'
                    >
                        <TextField
                            fullWidth
                            size='small'
                            type='number'
                            label='Minutos a "Offline"'
                            inputProps={{ step: 1, min: 1 }}
                            {...register('stale_after_minutes')}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}

export default ThresholdGauge
