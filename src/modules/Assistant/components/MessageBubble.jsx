import { HiSparkles } from 'react-icons/hi2'
import { AnswerBody } from '../utils/markdown.jsx'
import ToolCallTrace from './ToolCallTrace'
import MessageError from './MessageError'

/**
 * @param {{
 *   message: any,
 *   onCitationClick?: (n: number) => void,
 *   onRetry?: (id: string) => void,
 * }} props
 */
const MessageBubble = ({ message, onCitationClick, onRetry }) => {
	if (message.role === 'user') {
		return (
			<article role='article' className='flex justify-end'>
				<div className='max-w-[78%] rounded-3xl rounded-br-lg px-4 py-2.5 text-[14.5px] leading-[1.55] text-white shadow-[0_4px_18px_-6px_rgba(31,78,121,0.5)] bg-gradient-to-br from-[#2c6aa0] to-[#1f4e79]'>
					<div className='whitespace-pre-line'>{message.content}</div>
				</div>
			</article>
		)
	}

	// Assistant — pending
	if (message.status === 'pending') {
		return (
			<article role='article' className='flex'>
				<AssistantRail />
				<div className='flex-1 min-w-0 pl-3'>
					<div className='inline-flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-slate-400'>
						<span className='inline-flex gap-1' aria-hidden>
							<span
								className='inline-block w-1.5 h-1.5 rounded-full bg-[#368bed] animate-bounce'
								style={{ animationDelay: '0ms' }}
							/>
							<span
								className='inline-block w-1.5 h-1.5 rounded-full bg-[#368bed] animate-bounce'
								style={{ animationDelay: '120ms' }}
							/>
							<span
								className='inline-block w-1.5 h-1.5 rounded-full bg-[#368bed] animate-bounce'
								style={{ animationDelay: '240ms' }}
							/>
						</span>
						<span className='italic tracking-tight'>Pensando…</span>
					</div>
				</div>
			</article>
		)
	}

	// Assistant — error
	if (message.status === 'error') {
		return (
			<article role='article' className='flex'>
				<AssistantRail />
				<div className='flex-1 min-w-0 pl-3'>
					<MessageError
						message={message.error}
						code={message.errorCode}
						onRetry={() => onRetry?.(message.id)}
					/>
				</div>
			</article>
		)
	}

	// Assistant — full answer
	return (
		<article role='article' className='flex'>
			<AssistantRail />
			<div className='flex-1 min-w-0 pl-3'>
				<AnswerBody text={message.content} onCitation={onCitationClick} />
				{message.toolCalls?.length > 0 && <ToolCallTrace toolCalls={message.toolCalls} />}
			</div>
		</article>
	)
}

const AssistantRail = () => (
	<div className='shrink-0 flex flex-col items-center w-7 pt-1' aria-hidden>
		<div className='relative w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-[#368bed]/30 shadow-[0_4px_14px_-6px_rgba(54,139,237,0.45)] flex items-center justify-center text-[#1f4e79] dark:text-[#7fb6ef]'>
			<HiSparkles size={13} />
		</div>
		<div className='mt-1 w-px flex-1 bg-gradient-to-b from-[#368bed]/40 via-[#368bed]/10 to-transparent' />
	</div>
)

export default MessageBubble
