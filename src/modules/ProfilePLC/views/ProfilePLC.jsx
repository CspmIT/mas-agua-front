import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Container,
    Switch,
    Typography,
} from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import ModalVarPLC from '../../ConfigVars/components/ModalVarPLC'
import { useEffect, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { FiUpload } from 'react-icons/fi'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'

const ProfilePLC = () => {
    const [loading, setLoading] = useState(true)
    const [modalPLC, setModalPLC] = useState(false)
    const [plcProfile, setPlcProfile] = useState([])
    const [modalData, setModalData] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const editPLC = async (id) => {
        const { data } = await request(
            `${backend[import.meta.env.VITE_APP_NAME]}/plc/service/${id}`,
            'GET'
        )
        setModalData(data[0])
    }

    const deleteFilePLC = async (id) => {
        setActionLoading(true)
        try {
            const result = await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/plc/delete/${id}`,
                'GET'
            )
            if (result) {
                await getProfilePLC()
            }
        } catch (error) {
            console.error('Error al eliminar el perfil:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const activateProfilePLC = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Atencion!',
            text: '¿Esta seguro de activar este perfil? Empezara a reportar en infux',
            confirmButtonText: 'Si, activar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
        })
        if (!result.isConfirmed) {
            return false
        }
        setActionLoading(true)
        try {
            const status = await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/plc/activate/${id}`,
                'GET'
            )
            if (status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    html: 'El servico fue activado con exito',
                })
                await getProfilePLC()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: 'Ocurrio un error al activar el servicio.',
            })
        } finally {
            setActionLoading(false)
        }
    }

    const deactivateProfilePLC = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Atencion!',
            text: '¿Esta seguro de desactivar este perfil? Dejara de reportar en infux',
            confirmButtonText: 'Si, desactivar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
        })
        if (!result.isConfirmed) {
            return false
        }
        setActionLoading(true)
        try {
            const status = await request(
                `${backend[import.meta.env.VITE_APP_NAME]
                }/plc/deactivate/${id}`,
                'GET'
            )
            if (status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    html: 'El servico fue desactivado con exito',
                })
                await getProfilePLC()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: 'Ocurrio un error al desactivar el servicio.',
            })
        } finally {
            setActionLoading(false)
        }
    }

    const columns = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Nombre del servicio', accessorKey: 'serviceName' },
        { header: 'IP PLC', accessorKey: 'ip' },
        {
            header: 'Estado',
            accessorKey: 'status',
            Cell: ({ row }) => {
                return (
                    <>
                        <Switch
                            onClick={() => {
                                if (row.original.status === 1) {
                                    deactivateProfilePLC(row.original.id)
                                }
                                if (row.original.status === 0) {
                                    activateProfilePLC(row.original.id)
                                }
                            }}
                            checked={row.original.status === 1}
                            disabled={row.original.status === 2}
                        />
                        {row.original.status === 0 || row.original.status === 2
                            ? 'Inactivo'
                            : 'Activo'}
                    </>
                )
            },
        },
        {
            header: 'Acciones',
            accessorKey: 'actions',
            Cell: ({ row }) => {
                const statusBtnVariant =
                    row.original.status == 2 ? 'success' : 'error'
                return (
                    <div className="flex gap-2">
                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            disabled={row.original.status === 2}
                            onClick={() => {
                                editPLC(row.original.id)
                                setModalPLC(true)
                            }}
                        >
                            <FaPencilAlt className="me-2" /> Editar
                        </Button>
                        <Button
                            size="small"
                            color={statusBtnVariant}
                            variant="contained"
                            onClick={async () => {
                                if (row.original.status === 1) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Atencion',
                                        text: 'Primero debe desactivar el perfil para poder eliminarlo.',
                                    })
                                    return false
                                }
                                if (row.original.status === 2) {
                                    editPLC(row.original.id)
                                }
                                if (row.original.status === 0) {
                                    const value = await Swal.fire({
                                        icon: 'warning',
                                        title: 'Atencion',
                                        html: '<h5>Esta por eliminar los archivos del perfil del servidor.</h5><p>¿Esta seguro ejecutar esta funcion?</p>',
                                        confirmButtonText: 'Si, eliminar',
                                        cancelButtonText: 'Cancelar',
                                        showCancelButton: true,
                                    })
                                    if (value.isConfirmed) {
                                        deleteFilePLC(row.original.id)
                                    }
                                    return false
                                }
                                setModalPLC(true)
                            }}
                        >
                            {row.original.status === 2 ? (
                                <>
                                    <FiUpload className="me-1" /> {'Subir'}
                                </>
                            ) : (
                                <>
                                    <FaTrash className="me-1" />
                                    {' Eliminar'}
                                </>
                            )}
                        </Button>
                    </div>
                )
            },
        },
    ]

    const getProfilePLC = async () => {
        const profiles = await request(
            `${backend[import.meta.env.VITE_APP_NAME]}/plc/list`,
            'GET'
        )
        setPlcProfile(profiles.data)
        setLoading(false)
    }

    useEffect(() => {
        getProfilePLC()
    }, [])
    return (
        <>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={actionLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Container className='w-full'>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                    <Typography className='w-full text-center md:!ms-40' variant="h4" align="center">
                        Perfil PLC
                    </Typography>
                    <div className='flex justify-center sm:justify-end'>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setModalData(false)
                                setModalPLC(true)
                            }}
                            className="sm:mx-10 whitespace-nowrap"
                        >
                            Crear Perfil de PLC
                        </Button>
                    </div>
                </div>

                {!loading ? (
                    <TableCustom
                        data={plcProfile.length > 0 ? plcProfile : []}
                        columns={columns}
                        pagination={true}
                        pageSize={10}
                    />
                ) : (
                    <LoaderComponent />
                )}
                <ModalVarPLC
                    open={modalPLC}
                    setOpen={setModalPLC}
                    plcProfile={modalData}
                    list={getProfilePLC}
                />
            </Container>
        </>
    )
}

export default ProfilePLC
