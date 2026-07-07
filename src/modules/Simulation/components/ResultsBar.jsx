import { MenuItem, Slider, TextField } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Swal from 'sweetalert2'
import { formatSimTime } from '../lib/simTime'
import { NODE_PARAMS, LINK_PARAMS } from '../lib/resultParams'

const Legend = ({ stops, unit }) => (
	<div className='flex items-center gap-2 flex-wrap'>
		{stops.map((s) => (
			<span key={s.color + s.label} className='flex items-center gap-1 text-xs text-slate-600 dark:text-gray-300'>
				<span className='w-3 h-3 rounded-full inline-block' style={{ backgroundColor: s.color }} />
				{s.label}
			</span>
		))}
		<span className='text-[11px] text-slate-400 dark:text-slate-500'>{unit}</span>
	</div>
)

const paramSelectSx = { minWidth: 150, '& .MuiInputBase-root': { fontSize: '0.8rem' } }

const ResultsBar = ({
	result,
	stepIndex,
	onStepChange,
	onClose,
	nodeParam,
	linkParam,
	onNodeParamChange,
	onLinkParamChange,
	nodeStops,
	linkStops,
}) => {
	const step = result.steps[stepIndex]

	const showWarnings = () =>
		Swal.fire({
			title: 'Advertencias de la simulación',
			html: `<ul style="text-align:left;font-size:0.9rem">${result.warnings.map((w) => `<li>• ${w}</li>`).join('')}</ul>`,
			icon: 'warning',
		})

	return (
		<div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(780px,calc(100%-24px))] rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-600 shadow-lg px-5 py-3'>
			<div className='flex items-center justify-between gap-3'>
				<span className='text-sm font-semibold text-slate-700 dark:text-gray-200'>Resultados</span>
				<div className='flex items-center gap-3'>
					{result.warnings?.length > 0 && (
						<button
							type='button'
							onClick={showWarnings}
							className='bg-transparent border-0 p-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer hover:underline'
						>
							<WarningAmberIcon sx={{ fontSize: 16 }} />
							{result.warnings.length} advertencia{result.warnings.length > 1 ? 's' : ''}
						</button>
					)}
					<span className='text-sm font-mono text-[#368bed] dark:text-[#5ea5f0]'>{formatSimTime(step.time)} hs</span>
					<button
						type='button'
						onClick={onClose}
						className='bg-transparent border-0 p-0 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
					>
						<CloseIcon sx={{ fontSize: 17 }} />
					</button>
				</div>
			</div>

			{result.steps.length > 1 && (
				<Slider
					size='small'
					min={0}
					max={result.steps.length - 1}
					step={null}
					marks={result.steps.map((_, i) => ({ value: i }))}
					value={stepIndex}
					onChange={(_, v) => onStepChange(v)}
					valueLabelDisplay='auto'
					valueLabelFormat={(i) => formatSimTime(result.steps[i].time)}
				/>
			)}

			<div className='flex flex-col sm:flex-row gap-x-6 gap-y-2 mt-1'>
				<div className='flex items-center gap-2'>
					<TextField
						select
						size='small'
						variant='standard'
						label='Nodos'
						value={nodeParam}
						onChange={(e) => onNodeParamChange(e.target.value)}
						sx={paramSelectSx}
					>
						{Object.entries(NODE_PARAMS).map(([key, p]) => (
							<MenuItem key={key} value={key}>
								{p.label}
							</MenuItem>
						))}
					</TextField>
					<Legend stops={nodeStops} unit={NODE_PARAMS[nodeParam].unit(result)} />
				</div>
				<div className='flex items-center gap-2'>
					<TextField
						select
						size='small'
						variant='standard'
						label='Tramos'
						value={linkParam}
						onChange={(e) => onLinkParamChange(e.target.value)}
						sx={paramSelectSx}
					>
						{Object.entries(LINK_PARAMS).map(([key, p]) => (
							<MenuItem key={key} value={key}>
								{p.label}
							</MenuItem>
						))}
					</TextField>
					<Legend stops={linkStops} unit={LINK_PARAMS[linkParam].unit(result)} />
				</div>
			</div>
		</div>
	)
}

export default ResultsBar
