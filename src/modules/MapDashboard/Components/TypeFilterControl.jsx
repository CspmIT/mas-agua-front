import { useState } from 'react'
import { Close, FilterAlt } from '@mui/icons-material'
import { SENSOR_TYPE_OPTIONS } from '../utils/sensorDefaults'
import { PIN_BY_TYPE } from '../utils/sensorPins'

// Clave del bucket para marcadores sin tipo asignado
export const UNTYPED_KEY = 'none'

export const ALL_SENSOR_TYPES = new Set([
    ...SENSOR_TYPE_OPTIONS.map((o) => o.value),
    UNTYPED_KEY,
])

// Botón flotante + popover para filtrar los pines del mapa por tipo de sensor.
// Cada tipo se prende/apaga de forma independiente; "Todos" resetea el filtro.
const TypeFilterControl = ({ counts, activeTypes, setActiveTypes }) => {
    const [open, setOpen] = useState(false)

    const toggleType = (value) => {
        setActiveTypes((prev) => {
            const next = new Set(prev)
            if (next.has(value)) next.delete(value)
            else next.add(value)
            return next
        })
    }

    const isFiltering = activeTypes.size !== ALL_SENSOR_TYPES.size
    const rows = [
        ...SENSOR_TYPE_OPTIONS,
        ...(counts?.[UNTYPED_KEY] ? [{ value: UNTYPED_KEY, label: 'Sin tipo' }] : []),
    ]

    return (
        <div className='relative flex flex-col items-start'>
            {open && (
                <div
                    className='absolute bottom-full mb-2 left-0 rounded-xl bg-white border overflow-hidden'
                    style={{
                        width: 240,
                        maxWidth: 'calc(100vw - 32px)',
                        borderColor: 'rgba(15, 42, 68, 0.12)',
                        boxShadow:
                            '0 12px 32px rgba(15, 42, 68, 0.22), 0 2px 6px rgba(15, 42, 68, 0.08)',
                    }}
                >
                    <div
                        className='flex items-center justify-between px-3 py-2'
                        style={{
                            background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                        }}
                    >
                        <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-white'>
                            Tipo de sensor
                        </span>
                        <button
                            type='button'
                            onClick={() => setOpen(false)}
                            className='inline-flex items-center justify-center rounded-full transition-colors'
                            style={{
                                width: 28,
                                height: 28,
                                background: 'rgba(255, 255, 255, 0.18)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                cursor: 'pointer',
                            }}
                            aria-label='Cerrar filtro de tipos'
                        >
                            <Close sx={{ fontSize: 18, color: '#ffffff' }} />
                        </button>
                    </div>

                    <div className='px-2 py-2 flex flex-col gap-1 max-h-[50vh] overflow-y-auto'>
                        {rows.map((o) => {
                            const Shape = PIN_BY_TYPE[o.value] || PIN_BY_TYPE.presion
                            const active = activeTypes.has(o.value)
                            const count = counts?.[o.value] ?? 0
                            return (
                                <button
                                    key={o.value}
                                    type='button'
                                    onClick={() => toggleType(o.value)}
                                    className='flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-150 text-left'
                                    style={{
                                        background: active
                                            ? 'rgba(54, 139, 237, 0.08)'
                                            : '#ffffff',
                                        borderColor: active
                                            ? 'rgba(54, 139, 237, 0.45)'
                                            : 'rgba(15, 42, 68, 0.1)',
                                        opacity: active ? 1 : 0.55,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {/* Los pines son SVG de 32x42 fijos: se escalan al 50% */}
                                    <div style={{ width: 16, height: 21, flexShrink: 0, overflow: 'hidden' }}>
                                        <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: 32, height: 42 }}>
                                            <Shape color={active ? '#2c6aa0' : '#94a3b8'} label='' />
                                        </div>
                                    </div>
                                    <span className='flex-1 text-[11.5px] font-semibold text-slate-800'>
                                        {o.label}
                                    </span>
                                    <span
                                        className='text-[10.5px] font-bold text-slate-500'
                                        style={{ fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {count}
                                    </span>
                                </button>
                            )
                        })}

                        <button
                            type='button'
                            onClick={() => setActiveTypes(new Set(ALL_SENSOR_TYPES))}
                            disabled={!isFiltering}
                            className='mt-1 px-2 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors'
                            style={{
                                background: isFiltering
                                    ? 'rgba(54, 139, 237, 0.12)'
                                    : 'rgba(148, 163, 184, 0.1)',
                                color: isFiltering ? '#1d4ed8' : '#94a3b8',
                                border: '1px solid ' + (isFiltering
                                    ? 'rgba(54, 139, 237, 0.35)'
                                    : 'rgba(148, 163, 184, 0.25)'),
                                cursor: isFiltering ? 'pointer' : 'default',
                            }}
                        >
                            Mostrar todos
                        </button>
                    </div>
                </div>
            )}

            <button
                type='button'
                onClick={() => setOpen((v) => !v)}
                className='inline-flex items-center gap-1.5 rounded-full text-white transition-transform hover:scale-[1.03] active:scale-[0.98]'
                style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                    boxShadow:
                        '0 6px 18px rgba(44, 106, 160, 0.4), 0 2px 4px rgba(15, 42, 68, 0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                }}
                aria-label='Filtrar por tipo de sensor'
            >
                <FilterAlt sx={{ fontSize: 16 }} />
                <span className='text-[11px] font-semibold uppercase tracking-[0.14em]'>
                    Tipos
                </span>
                {isFiltering && (
                    <span
                        className='inline-flex items-center justify-center rounded-full text-[10px] font-bold'
                        style={{
                            minWidth: 16,
                            height: 16,
                            background: '#ffffff',
                            color: '#1f4e79',
                            padding: '0 4px',
                        }}
                    >
                        {activeTypes.size}
                    </span>
                )}
            </button>
        </div>
    )
}

export default TypeFilterControl
