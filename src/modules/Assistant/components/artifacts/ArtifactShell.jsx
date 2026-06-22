import { formatNumber } from './utils/artifactStyles'

/**
 * Tarjeta visual compartida entre todos los artifacts.
 * Header (título + subtítulo + range_label) + slot para badge + grid de stats
 * opcional + slot para el contenido (chart, barra, tabla).
 *
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   rangeLabel?: string,
 *   caption?: string,
 *   badge?: React.ReactNode,
 *   stats?: Array<{ label: string, value: React.ReactNode }>,
 *   children: React.ReactNode,
 * }} props
 */
const ArtifactShell = ({ title, subtitle, rangeLabel, caption, badge, stats, children }) => (
	<section className='mt-3 rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_2px_8px_rgba(15,42,68,0.04),0_18px_44px_-26px_rgba(15,42,68,0.20)] overflow-hidden'>
		<header className='flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5 border-b border-[#1f4e79]/6 dark:border-white/5'>
			<div className='min-w-0 flex-1'>
				<h3 className='text-[13.5px] font-semibold text-[#1f4e79] dark:text-[#9ec5f4] leading-tight truncate'>
					{title}
				</h3>
				{subtitle && (
					<p className='mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400 truncate'>
						{subtitle}
					</p>
				)}
				{rangeLabel && (
					<p className='mt-1 text-[10.5px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500'>
						{rangeLabel}
					</p>
				)}
			</div>
			{badge && <div className='shrink-0'>{badge}</div>}
		</header>

		{stats && stats.length > 0 && (
			<div className='grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 pt-3'>
				{stats.map((s, i) => (
					<StatCell key={i} label={s.label} value={s.value} />
				))}
			</div>
		)}

		<div className='px-2 sm:px-3 pt-2 pb-2'>{children}</div>

		{caption && (
			<p className='px-4 pb-3 text-[11.5px] text-slate-500 dark:text-slate-400 italic leading-snug'>
				{caption}
			</p>
		)}
	</section>
)

const StatCell = ({ label, value }) => (
	<div className='rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-2.5 py-1.5'>
		<div className='text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500'>
			{label}
		</div>
		<div className='mt-0.5 text-[13px] font-semibold text-slate-800 dark:text-slate-100 tabular-nums truncate'>
			{typeof value === 'number' ? formatNumber(value) : value ?? '—'}
		</div>
	</div>
)

export const TrendBadge = ({ style }) => (
	<span
		className={[
			'inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full border text-[11px] font-semibold',
			style.bg,
			style.border,
			style.text,
		].join(' ')}
	>
		<span className='inline-block w-1.5 h-1.5 rounded-full' style={{ background: style.dot }} />
		<span>
			<span aria-hidden className='mr-1'>
				{style.arrow}
			</span>
			{style.label}
		</span>
	</span>
)

export default ArtifactShell
