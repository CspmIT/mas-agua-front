import { useState, useEffect } from 'react'
import { PiPlusCircleDuotone } from 'react-icons/pi'
import { Close } from '@mui/icons-material'
import { BsClock } from 'react-icons/bs'
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import SelectVars from '../components/SelectVars'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'

export default function PumpControl({
    edit = true,
    initialPumps = [],
    initialStates = [],
    initialTitle = '',
}) {
    const [pumps, setPumps] = useState(initialPumps)
    const [states, setStates] = useState(initialStates)
    const [title, setTitle] = useState(initialTitle)
    const navigate = useNavigate()
    useEffect(() => {
        if (!edit) {
            setPumps(initialPumps)
            setStates(initialStates)
        }
    }, [initialPumps, initialStates])

    const [open, setOpen] = useState(false)
    const [type, setType] = useState('')
    const [dialogText, setDialogText] = useState('')
    const [newName, setNewName] = useState('')
    const [varId, setVarId] = useState('')

    const handleAdd = (type) => {
        if (!varId) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion',
                html: 'Debe agregar una variable para guardar',
            })
            return
        }
        if (type === 'state') {
            if (newName.trim()) {
                const newState = {
                    id: Math.max(0, ...states.map((s) => s.id)) + 1,
                    name: newName,
                    varId: varId.id,
                    value: null,
                    unit: null,
                    type: 'status',
                }
                setStates([...states, newState])
                setNewName('')
                setVarId('')
                setOpen(false)
            }
        }
        if (type === 'pump') {
            if (newName.trim()) {
                const newPump = {
                    id: Math.max(0, ...pumps.map((p) => p.id)) + 1,
                    name: newName,
                    varId: varId.id,
                    value: null,
                    unit: null,
                    type: 'pump',
                }
                setPumps([...pumps, newPump])
                setNewName('')
                setVarId('')
                setOpen(false)
            }
        }
    }

    const handleSave = async () => {
        if (pumps.length === 0 && states.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion',
                text: 'Debe enviar al menos una bomba o un estado',
            })
            return false
        }

        const url = `${backend[import.meta.env.VITE_APP_NAME]}/bombs`
        try {
            const { data } = await request(url, 'POST', {
                pumps: pumps,
                title: title,
                states: states,
            })

            await Swal.fire({
                icon: 'success',
                title: 'Exito',
                html: `Se cargo con exito el grafico ${data.name}`,
            })
            navigate('/')
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `Ocurrio un error al querer cargar el grafico. <br> ${error.message}`,
            })
        }
    }

    const handleRemovePump = (id) => {
        setPumps(pumps.filter((pump) => pump.id !== id))
    }

    const handleRemoveState = (id) =>
        setStates(states.filter((item) => item.id !== id))

    return (
        <>
            <Card className={`${edit ? 'max-w-2xl' : 'w-full'} mx-auto h-fit !shadow-none`}>
                {edit && (
                    <Button
                        onClick={() => navigate(-1)} // Volver atrás
                        className="!absolute !top-2 !right-2 !z-10"
                    >
                        <ArrowBack className="!h-6 !w-6" />
                    </Button>
                )}

                <CardContent className="p-6">
                    {edit && (
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            label="Título"
                            fullWidth
                            className="mb-4"
                        />
                    )}

                    {edit && (
                        <div className="flex justify-center items-center mb-4">
                            <Button
                                onClick={() => {
                                    setType('pump')
                                    setDialogText('Agregar nueva Bomba')
                                    setOpen(true)
                                }}
                            >
                                <PiPlusCircleDuotone className="h-5 w-5 mr-2" />
                                Agregar Bomba
                            </Button>
                            <Button
                                onClick={() => {
                                    setType('state')
                                    setDialogText('Agregar nuevo Estado')
                                    setOpen(true)
                                }}
                            >
                                <PiPlusCircleDuotone className="h-5 w-5 mr-2" />
                                Agregar Estado
                            </Button>
                        </div>
                    )}

                    {states.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-100 p-4 rounded-md relative flex gap-1 justify-center items-center mb-6"
                        >
                            {edit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="!absolute !-right-4 !top-1 !p-0"
                                    onClick={() => handleRemoveState(item.id)}
                                >
                                    <Close className="!h-4 !w-4" />
                                </Button>
                            )}

                            <Typography variant="h6">{item.name}: </Typography>
                            <Typography
                                variant="h6"
                                className={`font-bold ${item.color}`}
                            >
                                {item.value ?? 'Sin datos'}
                            </Typography>
                        </div>
                    ))}

                    <div
                        className={`grid gap-2 h-auto ${
                            pumps.length === 1
                                ? 'grid-cols-1 justify-items-center'
                                : pumps.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 '
                        }`}
                    >
                        {pumps.map((pump) => {
                            return (
                                <Card
                                    key={pump.id}
                                    className="!relative !bg-gray-100 w-full max-w-sm"
                                >
                                    {edit && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="!absolute !-right-4 !top-1 !p-0"
                                            onClick={() =>
                                                handleRemovePump(pump.id)
                                            }
                                        >
                                            <Close className="!h-4 !w-4" />
                                        </Button>
                                    )}

                                    <CardContent className="p-4">
                                        <h4 className="text-lg text-center font-medium mb-1">
                                            {pump.name}
                                        </h4>
                                        <p className="text-xl text-center font-bold text-blue-500">
                                            {pump.value
                                                ? pump.value + ' ' + pump.unit
                                                : '-'}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="flex justify-between items-center mt-4 text-gray-500">
                        <div className="flex">
                            <BsClock className="h-5 w-5 mr-2" />
                            <span className="text-sm">
                                {new Date().toLocaleString()}
                            </span>
                        </div>
                        {edit && (
                            <Button variant="contained" onClick={handleSave}>
                                Guardar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <div>
                        <DialogTitle>{dialogText}</DialogTitle>
                    </div>
                    <div className="flex flex-col gap-3">
                        <TextField
                            placeholder="Nombre"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <VarsProvider>
                            <SelectVars
                                setValueState={setVarId}
                                label={'Seleccione una variable'}
                            />
                        </VarsProvider>
                    </div>

                    <div>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={() => handleAdd(type)}>Agregar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
