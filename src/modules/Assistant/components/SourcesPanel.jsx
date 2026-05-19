import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { TbBookmark } from 'react-icons/tb'
import SourceCard from './SourceCard'

/**
 * Imperative handle: highlight(n) -> resalta la fuente N y la trae a vista.
 *
 * @param {{ sources: Array<any>, lastMessageId?: string }} props
 */
const SourcesPanel = forwardRef(({ sources = [] }, ref) => {
	const containerRef = useRef(null)
	const itemRefs = useRef([])
	const [highlightIndex, setHighlightIndex] = useState(null)
	const timeoutRef = useRef(null)

	itemRefs.current = useMemo(() => sources.map(() => null), [sources])

	useImperativeHandle(ref, () => ({
		highlight: (n) => {
			const idx = n - 1
			const node = itemRefs.current[idx]
			if (!node) return
			node.scrollIntoView({ behavior: 'smooth', block: 'center' })
			setHighlightIndex(idx)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => setHighlightIndex(null), 2000)
		},
	}))

	if (!sources.length) {
		return <SourcesEmpty />
	}

	return (
		<aside className='h-full flex flex-col min-h-0' aria-label='Fuentes citadas'>
			<header className='shrink-0 px-4 pt-4 pb-3'>
				<div className='text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#368bed] dark:text-[#7fb6ef] mb-1'>
					Trazabilidad
				</div>
				<h3 className='text-[15.5px] font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight'>
					Fuentes citadas
				</h3>
				<p className='mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400'>
					Estas son las {sources.length} {sources.length === 1 ? 'fuente' : 'fuentes'} que el
					asistente usó para responder.
				</p>
			</header>
			<div
				ref={containerRef}
				className='flex-1 min-h-0 overflow-y-auto px-3 pb-4 space-y-2.5'
				style={{ scrollbarGutter: 'stable' }}
			>
				{sources.map((s, i) => (
					<SourceCard
						key={`${s.doc_id}-${s.chunk_order}-${i}`}
						ref={(el) => (itemRefs.current[i] = el)}
						source={s}
						index={i + 1}
						highlighted={highlightIndex === i}
					/>
				))}
			</div>
		</aside>
	)
})

const SourcesEmpty = () => (
	<aside
		className='h-full flex flex-col items-center justify-center px-6 text-center'
		aria-label='Fuentes citadas'
	>
		<div className='w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-3'>
			<TbBookmark size={20} />
		</div>
		<div className='text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1'>
			Trazabilidad
		</div>
		<h3 className='text-[14.5px] font-medium text-slate-700 dark:text-slate-200'>
			Sin fuentes todavía
		</h3>
		<p className='mt-1 text-[12px] text-slate-500 dark:text-slate-400 max-w-[220px]'>
			Cuando hagas una pregunta, las fuentes que use el asistente van a aparecer acá.
		</p>
	</aside>
)

SourcesPanel.displayName = 'SourcesPanel'
export default SourcesPanel
