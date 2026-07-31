import { Checkbox, TextField, Tooltip } from '@mui/material'
import { FaDiscord } from 'react-icons/fa'

// Definición de zonas del gauge, de arriba hacia abajo.
// condition es la que usa la alarma creada desde el check de cada umbral.
export const THRESHOLD_ZONES = [
    { key: 'crit_high', label: 'Crítico alto', condition: '>', color: '#ef4444' },
    { key: 'warn_high', label: 'Advertencia alta', condition: '>', color: '#facc15' },
    { key: 'warn_low', label: 'Advertencia baja', condition: '<', color: '#facc15' },
    { key: 'crit_low', label: 'Crítico bajo', condition: '<', color: '#ef4444' },
]

const ROW_HEIGHT = 52
const NORMAL_HEIGHT = 96
const BAR_WIDTH = 18

// Gradiente del rango normal: azul oscuro (cerca de advertencia alta) a
// celeste (cerca de advertencia baja) — el pin del mapa replica esta escala
const NORMAL_GRADIENT = 'linear-gradient(180deg, #1e40af 0%, #2563eb 35%, #38bdf8 75%, #bae6fd 100%)'

const DISCORD_BLURPLE = '#5865F2'

const AlarmToggle = ({ checked, onChange, disabled, existing }) => (
    <Tooltip
        title={
            existing
                ? 'Ya existe una alarma con este valor (se administra en Configuración → Alarmas)'
                : disabled
                    ? 'Asigná una variable al marcador para poder crear la alarma'
                    : 'Crear alarma con este valor al guardar el mapa'
        }
        arrow
        placement='top'
    >
        <span className='inline-flex items-center'>
            <FaDiscord
                size={18}
                color={existing || (checked && !disabled) ? DISCORD_BLURPLE : '#94a3b8'}
                style={{ transition: 'color 0.15s ease' }}
            />
            <Checkbox
                size='small'
                checked={existing || checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled || existing}
                sx={{
                    p: 0.5,
                    '&.Mui-checked': { color: DISCORD_BLURPLE },
                    '&.Mui-disabled.Mui-checked': { color: DISCORD_BLURPLE, opacity: 0.75 },
                }}
            />
        </span>
    </Tooltip>
)

// Barra vertical de umbrales estilo "termómetro": cada zona de color queda
// alineada con su input, y el rango normal muestra el gradiente celeste→azul
const ThresholdGauge = ({
    register,
    watch,
    alarmChecks,
    setAlarmChecks,
    canCreateAlarms,
    existingAlarms = [],
}) => {
    const setCheck = (key, value) =>
        setAlarmChecks((prev) => ({ ...prev, [key]: value }))

    // Un umbral "ya tiene alarma" si la variable tiene una alarma con la misma
    // condición y el mismo valor que está cargado en el input
    const hasExistingAlarm = (zone) => {
        const raw = watch ? watch(zone.key) : undefined
        if (raw === '' || raw === null || raw === undefined) return false
        return existingAlarms.some(
            (a) =>
                a.condition === zone.condition &&
                a.value !== null &&
                a.value !== undefined &&
                Number(a.value) === Number(raw)
        )
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
                                background: s.zone ? s.zone.color : NORMAL_GRADIENT,
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
                                    existing={hasExistingAlarm(s.zone)}
                                />
                            </div>
                        ) : (
                            <div
                                key='normal'
                                className='flex items-center'
                                style={{ height: NORMAL_HEIGHT }}
                            >
                                <span className='text-[11px] leading-snug text-slate-500 dark:text-gray-400' style={{ maxWidth: 230 }}>
                                    Rango normal: el pin varía de celeste a azul
                                    oscuro según dónde caiga el valor.
                                </span>
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
