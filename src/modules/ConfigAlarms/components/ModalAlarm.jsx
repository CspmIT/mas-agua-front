import { useState, useEffect } from 'react'
import {
	Box,
	TextField,
	MenuItem,
	Button,
	CircularProgress,
	FormControlLabel,
	Switch,
	FormControl,
	InputLabel,
	Select,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'
import ModalShell from '../../../components/ModalShell'

const emptyForm = {
	name: '',
	id_influxvars: '',
	id_bit: null,
	condition: '',
	value: '',
	value2: '',
	repeatInterval: 0,
	type: 'single',
	logicOperator: 'AND',
	secondaryVariableId: '',
	secondary_id_bit: null,
	secondaryCondition: '',
	secondaryValue: '',
	hasTimeRange: false,
	startime: '',
	endtime: '',
}

const sectionBoxSx = {
	backgroundColor: 'transparent',
	border: '1px solid rgba(15, 42, 68, 0.06)',
	borderRadius: '10px',
	p: { xs: 1.25, sm: 1.5 },
	'body.dark &': {
		border: '1px solid rgba(255, 255, 255, 0.06)',
	},
}

const primarySaveSx = {
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	color: '#ffffff',
	textTransform: 'none',
	fontWeight: 600,
	px: 2.5,
	py: 0.75,
	borderRadius: '999px',
	boxShadow: '0 6px 14px -6px rgba(31, 78, 121, 0.55)',
	transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		transform: 'translateY(-1px)',
		boxShadow: '0 10px 22px -8px rgba(31, 78, 121, 0.65)',
		filter: 'brightness(1.03)',
	},
	'&:disabled': {
		background: 'linear-gradient(135deg, #6b8faf 0%, #547394 100%)',
		color: 'rgba(255, 255, 255, 0.8)',
	},
}

const secondarySx = {
	color: '#475569',
	textTransform: 'none',
	fontWeight: 500,
	px: 2,
	py: 0.75,
	borderRadius: '999px',
	'&:hover': { backgroundColor: 'rgba(15, 42, 68, 0.06)' },
	'body.dark &': {
		color: '#cbd5e1',
		'&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
	},
}

function SectionHeader({ eyebrow, title, hint }) {
	return (
		<div className='mb-1.5'>
			<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0]/80 dark:text-[#5ea5f0]/90'>
				{eyebrow}
			</div>
			{title && (
				<div className='text-sm font-semibold text-slate-800 dark:text-gray-100 leading-tight'>
					{title}
				</div>
			)}
			{hint && <div className='text-[11px] text-slate-500 dark:text-gray-400'>{hint}</div>}
		</div>
	)
}

