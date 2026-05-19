import {
	Box,
	Button,
	Chip,
	CircularProgress,
	IconButton,
	MenuItem,
	TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { varPLCSchema } from '../../ProfilePLC/schemas/varsPLC'
import { useEffect, useRef, useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'

const SectionHeader = ({ eyebrow, hint }) => (
	<div className='mb-1.5'>
		<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#5ea5f0]'>
			{eyebrow}
		</div>
		{hint && <div className='text-[11px] text-slate-500 dark:text-gray-400'>{hint}</div>}
	</div>
)

const sectionBoxSx = {
	border: '1px solid rgba(15, 42, 68, 0.06)',
	borderRadius: '10px',
	p: { xs: 1.25, sm: 1.5 },
	backgroundColor: 'transparent',
	'body.dark &': {
		backgroundColor: 'transparent',
		border: '1px solid rgba(255, 255, 255, 0.05)',
	},
}

const primarySx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	letterSpacing: '0.01em',
	px: 3,
	py: 1,
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
	transition: 'all 0.2s',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
		transform: 'translateY(-1px)',
	},
	'&.Mui-disabled': {
		background: 'rgba(148, 163, 184, 0.4)',
		boxShadow: 'none',
		color: '#ffffff',
	},
}

const outlinedSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 2.5,
	borderColor: 'rgba(15, 42, 68, 0.2)',
	color: '#2c6aa0',
	'&:hover': {
		borderColor: '#2c6aa0',
		backgroundColor: 'rgba(44, 106, 160, 0.06)',
	},
	'body.dark &': {
		borderColor: 'rgba(255, 255, 255, 0.15)',
		color: '#5ea5f0',
		'&:hover': {
			borderColor: '#5ea5f0',
			backgroundColor: 'rgba(94, 165, 240, 0.1)',
		},
	},
}

