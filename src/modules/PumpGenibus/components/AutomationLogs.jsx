import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import ModalShell from '../../../components/ModalShell'
import { StatusChip } from '../../PumpsTable/components/PumpPrimitives'
import { getAutomationLogs } from '../services/api'
import { formatDateTime } from '../utils/constants'

// Que hizo cada paso del motor segun type_data_pump
const TYPE_LABELS = {
    1: 'Baja de presión (fecha)',
    2: 'Suba de presión (fecha)',
    3: 'Baja de presión (diaria)',
    4: 'Suba de presión (diaria)',
    5: 'Nivel de cisterna',
}

// Historial de ejecuciones de una programacion
const AutomationLogs = ({ open, onClose, automation }) => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open || !automation) return
        setLoading(true)
        getAutomationLogs(automation.id)
            .then(({ data }) => setLogs(data))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false))
    }, [open, automation])

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            maxWidth={560}
            title="Historial de ejecución"
            eyebrow="Bombeo urbano"
        >
            <Box className="p-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <CircularProgress size={28} />
                    </div>
                ) : logs.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">
                        Esta programación todavía no registra ejecuciones.
                    </p>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    <th className="py-2 pr-2">Fecha</th>
                                    <th className="py-2 pr-2">Acción</th>
                                    <th className="py-2 pr-2">Setpoint</th>
                                    <th className="py-2">Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-t border-gray-100 dark:border-gray-700/60 text-gray-700 dark:text-gray-200"
                                    >
                                        <td className="py-2 pr-2 whitespace-nowrap">
                                            {formatDateTime(log.date_ejecute)}
                                        </td>
                                        <td className="py-2 pr-2">{TYPE_LABELS[log.type_data_pump] || '-'}</td>
                                        <td className="py-2 pr-2 font-semibold">
                                            {Number(log.set_point).toFixed(1)} bar
                                        </td>
                                        <td className="py-2">
                                            {log.status === 1 ? (
                                                <StatusChip label="Objetivo alcanzado" tone="success" />
                                            ) : (
                                                <StatusChip label="Paso de rampa" tone="neutral" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Box>
        </ModalShell>
    )
}

export default AutomationLogs
