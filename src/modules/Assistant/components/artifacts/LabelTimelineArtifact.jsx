import { useMemo } from 'react'
import { TbArrowRight } from 'react-icons/tb'
import ArtifactShell from './ArtifactShell'
import { colorForLabel } from './utils/artifactStyles'

/**
 * Render para artifacts type='label_timeline' (bit_calc en histórico).
 * Sin chart: barra horizontal con segmentos por porcentaje + lista
 * de últimas transiciones.
 *
 * @param {{ data: any }} props
 */
const LabelTimelineArtifact = ({ data }) => {
	const {
		variable_name,
		distribution = {},
		transitions = [],
		current_label,
		range_label,
	} = data

	const sorted = useMemo(
		() =>
			Object.entries(distribution)
				.map(([label, pct]) => ({ label, pct: Number(pct) || 0 }))
				.sort((a, b) => b.pct - a.pct),
		[distribution]
	)

	const lastTransitions = transitions.slice(-5).reverse()

	return (
		<ArtifactShell
			title={variable_name}
			rangeLabel={range_label}
			badge={current_label ? <CurrentBadge label={current_label} /> : null}
		>
			<div className='px-2 py-1 space-y-3'>
				{sorted.length > 0 ? (
					<>
						<div
							className='flex h-7 rounded-lg overflow-hidden ring-1 ring-[#1f4e79]/10 dark:ring-white/10'
							role='img'
							aria-label='Distribución de estados'
						>
							{sorted.map(({ label, pct }) => (
								<div
									key={label}
									className='flex items-center justify-center px-1.5 transition-all duration-200'
									style={{ width: `${pct}%`, background: colorForLabel(label) }}
									title={`${label}: ${pct.toFixed(1)}%`}
								>
									{pct >= 10 && (
										<span
											className='text-[10.5px] font-semibold text-white truncate tabular-nums'
											style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
										>
											{label} ({pct.toFixed(0)}%)
										</span>
									)}
								</div>
							))}
						</div>

						<div className='flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300'>
							{sorted.map(({ label, pct }) => (
								<div key={label} className='inline-flex items-center gap-1.5'>
									<span
										className='inline-block w-2.5 h-2.5 rounded-sm'
										style={{ background: colorForLabel(label) }}
									/>
									<span className='font-medium'>{label}</span>
									<span className='tabular-nums text-slate-400 dark:text-slate-500'>
										{pct.toFixed(1)}%
									</span>
								</div>
							))}
						</div>
					</>
				) : (
					<div className='text-[12px] text-slate-400 dark:text-slate-500 italic'>
						Sin distribución disponible
					</div>
				)}

				{lastTransitions.length > 0 && (
					<div className='pt-2 border-t border-slate-100 dark:border-white/5'>
						<div className='text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mb-1.5'>
							Últimos cambios
						</div>
						<ul className='space-y-1'>
							{lastTransitions.map((t, i) => (
								<li
									key={i}
									className='flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300'
								>
									<LabelChip label={t.from} />
									<TbArrowRight size={12} className='text-slate-400 shrink-0' />
									<LabelChip label={t.to} />
									<span className='ml-auto text-[11px] text-slate-400 dark:text-slate-500 tabular-nums truncate'>
										{t.time_label}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</ArtifactShell>
	)
}

const LabelChip = ({ label }) => (
	<span
		className='inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10.5px] font-medium text-white'
		style={{ background: colorForLabel(label) }}
	>
		{label}
	</span>
)

const CurrentBadge = ({ label }) => (
	<span
		className='inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-semibold text-white'
		style={{ background: colorForLabel(label) }}
	>
		<span className='opacity-90 font-normal'>Ahora:</span>
		{label}
	</span>
)

export default LabelTimelineArtifact
