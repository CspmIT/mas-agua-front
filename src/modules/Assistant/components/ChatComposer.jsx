import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { IoSendSharp } from 'react-icons/io5'

const MAX = 2000
const SOFT = 1500
const LINE_HEIGHT = 22
const MAX_ROWS = 6

/**
 * @param {{
 *   onSend: (text: string) => void,
 *   disabled?: boolean,
 * }} props
 */
const ChatComposer = ({ onSend, disabled = false }) => {
	const [value, setValue] = useState('')
	const ref = useRef(null)

	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return
		el.style.height = 'auto'
		const max = LINE_HEIGHT * MAX_ROWS + 24
		el.style.height = Math.min(el.scrollHeight, max) + 'px'
		el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
	}, [value])

	useEffect(() => {
		ref.current?.focus()
	}, [])

	const submit = () => {
		const trimmed = value.trim()
		if (!trimmed || disabled) return
		onSend(trimmed)
		setValue('')
	}

	const onKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			submit()
		}
	}

	const length = value.length
	const overSoft = length >= SOFT
	const over = length > MAX
	const empty = value.trim().length === 0

	return (
		<div
			className='relative rounded-3xl border border-[#1f4e79]/12 bg-white dark:bg-slate-900/70 shadow-[0_2px_6px_rgba(15,42,68,0.05),0_18px_44px_-22px_rgba(15,42,68,0.30)] focus-within:border-[#368bed]/55 focus-within:shadow-[0_2px_8px_rgba(54,139,237,0.18),0_22px_56px_-22px_rgba(54,139,237,0.38)] transition-all duration-200'
		>
			<textarea
				ref={ref}
				value={value}
				onChange={(e) => setValue(e.target.value.slice(0, MAX + 1))}
				onKeyDown={onKeyDown}
				placeholder='Hacé una pregunta sobre la planta, manuales o variables…'
				aria-label='Hacer una pregunta al asistente'
				rows={1}
				className='w-full resize-none bg-transparent outline-none px-5 pt-4 pb-2 text-[14.5px] leading-[1.55] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 max-h-[180px]'
			/>

			<div className='flex items-center justify-between px-3.5 pb-2.5 pt-0.5 gap-3'>
				<div className='flex items-center gap-2 min-w-0'>
					<span
						className={[
							'hidden sm:inline-flex items-center px-2 h-6 rounded-full text-[10.5px] font-medium tabular-nums border',
							over
								? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
								: overSoft
								? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
								: 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-slate-500',
							overSoft ? 'opacity-100' : 'opacity-0',
						].join(' ')}
						aria-hidden={!overSoft}
					>
						{length}/{MAX}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<Tooltip title='Enviar (Enter)'>
						<span>
							<IconButton
								onClick={submit}
								disabled={empty || disabled || over}
								aria-label='Enviar pregunta'
								sx={{
									width: 38,
									height: 38,
									color: '#fff',
									background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
									boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
									transition: 'all 0.18s',
									'&:hover': {
										background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
										boxShadow: '0 8px 24px rgba(44, 106, 160, 0.5)',
										transform: 'translateY(-1px)',
									},
									'&.Mui-disabled': {
										background: 'rgba(148,163,184,0.5)',
										color: '#fff',
										boxShadow: 'none',
									},
								}}
							>
								<IoSendSharp size={15} />
							</IconButton>
						</span>
					</Tooltip>
				</div>
			</div>
		</div>
	)
}

export default ChatComposer
