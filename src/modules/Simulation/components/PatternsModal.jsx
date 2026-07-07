import { useState } from 'react'
import { Button, TextField, Tooltip } from '@mui/material'
import { Add, DeleteOutline } from '@mui/icons-material'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'

// Curva residencial típica: valle nocturno, pico a la mañana y pico a la noche
const RESIDENTIAL = [0.5, 0.4, 0.35, 0.35, 0.4, 0.6, 0.9, 1.3, 1.5, 1.3, 1.1, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.4, 1.6, 1.5, 1.2, 0.9, 0.6]

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    '&:hover': { background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)' },
}

// Vista previa en barras de los multiplicadores
const PatternPreview = ({ multipliers }) => {
    const max = Math.max(...multipliers, 1)
    return (
        <div className='flex items-end gap-[2px] h-16 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-2 pt-2'>
            {multipliers.map((m, i) => (
                <Tooltip key={i} title={`${i}:00 hs — ×${m}`}>
                    <div
                        className='flex-1 rounded-t-sm'
                        style={{
                            height: `${Math.max(4, (m / max) * 100)}%`,
                            backgroundColor: m >= 1 ? '#368bed' : '#93c5fd',
                        }}
                    />
                </Tooltip>
            ))}
        </div>
    )
}

/**
 * Administrador de patrones horarios de demanda: multiplicadores por hora
 * que modulan la demanda base de los nodos a lo largo del día.
 */
const PatternsModal = ({ open, onClose, patterns, usageByTag, onChange }) => {
    const [selectedTag, setSelectedTag] = useState(null)
    const current = patterns.find((p) => p.tag === selectedTag) ?? patterns[0] ?? null

    const nextPatternTag = () => {
        let i = 1
        while (patterns.some((p) => p.tag === `PAT${i}`)) i++
        return `PAT${i}`
    }

    const addPattern = (multipliers) => {
        const tag = nextPatternTag()
        onChange([...patterns, { tag, multipliers: [...multipliers] }])
        setSelectedTag(tag)
    }

    const updateCurrent = (patch) => {
        onChange(patterns.map((p) => (p.tag === current.tag ? { ...p, ...patch } : p)))
        if (patch.tag) setSelectedTag(patch.tag)
    }

    const renameCurrent = (newTag) => {
        const clean = newTag.trim()
        if (!clean || /[\s;"]/.test(clean) || patterns.some((p) => p.tag === clean)) return
        onChange(
            patterns.map((p) => (p.tag === current.tag ? { ...p, tag: clean } : p)),
            { [current.tag]: clean }
        )
        setSelectedTag(clean)
    }

    const deleteCurrent = async () => {
        const used = usageByTag.get(current.tag) ?? 0
        if (used > 0) {
            const confirm = await Swal.fire({
                title: `¿Eliminar el patrón ${current.tag}?`,
                text: `Lo usan ${used} nodo(s), que pasarán a demanda constante.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#e11d48',
            })
            if (!confirm.isConfirmed) return
        }
        onChange(
            patterns.filter((p) => p.tag !== current.tag),
            { [current.tag]: null }
        )
        setSelectedTag(null)
    }

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            eyebrow='Simulación'
            title='Patrones de demanda'
            subtitle='Multiplicadores horarios de la demanda base (×1 = demanda base)'
            maxWidth='640px'
            footer={
                <Button variant='contained' disableElevation sx={primaryPillSx} onClick={onClose}>
                    Listo
                </Button>
            }
        >
            <div className='p-4 flex flex-col gap-3'>
                <div className='flex flex-wrap items-center gap-2'>
                    {patterns.map((p) => (
                        <button
                            key={p.tag}
                            type='button'
                            onClick={() => setSelectedTag(p.tag)}
                            className={`border-0 px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                                current?.tag === p.tag
                                    ? 'bg-[#368bed] text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            {p.tag}
                            {(usageByTag.get(p.tag) ?? 0) > 0 && (
                                <span className='ml-1 opacity-70 text-xs'>({usageByTag.get(p.tag)})</span>
                            )}
                        </button>
                    ))}
                    <Button size='small' startIcon={<Add sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: '999px' }} onClick={() => addPattern(RESIDENTIAL)}>
                        Residencial
                    </Button>
                    <Button size='small' startIcon={<Add sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: '999px' }} onClick={() => addPattern(Array(24).fill(1))}>
                        Plano
                    </Button>
                </div>

                {!current && (
                    <div className='text-sm text-slate-500 dark:text-gray-400 py-6 text-center'>
                        No hay patrones todavía. Creá uno con las plantillas de arriba: “Residencial” trae los picos de la mañana y la noche típicos de una localidad.
                    </div>
                )}

                {current && (
                    <>
                        <div className='flex items-center gap-2'>
                            <TextField
                                size='small'
                                label='Nombre del patrón'
                                value={current.tag}
                                onChange={(e) => renameCurrent(e.target.value)}
                                sx={{ width: 180 }}
                            />
                            <div className='flex-1' />
                            <Button
                                size='small'
                                color='error'
                                startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', borderRadius: '999px' }}
                                onClick={deleteCurrent}
                            >
                                Eliminar
                            </Button>
                        </div>

                        <PatternPreview multipliers={current.multipliers} />

                        <div className='grid grid-cols-6 sm:grid-cols-8 gap-1.5'>
                            {current.multipliers.map((m, i) => (
                                <TextField
                                    key={i}
                                    size='small'
                                    type='number'
                                    label={`${i} h`}
                                    value={m}
                                    inputProps={{ step: 0.1, min: 0, style: { fontSize: '0.8rem', padding: '6px 8px' } }}
                                    onChange={(e) => {
                                        const value = Math.max(0, Number(e.target.value) || 0)
                                        updateCurrent({ multipliers: current.multipliers.map((x, j) => (j === i ? value : x)) })
                                    }}
                                />
                            ))}
                        </div>
                        <div className='text-xs text-slate-400 dark:text-slate-500'>
                            El promedio ideal es cercano a 1 para que la demanda base represente el consumo medio diario. Promedio actual:{' '}
                            {(current.multipliers.reduce((a, b) => a + b, 0) / current.multipliers.length).toFixed(2)}.
                        </div>
                    </>
                )}
            </div>
        </ModalShell>
    )
}

export default PatternsModal
