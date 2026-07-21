import { useState } from 'react'
import { Box, IconButton, CircularProgress, Tooltip } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckIcon from '@mui/icons-material/Check'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import SyncIcon from '@mui/icons-material/Sync'
import Swal from 'sweetalert2'
import { StatusChip } from '../../PumpsTable/components/PumpPrimitives'
import PumpCard from './PumpCard'
import { sendSetPoint, refreshPumpStatus } from '../services/api'
import {
    generalStatus,
    formatDateTime,
    SET_POINT_MIN,
    SET_POINT_MAX,
} from '../utils/constants'

const round1 = (value) => Math.round(value * 10) / 10

const stepBtnSx = {
    border: '1px solid',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    width: 30,
    height: 30,
}

// Card principal: estado general, presion actual, control de setpoint con
// candado (igual UX que el legacy: desbloquear -> ajustar -> confirmar) y las
// tres bombas con toda la informacion Genibus.
const LiveStatus = ({ data, onReload }) => {
    const [editing, setEditing] = useState(false)
    const [draftSp, setDraftSp] = useState(null)
    const [sending, setSending] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const status = generalStatus(data.alarma_general)

    const startEdit = async () => {
        const result = await Swal.fire({
            title: '¿Confirmás esta acción?',
            html: 'Al confirmar pasás a <b>cambiar la presión de salida</b> del bombeo urbano.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#42C88A',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        })
        if (result.isConfirmed) {
            setDraftSp(Number(data.set_point))
            setEditing(true)
        }
    }

    const cancelEdit = () => {
        setEditing(false)
        setDraftSp(null)
    }

    const stepDraft = (delta) => {
        setDraftSp((prev) => {
            const next = round1(prev + delta)
            if (next < SET_POINT_MIN || next > SET_POINT_MAX) return prev
            return next
        })
    }

    const confirmSetPoint = async () => {
        const result = await Swal.fire({
            title: '¿Confirmás esta acción?',
            html: `La presión de salida del agua pasará a <b>${draftSp.toFixed(1)} bar</b>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#42C88A',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return

        try {
            setSending(true)
            await sendSetPoint(draftSp)
            setEditing(false)
            // Ciclo de lectura completo para verificar que el CU352 tomo el SP
            await refreshPumpStatus()
            await onReload()
            Swal.fire({
                title: 'Correcto',
                html: 'Comando ejecutado correctamente.',
                icon: 'success',
                timer: 1800,
                showConfirmButton: false,
            })
        } catch (error) {
            Swal.fire({
                title: 'Error',
                html: error?.response?.data?.message || String(error),
                icon: 'error',
                showConfirmButton: false,
                showCloseButton: true,
            })
        } finally {
            setSending(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await refreshPumpStatus()
            await onReload()
        } catch (error) {
            Swal.fire({
                title: 'Sin respuesta',
                html: error?.response?.data?.message || 'El equipo no respondió a la consulta.',
                icon: 'warning',
                showConfirmButton: false,
                showCloseButton: true,
            })
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <Box className="rounded-3xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-col gap-4">
            {/* Estado general + presion + setpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                        Estado
                    </span>
                    <StatusChip label={status.label} tone={status.tone} pulse={status.pulse} />
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                        Presión actual
                    </span>
                    <span className="text-4xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                        {Number(data.presion_actual).toFixed(3)}
                        <span className="text-base font-normal text-gray-400 ml-1">bar</span>
                    </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                        Setpoint
                    </span>
                    {!editing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {Number(data.set_point).toFixed(1)}
                                <span className="text-sm font-normal text-gray-400 ml-1">bar</span>
                            </span>
                            <Tooltip title="Cambiar presión de salida">
                                <IconButton size="small" onClick={startEdit} sx={stepBtnSx}>
                                    <LockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <IconButton size="small" onClick={() => stepDraft(-0.1)} sx={stepBtnSx} disabled={sending}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <span className="text-2xl font-bold text-secondary w-14 text-center">
                                {draftSp?.toFixed(1)}
                            </span>
                            <IconButton size="small" onClick={() => stepDraft(0.1)} sx={stepBtnSx} disabled={sending}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                            <Tooltip title="Enviar al equipo">
                                <IconButton
                                    size="small"
                                    onClick={confirmSetPoint}
                                    disabled={sending}
                                    sx={{ ...stepBtnSx, color: '#10b981' }}
                                >
                                    {sending ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancelar">
                                <IconButton size="small" onClick={cancelEdit} disabled={sending} sx={stepBtnSx}>
                                    <LockOpenIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>

            {/* Las 3 bombas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.bombas?.map((pump) => (
                    <PumpCard key={pump.numero} pump={pump} />
                ))}
            </div>

            {/* Ultima actualizacion + refresco manual */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <SyncIcon
                    sx={{
                        fontSize: 14,
                        ...(refreshing && {
                            animation: 'pumpSpin 1s linear infinite',
                            '@keyframes pumpSpin': {
                                from: { transform: 'rotate(0deg)' },
                                to: { transform: 'rotate(360deg)' },
                            },
                        }),
                    }}
                />
                <span>Actualizado: {formatDateTime(data.actualizacion)}</span>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-transparent border-0 p-0 ml-2 text-primary font-semibold cursor-pointer disabled:opacity-50"
                >
                    {refreshing ? 'Consultando equipo…' : 'Consultar ahora'}
                </button>
            </div>
        </Box>
    )
}

export default LiveStatus
