import React, { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { configs } from '../configs/configs'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'

const ChartsTable = () => {
    const navigate = useNavigate()
    const [charts, setCharts] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const [loader, setLoader] = useState(true)
    const fetchCharts = async () => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        const endpoint = url + '/allCharts'
        const { data } = await request(endpoint, 'GET')
        const columnsCel = [
            {
                header: 'ID',
                accessorKey: 'id',
            },
            {
                header: 'Titulo',
                accessorKey: 'name',
            },
            {
                header: 'Tipo',
                accessorKey: 'type',
            },
            {
                header: 'Orden',
                accessorKey: 'order',
            },
            {
                header: 'Acciones',
                accessorKey: 'actions',
                Cell: ({ row }) => (
                    <Box display="flex" gap={1}>
                        <Button
                            disabled={
                                row.original.type === 'PumpControl'
                            }
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                const type = row.original.type
                                if (type === 'BooleanChart') {
                                    navigate(`/config/graphic/boolean/${row.original.id}`)
                                    return
                                }
                                if (type === 'MultipleBooleanChart') {
                                    navigate(`/config/graphic/multipleBoolean/${row.original.id}`)
                                    return
                                }
                                if (type === 'PumpControl') {
                                    navigate('/config/pumps')
                                    return
                                }
                                const matchingConfig = Object.values(
                                    configs
                                ).find((config) => config.typeGraph === type)

                                navigate(
                                    `/config/graphic/${matchingConfig.id}/${row.original.id}`
                                )
                            }}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="outlined"
                            color={row.original.status ? 'error' : 'success'} // Cambia el color según el estado
                            size="small"
                            onClick={async (e) => {
                                e.preventDefault()
                                const question = await Swal.fire({
                                    icon: 'question',
                                    html: `Esta seguro que desea ${row.original.status
                                            ? 'desactivar'
                                            : 'activar'
                                        } este grafico?`,
                                    showCancelButton: true,
                                    cancelButtonText: 'Cancelar',
                                    confirmButtonText: `${row.original.status
                                            ? 'Desactivar'
                                            : 'Activar'
                                        }`,
                                })
                                if (!question.isConfirmed) {
                                    return false
                                }
                                const endpoint = `${url}/charts/status`
                                try {
                                    const { data } = await request(
                                        endpoint,
                                        'PUT',
                                        {
                                            id: row.original.id,
                                            status: row.original.status,
                                        }
                                    )
                                    if (data) {
                                        await Swal.fire({
                                            icon: 'success',
                                            html: 'Grafico actualizado correctamnte',
                                        })
                                        // Actualiza el estado local
                                        setCharts((prevCharts) =>
                                            prevCharts.map((chart) =>
                                                chart.id === row.original.id
                                                    ? {
                                                        ...chart,
                                                        status: !chart.status,
                                                    }
                                                    : chart
                                            )
                                        )
                                    }
                                } catch (error) {
                                    console.error(error)
                                    Swal.fire({
                                        icon: 'error',
                                        html: 'No se puedo actualizar el grafico',
                                    })
                                }
                            }}
                        >
                            {row.original.status ? 'Desactivar' : 'Activar'}
                        </Button>
                    </Box>
                ),
            },
        ]
        setColumnsTable(columnsCel)
        setCharts(data)
        setLoader(false)
    }
    useEffect(() => {
        fetchCharts()
    }, [])

    return (
        <Container className="w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">

                <Typography className='w-full text-center md:!ms-40' variant="h4" align="center">
                    Gráficos
                </Typography>
                <div className='flex justify-center sm:justify-end'>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            navigate('/config/graphic')
                        }}
                        className="sm:mx-10 whitespace-nowrap"
                    >
                        Crear grafico
                    </Button>
                </div>

                

            </div>
            {!loader ? (
                <TableCustom
                    columns={columnsTable}
                    data={charts.length > 0 ? charts : []}
                    pagination={true}
                    pageSize={10}
                    topToolbar={true}
                />
            ) : (
                <LoaderComponent />
            )}
        </Container>
    )
}

export default ChartsTable
