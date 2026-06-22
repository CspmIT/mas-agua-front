import { useState, useEffect, Fragment } from 'react'
import {
	Box, IconButton, Button, TextField,
	MenuItem, Chip
} from '@mui/material'
import { Add, Delete, Check, ArrowBack, ArrowForward, Save } from '@mui/icons-material'
import { request } from '../../utils/js/request'
import { backend } from '../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import ModalShell from '../ModalShell'

const IMAGE_OPTIONS = [
	{ value: 'default', label: 'Apagado (gris)' },
	{ value: 'success', label: 'Encendido (verde)' },
	{ value: 'error', label: 'En falla (rojo)' },
	{ value: 'warning', label: 'Advertencia (amarillo)' },
]

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

const StepIndicator = ({ steps, current }) => (
	<div className='flex items-center gap-2 mb-2.5 w-full'>
		{steps.map((s, i) => (
			<Fragment key={i}>
				<div className='flex items-center gap-2 min-w-0'>
					<div
						className={`
							w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
							transition-all duration-300
							${
								i < current
									? 'bg-[#10b981] text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
									: i === current
									? 'bg-[#2c6aa0] text-white shadow-[0_2px_8px_rgba(44,106,160,0.35)] ring-4 ring-[#2c6aa0]/15'
									: 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
							}
						`}
					>
						{i < current ? <Check sx={{ fontSize: 14 }} /> : i + 1}
					</div>
					<span
						className={`text-xs sm:text-sm font-medium truncate ${
							i === current
								? 'text-slate-900 dark:text-gray-100'
								: 'text-slate-500 dark:text-gray-400'
						}`}
					>
						{s}
					</span>
				</div>
				{i < steps.length - 1 && (
					<div
						className={`flex-1 h-[2px] rounded-full transition-colors duration-300 ${
							i < current ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-gray-700'
						}`}
					/>
				)}
			</Fragment>
		))}
	</div>
)

const primarySx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 2.5,
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
	transition: 'all 0.2s',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
		transform: 'translateY(-1px)',
	},
}

const successSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 2.5,
	background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
	boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
	transition: 'all 0.2s',
	'&:hover': {
		background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
		boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
		transform: 'translateY(-1px)',
	},
}

const secondarySx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 2.5,
	borderColor: 'rgba(15, 42, 68, 0.2)',
	color: '#334155',
	'&:hover': {
		borderColor: '#2c6aa0',
		color: '#2c6aa0',
		backgroundColor: 'rgba(44, 106, 160, 0.06)',
	},
	'body.dark &': {
		borderColor: 'rgba(255, 255, 255, 0.15)',
		color: '#e5e7eb',
		'&:hover': {
			borderColor: '#5ea5f0',
			color: '#5ea5f0',
			backgroundColor: 'rgba(94, 165, 240, 0.1)',
		},
	},
}

