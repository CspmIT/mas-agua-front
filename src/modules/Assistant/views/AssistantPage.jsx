import { useEffect, useMemo, useRef, useState } from 'react'
import { Container, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'
import { TbBookmark, TbFileText } from 'react-icons/tb'
import { useAssistantChat } from '../hooks/useAssistantChat'
import MessageList from '../components/MessageList'
import ChatComposer from '../components/ChatComposer'
import SuggestionsEmpty from '../components/SuggestionsEmpty'
import SourcesDrawer from '../components/SourcesDrawer'
import { storage } from '../../../storage/storage'

const AssistantPage = () => {
	const sourcesRef = useRef(null)
	const [sourcesOpen, setSourcesOpen] = useState(false)
	const { messages, enableTools, isSending, sendQuestion, retryMessage, toggleTools } =
		useAssistantChat()
	const isSuperAdmin = storage.get('usuario')?.profile === 4

	const lastAssistant = useMemo(() => {
		for (let i = messages.length - 1; i >= 0; i--) {
			const m = messages[i]
			if (m.role === 'assistant' && !m.status) return m
		}
		return null
	}, [messages])

	const visibleSources = lastAssistant?.sources || []

	const onCitationClick = (_msgId, n) => {
		setSourcesOpen(true)
		// Esperar al próximo frame para que el panel exista antes de hacer scroll/highlight.
		requestAnimationFrame(() => sourcesRef.current?.highlight(n))
	}



	const isEmpty = messages.length === 0

	return (
		<Container maxWidth={false} disableGutters className='w-full px-2 sm:px-4 pt-1'>
			<section
				className='relative rounded-3xl border border-[#1f4e79]/5 bg-white/85 dark:bg-slate-900/40 backdrop-blur-[1px] shadow-[0_2px_8px_rgba(15,42,68,0.05),0_28px_60px_-30px_rgba(15,42,68,0.30)] overflow-hidden flex flex-col'
				style={{ height: 'calc(100dvh - 124px)' }}
				aria-label='Conversación con el asistente'
			>
				<DotsTexture />

				<TopBar
					sourcesCount={visibleSources.length}
					onOpenSources={() => setSourcesOpen(true)}
					isSuperAdmin={isSuperAdmin}
				/>

				<div className='relative flex-1 min-h-0 flex flex-col'>
					{isEmpty ? (
						<div className='flex-1 min-h-0 flex items-center justify-center overflow-y-auto'>
							<SuggestionsEmpty
								onPick={(text, opts = {}) => {
									if (opts.enableTools) toggleTools(true)
									sendQuestion(text, { enableTools: opts.enableTools ?? enableTools })
								}}
							/>
						</div>
					) : (
						<MessageList
							messages={messages}
							onCitationClick={onCitationClick}
							onRetry={retryMessage}
						/>
					)}

					<div className='shrink-0 border-t border-[#1f4e79]/8 dark:border-white/5 bg-gradient-to-b from-transparent to-white/80 dark:to-slate-900/60 px-3 sm:px-5 pt-3 pb-2'>
						<ChatComposer
							onSend={(text) => sendQuestion(text)}
							disabled={isSending}
							enableTools={enableTools}
							onToggleTools={() => toggleTools()}
						/>
						<p className='mt-3 text-center text-[11px] leading-tight text-slate-400 dark:text-slate-500'>
							El asistente es IA y puede cometer errores. Por favor, verificá las respuestas.
						</p>
					</div>
				</div>
			</section>

			<SourcesDrawer
				ref={sourcesRef}
				open={sourcesOpen}
				onClose={() => setSourcesOpen(false)}
				sources={visibleSources}
			/>
		</Container>
	)
}

const TopBar = ({ sourcesCount, onOpenSources, isSuperAdmin }) => (
	<div className='shrink-0 relative z-10 flex items-center justify-end gap-1 px-2 sm:px-3 pt-2.5 pb-1.5'>
		{isSuperAdmin && (
			<Tooltip title='Documentos del asistente'>
				<Link
					to='/assistant/docs'
					aria-label='Documentos del asistente'
					className='inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#1f4e79] dark:hover:text-[#7fb6ef] hover:bg-[#368bed]/8 transition-colors no-underline'
				>
					<TbFileText size={12} />
					<span className='hidden sm:inline'>Documentos</span>
				</Link>
			</Tooltip>
		)}

		<Tooltip title={sourcesCount > 0 ? 'Ver fuentes citadas' : 'Aún no hay fuentes'}>
			<span>
				<button
					type='button'
					onClick={onOpenSources}
					disabled={sourcesCount === 0}
					aria-label={
						sourcesCount > 0
							? `Abrir trazabilidad: ${sourcesCount} fuentes`
							: 'Trazabilidad sin fuentes'
					}
					className={[
						'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-medium transition-all',
						sourcesCount > 0
							? 'bg-[#368bed]/10 hover:bg-[#368bed]/22 text-[#1f4e79] dark:text-[#9ec5f4] border border-[#368bed]/25 hover:border-[#368bed]/45 cursor-pointer'
							: 'text-slate-400 dark:text-slate-600 cursor-default',
					].join(' ')}
				>
					<TbBookmark size={12} />
					<span className='hidden sm:inline'>Trazabilidad</span>
					{sourcesCount > 0 && (
						<span className='inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#368bed] text-white text-[10px] font-semibold tabular-nums'>
							{sourcesCount}
						</span>
					)}
				</button>
			</span>
		</Tooltip>
	</div>
)

const DotsTexture = () => (
	<div
		className='pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]'
		aria-hidden
		style={{
			backgroundImage: 'radial-gradient(circle, #1f4e79 1px, transparent 1px)',
			backgroundSize: '18px 18px',
			maskImage:
				'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.7), rgba(0,0,0,0.1) 60%, transparent 80%)',
			WebkitMaskImage:
				'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.7), rgba(0,0,0,0.1) 60%, transparent 80%)',
		}}
	/>
)

export default AssistantPage
