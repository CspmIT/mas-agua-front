import {
    Box,
    Button,
    Container,
    Typography,
} from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import { useEffect, useState } from 'react'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'
import ModalVar from '../../../components/DataGenerator/ModalVar'
import { FaPencil } from 'react-icons/fa6'
import { FaTrash } from 'react-icons/fa'

const Vars = () => {
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [detailVar, setDetailVar] = useState(null)
    const [vars, setVars] = useState([])
    const [columns, setColumns] = useState([
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre', accessorKey: 'name' },
        {
            header: 'Calculo',
            accessorKey: 'calc',
            Cell: ({ row }) => (row.original.calc ? 'Si' : 'No'),
        },
        {
            header: 'Opciones',
            accessorKey: 'options',
            Cell: ({ row }) => {
                return (
                    <div className='flex gap-2'>
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
                            onClick={() => {
                                setDetailVar(row.original)
                                setModal(true)
                            }}
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
                <Typography variant="h3" align="center" flexGrow={1}>
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
                />
            ) : (
                <>Cargando...</>
            )}
            <ModalVar
                openModal={modal}
                setOpenModal={setModal}
                data={detailVar}
            />
        </Container>
    )
}

export default Vars
