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
            <Card className={`${edit ? 'max-w-2xl' : 'w-full'} h-full !shadow-none`}>
                {edit && (
                    <Button
                        onClick={() => navigate(-1)} // Volver atrás
                        className="!absolute !top-2 !right-2 !z-10"
                    >
                        <ArrowBack className="!h-6 !w-6" />
                    </Button>
                )}

                <CardContent>
                    {edit && (
                        <TextField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            label="Título"
                            fullWidth
                            className="!rounded-xl"
                        />
                    )}

                    {edit && (
                        <div className="flex justify-center items-center mb-1">
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
                            className="relative flex justify-center items-center gap-2 mb-2 px-3 py-1.5 bg-slate-50/30 border-2 border-blue-200 rounded-xl"
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

                            <span className="text-sm text-slate-600">{item.name}</span>
                            <span className={`text-base font-bold ${item.color}`}>
                                {item.value ?? 'Sin datos'}
                            </span>
                        </div>
                    ))}

                    <div className="flex flex-wrap items-stretch justify-center gap-2">
                        {pumps.map((pump) => {
                            return (
                                <div
                                    key={pump.id}
                                    className="relative flex-1 min-w-[90px] flex flex-col justify-center items-center px-3 py-2 bg-slate-50/30 border-2 border-blue-200 rounded-xl"
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

                                    <h4 className="text-sm text-center text-slate-600">
                                        {pump.name}
                                    </h4>
                                    <p className="text-lg text-center font-bold text-blue-600">
                                        {pump.value != null
                                            ? pump.value + ' ' + pump.unit
                                            : '-'}
                                    </p>
                                </div>
                            )
                        })}
                    </div>

                    <div className={`flex items-center mt-2 text-slate-400 ${edit ? 'justify-between' : 'justify-center'}`}>
                        <div className="flex items-center">
                            <BsClock className="h-4 w-4 mr-2" />
                            <span className="text-xs">
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
