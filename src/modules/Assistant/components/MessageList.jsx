import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TbArrowDown } from 'react-icons/tb'
import MessageBubble from './MessageBubble'

const STICK_THRESHOLD = 80

/**
 * @param {{
 *   messages: Array<any>,
 *   onCitationClick?: (msgId: string, n: number) => void,
 *   onRetry?: (id: string) => void,
 * }} props
 */
const MessageList = ({ messages, onCitationClick, onRetry }) => {
	const ref = useRef(null)
	const [stick, setStick] = useState(true)
	const [showJump, setShowJump] = useState(false)

	// Detecta si el usuario scrolleó arriba
	useEffect(() => {
		const el = ref.current
		if (!el) return
		const onScroll = () => {
			const distance = el.scrollHeight - el.scrollTop - el.clientHeight
			const atBottom = distance < STICK_THRESHOLD
			setStick(atBottom)
			setShowJump(!atBottom && messages.length > 0)
		}
		el.addEventListener('scroll', onScroll, { passive: true })
		return () => el.removeEventListener('scroll', onScroll)
	}, [messages.length])

	// Auto-scroll cuando estamos pegados al fondo
	useLayoutEffect(() => {
		const el = ref.current
		if (!el || !stick) return
		el.scrollTop = el.scrollHeight
	}, [messages, stick])

	const jump = () => {
		const el = ref.current
		if (!el) return
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
	}

	return (
		<div className='relative flex-1 min-h-0'>
			<div
				ref={ref}
				role='log'
				aria-live='polite'
				aria-label='Conversación con el asistente'
				className='absolute inset-0 overflow-y-auto px-3 sm:px-5 pt-4 pb-2 space-y-5 scrollbar-thin'
				style={{ scrollbarGutter: 'stable both-edges' }}
			>
				{messages.map((m, i) => (
					<MessageBubble
						key={m.id}
						message={m}
						onCitationClick={(n) => onCitationClick?.(m.id, n)}
						onRetry={onRetry}
					/>
				))}
				<div className='h-1' />
			</div>

			{showJump && (
				<button
					type='button'
					onClick={jump}
					aria-label='Ir al final'
					className='absolute right-4 bottom-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/95 dark:bg-slate-900/85 border border-[#1f4e79]/15 dark:border-white/10 backdrop-blur-sm shadow-[0_8px_22px_-10px_rgba(15,42,68,0.35)] text-[12px] font-medium text-[#1f4e79] dark:text-[#7fb6ef] hover:bg-white dark:hover:bg-slate-900 transition-all'
				>
					<TbArrowDown size={13} />
					Mensajes nuevos
				</button>
			)}
		</div>
	)
}

export default MessageList