const ModalVarPLC = ({ open, setOpen, plcProfile = false, list = false }) => {
	const [points, setPoints] = useState([])
	const [variables, setVariables] = useState([])
	const [loadingSubmit, setLoadingSubmit] = useState(false)

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
			.map((b) => ({ value: b, label: `Byte ${b}` }))
	}

	const bitOptions = Array.from({ length: 8 }, (_, i) => ({
		value: i,
		label: `Bit ${i}`,
	}))

	const getAvailableBitsForVariable = (currentIndex, currentByte) => {
		if (currentByte === '') return bitOptions
		const usedBits = variables
			.filter((_, i) => i !== currentIndex && variables[i].byte === currentByte)
			.map((v) => parseInt(v.bit))
		return bitOptions.filter((bit) => !usedBits.includes(bit.value))
	}

	const addVariable = () => {
		const totalBytesDisponibles = generarOpcionesBytes().length
		const totalBitsDisponibles = totalBytesDisponibles * 8
		if (variables.length >= totalBitsDisponibles) {
			alert('Ya se han utilizado todos los bits disponibles en los rangos seleccionados.')
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

	const handleClose = () => setOpen(false)

	const addPoints = () => {
		const { startPoint, endPoint } = getValues()
		if (startPoint === undefined || startPoint === null) {
			setError('startPoint', { message: 'Debe ingresar un valor' })
			return
		}
		if (endPoint === undefined || endPoint === null) {
			setError('endPoint', { message: 'Debe ingresar un valor' })
			return
		}
		if (!Number.isInteger(startPoint) || startPoint < 0) {
			setError('startPoint', { message: 'Debe ser un entero positivo' })
			return
		}
		if (!Number.isInteger(endPoint) || endPoint < 0) {
			setError('endPoint', { message: 'Debe ser un entero positivo' })
			return
		}
		if (startPoint > endPoint) {
			setError('startPoint', { message: 'El inicio debe ser menor o igual al fin' })
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
			setValue('topic', plcProfile.topic)
			setValue('influx', plcProfile.influx)
			setValue('PLCModel', plcProfile.PLCModel)
			setValue('ip', plcProfile.ip)
			setValue('serviceName', plcProfile.serviceName)
			setValue('rack', plcProfile.rack)
			setValue('slot', plcProfile.slot)
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
		const url = plcProfile?.id ? `${endPoint}/plc/edit` : `${endPoint}/plc/create`
		try {
			const result = await request(url, 'POST', PLCConfig)
			const htmlContent = result.data.message
			await Swal.fire({ title: 'Exito', icon: 'success', html: htmlContent })
			reset()
			setPoints([])
			setVariables([])
			list()
			setOpen(false)
		} catch (error) {
			const errorMessages = error.response.data.message
			const htmlContent = errorMessages.map((element) => `<p>${element.message}</p>`).join('')
			Swal.fire({ title: 'Atención', icon: 'error', html: htmlContent })
			console.error(error.response.data.message)
		} finally {
			setLoadingSubmit(false)
		}
	}

	const submitLabel = loadingSubmit
		? 'Guardando...'
		: plcProfile
		? plcProfile.status === 2
			? 'Subir archivos'
			: 'Editar perfil'
		: 'Crear perfil'

	return (
		<ModalShell
			open={!!open}
			onClose={handleClose}
			eyebrow={plcProfile ? 'Editar perfil PLC' : 'Nuevo perfil PLC'}
			title='Configuración de PLC'
			subtitle='Define tópico, modelo, puntos de lectura y variables mapeadas'
			maxWidth='96vw'
			footer={
				<Button
					type='button'
					variant='contained'
					disableElevation
					disabled={loadingSubmit}
					onClick={handleSubmit(onSubmit)}
					startIcon={
						loadingSubmit && <CircularProgress size={16} color='inherit' />
					}
					sx={primarySx}
				>
					{submitLabel}
				</Button>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2 w-full'>
				{/* ── CONEXIÓN ── */}
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Conexión' />
					<div className='flex flex-wrap gap-2'>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='text'
							label='Tópico'
							error={!!errors.topic}
							helperText={errors.topic?.message}
							sx={{ flex: '2 1 280px' }}
							{...register('topic')}
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='text'
							label='Influx'
							select
							defaultValue={getValues('influx')}
							{...register('influx')}
							error={!!errors.influx}
							helperText={errors.influx?.message}
							sx={{ flex: '1 1 220px' }}
						>
							<MenuItem disabled value={''}></MenuItem>
							<MenuItem value={'Sensors_Morteros_Interna'}>Mas Agua Morteros</MenuItem>
							<MenuItem value={'Sensors_Externos'}>Mas Agua Externos</MenuItem>
							<MenuItem value={'externos'}>Energia Externos</MenuItem>
						</TextField>
					</div>
				</Box>

				{/* ── PLC ── */}
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Opciones del PLC' />
					<div className='flex flex-wrap gap-2 mb-2'>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='text'
							label='Modelo del PLC'
							select
							defaultValue={getValues('PLCModel')}
							{...register('PLCModel')}
							error={!!errors.PLCModel}
							helperText={errors.PLCModel?.message}
							sx={{ flex: '1 1 180px' }}
						>
							<MenuItem disabled value={''}></MenuItem>
							<MenuItem value={'LOGO_7'}>LOGO_7</MenuItem>
							<MenuItem value={'LOGO_8'}>LOGO_8</MenuItem>
							<MenuItem value={'S7_1200'}>S7_1200</MenuItem>
						</TextField>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='text'
							label='IP del PLC'
							error={!!errors.ip}
							helperText={errors.ip?.message}
							sx={{ flex: '1 1 180px' }}
							{...register('ip')}
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='text'
							label='Nombre del servicio'
							error={!!errors.serviceName}
							helperText={errors.serviceName?.message}
							sx={{ flex: '1 1 220px' }}
							{...register('serviceName')}
						/>
					</div>
					<div className='flex flex-wrap gap-2'>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='number'
							label='RACK'
							error={!!errors.rack}
							helperText={errors.rack?.message}
							sx={{ flex: '1 1 140px' }}
							{...register('rack')}
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='number'
							label='SLOT'
							error={!!errors.slot}
							helperText={errors.slot?.message}
							sx={{ flex: '1 1 140px' }}
							{...register('slot')}
						/>
					</div>
				</Box>

				{/* ── PUNTOS ── */}
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Puntos de las variables' hint='Rangos de bytes a leer.' />
					<div className='flex flex-wrap gap-2 items-start mb-2'>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='number'
							label='Inicio'
							error={!!errors.startPoint}
							helperText={errors.startPoint?.message}
							sx={{ flex: '1 1 140px' }}
							{...register('startPoint', { valueAsNumber: true })}
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							size='small'
							type='number'
							label='Fin'
							error={!!errors.endPoint}
							helperText={errors.endPoint?.message}
							sx={{ flex: '1 1 140px' }}
							{...register('endPoint', { valueAsNumber: true })}
						/>
						<Button variant='outlined' size='small' onClick={addPoints} sx={{ ...outlinedSx, py: 0.4 }}>
							+ Agregar rango
						</Button>
					</div>

					{points.length > 0 && (
						<Box
							sx={{
								p: 1,
								borderRadius: '8px',
								backgroundColor: 'rgba(44, 106, 160, 0.04)',
								border: '1px dashed rgba(44, 106, 160, 0.22)',
								'body.dark &': {
									backgroundColor: 'rgba(94, 165, 240, 0.05)',
									border: '1px dashed rgba(94, 165, 240, 0.28)',
								},
							}}
						>
							<div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400 mb-1'>
								Rangos agregados
							</div>
							<div className='flex flex-wrap gap-1.5'>
								{points.map((punto, index) => (
									<Chip
										key={index}
										label={`[${punto.startPoint} — ${punto.endPoint}]`}
										onDelete={() => removePoint(index)}
										deleteIcon={<FaTrash style={{ fontSize: 10 }} />}
										sx={{
											height: 24,
											fontSize: '0.75rem',
											fontWeight: 600,
											backgroundColor: 'rgba(54, 139, 237, 0.14)',
											color: '#1e3a8a',
											border: '1px solid rgba(54, 139, 237, 0.25)',
											'& .MuiChip-deleteIcon': { color: '#e11d48', marginRight: '6px' },
											'body.dark &': {
												backgroundColor: 'rgba(94, 165, 240, 0.2)',
												color: '#c7dafe',
												border: '1px solid rgba(94, 165, 240, 0.3)',
											},
										}}
									/>
								))}
							</div>
						</Box>
					)}
				</Box>

				{/* ── VARIABLES ── */}
				{points.length > 0 && (
					<Box sx={sectionBoxSx}>
						<div className='flex justify-between items-center mb-1.5 flex-wrap gap-2'>
							<SectionHeader eyebrow='Variables' hint='Bit del byte → tipo y field.' />
							<Button
								variant='outlined'
								size='small'
								onClick={addVariable}
								disabled={variables.length >= generarOpcionesBytes().length * 8}
								sx={{ ...outlinedSx, py: 0.4 }}
							>
								+ Agregar variable
							</Button>
						</div>

						<div ref={containerRef} className='max-h-[280px] overflow-y-auto pr-1 flex flex-col gap-1.5'>
							{variables.map((variable, index) => (
								<Box
									key={index}
									sx={{
										display: 'flex',
										gap: 1,
										alignItems: 'center',
										flexWrap: 'wrap',
										p: 0.75,
										borderRadius: '8px',
										backgroundColor: '#ffffff',
										border: '1px solid rgba(15, 42, 68, 0.08)',
										borderLeft: '3px solid #2c6aa0',
										transition: 'all 0.2s',
										'&:hover': {
											boxShadow: '0 4px 12px -4px rgba(15, 42, 68, 0.12)',
										},
										'body.dark &': {
											backgroundColor: 'rgba(31, 41, 55, 0.5)',
											border: '1px solid rgba(255, 255, 255, 0.06)',
											borderLeft: '3px solid #5ea5f0',
										},
									}}
								>
									<TextField
										InputLabelProps={{ shrink: true }}
										size='small'
										select
										label='Byte'
										value={variable.byte}
										onChange={(e) => updateVariable(index, 'byte', e.target.value)}
										sx={{ flex: '1 1 110px' }}
									>
										{generarOpcionesBytes().map((opt) => (
											<MenuItem key={opt.value} value={opt.value}>
												{opt.label}
											</MenuItem>
										))}
									</TextField>
									<TextField
										InputLabelProps={{ shrink: true }}
										size='small'
										select
										label='Bit'
										value={variable.bit}
										onChange={(e) => updateVariable(index, 'bit', e.target.value)}
										sx={{ flex: '1 1 90px' }}
									>
										{getAvailableBitsForVariable(index, variable.byte).map((opt) => (
											<MenuItem key={opt.value} value={opt.value}>
												{opt.label}
											</MenuItem>
										))}
									</TextField>
									<TextField
										InputLabelProps={{ shrink: true }}
										size='small'
										select
										label='Tipo'
										value={variable.type}
										onChange={(e) => updateVariable(index, 'type', e.target.value)}
										sx={{ flex: '1 1 130px' }}
									>
										<MenuItem value='BOOL'>BOOL</MenuItem>
										<MenuItem value='BYTE'>BYTE</MenuItem>
										<MenuItem value='INT'>INT</MenuItem>
										<MenuItem value='UINT'>UNSIGNED INT</MenuItem>
										<MenuItem value='FLOAT'>FLOAT</MenuItem>
										<MenuItem value='STRING'>STRING</MenuItem>
										<MenuItem value='LONG'>LONG</MenuItem>
										<MenuItem value='ULONG'>UNSIGNED LONG</MenuItem>
										<MenuItem value='DOUBLE'>DOUBLE</MenuItem>
									</TextField>
									<TextField
										InputLabelProps={{ shrink: true }}
										size='small'
										label='Field'
										value={variable.field}
										onChange={(e) => updateVariable(index, 'field', e.target.value)}
										sx={{ flex: '2 1 180px' }}
									/>
									<IconButton
										size='small'
										onClick={() => removeVariable(index)}
										sx={{
											color: '#e11d48',
											borderRadius: '10px',
											'&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.12)' },
										}}
									>
										<FaTrash style={{ fontSize: 14 }} />
									</IconButton>
								</Box>
							))}
							{variables.length === 0 && (
								<div className='text-center text-xs text-slate-400 dark:text-gray-500 py-2'>
									Aún no agregaste variables
								</div>
							)}
						</div>
					</Box>
				)}
			</form>
		</ModalShell>
	)
}

export default ModalVarPLC
