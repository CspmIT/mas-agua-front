import { Box, Button, Container, Typography } from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import { useEffect, useState } from 'react'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'
import ModalVar from '../../../components/DataGenerator/ModalVar'
import { FaPencil } from 'react-icons/fa6'
import { FaTrash } from 'react-icons/fa'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'

const Vars = () => {
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [detailVar, setDetailVar] = useState(null)
    const [vars, setVars] = useState([])
    const deleteVar = async (id) => {
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/deleteVar/${id}`
        const aprovationUser = await Swal.fire({
            icon: 'warning',
            title: 'Atencion!',
            html: 'Esta seguro que desea eliminar esta variable?',
            showConfirmButton: true,
            confirmButtonText: 'Si, eliminar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
        })
        if(!aprovationUser.isConfirmed){
            return false
        }
        try {
            const { data } = await request(url, 'POST')
            if (data.influxVar) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Exito!',
                    html: 'La variable fue eliminada con exito.',
                })
                getVars()
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                html: 'Ocurrio un error al actualizar la variable',
            })
        }
    }
    const [columns, setColumns] = useState([
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre', accessorKey: 'name' },
        {
            header: 'Calculo',
            accessorKey: 'calc',
            Cell: ({ row }) => (row.original.calc ? 'Si' : 'No'),
        },
        { 
            header: 'Proceso', 
            accessorKey: 'process',
            Cell: ({ row }) => (row.original.process ? row.original.process : '-'),
        },
        {
            header: 'Opciones',
            accessorKey: 'options',
            Cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            size="small"
                            color="success"
                            variant="contained"
                            onClick={() => {
                                setDetailVar(row.original)
                                setModal(true)
                            }}
                        >
                            <FaPencil className="me-2" /> Editar
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => deleteVar(row.original.id)}
                        >
                            <FaTrash className="me-2" /> Eliminar
                        </Button>
                    </div>
                )
            },
        },
    ])

    const getVars = async () => {
        const varsDB = await getVarsInflux()
        setVars(varsDB)
        setLoading(false)
    }

    useEffect(() => {
        getVars()
    }, [])

    return (
        <Container>
            <Box
                display="flex"
                justifyContent={'space-between'}
                alignItems={'center'}
                mb={3}
                gap={3}
            >
                <Typography variant="h3" align="center" flexGrow={1} className="!ms-24">
                    Variables
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setDetailVar(null)
                        setModal(true)
                    }}
                >
                    Crear Variable
                </Button>
            </Box>
            {!loading ? (
                <TableCustom
                    data={vars.length > 0 ? vars : []}
                    columns={columns}
                    pagination={true}
                    pageSize={10}
                    filter={true}
                    topToolbar={true}
                />
            ) : (
                <>Cargando...</>
            )}
            <ModalVar
                openModal={modal}
                setOpenModal={setModal}
                data={detailVar}
                onSaved={() => getVars()}
            />
        </Container>
    )
}

export default Vars