export default function BitCalcVarModal({ open, onClose, data = null, onSaved }) {
	const [step, setStep] = useState(0)

	const [name, setName] = useState('')
	const [unit, setUnit] = useState('calc_binary')
	const [process, setProcess] = useState('')
	const [type, setType] = useState('last')
	const [allBCVars, setAllBCVars] = useState([])
	const [sources, setSources] = useState([])

	const [pendingVarId, setPendingVarId] = useState('')
	const [pendingBitId, setPendingBitId] = useState('')

	const [results, setResults] = useState({})

	useEffect(() => {
		if (!open) return
		request(`${backend[import.meta.env.VITE_APP_NAME]}/getVarsInflux`, 'GET')
			.then(res => {
				const bcVars = (res.data || []).filter(
					v => v.binary_compressed === true && v.calc_binary_compressed === false
				)
				setAllBCVars(bcVars)
			})
			.catch(() => {})
	}, [open])

	useEffect(() => {
		if (!data) return
		setName(data.name)
		setUnit(data.unit || 'calc_binary')
		setType(data.type || 'last')
		setProcess(data.process)
		setSources(data.sources || [])
		setResults(data.results || {})
	}, [data])

	useEffect(() => {
		if (!sources.length) return
		const count = Math.pow(2, sources.length)
		setResults(prev => {
			const next = {}
			for (let i = 0; i < count; i++) {
				next[String(i)] = prev[String(i)] ?? { image: 'default', label: '' }
			}
			return next
		})
	}, [sources])

	const selectedVar = allBCVars.find(v => v.id === Number(pendingVarId)) ?? null

	const handleAddSource = () => {
		if (!selectedVar || pendingBitId === '') return

		const bitObj = selectedVar.bits?.find(b => String(b.id) === String(pendingBitId))
		if (!bitObj) return

		const already = sources.some(s => s.id_var === selectedVar.id && s.id_bit === bitObj.id)
		if (already) {
			Swal.fire({ icon: 'warning', title: 'Ya agregado', text: 'Ese bit ya está en las fuentes' })
			return
		}

		const influx_config = Object.values(selectedVar.varsInflux)[0]

		setSources(prev => [
			...prev,
			{
				id_var: selectedVar.id,
				var_name: selectedVar.name,
				id_bit: bitObj.id,
				bit_name: bitObj.name,
				bit_position: bitObj.bit,
				influx_config,
			},
		])

		setPendingVarId('')
		setPendingBitId('')
	}

	const renderTruthRow = (index) => {
		const bits = sources.map((_, i) => (index >> i) & 1)
		const row = results[String(index)] ?? { image: 'default', label: '' }

		return (
			<Box
				key={index}
				sx={{
					display: 'grid',
					gap: 1,
					alignItems: 'center',
					py: 0.75,
					gridTemplateColumns: 'auto 1fr 1fr auto',
					borderBottom: '1px solid rgba(15, 42, 68, 0.06)',
					'&:last-child': { borderBottom: 'none' },
					'body.dark &': { borderBottom: '1px solid rgba(255, 255, 255, 0.06)' },
				}}
			>
				<div className='flex gap-1 flex-wrap min-w-fit'>
					{bits.map((b, i) => (
						<Chip
							key={i}
							label={`${sources[i].bit_name}=${b}`}
							size='small'
							sx={{
								height: 22,
								fontSize: '0.7rem',
								fontWeight: 500,
								backgroundColor: b ? 'rgba(16, 185, 129, 0.14)' : 'rgba(148, 163, 184, 0.2)',
								color: b ? '#065f46' : '#334155',
								border: 'none',
								'body.dark &': {
									backgroundColor: b ? 'rgba(16, 185, 129, 0.22)' : 'rgba(148, 163, 184, 0.25)',
									color: b ? '#6ee7b7' : '#cbd5e1',
								},
							}}
						/>
					))}
				</div>

				<TextField
					select
					size='small'
					label='Imagen'
					value={row.image}
					onChange={e =>
						setResults(prev => ({
							...prev,
							[String(index)]: { ...prev[String(index)], image: e.target.value },
						}))
					}
				>
					{IMAGE_OPTIONS.map(o => (
						<MenuItem key={o.value} value={o.value}>
							{o.label}
						</MenuItem>
					))}
				</TextField>

				<TextField
					size='small'
					label='Etiqueta'
					value={row.label}
					placeholder='Ej: Bomba encendida'
					onChange={e =>
						setResults(prev => ({
							...prev,
							[String(index)]: { ...prev[String(index)], label: e.target.value },
						}))
					}
				/>

				<Chip
					label={String(index)}
					size='small'
					sx={{
						height: 22,
						fontWeight: 600,
						backgroundColor: 'rgba(54, 139, 237, 0.14)',
						color: '#1e3a8a',
						'body.dark &': { backgroundColor: 'rgba(94, 165, 240, 0.2)', color: '#93c5fd' },
					}}
				/>
			</Box>
		)
	}

	const handleSave = async () => {
		if (!name || !process) {
			Swal.fire({ icon: 'error', title: 'Faltan datos', text: 'Nombre y proceso son requeridos' })
			return
		}
		if (!sources.length) {
			Swal.fire({ icon: 'error', title: 'Sin fuentes', text: 'Agregá al menos una variable binaria' })
			return
		}
		const varsInflux = sources.reduce((acc, s) => {
			if (!acc[s.var_name]) acc[s.var_name] = s.influx_config
			return acc
		}, {})

		try {
			await request(`${backend[import.meta.env.VITE_APP_NAME]}/bitCalcVars/save`, 'POST', {
				id: data?.id || 0,
				name,
				unit,
				type,
				process,
				varsInflux,
				sources,
				results,
			})
			Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false })
			onSaved?.()
			onClose()
		} catch {
			Swal.fire({ icon: 'error', title: 'Error al guardar' })
		}
	}

	const steps = ['Info básica', 'Variables de entrada', 'Tabla de resultados']

	return (
		<ModalShell
			open={open}
			onClose={onClose}
			eyebrow='Variable calculada'
			title='Bits comprimidos'
			subtitle='Combiná bits de variables binarias para resolver un estado compuesto'
			maxWidth='92vw'
			footer={
				<>
					<Button
						variant='outlined'
						disabled={step === 0}
						startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
						onClick={() => setStep(s => s - 1)}
						sx={secondarySx}
					>
						Anterior
					</Button>
					{step < 2 ? (
						<Button
							variant='contained'
							disableElevation
							endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
							onClick={() => setStep(s => s + 1)}
							sx={primarySx}
						>
							Siguiente
						</Button>
					) : (
						<Button
							variant='contained'
							disableElevation
							startIcon={<Save sx={{ fontSize: 16 }} />}
							onClick={handleSave}
							sx={successSx}
						>
							Guardar
						</Button>
					)}
				</>
			}
		>
			<StepIndicator steps={steps} current={step} />

			{/* ── PASO 1 ── */}
			{step === 0 && (
				<Box sx={sectionBoxSx}>
					<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#5ea5f0] mb-1.5'>
						Información básica
					</div>
					<div className='flex flex-col gap-2 max-w-xl mx-auto'>
						<TextField
							label='Nombre de la variable'
							value={name}
							size='small'
							required
							onChange={e => setName(e.target.value)}
						/>
						<TextField
							label='Proceso'
							value={process}
							size='small'
							required
							onChange={e => setProcess(e.target.value)}
						/>
						<TextField
							label='Unidad de medida'
							value='calc_binary'
							size='small'
							disabled
							onChange={e => setUnit(e.target.value)}
						/>
						<TextField
							select
							label='Tipo de consulta'
							value={type}
							size='small'
							disabled
							onChange={e => setType(e.target.value)}
						>
							<MenuItem value='last'>Instantánea</MenuItem>
							<MenuItem value='history'>Histórico</MenuItem>
						</TextField>
					</div>
				</Box>
			)}

			{/* ── PASO 2 ── */}
			{step === 1 && (
				<div className='flex flex-col gap-2'>
					<p className='text-xs text-slate-600 dark:text-gray-400'>
						Hasta 4 variables binarias. El orden define la posición del bit (fuente 0 → bit 0, etc.).
					</p>

					{sources.map((s, i) => (
						<Box
							key={i}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								flexWrap: 'wrap',
								gap: 1,
								px: 1.5,
								py: 1,
								borderRadius: '12px',
								border: '1px solid rgba(15, 42, 68, 0.08)',
								backgroundColor: '#ffffff',
								borderLeft: '3px solid #2c6aa0',
								transition: 'all 0.2s',
								'&:hover': {
									boxShadow: '0 4px 12px -4px rgba(15, 42, 68, 0.12)',
									transform: 'translateY(-1px)',
								},
								'body.dark &': {
									backgroundColor: 'rgba(31, 41, 55, 0.5)',
									border: '1px solid rgba(255, 255, 255, 0.06)',
									borderLeft: '3px solid #5ea5f0',
								},
							}}
						>
							<div className='flex gap-2 items-center flex-wrap'>
								<Chip
									label={`Bit ${i} · peso ${Math.pow(2, i)}`}
									size='small'
									sx={{
										height: 22,
										fontWeight: 600,
										backgroundColor: 'rgba(54, 139, 237, 0.14)',
										color: '#1e3a8a',
										'body.dark &': { backgroundColor: 'rgba(94, 165, 240, 0.2)', color: '#93c5fd' },
									}}
								/>
								<span className='text-sm text-slate-700 dark:text-gray-200'>
									<strong>{s.var_name}</strong> → <strong>{s.bit_name}</strong>
									<span className='text-slate-400 dark:text-gray-500 text-xs ml-1'>
										(posición {s.bit_position} del byte)
									</span>
								</span>
							</div>
							<IconButton
								size='small'
								onClick={() => setSources(prev => prev.filter((_, idx) => idx !== i))}
								sx={{
									color: '#e11d48',
									borderRadius: '10px',
									'&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.12)' },
								}}
							>
								<Delete sx={{ fontSize: 18 }} />
							</IconButton>
						</Box>
					))}

					{sources.length < 4 && (
						<Box sx={sectionBoxSx}>
							<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#5ea5f0] mb-1.5'>
								Agregar fuente
							</div>
							<div className='flex gap-2 flex-wrap items-start'>
								<TextField
									select
									label='Variable binaria'
									size='small'
									sx={{ flex: '1 1 220px' }}
									value={pendingVarId}
									onChange={e => {
										setPendingVarId(e.target.value)
										setPendingBitId('')
									}}
								>
									{allBCVars.map(v => (
										<MenuItem key={v.id} value={String(v.id)}>
											{v.name}
										</MenuItem>
									))}
								</TextField>

								<TextField
									select
									label='Bit'
									size='small'
									sx={{ flex: '1 1 180px' }}
									value={pendingBitId}
									onChange={e => setPendingBitId(e.target.value)}
									disabled={!selectedVar}
								>
									{(selectedVar?.bits ?? []).map(b => (
										<MenuItem key={b.id} value={String(b.id)}>
											{b.name} (bit {b.bit})
										</MenuItem>
									))}
								</TextField>

								<Button
									variant='contained'
									disableElevation
									size='small'
									startIcon={<Add sx={{ fontSize: 16 }} />}
									disabled={!pendingVarId || pendingBitId === ''}
									onClick={handleAddSource}
									sx={{
										borderRadius: '999px',
										textTransform: 'none',
										backgroundColor: '#2c6aa0',
										px: 2.25,
										py: 0.9,
										'&:hover': { backgroundColor: '#1f4e79' },
									}}
								>
									Agregar
								</Button>
							</div>
						</Box>
					)}
				</div>
			)}

			{/* ── PASO 3 ── */}
			{step === 2 && (
				<Box sx={sectionBoxSx}>
					<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#5ea5f0] mb-1'>
						Tabla de verdad
					</div>
					<p className='text-xs text-slate-600 dark:text-gray-400 mb-2'>
						{sources.length} bit(s) → {Math.pow(2, sources.length)} combinaciones.
					</p>
					<div className='flex flex-col'>
						{Array.from({ length: Math.pow(2, sources.length) }, (_, i) => renderTruthRow(i))}
					</div>
				</Box>
			)}
		</ModalShell>
	)
}
