import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbExternalLink } from 'react-icons/tb'
import { FaChartLine, FaBell, FaFilePdf } from 'react-icons/fa'
import { getTypeMeta, parseExternalId } from '../utils/docTypes'
import { getDocumentDownloadUrl } from '../../../utils/js/assistant'

const formatScore = (n) => {
	if (typeof n !== 'number') return '—'
	return n.toFixed(2)
}

/**
 * @param {{ source: any, index: number, highlighted?: boolean }} props
 */
const SourceCard = forwardRef(({ source, index, highlighted }, ref) => {
	const navigate = useNavigate()
	const meta = getTypeMeta(source.doc_type)
	const ext = parseExternalId(source.external_id)

	const onAction = () => {
		if (ext?.kind === 'influxvar') {
			// TODO: la pantalla de charts debe leer ?influxVar={id} y preseleccionar la variable.
			navigate(`/config/allGraphic?influxVar=${encodeURIComponent(ext.id)}`)
			return
		}
		if (ext?.kind === 'alarm') {
			// TODO: la pantalla de alarmas debe leer ?id={id} y abrir el detalle.
			navigate(`/config/alarm?id=${encodeURIComponent(ext.id)}`)
			return
		}
		// Documento subido: abrir el binario en pestaña nueva.
		const url = getDocumentDownloadUrl(source.doc_id)
		window.open(url, '_blank', 'noopener,noreferrer')
	}

	const ActionIcon = ext?.kind === 'influxvar' ? FaChartLine : ext?.kind === 'alarm' ? FaBell : FaFilePdf
	const actionLabel = ext?.kind === 'influxvar' ? 'Ver gráfico' : ext?.kind === 'alarm' ? 'Ver alarma' : 'Ver documento'

	return (
		<div
			ref={ref}
			data-source-index={index}
			className={[
				'relative rounded-2xl border bg-white dark:bg-slate-900/55 transition-all duration-200',
				highlighted
					? 'border-[#368bed]/55 shadow-[0_0_0_3px_rgba(54,139,237,0.18),0_18px_44px_-22px_rgba(54,139,237,0.50)]'
					: 'border-slate-200/80 dark:border-white/10 shadow-[0_2px_6px_rgba(15,42,68,0.05),0_14px_32px_-18px_rgba(15,42,68,0.18)]',
			].join(' ')}
		>
			<div
				className='absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full'
				style={{ backgroundColor: meta.accent }}
				aria-hidden
			/>
			<div className='pl-4 pr-3 py-3'>
				<div className='flex items-start justify-between gap-2'>
					<div className='min-w-0'>
						<div className='flex items-center gap-2 mb-1'>
							<span
								className='inline-flex items-center px-1.5 h-[18px] rounded-md text-[10px] font-semibold uppercase tracking-[0.10em]'
								style={{ color: meta.accent, backgroundColor: meta.soft }}
							>
								{meta.label}
							</span>
							<span className='text-[10.5px] font-mono tabular-nums text-slate-400 dark:text-slate-500'>
								#{index}
							</span>
						</div>
						<div className='text-[13.5px] font-medium tracking-tight text-slate-800 dark:text-slate-100 leading-snug line-clamp-2'>
							{source.title || source.doc_id}
						</div>
					</div>
					<ScoreBadge score={source.score} />
				</div>

				<div className='mt-2.5 flex items-center justify-between gap-2'>
					<div className='text-[11px] text-slate-500 dark:text-slate-400 tabular-nums'>
						Fragmento <span className='font-mono'>#{source.chunk_order}</span>
						<span className='mx-1.5 text-slate-300 dark:text-slate-600'>·</span>
						similitud <span className='font-mono'>{formatScore(source.score)}</span>
					</div>
					<button
						type='button'
						onClick={onAction}
						className='inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-[#368bed]/10 border border-slate-200 dark:border-white/10 hover:border-[#368bed]/35 text-[11.5px] font-medium text-[#1f4e79] dark:text-[#7fb6ef] transition-colors'
					>
						<ActionIcon size={11} />
						{actionLabel}
						<TbExternalLink size={11} className='opacity-60' />
					</button>
				</div>
			</div>
		</div>
	)
})

const ScoreBadge = ({ score }) => {
	const pct = Math.max(0, Math.min(1, Number(score) || 0))
	return (
		<div className='shrink-0 flex flex-col items-end gap-0.5'>
			<div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500'>
				Match
			</div>
			<div
				className='relative w-12 h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10'
				aria-label={`Similitud ${pct.toFixed(2)}`}
			>
				<div
					className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#368bed] to-[#1f4e79]'
					style={{ width: `${pct * 100}%` }}
				/>
			</div>
		</div>
	)
}

SourceCard.displayName = 'SourceCard'
export default SourceCard
