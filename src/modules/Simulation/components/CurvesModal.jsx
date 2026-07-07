import { useState } from 'react'
import { Button, IconButton, TextField, Tooltip } from '@mui/material'
import { Add, DeleteOutline, Close } from '@mui/icons-material'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'

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

// Curva de arranque razonable para una bomba de pueblo: 35 m a válvula cerrada
const DEFAULT_POINTS = [
    { flow: 0, head: 35 },
    { flow: 30, head: 25 },
    { flow: 60, head: 12 },
]

// Vista previa de la curva caudal-altura
const CurvePreview = ({ points }) => {
    if (points.length === 0) return null
    const W = 260
    const H = 110
    const PAD = 22
    const maxFlow = Math.max(...points.map((p) => p.flow), 1)
    const maxHead = Math.max(...points.map((p) => p.head), 1)
    const x = (f) => PAD + ((W - PAD * 2) * f) / maxFlow
    const y = (h) => H - PAD + ((PAD * 2 - H) * h) / maxHead
    const line = points.map((p) => `${x(p.flow).toFixed(1)},${y(p.head).toFixed(1)}`).join(' ')
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className='w-full rounded-lg bg-slate-50 dark:bg-slate-700/40'>
            <polyline points={line} fill='none' stroke='#d8621d' strokeWidth='2' strokeLinejoin='round' />
            {points.map((p, i) => (
                <circle key={i} cx={x(p.flow)} cy={y(p.head)} r='3' fill='#d8621d' stroke='#fff' strokeWidth='1.2' />
            ))}
            <text x={W / 2} y={H - 4} fontSize='9' fill='#94a3b8' textAnchor='middle'>
                Caudal →
            </text>
            <text x={10} y={H / 2} fontSize='9' fill='#94a3b8' textAnchor='middle' transform={`rotate(-90 10 ${H / 2})`}>
                Altura (m) →
            </text>
        </svg>
    )
}

/**
 * Administrador de curvas caudal-altura de bombas.
 */
