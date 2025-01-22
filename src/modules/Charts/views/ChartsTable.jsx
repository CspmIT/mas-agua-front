import React, { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import { Box, Button, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const ChartsTable = () => {
    const navigate = useNavigate()
    const [charts, setCharts] = useState([])
    const [columnsTable, setColumnsTable] = useState([])
    const fetchCharts = async () => {
        const url = backend[import.meta.env.VITE_APP_NAME]
        const endpoint = url + '/charts'
        const { data } = await request(endpoint, 'GET')
        const columnsCel = [
            {
                header: 'id',
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
                header: 'Acciones',
            },
        ]
        setColumnsTable(columnsCel)
        setCharts(data)
    }
    useEffect(() => {
        fetchCharts()
    }, [])
    return (
        <Container>
            {charts.length > 0 && columnsTable.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <Box
                        display="flex"
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        mb={3}
                    >
                        <Typography variant="h3" align="center" flexGrow={1}>
                            Graficos
                        </Typography>
                        <Button variant="contained" color="primary" onClick={()=> {navigate('/config/graphic')}}>
                            Crear grafico
                        </Button>
                    </Box>

                    <TableCustom columns={columnsTable} data={charts} />
                </div>
            ) : (
                <p>Cargando datos...</p>
            )}
        </Container>
    )
}

export default ChartsTable
