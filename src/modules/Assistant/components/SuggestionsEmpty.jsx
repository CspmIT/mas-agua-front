import { HiSparkles } from 'react-icons/hi2'
import { IoArrowForward } from 'react-icons/io5'

const SUGGESTIONS = [
	{
		eyebrow: 'Configuración',
		text: '¿Qué alarmas hay configuradas para presión de red?',
	},
	{
		eyebrow: 'Procedimientos',
		text: 'Procedimiento de purga semanal de bombas',
	},
	{
		eyebrow: 'Tiempo real · activa el toggle',
		text: '¿Cuál es el caudal promedio de la última hora?',
		needsTools: true,
	},
]

/**
 * @param {{ onPick: (text: string, opts?: { enableTools?: boolean }) => void }} props
 */
const SuggestionsEmpty = ({ onPick }) => {
	return (
		<div className='flex flex-col items-center justify-center text-center px-6 py-10 max-w-2xl mx-auto'>
			<div className='relative mb-4'>
				<div className='absolute inset-0 rounded-full bg-[#368bed]/15 blur-xl' aria-hidden />
				<div className='relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2c6aa0] to-[#1f4e79] text-white flex items-center justify-center shadow-[0_10px_30px_-12px_rgba(31,78,121,0.7)]'>
					<HiSparkles size={22} />
				</div>
			</div>
			<div className='text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[#368bed] dark:text-[#7fb6ef] mb-1.5'>
				Asistente de operación
			</div>
			<h2 className='text-[22px] sm:text-[24px] leading-tight font-medium tracking-tight text-slate-800 dark:text-slate-100'>
				¿Qué necesitás resolver hoy?
			</h2>
			<p className='mt-2 text-[13.5px] text-slate-500 dark:text-slate-400 max-w-md'>
				Consultá manuales, procedimientos y la configuración de tu planta. Activá{' '}
				<span className='font-medium text-[#10B981]'>datos en tiempo real</span> para preguntar por
				variables actuales.
			</p>

			<div className='mt-7 w-full grid gap-2.5'>
				{SUGGESTIONS.map((s, i) => (
					<button
						key={i}
						type='button'
						onClick={() => onPick(s.text, { enableTools: !!s.needsTools })}
						className='group text-left rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[#368bed]/45 hover:bg-[#368bed]/[0.04] dark:hover:bg-[#368bed]/[0.06] transition-all px-4 py-3 flex items-start gap-3'
					>
						<span className='shrink-0 mt-1 w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-[#368bed]/15 flex items-center justify-center text-slate-400 group-hover:text-[#1f4e79] dark:group-hover:text-[#7fb6ef] transition-colors'>
							<IoArrowForward size={13} />
						</span>
						<div className='min-w-0 flex-1'>
							<div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 group-hover:text-[#368bed] transition-colors mb-0.5'>
								{s.eyebrow}
							</div>
							<div className='text-[14px] text-slate-700 dark:text-slate-200 leading-snug'>
								{s.text}
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}

export default SuggestionsEmpty