const CurvesModal = ({ open, onClose, curves, usageByTag, flowUnits, onChange }) => {
    const [selectedTag, setSelectedTag] = useState(null)
    const current = curves.find((c) => c.tag === selectedTag) ?? curves[0] ?? null

    const addCurve = () => {
        let i = 1
        while (curves.some((c) => c.tag === `CURVA${i}`)) i++
        const tag = `CURVA${i}`
        onChange([...curves, { tag, points: DEFAULT_POINTS.map((p) => ({ ...p })) }])
        setSelectedTag(tag)
    }

    const updateCurrent = (points) => {
        onChange(curves.map((c) => (c.tag === current.tag ? { ...c, points } : c)))
    }

    const renameCurrent = (newTag) => {
        const clean = newTag.trim()
        if (!clean || /[\s;"]/.test(clean) || curves.some((c) => c.tag === clean)) return
        onChange(
            curves.map((c) => (c.tag === current.tag ? { ...c, tag: clean } : c)),
            { [current.tag]: clean }
        )
        setSelectedTag(clean)
    }

    const deleteCurrent = async () => {
        const used = usageByTag.get(current.tag) ?? 0
        if (used > 0) {
            const confirm = await Swal.fire({
                title: `¿Eliminar la curva ${current.tag}?`,
                text: `La usan ${used} bomba(s), que pasarán a potencia constante de 5 kW.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#e11d48',
            })
            if (!confirm.isConfirmed) return
        }
        onChange(
            curves.filter((c) => c.tag !== current.tag),
            { [current.tag]: null }
        )
        setSelectedTag(null)
    }

    // Los caudales deben crecer y las alturas decrecer para que EPANET acepte la curva
    const validation = (() => {
        if (!current) return null
        for (let i = 1; i < current.points.length; i++) {
            if (current.points[i].flow <= current.points[i - 1].flow) return 'Los caudales deben ir de menor a mayor.'
            if (current.points[i].head >= current.points[i - 1].head) return 'La altura debe bajar a medida que sube el caudal.'
        }
        return null
    })()

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            eyebrow='Simulación'
            title='Curvas de bombas'
            subtitle='Curva característica caudal-altura de cada bomba'
            maxWidth='560px'
            footer={
                <Button variant='contained' disableElevation sx={primaryPillSx} onClick={onClose}>
                    Listo
                </Button>
            }
        >
            <div className='p-4 flex flex-col gap-3'>
                <div className='flex flex-wrap items-center gap-2'>
                    {curves.map((c) => (
                        <button
                            key={c.tag}
                            type='button'
                            onClick={() => setSelectedTag(c.tag)}
                            className={`border-0 px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                                current?.tag === c.tag
                                    ? 'bg-[#d8621d] text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            {c.tag}
                            {(usageByTag.get(c.tag) ?? 0) > 0 && <span className='ml-1 opacity-70 text-xs'>({usageByTag.get(c.tag)})</span>}
                        </button>
                    ))}
                    <Button size='small' startIcon={<Add sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: '999px' }} onClick={addCurve}>
                        Nueva curva
                    </Button>
                </div>

                {!current && (
                    <div className='text-sm text-slate-500 dark:text-gray-400 py-6 text-center'>
                        No hay curvas todavía. La curva caudal-altura sale de la placa o del catálogo de la bomba: cuánta altura entrega a cada caudal.
                    </div>
                )}

                {current && (
                    <>
                        <div className='flex items-center gap-2'>
                            <TextField size='small' label='Nombre de la curva' value={current.tag} onChange={(e) => renameCurrent(e.target.value)} sx={{ width: 180 }} />
                            <div className='flex-1' />
                            <Button size='small' color='error' startIcon={<DeleteOutline sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', borderRadius: '999px' }} onClick={deleteCurrent}>
                                Eliminar
                            </Button>
                        </div>

                        <CurvePreview points={current.points} />

                        <div className='flex flex-col gap-1.5'>
                            {current.points.map((p, i) => (
                                <div key={i} className='flex items-center gap-2'>
                                    <TextField
                                        size='small'
                                        type='number'
                                        label={`Caudal (${flowUnits})`}
                                        value={p.flow}
                                        inputProps={{ min: 0, style: { fontSize: '0.85rem' } }}
                                        onChange={(e) => updateCurrent(current.points.map((x, j) => (j === i ? { ...x, flow: Math.max(0, Number(e.target.value) || 0) } : x)))}
                                    />
                                    <TextField
                                        size='small'
                                        type='number'
                                        label='Altura (m)'
                                        value={p.head}
                                        inputProps={{ min: 0, style: { fontSize: '0.85rem' } }}
                                        onChange={(e) => updateCurrent(current.points.map((x, j) => (j === i ? { ...x, head: Math.max(0, Number(e.target.value) || 0) } : x)))}
                                    />
                                    <Tooltip title='Quitar punto'>
                                        <span>
                                            <IconButton size='small' disabled={current.points.length <= 1} onClick={() => updateCurrent(current.points.filter((_, j) => j !== i))}>
                                                <Close sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </div>
                            ))}
                            <Button
                                size='small'
                                startIcon={<Add sx={{ fontSize: 15 }} />}
                                sx={{ textTransform: 'none', borderRadius: '999px', alignSelf: 'flex-start' }}
                                disabled={current.points.length >= 50}
                                onClick={() => {
                                    const last = current.points[current.points.length - 1]
                                    updateCurrent([...current.points, { flow: last.flow + 10, head: Math.max(1, last.head - 5) }])
                                }}
                            >
                                Agregar punto
                            </Button>
                        </div>

                        {validation && <div className='text-xs font-medium text-rose-600 dark:text-rose-400'>{validation}</div>}
                        <div className='text-xs text-slate-400 dark:text-slate-500'>
                            Con un solo punto (caudal y altura de diseño), EPANET completa la curva automáticamente.
                        </div>
                    </>
                )}
            </div>
        </ModalShell>
    )
}

export default CurvesModal
