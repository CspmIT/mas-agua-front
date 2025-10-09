import { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, FormLabel } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import { FaEye } from 'react-icons/fa'

const Alert = () => {
    const [listLogs_Alarms, setListLogs_Alarms] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLogs_Alarms = async () => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        try {
            setLoading(true)
            const { data } = await request(`${url}/listAlerts`, 'GET')
            data.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt)) // Ordenar por fecha descendente
            const columns = [
                {
                    header: 'Fecha', accessorKey: 'triggeredAt', size: 100, // si TableCustom soporta `size`
                    cell: info => <span className="whitespace-nowrap">{info.getValue()}</span>
                },
                { header: 'Mensaje', accessorKey: 'message' },
                // {
                //     header: 'Acciones',
                //     accessorKey: 'actions',
                //     size: 50,
                //     Cell: ({ row }) => (
                //         <Box display="flex" gap={1}>
                //             <Button
                //                 variant="outlined"
                //                 color="primary"
                //                 size="small"
                //                 onClick={() => {
                //                     // setSelectedAlarm(row.original)
                //                     // setModalAlarms(true)
                //                 }}
                //             >
                //                 Leido
                //             </Button>
                //         </Box>
                //     ),
                // },
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

    useEffect(() => {
        fetchLogs_Alarms()
    }, [])

    return (
        <div className="flex flex-col w-full h-full gap-6">
            {loading ? (
                <LoaderComponent />
            ) : (
                <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col gap-6 transition-all">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-300 dark:border-gray-700 pb-3">
                        <FormLabel className='w-full text-center !text-3xl'>
                            Registro de Alarmas
                        </FormLabel>
                    </div>

                    {/* Tabla */}
                    <div className="flex-1 overflow-hidden rounded-lg shadow-md">
                        <TableCustom
                            columns={columnsTable}
                            data={listLogs_Alarms.length ? listLogs_Alarms : []}
                            pagination={true}
                            pageSize={10}
                            density='compact'
                            header={{
                                background: 'rgb(190 190 190)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}
                            toolbarClass={{ background: 'rgb(190 190 190)' }}
							body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
							footer={{ background: 'rgb(190 190 190)' }}
                            topToolbar
                        />
                    </div>
                </CardCustom>
            )}
        </div>
    )
}

export default Alert
