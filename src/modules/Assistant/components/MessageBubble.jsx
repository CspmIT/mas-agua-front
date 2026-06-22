import { HiSparkles } from 'react-icons/hi2'
import { TbCheck, TbAlertCircle } from 'react-icons/tb'
import { AnswerBody } from '../utils/markdown.jsx'
import MessageError from './MessageError'
import FeedbackButtons from './FeedbackButtons'
import ArtifactRenderer from './artifacts/ArtifactRenderer'

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

	// Assistant — pending (POST emitido, todavía no llegó el primer evento SSE)
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

	// Assistant — streaming (respuesta armándose en tiempo real)
	if (message.status === 'streaming') {
		return (
			<article role='article' className='flex'>
				<AssistantRail />
				<div className='flex-1 min-w-0 pl-3 space-y-2'>
					{message.progress?.length > 0 && <ProgressChips items={message.progress} />}
					{/* El artifact se acumula en el estado durante el stream (onArtifact) pero NO se
					    renderiza acá: se difiere al branch final (o error) para que el gráfico aparezca
					    recién cuando el texto terminó de escribirse, en vez de plantarse arriba del
					    typewriter. Para revertir, volver a renderizar <ArtifactRenderer> en este branch. */}
					{message.content && (
						<div className='relative'>
							<AnswerBody text={message.content} onCitation={onCitationClick} />
							<BlinkingCursor />
						</div>
					)}
				</div>
			</article>
		)
	}

	// Assistant — error
	if (message.status === 'error') {
		return (
			<article role='article' className='flex'>
				<AssistantRail />
				<div className='flex-1 min-w-0 pl-3 space-y-2'>
					{/* Si el stream alcanzó a traer contenido parcial, lo mostramos arriba del error
					    para que el usuario no pierda la salida visible. */}
					{message.artifacts?.length > 0 && <ArtifactRenderer artifacts={message.artifacts} />}
					{message.content && <AnswerBody text={message.content} onCitation={onCitationClick} />}
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
				{message.artifacts?.length > 0 && <ArtifactRenderer artifacts={message.artifacts} />}
				<FeedbackButtons assistantMessage={message} />
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

/**
 * @param {{ items: Array<{ id: string, label: string, loading?: boolean, error?: boolean }> }} props
 */
const ProgressChips = ({ items }) => (
	<div className='flex flex-wrap gap-1.5'>
		{items.map((p) => (
			<ProgressChip key={p.id} {...p} />
		))}
	</div>
)

const ProgressChip = ({ label, loading, error }) => {
	const base =
		'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium border tabular-nums transition-colors'
	if (error) {
		return (
			<span
				className={`${base} bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300`}
			>
				<TbAlertCircle size={12} />
				<span>{label}</span>
			</span>
		)
	}
	if (loading) {
		return (
			<span
				className={`${base} bg-[#368bed]/10 border-[#368bed]/30 text-[#1f4e79] dark:text-[#9ec5f4]`}
			>
				<span
					className='inline-block w-2.5 h-2.5 rounded-full border-2 border-[#368bed]/30 border-t-[#368bed] animate-spin'
					aria-hidden
				/>
				<span>{label}</span>
			</span>
		)
	}
	return (
		<span
			className={`${base} bg-slate-50 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-300`}
		>
			<TbCheck size={12} className='text-[#10B981]' />
			<span>{label}</span>
		</span>
	)
}

const BlinkingCursor = () => (
	<span
		aria-hidden
		className='inline-block w-[7px] h-[14px] ml-0.5 align-[-1px] bg-[#368bed] rounded-[1px] animate-pulse'
	/>
)

export default MessageBubble
