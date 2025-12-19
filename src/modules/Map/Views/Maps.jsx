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
                Cell: ({row}) => {
                    const date = new Date(row.original.createdAt)
                    return (date.toLocaleString("es-AR", {timeZone: "America/Argentina/Cordoba"}))}
            },
            {
                header: 'Acciones',
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
