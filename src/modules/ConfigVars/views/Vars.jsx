import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import { useEffect, useState } from 'react'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'
import ModalVar from '../../../components/DataGenerator/ModalVar'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import CardCustom from '../../../components/CardCustom'
import { Controller, useForm } from 'react-hook-form'
import LoaderComponent from '../../../components/Loader'

const Vars = () => {
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [detailVar, setDetailVar] = useState(null)
    const [vars, setVars] = useState([])
    const [varsOriginal, setVarsOriginal] = useState([]);
    const [processList, setProcessList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const { control, handleSubmit } = useForm({ defaultValues: { process: '', calc: '', unit: '' } });
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
        if (!aprovationUser.isConfirmed) {
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
        { header: 'ID', accessorKey: 'id', size: 50 },
        { header: 'Nombre', accessorKey: 'name', size: 350},
        { header: 'Unidad', accessorKey: 'unit' },
        {
            header: 'Cálculo',
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
                            color="primary"
                            variant="contained"
                            onClick={() => {
                                setDetailVar(row.original)
                                setModal(true)
                            }}
                        >
                            Editar
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => deleteVar(row.original.id)}
                        >
                            Eliminar
                        </Button>
                    </div>
                )
            },
        },
    ])

    const getVars = async () => {
        const varsDB = await getVarsInflux();

        setVars(varsDB);
        setVarsOriginal(varsDB);

        const processUniques = Array.from(
            new Set(varsDB.map(v => v.process).filter(Boolean))
        );

        const unitUniques = Array.from(
            new Set(varsDB.map(v => v.unit).filter(Boolean))
        );

        setProcessList(processUniques);
        setUnitList(unitUniques);
        setLoading(false);
    };


    // FUNCION PARA SETEAR FILTROS
    const onSubmit = ({ process, calc, unit }) => {
        let filtered = [...varsOriginal];
    
        // Filtro por process
        if (process) {
            filtered = filtered.filter(v => v.process === process);
        }
    
        // Filtro por calc (convertimos string → boolean)
        if (calc === "true") {
            filtered = filtered.filter(v => v.calc === true);
        } else if (calc === "false") {
            filtered = filtered.filter(v => v.calc === false);
        }

        // Filtro por unit
        if (unit) {
            filtered = filtered.filter(v => v.unit === unit);
        }
    
        setVars(filtered);
    };
    


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
                <Typography variant="h3" align="center" flexGrow={1} className="!ms-44">
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
                <>
                    <CardCustom className={'p-2 my-5 rounded-md bg-grey-100'}>
                        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-wrap relative w-full justify-center items-end mt-2'>
                        <div className='md:w-1/6 p-1 w-full'>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="unit_label">Unidad</InputLabel>
                                    <Controller
                                        name="unit"
                                        control={control}
                                        size="small"
                                        render={({ field }) => (
                                            <Select {...field} labelId="unit_label" label="Unidad">
                                                <MenuItem value="">Todos</MenuItem>
                                                {unitList.map((p, i) => (
                                                    <MenuItem key={i} value={p}>
                                                        {p}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className='md:w-1/6 p-1 w-full'>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="calc_label">Cálculo</InputLabel>
                                    <Controller
                                        name="calc"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                            labelId="calc_label"
                                            label="Cálculo"
                                            {...field}
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            <MenuItem value="true">Sí</MenuItem>
                                            <MenuItem value="false">No</MenuItem>
                                        </Select>
                                        
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className='md:w-1/4 p-1 w-full'>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="process_label">Proceso</InputLabel>
                                    <Controller
                                        name="process"
                                        control={control}
                                        size="small"
                                        render={({ field }) => (
                                            <Select {...field} labelId="process_label" label="Proceso">
                                                <MenuItem value="">Todos</MenuItem>
                                                {processList.map((p, i) => (
                                                    <MenuItem key={i} value={p}>
                                                        {p}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </div>


                            <div className='p-1 w-full justify-center flex'>
                                <Button variant="contained" color="primary" size="small"
                                    onClick={() => {
                                        handleSubmit(onSubmit)()
                                    }}
                                >
                                    Filtrar
                                </Button>
                            </div>
                        </form>
                    </CardCustom >
                    <TableCustom
                        data={vars.length > 0 ? vars : []}
                        columns={columns}
                        pagination={true}
                        pageSize={10}
                        topToolbar={true}
                    />
                </>
            ) : (
               <LoaderComponent />
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
