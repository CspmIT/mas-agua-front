import { Close } from '@mui/icons-material'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    MenuItem,
    Modal,
    TextField,
    Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { varPLCSchema } from '../../ProfilePLC/schemas/varsPLC'
import { useEffect, useRef, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'

const ModalVarPLC = ({ open, setOpen, plcProfile = false, list = false }) => {
    const [points, setPoints] = useState([])
    const [variables, setVariables] = useState([])
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    // Se usa para que el scroll vaya abajo cuando se agrega una variable nueva
    const containerRef = useRef(null)
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [variables])

    const generarOpcionesBytes = () => {
        let bytes = new Set()
        points.forEach(({ startPoint, endPoint }) => {
            for (let i = startPoint; i <= endPoint; i++) {
                bytes.add(i)
            }
        })
        return Array.from(bytes)
            .sort((a, b) => a - b)
            .map((b) => ({
                value: b,
                label: `Byte ${b}`,
            }))
    }

    const bitOptions = Array.from({ length: 8 }, (_, i) => ({
        value: i,
        label: `Bit ${i}`,
    }))

    const getAvailableBitsForVariable = (currentIndex, currentByte) => {
        if (currentByte === '') return bitOptions

        const usedBits = variables
            .filter(
                (_, i) =>
                    i !== currentIndex && variables[i].byte === currentByte
            )
            .map((v) => parseInt(v.bit))

        return bitOptions.filter((bit) => !usedBits.includes(bit.value))
    }

    const addVariable = () => {
        const totalBytesDisponibles = generarOpcionesBytes().length
        const totalBitsDisponibles = totalBytesDisponibles * 8

        if (variables.length >= totalBitsDisponibles) {
            alert(
                'Ya se han utilizado todos los bits disponibles en los rangos seleccionados.'
            )
            return
        }

        setVariables([...variables, { byte: '', bit: '', type: '', field: '' }])
    }

    const updateVariable = (index, field, value) => {
        const newVars = [...variables]
        newVars[index][field] = value
        setVariables(newVars)
    }

    const removeVariable = (index) => {
        const newVars = [...variables]
        newVars.splice(index, 1)
        setVariables(newVars)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const addPoints = () => {
        const { startPoint, endPoint } = getValues()

        // Validar existencia
        if (startPoint === undefined || startPoint === null) {
            setError('startPoint', {
                message: 'Debe ingresar un valor',
            })
            return
        }

        if (endPoint === undefined || endPoint === null) {
            setError('endPoint', {
                message: 'Debe ingresar un valor',
            })
            return
        }

        // Validar que sean enteros positivos
        if (!Number.isInteger(startPoint) || startPoint < 0) {
            setError('startPoint', {
                message: 'Debe ser un entero positivo',
            })
            return
        }

        if (!Number.isInteger(endPoint) || endPoint < 0) {
            setError('endPoint', {
                message: 'Debe ser un entero positivo',
            })
            return
        }

        // Validar rango
        if (startPoint > endPoint) {
            setError('startPoint', {
                message: 'El inicio debe ser menor o igual al fin',
            })
            return
        }

        clearErrors(['startPoint', 'endPoint'])

        setPoints([...points, { startPoint, endPoint }])
        setValue('startPoint', undefined)
        setValue('endPoint', undefined)
    }

    const removePoint = (index) => {
        const newPoints = [...points]
        newPoints.splice(index, 1)
        setPoints(newPoints)
    }

    useEffect(() => {
        setValue('points', points)
    }, [points])

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        clearErrors,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(varPLCSchema),
    })

    useEffect(() => {
        if (!plcProfile) {
            reset()
            setPoints([])
            setVariables([])
            return
        }
        if (plcProfile) {
            // Setea los valores del formulario
            setValue('topic', plcProfile.topic)
            setValue('influx', plcProfile.influx)
            setValue('PLCModel', plcProfile.PLCModel)
            setValue('ip', plcProfile.ip)
            setValue('serviceName', plcProfile.serviceName)
            setValue('rack', plcProfile.rack)
            setValue('slot', plcProfile.slot)

            // Setea los valores de los estados locales (si usás useState)
            setPoints(plcProfile.PointsPLC || [])
            setVariables(plcProfile.VarsPLC || [])
        }
    }, [plcProfile])

    const onSubmit = async (data) => {
        setLoadingSubmit(true)
        const PLCConfig = {
            id: plcProfile?.id,
            status: plcProfile?.status,
            ...data,
            points: points,
            vars: variables,
        }

        const endPoint = backend[import.meta.env.VITE_APP_NAME]
        const url = plcProfile?.id
            ? `${endPoint}/plc/edit`
            : `${endPoint}/plc/create`
        try {
            const result = await request(url, 'POST', PLCConfig)
            const htmlContent = result.data.message
            await Swal.fire({
                title: 'Exito',
                icon: 'success',
                html: htmlContent,
            })
            reset()
            setPoints([])
            setVariables([])
            list()
            setOpen(false)
        } catch (error) {
            const errorMessages = error.response.data.message
            const htmlContent = errorMessages
                .map((element) => `<p>${element.message}</p>`)
                .join('')

            Swal.fire({
                title: 'Atención',
                icon: 'error',
                html: htmlContent,
            })
            console.log(error.response.data.message)
        } finally {
            setLoadingSubmit(false)
        }
    }

    return (
        <>
            {open && (
                <Modal className="flex justify-center items-center" open={open}>
                    <Box className="relative flex justify-center items-center  bg-white !rounded-lg">
                        <IconButton
                            onClick={handleClose}
                            className="!absolute top-3 right-3"
                        >
                            <Close color="error" />
                        </IconButton>

                        <form
                            className="p-5 flex flex-col h-full gap-3 justify-start items-center min-w-[90vw] max-w-[94vw]"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Typography variant="h4">
                                Configuracion de PLC
                            </Typography>
                            <div className="flex w-full gap-3 justify-center">
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-3/4"
                                    type="text"
                                    label="Topico"
                                    error={!!errors.topic}
                                    helperText={errors.topic?.message}
                                    {...register('topic')}
                                />
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/4"
                                    type="text"
                                    label="Influx"
                                    select={true}
                                    defaultValue={getValues('influx')}
                                    {...register('influx')}
                                    error={!!errors.influx}
                                    helperText={errors.influx?.message}
                                >
                                    <MenuItem disabled value={''}></MenuItem>
                                    <MenuItem
                                        value={'Sensors_Morteros_Interna'}
                                    >
                                        Mas Agua Morteros
                                    </MenuItem>
                                    <MenuItem value={'Sensors_Externos'}>
                                        Mas Agua Externos
                                    </MenuItem>
                                    <MenuItem value={'externos'}>
                                        Energia Externos
                                    </MenuItem>
                                </TextField>
                            </div>
                            <Typography variant="h5">
                                Opciones del PLC
                            </Typography>
                            <div className="flex w-full gap-3">
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/2"
                                    type="text"
                                    label="Modelo del PLC"
                                    select={true}
                                    defaultValue={getValues('PLCModel')}
                                    {...register('PLCModel')}
                                    error={!!errors.PLCModel}
                                    helperText={errors.PLCModel?.message}
                                >
                                    <MenuItem disabled value={''}></MenuItem>
                                    <MenuItem value={'LOGO_7'}>LOGO_7</MenuItem>
                                    <MenuItem value={'LOGO_8'}>LOGO_8</MenuItem>
                                    <MenuItem value={'S7_1200'}>
                                        S7_1200
                                    </MenuItem>
                                </TextField>

                                {/* LOGO_7, LOGO_8, S7_1200 */}
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/2"
                                    type="text"
                                    label="IP del PLC"
                                    error={!!errors.ip}
                                    helperText={errors.ip?.message}
                                    {...register('ip')}
                                />
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/2"
                                    type="text"
                                    label="Nombre del servicio"
                                    error={!!errors.serviceName}
                                    helperText={errors.serviceName?.message}
                                    {...register('serviceName')}
                                />
                            </div>
                            <div className="flex w-full gap-3">
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/2"
                                    type="number"
                                    label="RACK"
                                    error={!!errors.rack}
                                    helperText={errors.rack?.message}
                                    {...register('rack')}
                                />
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/2"
                                    type="number"
                                    label="SLOT"
                                    error={!!errors.slot}
                                    helperText={errors.slot?.message}
                                    {...register('slot')}
                                />
                            </div>
                            <Typography variant="h5">
                                Puntos de las variables
                            </Typography>
                            <div className="flex w-full gap-3 justify-center items-center">
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/4"
                                    type="number"
                                    label="Inicio"
                                    error={!!errors.startPoint}
                                    helperText={errors.startPoint?.message}
                                    {...register('startPoint', {
                                        valueAsNumber: true,
                                    })}
                                />

                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    className="w-1/4"
                                    type="number"
                                    label="Fin"
                                    error={!!errors.endPoint}
                                    helperText={errors.endPoint?.message}
                                    {...register('endPoint', {
                                        valueAsNumber: true,
                                    })}
                                />

                                <Button
                                    color="primary"
                                    variant="outlined"
                                    onClick={addPoints}
                                >
                                    Agregar puntos
                                </Button>
                            </div>
                            {points.length > 0 && (
                                <>
                                    <Box className="mt-4 p-4 border rounded-lg bg-gray-50">
                                        <Typography
                                            variant="subtitle1"
                                            className="mb-2 font-medium"
                                        >
                                            Puntos agregados:
                                        </Typography>
                                        <Box className="flex flex-rap gap-2">
                                            {points.map((punto, index) => (
                                                <Chip
                                                    key={index}
                                                    label={`{${punto.startPoint}, ${punto.endPoint}}`}
                                                    onDelete={() =>
                                                        removePoint(index)
                                                    }
                                                    deleteIcon={<FaTrash />}
                                                    variant="outlined"
                                                    className="text-sm py-3"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box className="mt-4 w-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <Typography variant="h6">
                                                Variables
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                onClick={addVariable}
                                                disabled={
                                                    variables.length >=
                                                    generarOpcionesBytes()
                                                        .length *
                                                        8
                                                }
                                            >
                                                Agregar variable
                                            </Button>
                                        </div>

                                        <div
                                            ref={containerRef}
                                            className="max-h-[200px] overflow-y-auto"
                                        >
                                            {variables.map(
                                                (variable, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex gap-3 items-center mb-2 mt-3"
                                                    >
                                                        <TextField
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            className="w-1/4"
                                                            select
                                                            label="Byte"
                                                            value={
                                                                variable.byte
                                                            }
                                                            onChange={(e) =>
                                                                updateVariable(
                                                                    index,
                                                                    'byte',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {generarOpcionesBytes().map(
                                                                (opt) => (
                                                                    <MenuItem
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </TextField>

                                                        <TextField
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            className="w-1/4"
                                                            select
                                                            label="Bit"
                                                            value={variable.bit}
                                                            onChange={(e) =>
                                                                updateVariable(
                                                                    index,
                                                                    'bit',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {getAvailableBitsForVariable(
                                                                index,
                                                                variable.byte
                                                            ).map((opt) => (
                                                                <MenuItem
                                                                    key={
                                                                        opt.value
                                                                    }
                                                                    value={
                                                                        opt.value
                                                                    }
                                                                >
                                                                    {opt.label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>

                                                        <TextField
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            className="w-1/4"
                                                            select
                                                            label="Tipo"
                                                            value={
                                                                variable.type
                                                            }
                                                            onChange={(e) =>
                                                                updateVariable(
                                                                    index,
                                                                    'type',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="BOOL">
                                                                BOOL
                                                            </MenuItem>
                                                            <MenuItem value="BYTE">
                                                                BYTE
                                                            </MenuItem>
                                                            <MenuItem value="INT">
                                                                INT
                                                            </MenuItem>
                                                            <MenuItem value="UINT">
                                                                UNSIGNED INT
                                                            </MenuItem>
                                                            <MenuItem value="FLOAT">
                                                                FLOAT
                                                            </MenuItem>
                                                            <MenuItem value="STRING">
                                                                STRING
                                                            </MenuItem>
                                                            <MenuItem value="LONG">
                                                                LONG
                                                            </MenuItem>
                                                            <MenuItem value="ULONG">
                                                                UNSIGNED LONG
                                                            </MenuItem>
                                                            <MenuItem value="DOUBLE">
                                                                DOUBLE
                                                            </MenuItem>
                                                        </TextField>

                                                        <TextField
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            className="w-1/4"
                                                            label="Field"
                                                            value={
                                                                variable.field
                                                            }
                                                            onChange={(e) =>
                                                                updateVariable(
                                                                    index,
                                                                    'field',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                        <IconButton
                                                            color="error"
                                                            onClick={() =>
                                                                removeVariable(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </IconButton>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </Box>
                                </>
                            )}
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                disabled={loadingSubmit}
                                startIcon={
                                    loadingSubmit && (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    )
                                }
                            >
                                {loadingSubmit
                                    ? 'Guardando...'
                                    : plcProfile
                                    ? plcProfile.status === 2
                                        ? 'Subir archivos'
                                        : 'Editar perfil'
                                    : 'Crear perfil'}
                            </Button>
                        </form>
                    </Box>
                </Modal>
            )}
        </>
    )
}

export default ModalVarPLC
