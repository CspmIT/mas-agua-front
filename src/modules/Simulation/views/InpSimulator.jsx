import { useMemo, useRef, useState } from 'react'
import { Alert, Button, CircularProgress, Slider } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import PageHeader from '../../../components/PageHeader'
import { formatSimTime } from '../lib/simTime'
import net1Inp from '../data/net1.inp?raw'

const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const fmt = (value) => numberFormat.format(value)

const SummaryCard = ({ label, value }) => (
	<div className='rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 min-w-[120px]'>
		<div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500'>{label}</div>
		<div className='text-lg font-medium text-slate-800 dark:text-gray-100'>{value}</div>
	</div>
)

const TableShell = ({ title, headers, children }) => (
	<div className='rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden'>
		<div className='px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-200 border-b border-slate-100 dark:border-slate-700'>
			{title}
		</div>
		<div className='overflow-x-auto'>
			<table className='w-full text-sm'>
				<thead>
					<tr className='text-left text-[11px] uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500'>
						{headers.map((h) => (
							<th key={h} className='px-4 py-2 font-semibold whitespace-nowrap'>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody className='text-slate-700 dark:text-gray-200'>{children}</tbody>
			</table>
		</div>
	</div>
)

const InpSimulator = () => {
	const [inpText, setInpText] = useState(null)
	const [inpName, setInpName] = useState(null)
	const [result, setResult] = useState(null)
	const [stepIndex, setStepIndex] = useState(0)
	const [running, setRunning] = useState(false)
	const [error, setError] = useState(null)
	const fileInputRef = useRef(null)

	const loadExample = () => {
		setInpText(net1Inp)
		setInpName('Net1 (red de ejemplo EPANET)')
		setResult(null)
		setError(null)
	}

	const onFileSelected = async (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		setInpText(await file.text())
		setInpName(file.name)
		setResult(null)
		setError(null)
		event.target.value = ''
	}

	const run = async () => {
		if (!inpText) return
		setRunning(true)
		setError(null)
		try {
			// Import dinámico: el motor WASM (~450 KB) se descarga recién en la primera simulación
			const { runSimulation } = await import('../lib/epanetRunner')
			const simResult = await runSimulation(inpText)
			setResult(simResult)
			setStepIndex(0)
		} catch (err) {
			setError(err?.message || 'Error desconocido al ejecutar la simulación')
		} finally {
			setRunning(false)
		}
	}

	const step = result?.steps[stepIndex]

	// Presión mínima aceptable de referencia para resaltar nodos comprometidos
	const lowPressure = result?.isMetric ? 10 : 14

	const sliderMarks = useMemo(() => {
		if (!result) return []
		return result.steps.map((s, i) => ({ value: i }))
	}, [result])

	return (
		<div className='px-4 sm:px-8 py-6 max-w-7xl mx-auto'>
			<PageHeader
				eyebrow='Simulación'
				title='Simulación hidráulica (EPANET)'
				subtitle='Cargá un modelo .INP y ejecutá una simulación de período extendido para ver presiones, caudales y velocidades.'
			/>

			<div className='flex flex-wrap items-center gap-3 mb-5'>
				<Button
					variant='outlined'
					startIcon={<AccountTreeIcon sx={{ fontSize: 18 }} />}
					onClick={loadExample}
					sx={{ borderRadius: '999px', textTransform: 'none' }}
				>
					Cargar red de ejemplo
				</Button>
				<Button
					variant='outlined'
					startIcon={<UploadFileIcon sx={{ fontSize: 18 }} />}
					onClick={() => fileInputRef.current?.click()}
					sx={{ borderRadius: '999px', textTransform: 'none' }}
				>
					Importar archivo .INP
				</Button>
				<input ref={fileInputRef} type='file' accept='.inp' hidden onChange={onFileSelected} />
				<Button
					variant='contained'
					disableElevation
					disabled={!inpText || running}
					startIcon={running ? <CircularProgress size={16} color='inherit' /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
					onClick={run}
					sx={{ borderRadius: '999px', textTransform: 'none' }}
				>
					{running ? 'Simulando…' : 'Ejecutar simulación'}
				</Button>
				{inpName && (
					<span className='text-sm text-slate-500 dark:text-gray-400'>
						Modelo cargado: <span className='font-medium text-slate-700 dark:text-gray-200'>{inpName}</span>
					</span>
				)}
			</div>

			{error && (
				<Alert severity='error' sx={{ mb: 3, borderRadius: '12px' }}>
					{error}
				</Alert>
			)}

			{result && step && (
				<>
					<div className='flex flex-wrap gap-3 mb-5'>
						<SummaryCard label='Nodos' value={result.nodes.length} />
						<SummaryCard label='Tramos' value={result.links.length} />
						<SummaryCard label='Duración' value={formatSimTime(result.duration)} />
						<SummaryCard label='Pasos' value={result.steps.length} />
						<SummaryCard label='Caudal' value={result.flowUnitLabel} />
						<SummaryCard label='Presión' value={result.pressureUnitLabel} />
					</div>

					{result.steps.length > 1 && (
						<div className='rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 mb-5'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-sm font-semibold text-slate-700 dark:text-gray-200'>Instante de simulación</span>
								<span className='text-sm font-mono text-[#368bed] dark:text-[#5ea5f0]'>{formatSimTime(step.time)} hs</span>
							</div>
							<Slider
								size='small'
								min={0}
								max={result.steps.length - 1}
								marks={sliderMarks}
								step={null}
								value={stepIndex}
								onChange={(_, v) => setStepIndex(v)}
								valueLabelDisplay='auto'
								valueLabelFormat={(i) => formatSimTime(result.steps[i].time)}
							/>
						</div>
					)}

					<div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
						<TableShell
							title={`Nodos — presión y demanda a las ${formatSimTime(step.time)} hs`}
							headers={['ID', 'Tipo', 'Elevación', `Presión (${result.pressureUnitLabel})`, `Demanda (${result.flowUnitLabel})`]}
						>
							{result.nodes.map((node, i) => {
								const values = step.nodes[i]
								const isLow = node.type === 0 && values.pressure < lowPressure
								return (
									<tr key={node.id} className='border-t border-slate-100 dark:border-slate-700/60'>
										<td className='px-4 py-2 font-medium'>{node.id}</td>
										<td className='px-4 py-2 text-slate-500 dark:text-gray-400'>{node.typeLabel}</td>
										<td className='px-4 py-2'>{fmt(node.elevation)}</td>
										<td className={`px-4 py-2 font-medium ${isLow ? 'text-rose-600 dark:text-rose-400' : ''}`}>
											{fmt(values.pressure)}
										</td>
										<td className='px-4 py-2'>{fmt(values.demand)}</td>
									</tr>
								)
							})}
						</TableShell>

						<TableShell
							title={`Tramos — caudal y velocidad a las ${formatSimTime(step.time)} hs`}
							headers={['ID', 'Tipo', 'Desde → Hasta', `Caudal (${result.flowUnitLabel})`, 'Velocidad']}
						>
							{result.links.map((link, i) => {
								const values = step.links[i]
								return (
									<tr key={link.id} className='border-t border-slate-100 dark:border-slate-700/60'>
										<td className='px-4 py-2 font-medium'>{link.id}</td>
										<td className='px-4 py-2 text-slate-500 dark:text-gray-400'>{link.typeLabel}</td>
										<td className='px-4 py-2 whitespace-nowrap'>
											{link.from} → {link.to}
										</td>
										<td className='px-4 py-2'>{fmt(values.flow)}</td>
										<td className='px-4 py-2'>{fmt(values.velocity)}</td>
									</tr>
								)
							})}
						</TableShell>
					</div>
				</>
			)}

			{!result && !error && (
				<div className='rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 px-6 py-14 text-center text-slate-400 dark:text-gray-500'>
					{inpText
						? 'Modelo listo. Presioná "Ejecutar simulación" para correr el motor EPANET.'
						: 'Cargá la red de ejemplo o importá un archivo .INP para comenzar.'}
				</div>
			)}
		</div>
	)
}

export default InpSimulator
