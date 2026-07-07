import { Button, IconButton, MenuItem, TextField, Tooltip } from '@mui/material'
import { Add, Close } from '@mui/icons-material'
import ModalShell from '../../../components/ModalShell'
import { LINK_TOOLS, NODE_TOOLS } from '../lib/editorDefaults'

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

const LINK_LABELS = Object.fromEntries(LINK_TOOLS.map((t) => [t.tool, t.label]))
const NODE_LABELS = Object.fromEntries(NODE_TOOLS.map((t) => [t.tool, t.label]))

const selectSx = { minWidth: 120 }

/**
 * Reglas de operación automática: abrir/cerrar un tramo según el nivel
 * de un tanque (o la presión de un nodo). El caso típico: la bomba corta
 * cuando el tanque se llena y arranca cuando baja.
 */
const ControlsModal = ({ open, onClose, controls, links, nodes, onChange }) => {
    // Bombas primero (el caso típico), tanques primero entre los nodos
    const sortedLinks = [...links].sort((a, b) => (a.type === 'pump' ? -1 : 1) - (b.type === 'pump' ? -1 : 1))
    const sortedNodes = [...nodes].sort((a, b) => (a.type === 'tank' ? -1 : 1) - (b.type === 'tank' ? -1 : 1))

    const update = (index, patch) => {
        onChange(controls.map((c, i) => (i === index ? { ...c, ...patch } : c)))
    }

    const addControl = () => {
        const pump = sortedLinks.find((l) => l.type === 'pump')
        const tank = sortedNodes.find((n) => n.type === 'tank')
        if (!pump || !tank) return
        onChange([
            ...controls,
            { link: pump.tag, action: 'CLOSED', node: tank.tag, condition: 'ABOVE', level: 4 },
        ])
    }

    const canAdd = links.some((l) => l.type === 'pump' || l.type === 'valve' || l.type === 'pipe') && nodes.length > 0

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            eyebrow='Simulación'
            title='Controles por nivel'
            subtitle='Ej.: la bomba corta cuando el tanque se llena y arranca cuando baja'
            maxWidth='680px'
            footer={
                <Button variant='contained' disableElevation sx={primaryPillSx} onClick={onClose}>
                    Listo
                </Button>
            }
        >
            <div className='p-4 flex flex-col gap-3'>
                {controls.length === 0 && (
                    <div className='text-sm text-slate-500 dark:text-gray-400 py-4 text-center'>
                        Sin controles, las bombas funcionan las 24 hs. Agregá el par típico: cerrar la bomba cuando el tanque supera el nivel máximo y abrirla cuando baja del mínimo.
                    </div>
                )}

                {controls.map((c, i) => (
                    <div key={i} className='flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 p-2.5'>
                        <TextField select size='small' label='Tramo' value={c.link} sx={selectSx} onChange={(e) => update(i, { link: e.target.value })}>
                            {sortedLinks.map((l) => (
                                <MenuItem key={l.tag} value={l.tag}>
                                    {l.tag} — {LINK_LABELS[l.type]}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select size='small' label='Acción' value={c.action} sx={{ minWidth: 100 }} onChange={(e) => update(i, { action: e.target.value })}>
                            <MenuItem value='OPEN'>Abrir</MenuItem>
                            <MenuItem value='CLOSED'>Cerrar</MenuItem>
                        </TextField>
                        <span className='text-sm text-slate-500 dark:text-gray-400'>cuando</span>
                        <TextField select size='small' label='Nodo' value={c.node} sx={selectSx} onChange={(e) => update(i, { node: e.target.value })}>
                            {sortedNodes.map((n) => (
                                <MenuItem key={n.tag} value={n.tag}>
                                    {n.tag} — {NODE_LABELS[n.type]}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select size='small' label='Condición' value={c.condition} sx={{ minWidth: 120 }} onChange={(e) => update(i, { condition: e.target.value })}>
                            <MenuItem value='ABOVE'>supera</MenuItem>
                            <MenuItem value='BELOW'>baja de</MenuItem>
                        </TextField>
                        <TextField
                            size='small'
                            type='number'
                            label='Nivel (m)'
                            value={c.level}
                            sx={{ width: 100 }}
                            inputProps={{ step: 0.1 }}
                            onChange={(e) => update(i, { level: Number(e.target.value) || 0 })}
                        />
                        <Tooltip title='Quitar regla'>
                            <IconButton size='small' onClick={() => onChange(controls.filter((_, j) => j !== i))}>
                                <Close sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                ))}

                <Button
                    size='small'
                    startIcon={<Add sx={{ fontSize: 15 }} />}
                    sx={{ textTransform: 'none', borderRadius: '999px', alignSelf: 'flex-start' }}
                    disabled={!canAdd}
                    onClick={addControl}
                >
                    Agregar regla
                </Button>
                <div className='text-xs text-slate-400 dark:text-slate-500'>
                    En tanques el valor es el nivel de agua (m sobre el fondo); en nodos de consumo es la presión (m.c.a.).
                </div>
            </div>
        </ModalShell>
    )
}

export default ControlsModal
