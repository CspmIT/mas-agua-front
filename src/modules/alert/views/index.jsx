import { useContext, useEffect, useMemo, useState } from 'react'
import { Container, IconButton, Tooltip } from '@mui/material'
import Swal from 'sweetalert2'
import { FaEye } from 'react-icons/fa'
import { MdOutlineInbox } from 'react-icons/md'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import LoaderComponent from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import { MainContext } from '../../../context/MainContext'
import AlarmCard from '../components/AlarmCard'
import AlarmToolbar from '../components/AlarmToolbar'
import { parseAlarmMessage, parseTriggeredAt, relativeLabel } from '../utils/parseAlarm'

const PAGE_SIZE = 10

const Alert = () => {
	const [alarms, setAlarms] = useState([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState('all')
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const { fetchUnreadCount } = useContext(MainContext)

	const fetchLogs_Alarms = async () => {
		const url = backend[import.meta.env.VITE_APP_NAME]
		try {
			setLoading(true)
			const { data } = await request(`${url}/listAlerts`, 'GET')
			setAlarms(Array.isArray(data) ? data : [])
		} catch (error) {
			console.error(error)
			Swal.fire({
				title: 'Error',
				text: 'No se pudieron obtener los datos de las alarmas.',
				icon: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async (id) => {
		const url = backend[import.meta.env.VITE_APP_NAME]
		try {
			await request(`${url}/alerts/viewed/${id}`, 'PUT')
			fetchUnreadCount()
			fetchLogs_Alarms()
		} catch (error) {
			console.error(error)
			Swal.fire({
				title: 'Error',
				text: 'No se pudo marcar la alerta como leída.',
				icon: 'error',
				showConfirmButton: false,
				timer: 1500,
			})
		}
	}

	const markAllAsRead = async () => {
		const url = backend[import.meta.env.VITE_APP_NAME]
		try {
			await request(`${url}/alerts/allviewed`, 'PUT')
			fetchUnreadCount()
			fetchLogs_Alarms()
			Swal.fire({
				title: 'Listo',
				text: 'Todas las alertas fueron marcadas como leídas.',
				icon: 'success',
				showConfirmButton: false,
				timer: 1500,
			})
		} catch (error) {
			console.error(error)
			Swal.fire({
				title: 'Error',
				text: 'No se pudieron marcar todas las alertas como leídas.',
				icon: 'error',
			})
		}
	}

	useEffect(() => {
		fetchLogs_Alarms()
	}, [])

	useEffect(() => {
		setPage(1)
	}, [filter, search])

	const stats = useMemo(() => {
		const total = alarms.length
		const unread = alarms.filter((a) => !a.viewed).length
		return { total, unread, read: total - unread }
	}, [alarms])

	const lastAlarmLabel = useMemo(() => {
		if (!alarms.length) return ''
		const latest = alarms.reduce((acc, a) => {
			const d = parseTriggeredAt(a.triggeredAt)
			if (!d) return acc
			if (!acc || d > acc) return d
			return acc
		}, null)
		return relativeLabel(latest) || latest?.toLocaleDateString('es-AR') || ''
	}, [alarms])

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		return alarms.filter((a) => {
			if (filter === 'unread' && a.viewed) return false
			if (filter === 'read' && !a.viewed) return false
			if (!q) return true
			const parsed = parseAlarmMessage(a.message)
			const haystack = [
				parsed.alarmName,
				parsed.condition,
				...(parsed.parts || []),
				a.message,
				a.value,
				a.triggeredAt,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
			return haystack.includes(q)
		})
	}, [alarms, filter, search])

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
	const currentPage = Math.min(page, totalPages)
	const pageStart = (currentPage - 1) * PAGE_SIZE
	const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

	const grouped = useMemo(() => {
		const unread = pageItems.filter((a) => !a.viewed)
		const read = pageItems.filter((a) => a.viewed)
		return { unread, read }
	}, [pageItems])

	const hasUnread = stats.unread > 0

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			{loading ? (
				<LoaderComponent />
			) : (
				<>
					<PageHeader
						title='Registro de alarmas'
						action={
							hasUnread && (
								<Tooltip title='Marcar todas como leídas'>
									<IconButton
										onClick={markAllAsRead}
										sx={{
											color: 'white',
											background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
											boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
											borderRadius: '999px',
											px: 2.25,
											py: 1,
											gap: 1,
											fontSize: '0.85rem',
											fontWeight: 500,
											transition: 'all 0.2s',
											'&:hover': {
												background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
												boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
												transform: 'translateY(-1px)',
											},
										}}
									>
										<FaEye />
										<span>Marcar todas</span>
									</IconButton>
								</Tooltip>
							)
						}
					/>

					<AlarmToolbar
						stats={stats}
						filter={filter}
						onFilterChange={setFilter}
						search={search}
						onSearchChange={setSearch}
						lastAlarmLabel={lastAlarmLabel}
					/>

					{filtered.length === 0 ? (
						<EmptyState
							hasData={alarms.length > 0}
							onClearFilters={() => {
								setFilter('all')
								setSearch('')
							}}
						/>
					) : (
						<>
							<div className='space-y-4'>
								{grouped.unread.length > 0 && (
									<div className='space-y-1.5'>
										{grouped.unread.map((a, i) => (
											<AlarmCard
												key={a.id}
												alarm={a}
												onMarkAsRead={markAsRead}
												index={i}
											/>
										))}
									</div>
								)}

								{grouped.read.length > 0 && (
									<section>
										<div className='flex items-center gap-3 mb-3 mt-2 px-1'>
											<span className='text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'>
												Anteriores
											</span>
											<hr className='flex-1 border-0 border-t border-slate-200 dark:border-white/10 m-0' />
										</div>
										<div className='space-y-1.5'>
											{grouped.read.map((a, i) => (
												<AlarmCard
													key={a.id}
													alarm={a}
													onMarkAsRead={markAsRead}
													index={i}
												/>
											))}
										</div>
									</section>
								)}
							</div>

							{totalPages > 1 && (
								<div
									className='mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-2 rounded-full'
									style={{
										background: 'linear-gradient(180deg, #ffffff 0%, #f3f6fa 100%)',
										boxShadow:
											'0 1px 2px rgba(15,42,68,0.06), 0 3px 6px -2px rgba(15,42,68,0.1), inset 0 1px 0 rgba(255,255,255,0.75)',
										border: '1px solid rgba(15,42,68,0.08)',
									}}
								>
									<span className='text-[12px] text-slate-500 tabular-nums pl-2'>
										Mostrando {pageStart + 1}–
										{Math.min(pageStart + PAGE_SIZE, filtered.length)} de {filtered.length}
									</span>
									<div className='inline-flex items-center gap-1'>
										<PagerButton
											disabled={currentPage === 1}
											onClick={() => setPage(currentPage - 1)}
										>
											Anterior
										</PagerButton>
										<span className='text-[12px] font-semibold text-slate-700 px-3 tabular-nums'>
											{currentPage} / {totalPages}
										</span>
										<PagerButton
											disabled={currentPage === totalPages}
											onClick={() => setPage(currentPage + 1)}
										>
											Siguiente
										</PagerButton>
									</div>
								</div>
							)}
						</>
					)}
				</>
			)}
		</Container>
	)
}

const PagerButton = ({ disabled, onClick, children }) => (
	<button
		type='button'
		disabled={disabled}
		onClick={onClick}
		className={[
			'px-3 py-1 rounded-full text-[12px] font-medium transition-colors',
			disabled
				? 'text-slate-300 cursor-not-allowed'
				: 'text-[#1f4e79] hover:bg-[#368bed]/10 hover:text-[#2c6aa0]',
		].join(' ')}
		style={{ border: 'none', background: 'transparent' }}
	>
		{children}
	</button>
)

const EmptyState = ({ hasData, onClearFilters }) => (
	<div className='flex flex-col items-center justify-center py-14 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-center'>
		<div className='w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3'>
			<MdOutlineInbox size={28} />
		</div>
		<h3 className='text-[15px] font-semibold text-slate-700 dark:text-slate-200'>
			{hasData ? 'Sin resultados' : 'Sin alarmas registradas'}
		</h3>
		<p className='mt-1 text-[13px] text-slate-500 dark:text-slate-400 max-w-xs'>
			{hasData
				? 'Probá ajustando el filtro o la búsqueda para ver otros eventos.'
				: 'Cuando se disparen alarmas, vas a verlas listadas acá.'}
		</p>
		{hasData && (
			<button
				type='button'
				onClick={onClearFilters}
				className='mt-3 inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-[12px] font-medium transition-colors'
			>
				Limpiar filtros
			</button>
		)}
	</div>
)

export default Alert
