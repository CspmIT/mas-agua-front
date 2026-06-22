import { forwardRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TbX } from 'react-icons/tb'
import SourcesPanel from './SourcesPanel'

/**
 * Drawer deslizable desde la derecha con el panel de fuentes.
 * Cierra con: backdrop click, ESC, botón X.
 *
 * @param {{ open: boolean, onClose: () => void, sources: Array<any> }} props
 */
const SourcesDrawer = forwardRef(({ open, onClose, sources }, ref) => {
	useEffect(() => {
		if (!open) return
		const onKey = (e) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [open, onClose])

	useEffect(() => {
		if (!open) return
		const orig = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = orig
		}
	}, [open])

	return createPortal(
		<div
			className={[
				'fixed inset-0 z-[1300]',
				open ? '' : 'pointer-events-none',
			].join(' ')}
			aria-hidden={!open}
		>
			<div
				onClick={onClose}
				className={[
					'absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300',
					open ? 'opacity-100' : 'opacity-0',
				].join(' ')}
				aria-hidden
			/>
			<aside
				role='dialog'
				aria-modal='true'
				aria-label='Fuentes citadas'
				className={[
					'absolute top-0 right-0 h-full w-full sm:max-w-[420px]',
					'bg-white dark:bg-slate-900',
					'shadow-[-18px_0_50px_-14px_rgba(15,42,68,0.35)]',
					'border-l border-[#1f4e79]/10 dark:border-white/5',
					'transition-transform duration-300',
					'flex flex-col',
					open ? 'translate-x-0' : 'translate-x-full',
				].join(' ')}
				style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
			>
				<div className='shrink-0 flex items-center justify-end px-2 pt-2.5 pb-1'>
					<button
						type='button'
						onClick={onClose}
						aria-label='Cerrar trazabilidad'
						className='inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#368bed]/50'
					>
						<TbX size={15} />
					</button>
				</div>
				<div className='flex-1 min-h-0'>
					<SourcesPanel ref={ref} sources={sources} />
				</div>
			</aside>
		</div>,
		document.body
	)
})

SourcesDrawer.displayName = 'SourcesDrawer'
export default SourcesDrawer
