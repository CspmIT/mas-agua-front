import { Box, Button, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import TableCustom from '../../../components/TableCustom'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate } from 'react-router-dom'
import LoaderComponent from '../../../components/Loader'

const Maps = () => {
    const [maps, setMaps] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const [loader, setLoader]  = useState(true)
    const navigate = useNavigate()
    async function getMaps() {
        const url = backend[import.meta.env.VITE_APP_NAME]
        const mapBack = await request(`${url}/maps`, 'GET')
        setMaps(mapBack.data)
        setColumnsTable([
            {
                header: 'id',
                accessorKey: 'id',
            },
            {
                header: 'latitud',
                accessorKey: 'latitude',
            },
            {
                header: 'longitud',
                accessorKey: 'longitude',
            },
            {
                header: 'Creado el',
                accessorKey: 'createdAt',
                Cell: ({row}) => {
                    const date = new Date(row.original.createdAt)
                    return (date.toLocaleString("es-AR", {timeZone: "America/Argentina/Cordoba"}))}
            },
            {
                header: 'Botones',
                accessorKey: 'actions',
                Cell: ({ row }) => (
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
                ),
            },
        ])
        setLoader(false)
    }
    useEffect(() => {
        getMaps()
    }, [])
    return (
        <Container>
            <Box
                display="flex"
                justifyContent={'space-between'}
                alignItems={'center'}
                mb={3}
            >
                <Typography variant="h3" align="center" flexGrow={1} className="!ms-24">
                    Mapas
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        navigate('/map/create')
                    }}
                >
                    Crear mapa
                </Button>
            </Box>
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
