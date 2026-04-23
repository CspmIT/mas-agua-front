import { useEffect, useState } from 'react'

const FloatingWidget = ({ className = '', style, children }) => (
	<div
		className={`absolute rounded-xl border border-slate-200/80 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/70 backdrop-blur-sm shadow-[0_4px_16px_rgba(44,106,160,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] px-3 py-2.5 text-[11px] text-slate-500 dark:text-gray-400 whitespace-nowrap ${className}`}
		style={style}
	>
		{children}
	</div>
)

export default function EmptyDashboard({ onAddChart }) {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 100)
		return () => clearTimeout(t)
	}, [])

	return (
		<div
			className={`w-full min-h-[70vh] flex flex-col items-center justify-center transition-all duration-500 ${
				visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
			}`}
		>
			<div className='relative w-[280px] h-[180px] mb-10'>
				<svg width='280' height='180' className='absolute inset-0'>
					<defs>
						<pattern id='grid' width='28' height='28' patternUnits='userSpaceOnUse'>
							<path d='M 28 0 L 0 0 0 28' fill='none' stroke='currentColor' className='text-slate-200 dark:text-gray-700' strokeWidth='0.8' />
						</pattern>
					</defs>
					<rect width='280' height='180' fill='url(#grid)' rx='16' />
				</svg>

				{/* Widget 1 — CirclePorcentaje (top left) */}
				<FloatingWidget
					className='flex items-center justify-center opacity-[0.45]'
					style={{ top: 8, left: 52, width: 82, height: 78 }}
				>
					<svg viewBox='0 0 80 80' fill='none' width='58' height='58'>
						<circle cx='40' cy='40' r='28' stroke='currentColor' className='text-slate-200 dark:text-gray-700' strokeWidth='8' />
						<circle cx='40' cy='40' r='28' stroke='#368bed' strokeWidth='8' strokeDasharray='105 70' strokeDashoffset='35' strokeLinecap='round' />
						<text x='40' y='44' textAnchor='middle' fontSize='13' fontWeight='bold' className='fill-slate-800 dark:fill-gray-200'>
							75%
						</text>
					</svg>
				</FloatingWidget>

				{/* Widget 2 — MultipleBooleanChart (top right) */}
				<FloatingWidget
					className='flex items-center justify-center opacity-40'
					style={{ top: 10, right: 24, width: 110, height: 78 }}
				>
					<svg viewBox='0 0 80 80' fill='none' width='80' height='64'>
						{[
							{ x: 2, y: 14, on: true }, { x: 44, y: 14, on: false },
							{ x: 2, y: 34, on: true }, { x: 44, y: 34, on: true },
							{ x: 2, y: 56, on: false }, { x: 44, y: 56, on: true },
						].map((led, i) => (
							<g key={i}>
								<circle cx={led.x + 8} cy={led.y + 8} r='7' fill={led.on ? '#10B981' : '#475569'} opacity={led.on ? 1 : 0.5} />
								<rect x={led.x + 18} y={led.y + 4} width='20' height='4' rx='2' fill={led.on ? '#368bed' : '#cbd5e1'} />
								<rect x={led.x + 18} y={led.y + 11} width='14' height='3' rx='1.5' fill='#e2e8f0' />
							</g>
						))}
					</svg>
				</FloatingWidget>

				{/* Widget 3 — GaugeSpeed (bottom left) */}
				<FloatingWidget
					className='flex items-center justify-center opacity-[0.45]'
					style={{ bottom: 14, left: 28, width: 100, height: 74 }}
				>
					<svg viewBox='0 0 80 80' fill='none' width='68' height='58'>
						<path d='M12 58 A30 30 0 0 1 68 58' stroke='currentColor' className='text-slate-200 dark:text-gray-700' strokeWidth='8' strokeLinecap='round' />
						<path d='M12 58 A30 30 0 0 1 52 22' stroke='#368bed' strokeWidth='8' strokeLinecap='round' />
						<line x1='40' y1='58' x2='55' y2='30' stroke='#d8621d' strokeWidth='2.5' strokeLinecap='round' />
						<circle cx='40' cy='58' r='4' className='fill-slate-800 dark:fill-gray-200' />
					</svg>
				</FloatingWidget>

				{/* Widget 4 — BooleanChart (bottom right) */}
				<FloatingWidget
					className='flex items-center justify-center opacity-40'
					style={{ bottom: 10, right: 50, width: 82, height: 74 }}
				>
					<svg viewBox='0 0 80 80' fill='none' width='100' height='100'>
						<circle cx='40' cy='35' r='22' fill='#10B981' opacity='0.2' />
						<circle cx='40' cy='35' r='15' fill='#10B981' />
						<text x='40' y='72' textAnchor='middle' fontSize='14' className='fill-slate-500 dark:fill-gray-400'>
							Encendido
						</text>
					</svg>
				</FloatingWidget>

				{/* Signo + central — animación pulse sutil */}
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2c6aa0] to-[#1f4e79] shadow-[0_4px_16px_rgba(44,106,160,0.35)]'>
					<span className='absolute inset-0 rounded-full bg-[#2c6aa0] opacity-40 animate-ping' />
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' className='relative'>
						<line x1='12' y1='5' x2='12' y2='19' />
						<line x1='5' y1='12' x2='19' y2='12' />
					</svg>
				</div>
			</div>

			<h2 className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#368bed] dark:text-[#5ea5f0] mb-2'>
				Dashboard vacío
			</h2>

			<p className='text-xl font-semibold tracking-tight text-slate-900 dark:text-gray-100 mb-2'>
				Empezá a construir tu panel
			</p>

			<p className='text-sm text-slate-500 dark:text-gray-400 text-center max-w-[320px] leading-relaxed mb-7'>
				Agregá widgets para visualizar tus datos en tiempo real. Podés personalizar el tamaño y posición de cada uno.
			</p>

			<button
				onClick={onAddChart}
				className='group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#2c6aa0] to-[#1f4e79] text-white text-sm font-medium tracking-wide shadow-[0_4px_14px_rgba(44,106,160,0.35)] hover:shadow-[0_8px_24px_rgba(44,106,160,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200'
			>
				<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='transition-transform group-hover:rotate-90 duration-300'>
					<circle cx='12' cy='12' r='10' />
					<line x1='12' y1='8' x2='12' y2='16' />
					<line x1='8' y1='12' x2='16' y2='12' />
				</svg>
				Agregar mi primer widget
			</button>
		</div>
	)
}
