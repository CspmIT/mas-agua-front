import { useEffect, useRef, useState } from 'react'
import { Tooltip } from '@mui/material'
import { TbPlus, TbDotsVertical, TbPencil, TbTrash, TbMessageCircle } from 'react-icons/tb'

/**
 * Sidebar izquierdo del módulo Assistant con la lista de conversaciones y
 * acciones (crear, seleccionar, borrar, renombrar).
 *
 * Reutiliza la paleta del proyecto (#368bed, #1f4e79) y la estética del panel
 * principal (bordes blandos, glass effect, dark mode).
 *
 * @param {{
 *   conversations: Array<{id:number, title:string, messageCount:number, lastMessageAt:string, createdAt?:string}>,
 *   conversationsHasMore: boolean,
 *   currentConversationId: number|null,
 *   onSelect: (id: number) => void,
 *   onNew: () => void,
 *   onDelete: (id: number) => Promise<void>,
 *   onRename: (id: number, title: string) => Promise<void>,
 *   onLoadMore: () => Promise<void>,
 * }} props
 */
const ConversationSidebar = ({
	conversations,
	conversationsHasMore,
	currentConversationId,
	onSelect,
	onNew,
	onDelete,
	onRename,
	onLoadMore,
}) => (
	<aside
		aria-label='Conversaciones guardadas'
		className='shrink-0 flex flex-col w-60 border-r border-[#1f4e79]/8 dark:border-white/5 bg-white/60 dark:bg-slate-900/30 backdrop-blur-[1px]'
	>
		{/* Header */}
		<div className='shrink-0 p-3 border-b border-[#1f4e79]/8 dark:border-white/5'>
			<button
				type='button'
				onClick={onNew}
				className='w-full inline-flex items-center justify-center gap-2 h-9 px-3 py-0 border-0 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-[#368bed] to-[#2c6aa0] hover:from-[#2c6aa0] hover:to-[#1f4e79] shadow-[0_6px_18px_-8px_rgba(54,139,237,0.65)] transition-colors'
			>
				<TbPlus size={15} />
				Nueva conversación
			</button>
		</div>

		{/* Lista */}
		<div className='flex-1 min-h-0 overflow-y-auto scrollbar-thin'>
			{conversations.length === 0 ? (
				<EmptyState />
			) : (
				<ul className='py-1.5 px-1'>
					{conversations.map((c) => (
						<ConversationItem
							key={c.id}
							conversation={c}
							isActive={c.id === currentConversationId}
							onSelect={() => onSelect(c.id)}
							onDelete={() => onDelete(c.id)}
							onRename={(newTitle) => onRename(c.id, newTitle)}
						/>
					))}
				</ul>
			)}

			{conversationsHasMore && (
				<div className='px-3 py-2'>
					<button
						type='button'
						onClick={onLoadMore}
						className='w-full text-[11.5px] font-medium text-[#368bed] hover:text-[#1f4e79] dark:hover:text-[#9ec5f4] py-1.5 px-0 border-0 rounded-md bg-transparent hover:bg-[#368bed]/8 transition-colors'
					>
						Cargar más antiguas
					</button>
				</div>
			)}
		</div>
	</aside>
)

const EmptyState = () => (
	<div className='p-6 text-center text-[12.5px] text-slate-400 dark:text-slate-500'>
		<TbMessageCircle size={22} className='mx-auto mb-2 opacity-50' />
		<p>Todavía no tenés conversaciones guardadas.</p>
		<p className='mt-0.5'>Iniciá una nueva consulta.</p>
	</div>
)

/**
 * Item individual del sidebar con menú flotante (renombrar / borrar) y
 * renombrado inline.
 */
