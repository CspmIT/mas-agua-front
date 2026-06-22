import { InputAdornment, TextField } from '@mui/material'
import { FaSearch } from 'react-icons/fa'
import { MdNotificationsActive, MdOutlineDoneAll, MdOutlineInbox } from 'react-icons/md'

const FILTERS = [
	{ key: 'all', label: 'Todas', icon: MdOutlineInbox },
	{ key: 'unread', label: 'Nuevas', icon: MdNotificationsActive },
	{ key: 'read', label: 'Vistas', icon: MdOutlineDoneAll },
]

const TONES = {
	default: '#64748b',
	primary: '#368bed',
	warning: '#d8621d',
}

const INNER_SURFACE = 'linear-gradient(180deg, #ffffff 0%, #f3f6fa 100%)'
const INNER_BORDER = '1px solid rgba(15,42,68,0.08)'
const INNER_SHADOW =
	'0 1px 2px rgba(15,42,68,0.06), 0 3px 6px -2px rgba(15,42,68,0.1), inset 0 1px 0 rgba(255,255,255,0.75)'

const Kpi = ({ label, value, tone = 'default' }) => (
	<div
		className='flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl flex-1 min-w-0 transition-all duration-200 hover:-translate-y-[1px]'
		style={{
			background: INNER_SURFACE,
			boxShadow: INNER_SHADOW,
			border: INNER_BORDER,
		}}
	>
		<div className='flex items-center gap-3 min-w-0'>
			<span
				className='w-[3px] h-7 rounded-full shrink-0'
				style={{
					background: `linear-gradient(180deg, ${TONES[tone] || TONES.default} 0%, rgba(0,0,0,0.18) 100%)`,
					boxShadow: `0 0 4px ${TONES[tone] || TONES.default}55`,
				}}
			/>
			<span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 truncate'>
				{label}
			</span>
		</div>
		<span className='text-[17px] leading-none font-semibold tabular-nums text-slate-800 shrink-0'>
			{value}
		</span>
	</div>
)

const AlarmToolbar = ({ stats, filter, onFilterChange, search, onSearchChange, lastAlarmLabel }) => {
	const counts = { all: stats.total, unread: stats.unread, read: stats.read }

	return (
		<div
			className='mb-3 rounded-2xl p-2 sm:p-2.5'
			style={{
				background: 'linear-gradient(150deg, #2c6aa0 0%, #1f4e79 75%, #1f4e79 100%)',
				boxShadow:
					'0 2px 6px rgba(44,106,160,0.18), 0 10px 22px -10px rgba(44,106,160,0.38), inset 0 1px 0 rgba(255,255,255,0.14)',
				border: '1px solid rgba(15,42,68,0.4)',
			}}
		>
			<div className='flex flex-col sm:flex-row gap-2 mb-2'>
				<Kpi label='Total' value={stats.total} tone='default' />
				<Kpi label='Nuevas' value={stats.unread} tone={stats.unread > 0 ? 'primary' : 'default'} />
				<Kpi label='Última' value={lastAlarmLabel || '—'} tone='warning' />
			</div>

			<div className='flex flex-col sm:flex-row sm:items-center gap-2'>
				<div
					className='inline-flex items-center gap-0.5 p-1 rounded-full self-start'
					style={{
						backgroundColor: '#ffffff',
						boxShadow: '0 1px 2px rgba(15,42,68,0.05)',
						border: '1px solid rgba(15,42,68,0.08)',
					}}
				>
					{FILTERS.map(({ key, label, icon: Icon }) => {
						const active = filter === key
						return (
							<button
								key={key}
								type='button'
								onClick={() => onFilterChange(key)}
								className={[
									'inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium transition-colors duration-150 select-none',
									active ? 'text-[#1f4e79]' : 'text-slate-500 hover:text-slate-800',
								].join(' ')}
								style={
									active
										? {
												padding: '6px 12px',
												background:
													'linear-gradient(180deg, rgba(54,139,237,0.18) 0%, rgba(54,139,237,0.08) 100%)',
												border: '1px solid rgba(54,139,237,0.22)',
												boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
										  }
										: { padding: '6px 12px', border: 'none', background: 'transparent' }
								}
							>
								<Icon size={13} />
								<span>{label}</span>
								<span
									className='ml-0.5 tabular-nums text-[10.5px] font-semibold rounded-full px-2 py-[1px]'
									style={
										active
											? {
													background:
														'linear-gradient(145deg, #368bed 0%, #1f4e79 100%)',
													color: '#ffffff',
													boxShadow:
														'0 1px 2px rgba(44,106,160,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
											  }
											: {
													background: '#e2e8f0',
													color: '#64748b',
											  }
									}
								>
									{counts[key]}
								</span>
							</button>
						)
					})}
				</div>

				<div className='flex-1 sm:max-w-xs sm:ml-auto'>
					<TextField
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder='Buscar por nombre, variable, valor…'
						size='small'
						fullWidth
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<FaSearch size={12} className='text-slate-400' />
								</InputAdornment>
							),
						}}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: '999px',
								background: INNER_SURFACE,
								color: '#1f2937',
								fontSize: '13px',
								boxShadow: INNER_SHADOW,
								'& fieldset': { borderColor: 'rgba(15,42,68,0.08)' },
								'&:hover fieldset': { borderColor: 'rgba(54,139,237,0.4)' },
								'&.Mui-focused fieldset': { borderColor: '#ffffff', borderWidth: 1.5 },
								'& input::placeholder': { color: '#94a3b8', opacity: 1 },
							},
						}}
					/>
				</div>
			</div>
		</div>
	)
}

export default AlarmToolbar
