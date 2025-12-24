import { useContext, useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, FormLabel, IconButton, Tooltip } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import { FaEye } from 'react-icons/fa'
import { MainContext } from '../../../context/MainContext'
import AlarmRow from '../components/AlarmRow'

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

    return (
        <div className="w-full">
            {loading ? (
                <LoaderComponent />
            ) : (
                <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-6 transition-all">

                    {/* Header responsivo */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-300 dark:border-gray-700 pb-3">
                        <FormLabel className='w-full text-center !text-3xl md:ms-24'>
                            Registro de Alarmas
                        </FormLabel>

                        <div className="flex justify-center sm:justify-end bg-primary rounded-full">
                            <Tooltip title='Marcar todas como leídas'>
                                <IconButton
                                    size="small"
                                    onClick={markAllAsRead}
                                    disabled={!listLogs_Alarms.some(a => !a.viewed)}
                                    sx={{
                                        m: 0.6,
                                        color: 'white',
                                    }}
                                >
                                    <FaEye />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Tabla responsiva */}
                    <div className="flex-1 overflow-x-auto rounded-lg shadow-md">
                        <TableCustom
                            columns={columnsTable}
                            data={listLogs_Alarms.length ? listLogs_Alarms : []}
                            pagination={true}
                            pageSize={10}
                            density="compact"
                            header={{
                                background: 'rgb(190 190 190)',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}
                            toolbarClass={{ background: 'rgb(190 190 190)' }}
                            body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
                            footer={{ background: 'rgb(190 190 190)' }}
                            ChangeColorRow={ChangeColorRow}
                            topToolbar
                        />
                    </div>
                </CardCustom>
            )}
        </div>
    )
}

export default Alert
