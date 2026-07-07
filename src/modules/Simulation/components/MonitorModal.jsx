import { useEffect, useState } from 'react'
import { Button, CircularProgress, Switch, TextField, FormControlLabel } from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'
import { setMonitor, runCheckNow, getRuns, markRunsViewed } from '../services/simNetworks'

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

const STATUS_CHIPS = {
    ok: { label: 'OK', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    deviation: { label: 'Desviación', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    skipped: { label: 'Sin sensores', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-gray-300' },
    error: { label: 'Error', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
}

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const fmtNum = (v) => (v == null ? '—' : numberFormat.format(v))

const measureBlock = (label, value) => `
    <div style="min-width:74px;text-align:center">
        <div style="font-size:0.68rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">${label}</div>
        <div style="font-size:1.05rem;font-weight:600;color:#1e293b;font-variant-numeric:tabular-nums">${value}</div>
    </div>`

// Detalle de una corrida: tarjetas por sensor (medido vs. simulado y su diferencia)
const showRunDetail = (run) => {
    const comparisonCards = (run.comparisons ?? [])
        .map((c) => {
            const chipColor = c.exceeded
                ? 'background:#ffe4e6;color:#be123c'
                : 'background:#d1fae5;color:#047857'
            return `
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;border:1px solid #e2e8f0;border-radius:14px;padding:12px 16px;margin-top:10px">
                <div style="flex:1;min-width:130px;text-align:left">
                    <div style="font-size:1.05rem;font-weight:700;color:#1e293b">${c.tag}</div>
                    <div style="font-size:0.78rem;color:#64748b">${c.varName}</div>
                </div>
                ${measureBlock('Medido', fmtNum(c.measured))}
                <div style="color:#cbd5e1;font-size:1.1rem">→</div>
                ${measureBlock('Simulado', fmtNum(c.simulated))}
                <div style="padding:6px 14px;border-radius:999px;font-weight:700;font-size:0.95rem;white-space:nowrap;font-variant-numeric:tabular-nums;${chipColor}">
                    Δ ${fmtNum(c.deviation)} m
                </div>
            </div>`
        })
        .join('')

    const inputChips = (run.inputs ?? [])
        .map(
            (i) => `
            <span style="display:inline-flex;align-items:baseline;gap:6px;background:#f1f5f9;border-radius:999px;padding:4px 12px;font-size:0.78rem;color:#334155;margin:3px 4px 0 0">
                <b>${i.tag}</b> ${fmtNum(i.value)}
                <span style="color:#94a3b8">· ${i.varName}</span>
            </span>`
        )
        .join('')

    Swal.fire({
        title: `Chequeo del ${new Date(run.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} hs`,
        html: `<div style="text-align:left;font-size:0.88rem;color:#334155">
            <p style="margin:0">${run.message ?? ''}</p>
            ${comparisonCards}
            ${inputChips ? `<div style="margin-top:14px"><div style="font-size:0.68rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:2px">Mediciones aplicadas como entrada</div>${inputChips}</div>` : ''}
            ${run.warnings?.length ? `<div style="margin-top:12px;background:#fef3c7;border-radius:10px;padding:8px 12px;color:#92400e;font-size:0.78rem">${run.warnings.join('<br/>')}</div>` : ''}
        </div>`,
        width: 600,
        confirmButtonText: 'Cerrar',
    })
}

/**
 * Monitoreo automático: el backend simula la red con los datos medidos y
 * compara contra los sensores de comparación; una desviación mayor al umbral
 * dispara el sistema de alarmas (posible fuga o anomalía).
 */
const MonitorModal = ({ open, onClose, networkId, monitor, onMonitorChange, onViewed }) => {
    const [runs, setRuns] = useState(null)
    const [saving, setSaving] = useState(false)
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        if (!open || !networkId) return
        setRuns(null)
        getRuns(networkId)
            .then(setRuns)
            .catch(() => setRuns([]))
        // Ver el detalle cuenta como atender las desviaciones pendientes
        markRunsViewed(networkId)
            .then(() => onViewed?.())
            .catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, networkId])

    const applyConfig = async (patch) => {
        const next = { ...monitor, ...patch }
        setSaving(true)
        try {
            await setMonitor(networkId, next)
            onMonitorChange(next)
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'No se pudo guardar la configuración', 'error')
        } finally {
            setSaving(false)
        }
    }

    const checkNow = async () => {
        setChecking(true)
        try {
            const run = await runCheckNow(networkId)
            setRuns((prev) => [run, ...(prev ?? [])])
            showRunDetail(run)
            if (run.status === 'deviation') markRunsViewed(networkId).catch(() => {})
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'No se pudo ejecutar el chequeo', 'error')
        } finally {
            setChecking(false)
        }
    }

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            eyebrow='Simulación'
            title='Monitoreo automático'
            subtitle='Compara la red simulada contra los sensores reales para detectar fugas o anomalías'
            maxWidth='680px'
            footer={
                <Button variant='contained' disableElevation sx={primaryPillSx} onClick={onClose}>
                    Listo
                </Button>
            }
        >
            <div className='p-4 flex flex-col gap-3'>
                <div className='flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-600 p-3'>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={Boolean(monitor.enabled)}
                                disabled={saving}
                                onChange={(e) => applyConfig({ enabled: e.target.checked })}
                            />
                        }
                        label={<span className='text-sm font-medium'>Monitoreo periódico habilitado</span>}
                    />
                    <TextField
                        size='small'
                        type='number'
                        label='Umbral de desviación (m)'
                        value={monitor.threshold}
                        disabled={saving}
                        inputProps={{ min: 0.5, step: 0.5 }}
                        sx={{ width: 190 }}
                        onChange={(e) => onMonitorChange({ ...monitor, threshold: Number(e.target.value) || 5 })}
                        onBlur={() => applyConfig({})}
                    />
                    <div className='flex-1' />
                    <Button
                        size='small'
                        variant='outlined'
                        disabled={checking}
                        startIcon={checking ? <CircularProgress size={14} /> : <PlayArrow sx={{ fontSize: 16 }} />}
                        sx={{ textTransform: 'none', borderRadius: '999px' }}
                        onClick={checkNow}
                    >
                        Ejecutar chequeo ahora
                    </Button>
                </div>

                <div className='text-xs text-slate-500 dark:text-gray-400'>
                    El chequeo aplica las mediciones actuales (variables asociadas), simula el estado de la red y compara
                    la presión/nivel simulado contra cada <b>sensor de comparación</b>. Si la diferencia supera el umbral,
                    se dispara una alerta en el sistema de alarmas. El chequeo periódico corre con el resto de las tareas
                    programadas del servidor.
                </div>

                <div className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mt-1'>
                    Últimos chequeos
                </div>
                {runs === null && (
                    <div className='flex justify-center py-4'>
                        <CircularProgress size={20} />
                    </div>
                )}
                {runs?.length === 0 && (
                    <div className='text-sm text-slate-400 dark:text-gray-500 text-center py-3'>Todavía no hay chequeos.</div>
                )}
                {runs?.length > 0 && (
                    <div className='flex flex-col divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto'>
                        {runs.map((run) => {
                            const chip = STATUS_CHIPS[run.status] ?? STATUS_CHIPS.error
                            return (
                                <button
                                    key={run.id}
                                    type='button'
                                    onClick={() => showRunDetail(run)}
                                    className='bg-transparent border-0 flex items-center gap-3 px-1 py-2 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg'
                                >
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${chip.className}`}>
                                        {chip.label}
                                    </span>
                                    <span className='text-xs text-slate-500 dark:text-gray-400 shrink-0'>
                                        {new Date(run.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className='text-sm text-slate-700 dark:text-gray-200 truncate'>{run.message}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </ModalShell>
    )
}

export default MonitorModal
