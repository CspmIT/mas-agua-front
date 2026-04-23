import { Container } from '@mui/material'
import { useEffect, useState } from 'react'
import TableCustom from '../../../components/TableCustom'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate } from 'react-router-dom'
import LoaderComponent from '../../../components/Loader'
import { storage } from '../../../storage/storage'
import PageHeader from '../../../components/PageHeader'
import { ActionsRow, EditChip, ToneChip } from '../../../components/TableActions'

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
                    <ActionsRow>
                        <EditChip onClick={() => navigate(`/map/edit?id=${row.original.id}`)} />

                        {isSuperAdmin && !row.original.inMenu && (
                            <ToneChip tone='accent' onClick={() => navigate(`/config/menu`)}>
                                Añadir a menú
                            </ToneChip>
                        )}
                    </ActionsRow>
                ),
            },
        ])
        setLoader(false)
    }
    useEffect(() => {
        getMaps()
    }, [])
    return (
        <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
            <PageHeader
                title='Mapas'
                createLabel='Crear mapa'
                onCreate={() => navigate('/map/create')}
            />

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
