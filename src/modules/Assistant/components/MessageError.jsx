import { MdOutlineErrorOutline } from 'react-icons/md'
import { TbReload } from 'react-icons/tb'

/**
 * @param {{ message: string, code?: string, onRetry: () => void }} props
 */
const MessageError = ({ message, code, onRetry }) => {
	const isDegraded = code === 'service' || code === 'network' || code === 'timeout'
	const isRate = code === 'rate'
	const eyebrow = isRate
		? 'Demasiadas consultas'
		: isDegraded
		? 'Servicio degradado'
		: 'No pudimos completar la consulta'
	return (
		<div
			role='alert'
			className='relative rounded-2xl border border-rose-200/80 dark:border-rose-500/25 bg-rose-50/60 dark:bg-rose-500/[0.06] p-4 pr-5'
		>
			<div className='absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-rose-400 via-rose-500 to-rose-400' />
			<div className='flex items-start gap-3 pl-2'>
				<div className='shrink-0 w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 flex items-center justify-center'>
					<MdOutlineErrorOutline size={18} />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='text-[10.5px] font-semibold uppercase tracking-[0.16em] text-rose-700/90 dark:text-rose-300 mb-0.5'>
						{eyebrow}
					</div>
					<p className='text-[13.5px] text-rose-900/90 dark:text-rose-100/90 leading-snug'>
						{message}
					</p>
					<button
						type='button'
						onClick={onRetry}
						className='mt-2.5 inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-white dark:bg-white/10 border border-rose-200 dark:border-white/10 text-[12px] font-medium text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-white/15 transition-colors'
					>
						<TbReload size={13} />
						Reintentar
					</button>
				</div>
			</div>
		</div>
	)
}

export default MessageError
