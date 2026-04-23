import { useContext, useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Container, IconButton, Tooltip } from '@mui/material'
import { FaEye } from 'react-icons/fa'
import { MainContext } from '../../../context/MainContext'
import AlarmRow from '../components/AlarmRow'
import PageHeader from '../../../components/PageHeader'

const Alert = () => {
    const [listLogs_Alarms, setListLogs_Alarms] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const [loading, setLoading] = useState(true)
    const { fetchUnreadCount } = useContext(MainContext)

    const ChangeColorRow = (row) => {
        return row.original.viewed === false
    }
    const fetchLogs_Alarms = async () => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        try {
            setLoading(true)
            const { data } = await request(`${url}/listAlerts`, 'GET')
            const columns = [
                {
                    header: 'Alarma',
                    accessorKey: 'message',
                    Cell: ({ row }) => (
                        <AlarmRow
                            row={row}
                            onMarkAsRead={markAsRead}
                        />
                    ),
                },
            ]
            setColumnsTable(columns)
            setListLogs_Alarms(data)
        } catch (error) {
            console.error(error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron obtener los datos de las alarmas.',
                icon: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id) => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        try {
            await request(`${url}/alerts/viewed/${id}`, 'PUT')
            fetchUnreadCount()
            fetchLogs_Alarms()
        } catch (error) {
            console.error(error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo marcar la alerta como leída.',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500,
            })
        }
    }

    const markAllAsRead = async () => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        try {
            await request(`${url}/alerts/allviewed`, 'PUT')
            fetchUnreadCount()
            fetchLogs_Alarms()
            Swal.fire({
                title: 'Listo',
                text: 'Todas las alertas fueron marcadas como leídas.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            })
        } catch (error) {
            console.error(error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron marcar todas las alertas como leídas.',
                icon: 'error',
            })
        }
    }


    useEffect(() => {
        fetchLogs_Alarms();
    }, [])

    const hasUnread = listLogs_Alarms.some(a => !a.viewed)

    return (
        <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
            {loading ? (
                <LoaderComponent />
            ) : (
                <>
                    <PageHeader
                        title='Registro de alarmas'
                        action={
                            hasUnread && (
                                <Tooltip title='Marcar todas como leídas'>
                                    <IconButton
                                        onClick={markAllAsRead}
                                        sx={{
                                            color: 'white',
                                            background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                                            boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
                                            borderRadius: '999px',
                                            px: 2.25,
                                            py: 1,
                                            gap: 1,
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                                                boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
                                                transform: 'translateY(-1px)',
                                            },
                                        }}
                                    >
                                        <FaEye />
                                        <span>Marcar todas</span>
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    />
                    <TableCustom
                        columns={columnsTable}
                        data={listLogs_Alarms.length ? listLogs_Alarms : []}
                        pagination={true}
                        pageSize={10}
                        ChangeColorRow={ChangeColorRow}
                        topToolbar
                    />
                </>
            )}
        </Container>
    )
}

export default Alert