const ModalAlarm = ({ openModal, setOpenModal, onSuccess, alarmData }) => {
	const [loading, setLoading] = useState(false)
	const [variables, setVariables] = useState([])
	const [form, setForm] = useState(emptyForm)

	const primaryVar = variables.find((v) => v.id === Number(form.id_influxvars)) ?? null
	const secondaryVar = variables.find((v) => v.id === Number(form.secondaryVariableId)) ?? null

	const primaryIsBinary = primaryVar?.binary_compressed ?? false
	const secondaryIsBinary = secondaryVar?.binary_compressed ?? false

	useEffect(() => {
		if (alarmData) {
			setForm({
				name: alarmData.name || '',
				id_influxvars: alarmData.id_influxvars || '',
				id_bit: alarmData.id_bit ?? null,
				condition: alarmData.condition || '',
				value: alarmData.value ?? '',
				value2: alarmData.value2 ?? '',
				repeatInterval: alarmData.repeatInterval ?? 0,
				type: alarmData.type || 'single',
				logicOperator: alarmData.logicOperator || 'AND',
				secondaryVariableId: alarmData.secondaryVariableId || '',
				secondary_id_bit: alarmData.secondary_id_bit ?? null,
				secondaryCondition: alarmData.secondaryCondition || '',
				secondaryValue: alarmData.secondaryValue || '',
				hasTimeRange: !!(alarmData.startime && alarmData.endtime),
				startime: alarmData.startime || '',
				endtime: alarmData.endtime || '',
			})
		} else {
			setForm(emptyForm)
		}
	}, [alarmData, openModal])

	useEffect(() => {
		if (openModal) {
			getVarsInflux().then(setVariables)
		}
	}, [openModal])

	const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

	const handlePrimaryVarChange = (id) => {
		setForm((prev) => ({ ...prev, id_influxvars: id, id_bit: null }))
	}

	const handleSecondaryVarChange = (id) => {
		setForm((prev) => ({ ...prev, secondaryVariableId: id, secondary_id_bit: null }))
	}

	const handleClose = () => {
		setForm(emptyForm)
		setOpenModal(false)
	}

	const handleSubmit = async (e) => {
		e?.preventDefault?.()

		if (primaryIsBinary && !form.id_bit) {
			Swal.fire('Error', 'Debe seleccionar un bit para la variable principal', 'error')
			return
		}
		if (form.type === 'combined' && secondaryIsBinary && !form.secondary_id_bit) {
			Swal.fire('Error', 'Debe seleccionar un bit para la variable secundaria', 'error')
			return
		}

		setLoading(true)
		try {
			const url = backend[import.meta.env.VITE_APP_NAME]
			const payload = { ...form }

			if (form.condition !== 'entre') delete payload.value2

			if (form.type === 'single') {
				delete payload.secondaryVariableId
				delete payload.secondaryCondition
				delete payload.secondaryValue
				delete payload.logicOperator
				delete payload.secondary_id_bit
			}

			if (!form.hasTimeRange) {
				delete payload.startime
				delete payload.endtime
				delete payload.hasTimeRange
			}

			if (!primaryIsBinary) payload.id_bit = null
			if (!secondaryIsBinary) payload.secondary_id_bit = null

			if (alarmData?.id) {
				await request(`${url}/updateAlarm/${alarmData.id}`, 'PUT', payload)
				await Swal.fire({
					showConfirmButton: false,
					timer: 1500,
					icon: 'success',
					text: 'Alarma editada correctamente',
				})
			} else {
				await request(`${url}/createAlarm`, 'POST', payload)
				await Swal.fire({
					showConfirmButton: false,
					timer: 1500,
					icon: 'success',
					text: 'Alarma creada correctamente',
				})
			}

			onSuccess?.()
			handleClose()
		} catch (err) {
			console.error(err)
			Swal.fire('Error', 'No se pudo guardar la alarma', 'error')
		} finally {
			setLoading(false)
		}
	}

	const isEdit = !!alarmData?.id

	return (
		<ModalShell
			open={openModal}
			onClose={handleClose}
			eyebrow={isEdit ? 'Editar alarma' : 'Nueva alarma'}
			title='Configuración de alarma'
			subtitle='Define condiciones, umbrales y horarios de activación'
			maxWidth='88vw'
			footer={
				<>
					<Button onClick={handleClose} disabled={loading} sx={secondarySx}>
						Cancelar
					</Button>
					<Button
						type='submit'
						form='alarm-form'
						disabled={loading}
						startIcon={
							loading ? (
								<CircularProgress size={16} sx={{ color: 'inherit' }} />
							) : (
								<Save sx={{ fontSize: 18 }} />
							)
						}
						sx={primarySaveSx}
					>
						{loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear alarma'}
					</Button>
				</>
			}
		>
			<form id='alarm-form' onSubmit={handleSubmit} className='flex flex-col gap-2'>
				{/* INFO BÁSICA */}
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Información' title='Identificación y modo' />
					<div className='flex flex-wrap gap-2 items-center'>
						<TextField
							label='Nombre'
							value={form.name}
							onChange={(e) => handleChange('name', e.target.value)}
							required
							size='small'
							sx={{ flex: '2 1 240px' }}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={form.type === 'combined'}
									onChange={(e) =>
										handleChange('type', e.target.checked ? 'combined' : 'single')
									}
								/>
							}
							label='Alarma combinada'
							sx={{ ml: 0.5 }}
						/>
						<TextField
							type='number'
							label='Repetición (min)'
							value={form.repeatInterval || ''}
							onChange={(e) => handleChange('repeatInterval', e.target.value)}
							required
							inputProps={{ min: 0 }}
							size='small'
							sx={{ flex: '1 1 160px' }}
						/>
					</div>
				</Box>

				{/* CONDICIÓN PRINCIPAL */}
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Condición principal' title='Variable y umbral a monitorear' />
					<div className='flex flex-wrap gap-2'>
						<TextField
							label='Variable'
							select
							value={form.id_influxvars}
							onChange={(e) => handlePrimaryVarChange(e.target.value)}
							required
							size='small'
							sx={{ flex: '2 1 220px' }}
						>
							<MenuItem value=''>Seleccioná una variable</MenuItem>
							{variables.map((v) => (
								<MenuItem key={v.id} value={v.id}>
									{v.name}
								</MenuItem>
							))}
						</TextField>

						{primaryIsBinary && (
							<FormControl size='small' required sx={{ flex: '2 1 220px' }}>
								<InputLabel>Bit de la variable</InputLabel>
								<Select
									value={form.id_bit ?? ''}
									label='Bit de la variable'
									onChange={(e) => handleChange('id_bit', e.target.value)}
								>
									<MenuItem value='' disabled>
										Seleccioná un bit
									</MenuItem>
									{(primaryVar?.bits ?? []).map((b) => (
										<MenuItem key={b.id} value={b.id}>
											{b.name} (bit {b.bit})
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}

						<TextField
							label='Condición'
							select
							value={form.condition}
							onChange={(e) => handleChange('condition', e.target.value)}
							required
							size='small'
							sx={{ flex: '1 1 150px' }}
						>
							<MenuItem value='>'>Mayor que</MenuItem>
							<MenuItem value='<'>Menor que</MenuItem>
							<MenuItem value='='>Igual a</MenuItem>
							<MenuItem value='>='>Mayor o igual</MenuItem>
							<MenuItem value='<='>Menor o igual</MenuItem>
							<MenuItem value='entre'>Entre</MenuItem>
						</TextField>

						<TextField
							type='number'
							label='Valor'
							value={form.value}
							onChange={(e) => handleChange('value', e.target.value)}
							required
							size='small'
							sx={{ flex: '1 1 120px' }}
						/>

						{form.condition === 'entre' && (
							<TextField
								type='number'
								label='Valor 2'
								value={form.value2}
								onChange={(e) => handleChange('value2', e.target.value)}
								required
								size='small'
								sx={{ flex: '1 1 120px' }}
							/>
						)}
					</div>
				</Box>

				{/* CONDICIÓN SECUNDARIA */}
				{form.type === 'combined' && (
					<Box
						sx={{
							...sectionBoxSx,
							borderColor: 'rgba(54, 139, 237, 0.25)',
							'body.dark &': { borderColor: 'rgba(94, 165, 240, 0.25)' },
						}}
					>
						<SectionHeader
							eyebrow='Condición secundaria'
							title='Segunda variable para combinar'
							hint={`Ambas condiciones se evalúan con el operador ${form.logicOperator}`}
						/>
						<div className='flex flex-wrap gap-2'>
							<TextField
								label='Operador lógico'
								select
								value={form.logicOperator}
								onChange={(e) => handleChange('logicOperator', e.target.value)}
								size='small'
								sx={{ flex: '1 1 140px' }}
							>
								<MenuItem value='AND'>AND (y)</MenuItem>
								<MenuItem value='OR'>OR (o)</MenuItem>
							</TextField>

							<TextField
								label='Variable secundaria'
								select
								value={form.secondaryVariableId}
								onChange={(e) => handleSecondaryVarChange(e.target.value)}
								required
								size='small'
								sx={{ flex: '2 1 220px' }}
							>
								<MenuItem value=''>Seleccioná una variable</MenuItem>
								{variables.map((v) => (
									<MenuItem key={v.id} value={v.id}>
										{v.name}
									</MenuItem>
								))}
							</TextField>

							{secondaryIsBinary && (
								<FormControl size='small' required sx={{ flex: '2 1 220px' }}>
									<InputLabel>Bit de la variable secundaria</InputLabel>
									<Select
										value={form.secondary_id_bit ?? ''}
										label='Bit de la variable secundaria'
										onChange={(e) => handleChange('secondary_id_bit', e.target.value)}
									>
										<MenuItem value='' disabled>
											Seleccioná un bit
										</MenuItem>
										{(secondaryVar?.bits ?? []).map((b) => (
											<MenuItem key={b.id} value={b.id}>
												{b.name} (bit {b.bit})
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}

							<TextField
								label='Condición'
								select
								value={form.secondaryCondition}
								onChange={(e) => handleChange('secondaryCondition', e.target.value)}
								required
								size='small'
								sx={{ flex: '1 1 150px' }}
							>
								<MenuItem value='>'>Mayor que</MenuItem>
								<MenuItem value='<'>Menor que</MenuItem>
								<MenuItem value='='>Igual a</MenuItem>
								<MenuItem value='>='>Mayor o igual</MenuItem>
								<MenuItem value='<='>Menor o igual</MenuItem>
							</TextField>

							<TextField
								type='number'
								label='Valor'
								value={form.secondaryValue}
								onChange={(e) => handleChange('secondaryValue', e.target.value)}
								required
								size='small'
								sx={{ flex: '1 1 120px' }}
							/>
						</div>
					</Box>
				)}

				{/* HORARIO */}
				<Box sx={sectionBoxSx}>
					<SectionHeader
						eyebrow='Horario'
						title='Restringir a un rango horario (opcional)'
					/>
					<div className='flex flex-wrap gap-2 items-center'>
						<FormControlLabel
							control={
								<Switch
									checked={form.hasTimeRange}
									onChange={(e) => {
										const checked = e.target.checked
										setForm((prev) => ({
											...prev,
											hasTimeRange: checked,
											startime: checked ? prev.startime || '00:00' : '',
											endtime: checked ? prev.endtime || '23:59' : '',
										}))
									}}
								/>
							}
							label='Activar rango horario'
						/>
						{form.hasTimeRange && (
							<>
								<TextField
									type='time'
									label='Desde'
									value={form.startime}
									onChange={(e) => handleChange('startime', e.target.value)}
									required
									size='small'
									sx={{ flex: '1 1 140px' }}
								/>
								<TextField
									type='time'
									label='Hasta'
									value={form.endtime}
									onChange={(e) => handleChange('endtime', e.target.value)}
									required
									size='small'
									sx={{ flex: '1 1 140px' }}
								/>
							</>
						)}
					</div>
				</Box>
			</form>
		</ModalShell>
	)
}

export default ModalAlarm
