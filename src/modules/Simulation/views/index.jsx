import { Button, Container, useMediaQuery } from '@mui/material'
import { Add, DescriptionOutlined } from '@mui/icons-material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import TableCustom from '../../../components/TableCustom'
import LoaderComponent from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import { ActionsRow, EditChip, DeleteChip } from '../../../components/TableActions'
import { getNetworks, deleteNetwork } from '../services/simNetworks'
import { formatSimTime } from '../lib/simTime'

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
}

const outlinePillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    color: '#1f4e79',
    background: 'linear-gradient(180deg, #ffffff 0%, #d9e1ec 100%)',
    border: '1px solid rgba(44, 106, 160, 0.28)',
    boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,42,68,0.08), 0 4px 10px rgba(15,42,68,0.10)',
    '&:hover': {
        background: 'linear-gradient(180deg, #ffffff 0%, #c8d4e3 100%)',
        borderColor: 'rgba(44, 106, 160, 0.45)',
    },
    'body.dark &': {
        color: '#cfe1f7',
        background:
            'linear-gradient(180deg, rgba(94,165,240,0.12) 0%, rgba(31,78,121,0.35) 100%)',
        borderColor: 'rgba(94, 165, 240, 0.35)',
    },
}

const NetworksList = () => {
    const navigate = useNavigate()
    const [networks, setNetworks] = useState([])
    const [loader, setLoader] = useState(true)
    const isMobile = useMediaQuery('(max-width: 768px)')

    const columnVisibility = useMemo(
        () => (isMobile ? { id: false, duration: false, flowUnits: false, updatedAt: false } : {}),
        [isMobile]
    )

    const load = async () => {
        try {
            setNetworks(await getNetworks())
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'No se pudieron cargar las redes', 'error')
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const onDelete = async (network) => {
        const confirm = await Swal.fire({
            title: `¿Eliminar la red "${network.name}"?`,
            text: 'Se borrarán sus nodos y tuberías. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e11d48',
        })
        if (!confirm.isConfirmed) return
        try {
            await deleteNetwork(network.id)
            await load()
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'No se pudo eliminar la red', 'error')
        }
    }

    const columnsTable = [
        {
            header: 'ID',
            accessorKey: 'id',
            size: 25,
        },
        {
            header: 'Nombre',
            accessorKey: 'name',
            Cell: ({ row }) => {
                const name = row.original?.name?.trim()
                return name ? name : (
                    <span className='italic text-slate-400 dark:text-gray-500'>Red sin nombre</span>
                )
            },
        },
        {
            header: 'Nodos',
            accessorKey: 'nodeCount',
            size: 60,
        },
        {
            header: 'Tramos',
            accessorKey: 'linkCount',
            size: 60,
        },
        {
            header: 'Duración',
            accessorKey: 'duration',
            size: 80,
            Cell: ({ row }) => `${formatSimTime(row.original.duration)} hs`,
        },
        {
            header: 'Unidades',
            accessorKey: 'flowUnits',
            size: 70,
        },
        {
            header: 'Monitoreo',
            accessorKey: 'monitorEnabled',
            size: 120,
            Cell: ({ row }) => {
                const { monitorEnabled, pendingDeviations, lastRun } = row.original
                if (!monitorEnabled) return <span className='text-slate-400 dark:text-gray-500'>—</span>
                if (pendingDeviations > 0) {
                    return (
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'>
                            ⚠ {pendingDeviations} desviación{pendingDeviations > 1 ? 'es' : ''}
                        </span>
                    )
                }
                if (lastRun?.status === 'ok') {
                    return (
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                            OK
                        </span>
                    )
                }
                return (
                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-gray-300'>
                        Activo
                    </span>
                )
            },
        },
        {
            header: 'Actualizado el',
            accessorKey: 'updatedAt',
            Cell: ({ row }) => {
                const date = new Date(row.original.updatedAt)
                return date.toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'actions',
            size: 200,
            Cell: ({ row }) => (
                <ActionsRow>
                    <EditChip onClick={() => navigate(`/simulation/editor/${row.original.id}`)}>Simular</EditChip>
                    <DeleteChip onClick={() => onDelete(row.original)} />
                </ActionsRow>
            ),
        },
    ]

    return (
        <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
            <PageHeader
                title='Simulador'
                action={
                    <div className='flex flex-wrap gap-2 w-full justify-center sm:w-auto sm:justify-end'>
                        <Button
                            onClick={() => navigate('/simulation/inp')}
                            variant='outlined'
                            startIcon={<DescriptionOutlined sx={{ fontSize: 18 }} />}
                            sx={outlinePillSx}
                        >
                            Simular archivo .INP
                        </Button>
                        <Button
                            onClick={() => navigate('/simulation/editor')}
                            variant='contained'
                            disableElevation
                            startIcon={<Add sx={{ fontSize: 18 }} />}
                            sx={primaryPillSx}
                        >
                            Nueva red
                        </Button>
                    </div>
                }
            />

            {!loader ? (
                <TableCustom
                    columns={columnsTable}
                    data={networks.length > 0 ? networks : []}
                    pagination={true}
                    pageSize={10}
                    columnVisibility={columnVisibility}
                />
            ) : (
                <LoaderComponent />
            )}
        </Container>
    )
}

export default NetworksList
