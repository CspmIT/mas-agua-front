import { Box, Button, FormControlLabel, IconButton, MenuItem, Switch, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import Calculadora from './Calculator'
import CalculatorVars from './ClculatorVars'
import { useForm } from 'react-hook-form'
import { useVars } from './ProviderVars'
import Swal from 'sweetalert2'
import { request } from '../../utils/js/request'
import { backend } from '../../utils/routes/app.routes'
import LoaderComponent from '../Loader'
import { Close, Save } from '@mui/icons-material'
import BitCalcVarModal from './BitCalcVarModal'

const SectionHeader = ({ eyebrow, title, hint }) => (
	<div className='mb-1.5'>
		<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#5ea5f0]'>
			{eyebrow}
		</div>
		{title && <div className='text-sm font-medium text-slate-700 dark:text-gray-200'>{title}</div>}
		{hint && <div className='text-[11px] text-slate-500 dark:text-gray-400'>{hint}</div>}
	</div>
)

const sectionBoxSx = {
	border: '1px solid rgba(15, 42, 68, 0.06)',
	borderRadius: '10px',
	p: { xs: 1.25, sm: 1.5 },
	backgroundColor: 'transparent',
	transition: 'border-color 0.2s',
	'body.dark &': {
		backgroundColor: 'transparent',
		border: '1px solid rgba(255, 255, 255, 0.05)',
	},
}

const primarySaveSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	letterSpacing: '0.01em',
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
	'&:active': { transform: 'translateY(0)' },
}