const ConversationItem = ({ conversation, isActive, onSelect, onDelete, onRename }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [draftTitle, setDraftTitle] = useState(conversation.title)
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef(null)

	useEffect(() => {
		setDraftTitle(conversation.title)
	}, [conversation.title])

	// Cierra el menú al click fuera.
	useEffect(() => {
		if (!menuOpen) return
		const onDocClick = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [menuOpen])

	const submitRename = async () => {
		const trimmed = draftTitle.trim()
		if (!trimmed || trimmed === conversation.title) {
			setIsEditing(false)
			setDraftTitle(conversation.title)
			return
		}
		try {
			await onRename(trimmed)
		} catch (_) {
			setDraftTitle(conversation.title)
		}
		setIsEditing(false)
	}

	const confirmDelete = async () => {
		if (!window.confirm(`¿Borrar la conversación "${conversation.title}"?`)) return
		try {
			await onDelete()
		} catch (_) {
			/* el hook ya logueó; en un futuro mostrar toast */
		}
	}

	return (
		<li
			className={[
				'group relative rounded-xl mb-0.5 transition-colors',
				isActive
					? 'bg-[#368bed]/12 dark:bg-[#368bed]/15 ring-1 ring-[#368bed]/25'
					: 'hover:bg-[#1f4e79]/5 dark:hover:bg-white/5',
			].join(' ')}
		>
			<div
				role='button'
				tabIndex={0}
				onClick={() => !isEditing && onSelect()}
				onKeyDown={(e) => {
					if (isEditing) return
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						onSelect()
					}
				}}
				className='block px-2.5 py-2 cursor-pointer'
			>
				{isEditing ? (
					<input
						autoFocus
						type='text'
						value={draftTitle}
						maxLength={120}
						onChange={(e) => setDraftTitle(e.target.value)}
						onBlur={submitRename}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								submitRename()
							}
							if (e.key === 'Escape') {
								setIsEditing(false)
								setDraftTitle(conversation.title)
							}
						}}
						onClick={(e) => e.stopPropagation()}
						className='w-full text-[13px] font-medium px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-[#368bed]/50 rounded-md outline-none focus:border-[#368bed] text-slate-800 dark:text-slate-100'
					/>
				) : (
					<div className='flex items-start justify-between gap-2'>
						<div className='flex-1 min-w-0'>
							<p
								className={[
									'text-[13px] font-medium truncate',
									isActive
										? 'text-[#1f4e79] dark:text-[#9ec5f4]'
										: 'text-slate-700 dark:text-slate-200',
								].join(' ')}
								title={conversation.title}
							>
								{conversation.title || 'Sin título'}
							</p>
							<p className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums'>
								{conversation.messageCount} {conversation.messageCount === 1 ? 'mensaje' : 'mensajes'} ·{' '}
								{formatRelativeDate(conversation.lastMessageAt)}
							</p>
						</div>

						<div
							ref={menuRef}
							className={[
								'shrink-0 relative transition-opacity',
								isActive || menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
							].join(' ')}
							onClick={(e) => e.stopPropagation()}
						>
							<Tooltip title='Más opciones' enterDelay={400}>
								<button
									type='button'
									onClick={() => setMenuOpen((v) => !v)}
									aria-label='Más opciones'
									className='inline-flex items-center justify-center w-6 h-6 p-0 border-0 rounded-md bg-transparent text-slate-500 dark:text-slate-400 hover:bg-[#1f4e79]/10 dark:hover:bg-white/10 hover:text-[#1f4e79] dark:hover:text-[#7fb6ef]'
								>
									<TbDotsVertical size={14} />
								</button>
							</Tooltip>

							{menuOpen && (
								<div
									role='menu'
									className='absolute right-0 top-7 z-20 min-w-[150px] py-1 bg-white dark:bg-slate-900 border border-[#1f4e79]/12 dark:border-white/10 rounded-lg shadow-[0_12px_28px_-12px_rgba(15,42,68,0.35)]'
								>
									<MenuItem
										icon={<TbPencil size={13} />}
										onClick={() => {
											setMenuOpen(false)
											setIsEditing(true)
										}}
									>
										Renombrar
									</MenuItem>
									<MenuItem
										icon={<TbTrash size={13} />}
										danger
										onClick={() => {
											setMenuOpen(false)
											confirmDelete()
										}}
									>
										Borrar
									</MenuItem>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</li>
	)
}

const MenuItem = ({ icon, danger, onClick, children }) => (
	<button
		type='button'
		role='menuitem'
		onClick={onClick}
		className={[
			'w-full flex items-center gap-2 px-3 py-1.5 border-0 bg-transparent text-[12.5px] text-left transition-colors',
			danger
				? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
				: 'text-slate-700 dark:text-slate-200 hover:bg-[#368bed]/10 dark:hover:bg-[#368bed]/15',
		].join(' ')}
	>
		<span className='shrink-0 opacity-80'>{icon}</span>
		{children}
	</button>
)

const formatRelativeDate = (iso) => {
	if (!iso) return ''
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) return ''
	const now = new Date()
	const diffMs = now - date
	const diffMin = Math.floor(diffMs / 60000)
	if (diffMin < 1) return 'hace un instante'
	if (diffMin < 60) return `hace ${diffMin} min`
	const diffH = Math.floor(diffMin / 60)
	if (diffH < 24) return `hace ${diffH} h`
	const diffD = Math.floor(diffH / 24)
	if (diffD < 7) return `hace ${diffD} d`
	return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default ConversationSidebar
