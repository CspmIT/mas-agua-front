import { useState, useEffect } from 'react'
import { AddCircleOutline, AccessTime, Close } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    TextField,
    Typography,
} from '@mui/material'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import SelectVars from '../components/SelectVars'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate } from 'react-router-dom'
import HeaderForms from '../components/HeaderForms'
import ModalShell from '../../../components/ModalShell'

const shellSx = {
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.12)',
    p: { xs: 2, sm: 2.5 },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
}

const sectionSx = {
    borderRadius: '14px',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    backgroundColor: 'transparent',
    p: { xs: 1.75, sm: 2 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const itemCardSx = {
    position: 'relative',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    borderLeft: '3px solid #2c6aa0',
    p: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: '3px solid #2c6aa0',
    },
}

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 3,
    py: 1,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
}

const addPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(44, 106, 160, 0.4)',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.04)',
    '&:hover': {
        borderColor: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.1)',
    },
}

const ghostCancelSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(15, 42, 68, 0.14)',
    color: '#475569',
}

const SectionTitle = ({ children, right }) => (
    <div className='flex items-center justify-between px-1 -mt-0.5'>
        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
            {children}
        </div>
        {right}
    </div>
)

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

    const closeDialog = () => {
        setOpen(false)
        setNewName('')
        setVarId('')
    }

    const handleAdd = (type) => {
        if (!varId) {
            Swal.fire({
                icon: 'error',
                title: 'Atención',
                html: 'Debe agregar una variable para guardar',
            })
            return
        }
        if (type === 'state' && newName.trim()) {
            const newState = {
                id: Math.max(0, ...states.map((s) => s.id)) + 1,
                name: newName,
                varId: varId.id,
                value: null,
                unit: null,
                type: 'status',
            }
            setStates([...states, newState])
            closeDialog()
        }
        if (type === 'pump' && newName.trim()) {
            const newPump = {
                id: Math.max(0, ...pumps.map((p) => p.id)) + 1,
                name: newName,
                varId: varId.id,
                value: null,
                unit: null,
                type: 'pump',
            }
            setPumps([...pumps, newPump])
            closeDialog()
        }
    }

    const handleSave = async () => {
        if (pumps.length === 0 && states.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Atención',
                text: 'Debe enviar al menos una bomba o un estado',
            })
            return false
        }
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/bombs`
        try {
            const { data } = await request(url, 'POST', { pumps, title, states })
            await Swal.fire({
                icon: 'success',
                title: 'Éxito',
                html: `Se cargó con éxito el gráfico ${data.name}`,
            })
            navigate('/')
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `Ocurrió un error al querer cargar el gráfico. <br> ${error.message}`,
            })
        }
    }

    const handleRemovePump = (id) => setPumps(pumps.filter((p) => p.id !== id))
    const handleRemoveState = (id) => setStates(states.filter((s) => s.id !== id))

    if (!edit) {
        return (
            <Card className='w-full h-full !shadow-none'>
                <CardContent>
                    {states.map((item) => (
                        <div
                            key={item.id}
                            className='!bg-gray-100 border-2 border-gray-200 rounded-md relative flex justify-center items-center mb-2'
                        >
                            <Typography variant='h6' mx={1}>{item.name}: </Typography>
                            <Typography variant='h6' className={`font-bold ${item.color}`}>
                                {item.value ?? 'Sin datos'}
                            </Typography>
                        </div>
                    ))}
                    <div
                        className={`grid gap-1 ${
                            pumps.length === 1
                                ? 'grid-cols-1 justify-items-center'
                                : pumps.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3'
                        }`}
                    >
                        {pumps.map((pump) => (
                            <Card
                                key={pump.id}
                                className='!relative !bg-gray-100 border-2 border-gray-200 w-full max-w-sm'
                            >
                                <CardContent>
                                    <h4 className='text-md text-center font-small'>{pump.name}</h4>
                                    <p className='text-lg text-center font-bold text-blue-600'>
                                        {pump.value != null ? pump.value + ' ' + pump.unit : '-'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className='flex justify-between items-center mt-2 text-gray-500'>
                        <div className='flex items-center'>
                            <AccessTime sx={{ fontSize: 18, mr: 0.75 }} />
                            <span className='text-sm'>{new Date().toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <HeaderForms
                    idChart={false}
                    chart={{ name: title }}
                    backTo='/config/allGraphic'
                />

                <Box sx={shellSx}>
                    <div className='flex flex-col gap-3'>
                        <Box sx={sectionSx}>
                            <SectionTitle>Información</SectionTitle>
                            <TextField
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                label='Título del gráfico'
                                size='small'
                                fullWidth
                            />
                        </Box>

                        <Box sx={sectionSx}>
                            <SectionTitle
                                right={
                                    <span className='text-[11px] font-semibold text-slate-500 dark:text-gray-400'>
                                        {states.length} {states.length === 1 ? 'estado' : 'estados'}
                                    </span>
                                }
                            >
                                Estados
                            </SectionTitle>
                            {states.length === 0 ? (
                                <div className='text-center text-xs text-slate-500 dark:text-gray-400 py-3'>
                                    Aún no agregaste estados.
                                </div>
                            ) : (
                                <div className='flex flex-col gap-1.5'>
                                    {states.map((item) => (
                                        <Box key={item.id} sx={itemCardSx}>
                                            <div className='flex items-center justify-between gap-2'>
                                                <div className='flex items-center gap-2 min-w-0'>
                                                    <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-white bg-[#2c6aa0] px-2 py-0.5 rounded-full'>
                                                        Estado
                                                    </span>
                                                    <span className='text-sm font-medium text-slate-700 dark:text-gray-200 truncate'>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => handleRemoveState(item.id)}
                                                    sx={{ color: '#b91c1c' }}
                                                >
                                                    <Close fontSize='small' />
                                                </IconButton>
                                            </div>
                                        </Box>
                                    ))}
                                </div>
                            )}
                            <Button
                                variant='outlined'
                                sx={addPillSx}
                                startIcon={<AddCircleOutline sx={{ fontSize: 18 }} />}
                                onClick={() => {
                                    setType('state')
                                    setDialogText('Agregar nuevo estado')
                                    setOpen(true)
                                }}
                            >
                                Agregar estado
                            </Button>
                        </Box>

                        <Box sx={sectionSx}>
                            <SectionTitle
                                right={
                                    <span className='text-[11px] font-semibold text-slate-500 dark:text-gray-400'>
                                        {pumps.length} {pumps.length === 1 ? 'bomba' : 'bombas'}
                                    </span>
                                }
                            >
                                Bombas
                            </SectionTitle>
                            {pumps.length === 0 ? (
                                <div className='text-center text-xs text-slate-500 dark:text-gray-400 py-3'>
                                    Aún no agregaste bombas.
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                                    {pumps.map((pump) => (
                                        <Box key={pump.id} sx={itemCardSx}>
                                            <div className='flex items-center justify-between gap-2'>
                                                <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-white bg-[#2c6aa0] px-2 py-0.5 rounded-full'>
                                                    Bomba
                                                </span>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => handleRemovePump(pump.id)}
                                                    sx={{ color: '#b91c1c' }}
                                                >
                                                    <Close fontSize='small' />
                                                </IconButton>
                                            </div>
                                            <span className='text-sm font-medium text-slate-700 dark:text-gray-200 truncate'>
                                                {pump.name}
                                            </span>
                                        </Box>
                                    ))}
                                </div>
                            )}
                            <Button
                                variant='outlined'
                                sx={addPillSx}
                                startIcon={<AddCircleOutline sx={{ fontSize: 18 }} />}
                                onClick={() => {
                                    setType('pump')
                                    setDialogText('Agregar nueva bomba')
                                    setOpen(true)
                                }}
                            >
                                Agregar bomba
                            </Button>
                        </Box>

                        <div className='flex items-center justify-between gap-2 pt-1'>
                            <div className='flex items-center text-slate-500 dark:text-gray-400 text-xs'>
                                <AccessTime sx={{ fontSize: 16, mr: 0.75 }} />
                                <span>{new Date().toLocaleString()}</span>
                            </div>
                            <Button
                                variant='contained'
                                disableElevation
                                sx={primaryPillSx}
                                onClick={handleSave}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </Box>
            </Container>

            <ModalShell
                open={open}
                onClose={closeDialog}
                eyebrow={type === 'pump' ? 'Bomba' : 'Estado'}
                title={dialogText}
                maxWidth='440px'
                footer={
                    <>
                        <Button variant='outlined' sx={ghostCancelSx} onClick={closeDialog}>
                            Cancelar
                        </Button>
                        <Button
                            variant='contained'
                            disableElevation
                            sx={primaryPillSx}
                            onClick={() => handleAdd(type)}
                        >
                            Agregar
                        </Button>
                    </>
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 0.5 }}>
                    <TextField
                        size='small'
                        fullWidth
                        label='Nombre'
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <VarsProvider>
                        <SelectVars
                            setValueState={setVarId}
                            label='Seleccione una variable'
                        />
                    </VarsProvider>
                </Box>
            </ModalShell>
        </>
    )
}
