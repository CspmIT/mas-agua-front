import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Container } from '@mui/material'
import { Add } from '@mui/icons-material'
import Swal from 'sweetalert2'
import PageHeader from '../../../components/PageHeader'
import TableCustom from '../../../components/TableCustom'
import LoaderComponent from '../../../components/Loader'
import { EditChip, DeleteChip, ToneChip, ActionsRow, StatusPill } from '../../../components/TableActions'
import LiveStatus from '../components/LiveStatus'
import AutomationForm from '../components/AutomationForm'
import AutomationLogs from '../components/AutomationLogs'
import { getPumpStatus, listAutomations, deleteAutomation } from '../services/api'
import {
    PROGRAMMING_LABELS,
    formatDays,
    formatWallDateTime,
    formatTime,
} from '../utils/constants'

// El cron del backend refresca el estado cada 1 minuto: con poll de 30 s
// el front nunca muestra un dato de mas de ~1.5 min
const POLL_MS = 30 * 1000

// Detalle de "que hace" la programacion segun su tipo
const describeAutomation = (row) => {
    if (row.programming === 1) {
        return (
            <div className="text-sm leading-5">
                <b>Días:</b> {formatDays(row.days_to_do)}
                <br />
                <b>Inicio:</b> {formatTime(row.time_start)} hs — <b>Fin:</b> {formatTime(row.time_finish)} hs
            </div>
        )
    }
    if (row.programming === 2) {
        return (
            <div className="text-sm leading-5">
                <b>Inicio:</b> {formatWallDateTime(row.date_start)}
                <br />
                <b>Fin:</b> {formatWallDateTime(row.date_finish)}
            </div>
        )
    }
    return (
        <div className="text-sm leading-5">
            <b>Nivel de cisterna:</b> menor a {row.cistern_level}%
        </div>
    )
}

const describePressure = (row) => {
    if (row.programming === 3) {
        return (
            <span className="text-sm">
                <b>Reducir a:</b> {Number(row.starting_pressure).toFixed(1)} bar
            </span>
        )
    }
    return (
        <div className="text-sm leading-5">
            <b>Inicio:</b> {Number(row.starting_pressure).toFixed(1)} bar
            <br />
            <b>Fin:</b> {Number(row.end_pressure).toFixed(1)} bar
        </div>
    )
}

// Pill primario (mismo estilo que el boton de PageHeader)
const createPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 1,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
    },
}

// embedded: se renderiza dentro de la vista Controles (sin Container ni PageHeader propio)
const PumpGenibus = ({ embedded = false }) => {
    const [status, setStatus] = useState(null)
    const [automations, setAutomations] = useState([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [logsFor, setLogsFor] = useState(null)

    const loadStatus = useCallback(async () => {
        try {
            const { data } = await getPumpStatus()
            setStatus(data)
        } catch {
            // 404 = todavia no corrio ningun ciclo de lectura; se muestra vacio
            setStatus(null)
        }
    }, [])

    const loadAutomations = useCallback(async () => {
        const { data } = await listAutomations()
        setAutomations(data)
    }, [])

    useEffect(() => {
        Promise.allSettled([loadStatus(), loadAutomations()]).finally(() => setLoading(false))
        const interval = setInterval(loadStatus, POLL_MS)
        return () => clearInterval(interval)
    }, [loadStatus, loadAutomations])

    const handleDelete = async (row) => {
        const result = await Swal.fire({
            title: '¿Eliminar programación?',
            html: 'La programación dejará de ejecutarse. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return
        try {
            await deleteAutomation(row.id)
            await loadAutomations()
        } catch (error) {
            Swal.fire({
                title: 'Error',
                html: error?.response?.data?.message || String(error),
                icon: 'error',
                showConfirmButton: false,
                showCloseButton: true,
            })
        }
    }

    const columns = [
        {
            accessorKey: 'programming',
            header: 'Programación',
            size: 120,
            Cell: ({ row }) => (
                <span className="font-semibold text-slate-800 dark:text-gray-100">
                    {PROGRAMMING_LABELS[row.original.programming]}
                </span>
            ),
        },
        {
            accessorKey: 'detail',
            header: 'Realizar',
            size: 240,
            Cell: ({ row }) => describeAutomation(row.original),
        },
        {
            accessorKey: 'pressure',
            header: 'Presión',
            size: 150,
            Cell: ({ row }) => describePressure(row.original),
        },
        {
            accessorKey: 'repeat_action',
            header: 'Repetir',
            size: 90,
            Cell: ({ row }) =>
                row.original.programming === 2
                    ? 'Una vez'
                    : row.original.programming === 3
                    ? 'Siempre'
                    : row.original.repeat_action === 1
                    ? 'Una vez'
                    : 'Siempre',
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            size: 90,
            Cell: ({ row }) => <StatusPill active={row.original.status === 1} />,
        },
        {
            accessorKey: 'actions',
            header: '',
            size: 210,
            Cell: ({ row }) => (
                <ActionsRow>
                    <EditChip
                        onClick={() => {
                            setEditing(row.original)
                            setFormOpen(true)
                        }}
                    />
                    <ToneChip tone="info" onClick={() => setLogsFor(row.original)}>
                        Historial
                    </ToneChip>
                    <DeleteChip onClick={() => handleDelete(row.original)} />
                </ActionsRow>
            ),
        },
    ]

    if (loading) return <LoaderComponent />

    const openCreate = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const inner = (
        <>
            {!embedded && (
                <PageHeader
                    title="Control de Bombas"
                    onCreate={openCreate}
                    createLabel="Nueva programación"
                />
            )}

            <Box className="flex flex-col gap-5">
                {status ? (
                    <LiveStatus data={status} onReload={loadStatus} />
                ) : (
                    <Box className="rounded-3xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
                        Todavía no hay lecturas del equipo de bombeo. El ciclo de lectura corre
                        cada 1 minuto: si esto persiste, revisá el cron y la conexión MQTT.
                    </Box>
                )}

                {embedded && (
                    <div className="flex justify-end -mb-2">
                        <Button
                            onClick={openCreate}
                            variant="contained"
                            disableElevation
                            startIcon={<Add sx={{ fontSize: 18 }} />}
                            sx={createPillSx}
                        >
                            Nueva programación
                        </Button>
                    </div>
                )}

                <TableCustom data={automations} columns={columns} />
            </Box>

            <AutomationForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                record={editing}
                onSaved={loadAutomations}
            />
            <AutomationLogs
                open={Boolean(logsFor)}
                onClose={() => setLogsFor(null)}
                automation={logsFor}
            />
        </>
    )

    if (embedded) return inner

    return (
        <Container maxWidth={false} disableGutters className="w-full px-3 sm:px-5 pt-2 pb-4">
            {inner}
        </Container>
    )
}

export default PumpGenibus