const DataGenerator = ({ handleClose, data = null, onSaved }) => {
	const [requireCalc, setRequireCalc] = useState(false)
	const [binaryCompressed, setBinaryCompressed] = useState(data?.binary_compressed || false);
	const [bits, setBits] = useState(data?.binary_compressed ? data.bits ?? [] : []);
	const [isBitCalcVar, setIsBitCalcVar] = useState(false);
	const [display, setDisplay] = useState([])
	const {
		register,
		formState: { errors },
		handleSubmit,
		setValue,
	} = useForm()

	const handleRquiredCalc = () => {
		setRequireCalc(prev => !prev);
		setBinaryCompressed(false);
		setBits([]);
		setIsBitCalcVar(false);
		dispatch({ type: "SET_EQUATION", payload: [] });
		dispatch({ type: "SET_CALC_VAR", payload: [] });
	};


	const handleBinaryCompressed = () => {
		setBinaryCompressed(prev => !prev);
		setIsBitCalcVar(false);
		// Limpiamos fórmula si estaba prendida
		if (requireCalc) {
			setRequireCalc(false);
			setDisplay([]);
			dispatch({ type: "SET_EQUATION", payload: null });
			dispatch({ type: "SET_CALC_VAR", payload: [] });
		}
	};

	const handleBitCalcVar = () => {
		setIsBitCalcVar(prev => !prev);
		// Limpiar los otros modos
		if (requireCalc) {
			setRequireCalc(false);
			dispatch({ type: "SET_EQUATION", payload: [] });
			dispatch({ type: "SET_CALC_VAR", payload: [] });
		}
		if (binaryCompressed) {
			setBinaryCompressed(false);
			setBits([]);
		}
	};

	useEffect(() => {
		if (requireCalc) {
			setValue('topic', '')
			setValue('field', '')
			setValue('time', '')
			setValue('unit', '')
			setValue('unit_topic', '')
			setValue('period', '')
			setValue('unit_period', '')
			setValue('type_period', '')
		}
	}, [requireCalc])
	const [state, dispatch] = useVars()
	const isValidFormula = display.length
	const onSubmit = async (data) => {

		try {
			if (requireCalc) {
				if (state.calcVars.length === 0) {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Debe generar la formula de la variable para poder guardarla',
					})
					return false
				}
				// Valido que display tenga la variable del calculo
				if (!isValidFormula) {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Debe existir al menos una variable en la formula',
					})
					return false
				}
			}
			LoaderComponent({ image: false })

			const dataConsult = requireCalc
				? state.calcVars.reduce((acc, val) => {
					if (!acc?.[val.calc_name_var]) acc[val.calc_name_var] = {}
					acc[val.calc_name_var] = {
						calc_topic: val.calc_topic,
						calc_field: val.calc_field,
						calc_time: val.calc_time,
						calc_unit: val.calc_unit,
						calc_unit_topic: val.calc_unit_topic,
						calc_period: val.calc_period,
						calc_unit_period: val.calc_unit_period,
						calc_type_period: val.calc_type_period,
					}
					return acc
				}, {})
				: {
					[data.name_var]: {
						calc_topic: data.topic,
						calc_field: data.field,
						calc_time: data.time,
						calc_unit: data.unit_topic,
						calc_period: data.period,
						calc_unit_period: data.unit_period,
						calc_type_period: data.type_period,
					},
				}
			const dataReturn = {
				id: data.id || 0,
				name: data.name_var,
				unit: data.unit,
				type: data.type_var,
				calc: requireCalc,
				varsInflux: dataConsult,
				process: data.process,
				equation: state?.equation || null,
				binary_compressed: binaryCompressed || isBitCalcVar,
				bits: binaryCompressed ? bits.map(b => ({ id: b.id, name: b.name, bit: b.bit })) : [],
				decimales: Number.isInteger(Number(data.decimales)) ? Number(data.decimales) : 1,
			}

			await request(`${backend[import.meta.env.VITE_APP_NAME]}/saveVariable`, 'POST', dataReturn)

			if (onSaved) onSaved();

			if (handleClose) {
				handleClose()
			}

			Swal.fire({
				icon: 'success',
				title: 'Perfecto!',
				text: 'La variable se guardo correctamente',
			})
		} catch (error) {
			console.error(error)
			Swal.fire({
				icon: 'warning',
				title: 'Atención!',
				text: `Hubo un problema al guardar.`,
			})
		}
	}
	const setData = async () => {
		setValue('id', data?.id || 0)
		setValue('name_var', data?.name)
		setValue('unit', data?.unit)
		setValue('process', data?.process)
		setValue('type_var', data?.type)
		setValue('decimales', data?.decimales ?? 1)
		if (data?.calc) {
			setDisplay(data?.equation)
			handleRquiredCalc()
		}
		if (!data.calc) {
			setValue('topic', data?.varsInflux?.[data.name]?.calc_topic)
			setValue('field', data?.varsInflux?.[data.name]?.calc_field)
			setValue('time', data?.varsInflux?.[data.name]?.calc_time)
			setValue('unit_topic', data?.varsInflux?.[data.name]?.calc_unit)
			setValue('period', data?.varsInflux?.[data.name]?.calc_period)
			setValue('unit_period', data?.varsInflux?.[data.name]?.calc_unit_period)
			setValue('type_period', data?.varsInflux?.[data.name]?.calc_type_period)
		} else {
			const vars = Object.keys(data?.varsInflux).reduce((acc, val) => {
				acc.push({
					calc_name_var: val,
					calc_topic: data?.varsInflux[val].calc_topic,
					calc_field: data?.varsInflux[val].calc_field,
					calc_time: data?.varsInflux[val].calc_time,
					calc_unit_topic: data?.varsInflux[val].calc_unit_topic,
					calc_period: data?.varsInflux[val].calc_period,
					calc_unit_period: data?.varsInflux[val].calc_unit_period,
					calc_type_period: data?.varsInflux[val].calc_type_period,
				})
				return acc
			}, [])
			dispatch({ type: 'SET_CALC_VAR', payload: vars })
			dispatch({ type: 'SET_EQUATION', payload: data?.equation })
		}
	}
	useEffect(() => {
		if (data) {
			setData()
		}
	}, [data])

	return (
		<div className='flex flex-col gap-2 w-full'>
			{/* ── INFORMACIÓN BÁSICA ── */}
			<Box sx={sectionBoxSx}>
				<SectionHeader eyebrow='Información básica' />
				<div className='flex flex-wrap gap-2'>
					<TextField type='hidden' className='!hidden' {...register('id')} />
					<TextField
						type='text'
						label='Nombre de variable'
						{...register('name_var', { required: 'Este campo es requerido' })}
						error={!!errors.name_var}
						helperText={errors.name_var && errors.name_var.message}
						size='small'
						sx={{ flex: '2 1 220px' }}
					/>
					<TextField
						type='text'
						label='Proceso'
						{...register('process', { required: 'Este campo es requerido' })}
						error={!!errors.process}
						helperText={errors.process && errors.process.message}
						size='small'
						sx={{ flex: '1 1 180px' }}
					/>
					<TextField
						type='text'
						label='Unidad de medida'
						{...register('unit', { required: 'Este campo es requerido' })}
						error={!!errors.unit}
						helperText={errors.unit && errors.unit.message}
						size='small'
						sx={{ flex: '1 1 140px' }}
					/>
					<TextField
						type='number'
						label='Decimales'
						defaultValue={data?.decimales ?? 1}
						inputProps={{ min: 0, max: 6, step: 1 }}
						{...register('decimales', {
							required: 'Este campo es requerido',
							valueAsNumber: true,
							min: { value: 0, message: 'Mínimo 0' },
							max: { value: 6, message: 'Máximo 6' },
							validate: (v) => Number.isInteger(Number(v)) || 'Debe ser un entero',
						})}
						error={!!errors.decimales}
						helperText={errors.decimales && errors.decimales.message}
						size='small'
						sx={{ flex: '1 1 120px' }}
					/>
					<TextField
						select
						label='Tipo de variable'
						{...register('type_var', { required: 'Este campo es requerido' })}
						error={!!errors.type_var}
						helperText={errors.type_var && errors.type_var.message}
						defaultValue={data?.type || 'last'}
						size='small'
						sx={{ flex: '1 1 160px' }}
					>
						<MenuItem value='last'>Instantánea</MenuItem>
						<MenuItem value='history'>Histórico</MenuItem>
					</TextField>
				</div>
			</Box>

			{/* ── MODO DE VARIABLE ── */}
			<Box sx={sectionBoxSx}>
				<SectionHeader eyebrow='Modo de variable' />
				<div className='flex flex-wrap gap-x-3 gap-y-0'>
					<FormControlLabel
						control={<Switch checked={requireCalc} />}
						label='Requiere cálculo'
						onChange={handleRquiredCalc}
						sx={{ m: 0 }}
					/>
					<FormControlLabel
						control={<Switch checked={binaryCompressed} />}
						label='Binaria comprimida'
						onChange={handleBinaryCompressed}
						sx={{ m: 0 }}
					/>
					<FormControlLabel
						control={<Switch checked={isBitCalcVar} />}
						label='Cálculo de bits comprimidos'
						onChange={handleBitCalcVar}
						sx={{ m: 0 }}
					/>
				</div>
			</Box>

			{/* ── CONFIGURACIÓN INFLUX ── */}
			{!requireCalc && (
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Configuración Influx' />
					<div className='flex flex-wrap gap-2 mb-2'>
						<TextField
							type='text'
							label='Tópico'
							{...register('topic', { required: 'Este campo es requerido' })}
							error={!!errors.topic}
							helperText={errors.topic && errors.topic.message}
							size='small'
							sx={{ flex: '2 1 260px' }}
						/>
						<TextField
							type='text'
							label='Field'
							{...register('field', { required: 'Este campo es requerido' })}
							error={!!errors.field}
							helperText={errors.field && errors.field.message}
							size='small'
							sx={{ flex: '1 1 180px' }}
						/>
					</div>
					<div className='flex flex-wrap gap-3'>
						<TextField
							type='number'
							label='Tiempo de consulta'
							{...register('time', {
								required: 'Este campo es requerido',
								pattern: { value: /^[0-9]+$/, message: 'Solo se permiten números' },
							})}
							error={!!errors.time}
							helperText={errors.time && errors.time.message}
							size='small'
							sx={{ flex: '1 1 140px' }}
						/>
						<TextField
							select
							label='Unidad'
							{...register('unit_topic', { required: 'Este campo es requerido' })}
							error={!!errors.unit_topic}
							helperText={errors.unit_topic && errors.unit_topic.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_unit || 'ms'}
							size='small'
							sx={{ flex: '1 1 120px' }}
						>
							<MenuItem value='ms'>Milisegundos</MenuItem>
							<MenuItem value='s'>Segundos</MenuItem>
							<MenuItem value='m'>Minutos</MenuItem>
							<MenuItem value='h'>Horas</MenuItem>
							<MenuItem value='d'>Días</MenuItem>
							<MenuItem value='mo'>Mes</MenuItem>
							<MenuItem value='y'>Año</MenuItem>
						</TextField>
						<TextField
							type='number'
							label='Período de muestreo'
							{...register('period', {
								required: 'Este campo es requerido',
								pattern: { value: /^[0-9]+$/, message: 'Solo se permiten números' },
							})}
							error={!!errors.period}
							helperText={errors.period && errors.period.message}
							size='small'
							sx={{ flex: '1 1 140px' }}
						/>
						<TextField
							select
							label='Unidad período'
							{...register('unit_period', { required: 'Este campo es requerido' })}
							error={!!errors.unit_period}
							helperText={errors.unit_period && errors.unit_period.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_unit_period || 'ms'}
							size='small'
							sx={{ flex: '1 1 120px' }}
						>
							<MenuItem value='ms'>Milisegundos</MenuItem>
							<MenuItem value='s'>Segundos</MenuItem>
							<MenuItem value='m'>Minutos</MenuItem>
							<MenuItem value='h'>Horas</MenuItem>
							<MenuItem value='d'>Días</MenuItem>
							<MenuItem value='mo'>Mes</MenuItem>
							<MenuItem value='y'>Año</MenuItem>
						</TextField>
						<TextField
							select
							label='Tipo de período'
							{...register('type_period', { required: 'Este campo es requerido' })}
							error={!!errors.type_period}
							helperText={errors.type_period && errors.type_period.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_type_period || 'last'}
							size='small'
							sx={{ flex: '1 1 140px' }}
						>
							<MenuItem value='last'>Último</MenuItem>
							<MenuItem value='mean'>Promedio</MenuItem>
							<MenuItem value='max'>Máximo</MenuItem>
							<MenuItem value='min'>Mínimo</MenuItem>
						</TextField>
					</div>
				</Box>
			)}

			{/* ── BITS COMPRIMIDOS ── */}
			{binaryCompressed && (
				<Box sx={sectionBoxSx}>
					<SectionHeader eyebrow='Bits comprimidos' hint='Máximo 8. Nombre + posición (0-7).' />
					<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
						{Array.from({ length: Math.min(bits.length, 8) }).map((_, i) => {
							const b = bits[i]
							return (
								<div key={i} className='flex gap-2 items-center'>
									<TextField
										type='text'
										label='Nombre'
										value={b?.name || ''}
										onChange={e =>
											setBits(prev =>
												prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x))
											)
										}
										fullWidth
										size='small'
									/>
									<TextField
										type='number'
										label='Pos.'
										value={b?.bit ?? 1}
										onChange={e => {
											let val = Number(e.target.value)
											if (val < 0) val = 0
											if (val > 7) val = 7
											setBits(prev =>
												prev.map((x, idx) => (idx === i ? { ...x, bit: val } : x))
											)
										}}
										size='small'
										className='w-20'
										inputProps={{ min: 0, max: 7 }}
									/>
									<IconButton
										size='small'
										disabled={!b}
										onClick={() => setBits(p => p.filter((_, idx) => idx !== i))}
										sx={{
											color: '#e11d48',
											borderRadius: '10px',
											'&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.12)' },
										}}
									>
										<Close sx={{ fontSize: 18 }} />
									</IconButton>
								</div>
							)
						})}
					</div>
					<div className='flex justify-center mt-2'>
						<Button
							variant='contained'
							disableElevation
							size='small'
							onClick={() => {
								if (bits.length < 8) setBits(prev => [...prev, { name: '', bit: 0 }])
							}}
							disabled={bits.length >= 8}
							sx={{
								borderRadius: '999px',
								textTransform: 'none',
								px: 2,
								py: 0.4,
								backgroundColor: '#2c6aa0',
								'&:hover': { backgroundColor: '#1f4e79' },
							}}
						>
							{bits.length >= 8 ? 'Máximo 8 bits' : '+ Agregar bit'}
						</Button>
					</div>
				</Box>
			)}

			{/* ── CÁLCULO DE BITS COMPRIMIDOS ── */}
			<div
				className={`transition-all duration-500 ease-in-out overflow-hidden ${
					isBitCalcVar ? 'max-h-[200vh] opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				{isBitCalcVar && (
					<BitCalcVarModal
						open={isBitCalcVar}
						onClose={() => setIsBitCalcVar(false)}
						onSaved={() => {
							if (onSaved) onSaved()
							if (handleClose) handleClose()
						}}
					/>
				)}
			</div>

			{/* ── FÓRMULA ── */}
			<div
				className={`transition-all duration-500 ease-in-out overflow-hidden ${
					requireCalc ? 'max-h-[200vh] opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				{requireCalc && (
					<Box sx={sectionBoxSx}>
						<SectionHeader eyebrow='Fórmula' />
						<div className='flex flex-col gap-2 items-center'>
							<CalculatorVars />
							<Calculadora setDisplay={setDisplay} display={display} showNumbers={true} />
						</div>
					</Box>
				)}
			</div>

			{/* ── ACCIÓN GUARDAR ── */}
			<div className='flex justify-end pt-1'>
				<Button
					variant='contained'
					disableElevation
					size='small'
					startIcon={<Save sx={{ fontSize: 16 }} />}
					onClick={handleSubmit(onSubmit)}
					sx={primarySaveSx}
				>
					Guardar variable
				</Button>
			</div>
		</div>
	)
}

export default DataGenerator
