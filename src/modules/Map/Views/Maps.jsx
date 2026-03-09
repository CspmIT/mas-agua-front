import { Box, Button, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import TableCustom from '../../../components/TableCustom'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate } from 'react-router-dom'
import LoaderComponent from '../../../components/Loader'
import { storage } from '../../../storage/storage'

const Maps = () => {
    const [maps, setMaps] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const [loader, setLoader] = useState(true)
    const navigate = useNavigate()
    const usuario = storage.get('usuario');
    const isSuperAdmin = usuario?.profile === 4;

    async function getMaps() {
        const url = backend[import.meta.env.VITE_APP_NAME]
        const mapBack = await request(`${url}/maps`, 'GET')
        setMaps(mapBack.data)
        setColumnsTable([
            {
                header: 'ID',
                accessorKey: 'id',
            },
            {
                header: 'Nombre',
                accessorKey: 'name'
            },
            {
                header: 'Latitud',
                accessorKey: 'latitude',
            },
            {
                header: 'Longitud',
                accessorKey: 'longitude',
            },
            {
                header: 'Creado el',
                accessorKey: 'createdAt',
                Cell: ({ row }) => {
                    const date = new Date(row.original.createdAt)
                    return (date.toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" }))
                }
            },
            {
                header: 'Acciones',
                accessorKey: 'actions',
                size: 250,
                Cell: ({ row }) => (
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                navigate(`/map/edit?id=${row.original.id}`)
                            }}
                        >
                            Editar
                        </Button>

                        {/* SOLO ADMIN */}
                        {isSuperAdmin && !row.original.inMenu && (
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    backgroundColor: '#0ea5e9',
                                    '&:hover': { backgroundColor: '#0284c7' },
                                }}
                                onClick={() => navigate(`/config/menu`)}
                            >
                                Añadir a menú
                            </Button>
                        )}
                    </Box>
                ),
            },
        ])
        setLoader(false)
    }
    useEffect(() => {
        getMaps()
    }, [])
    return (
        <Container className='w-full'>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                <Typography className='w-full text-center md:!ms-24' variant="h4" align="center">
                    Mapas
                </Typography>

                <div className='flex justify-center sm:justify-end'>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            navigate('/map/create')
                        }}
                        className="sm:mx-10 whitespace-nowrap"
                    >
                        Crear mapa
                    </Button>
                </div>
            </div>

            {!loader ? (
                <TableCustom
                    columns={columnsTable}
                    data={maps.length > 0 ? maps : []}
                    pagination={true}
                    pageSize={10}
                />
            ) : (
                <LoaderComponent />
            )}
        </Container>
    )
}

export default Maps
