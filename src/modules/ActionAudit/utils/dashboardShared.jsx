import { Tooltip } from '@mui/material'
import { FaInfoCircle } from 'react-icons/fa'
import CardCustom from '../../../components/CardCustom'

// Piezas compartidas entre el dashboard de uso (AuditDashboard) y el de
// tareas automáticas (CronDashboard).

// Un tono por gráfico: conteos en azul, tiempos/demanda en naranja,
// actividad de usuarios/sesiones en violeta. Los colores de estado
// (verde/ámbar/rojo) quedan reservados para resultados.
export const COLOR = {
	count: '#368bed',
	duration: '#d8621d',
	activity: '#8b5cf6',
	ok: '#10B981',
	error: '#ef4444',
}

export const RANGES = [
	{ days: 7, label: '7 días' },
	{ days: 30, label: '30 días' },
	{ days: 90, label: '90 días' },
]

const pad = (n) => String(n).padStart(2, '0')

// Claves de día/hora en horario argentino (offset fijo -03), consistentes
// con el agrupamiento del backend. La DB guarda en UTC.
const artParts = (date) => new Date(date.getTime() - 3 * 60 * 60 * 1000)

export const artDayKey = (date) => {
	const s = artParts(date)
	return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`
}

export const artHourKey = (date) => {
	const s = artParts(date)
	return `${artDayKey(date)} ${pad(s.getUTCHours())}:00`
}

export const lastNDayKeys = (n) => {
	const now = Date.now()
	return Array.from({ length: n }, (_, i) => artDayKey(new Date(now - (n - 1 - i) * 86400000)))
}

// Todas las horas entre dos timestamps (para rellenar con 0 las horas sin tráfico)
export const hourStampsBetween = (fromTs, toTs) => {
	const start = Math.floor(fromTs / 3600000) * 3600000
	const out = []
	for (let ts = start; ts <= toTs; ts += 3600000) out.push(ts)
	return out
}

export const dayLabel = (key) => `${key.slice(8, 10)}/${key.slice(5, 7)}`

export const formatHourTick = (ts) =>
	new Date(ts).toLocaleString('es-AR', {
		timeZone: 'America/Argentina/Cordoba',
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})

export const formatInt = (n) => (n == null ? '—' : Number(n).toLocaleString('es-AR'))

export const HelpIcon = ({ help }) => (
	<Tooltip title={help} arrow placement='top' enterTouchDelay={50} leaveTouchDelay={5000}>
		<span className='flex items-center text-slate-400 dark:text-gray-400 cursor-help'>
			<FaInfoCircle size={13} />
		</span>
	</Tooltip>
)

export const KpiCard = ({ label, value, hint, help }) => (
	<CardCustom className='rounded-xl p-4 flex flex-col gap-0.5'>
		<span className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-gray-400'>
			{label}
			{help && <HelpIcon help={help} />}
		</span>
		<span className='text-2xl font-semibold text-slate-800 dark:text-gray-100 tabular-nums'>
			{value}
		</span>
		{hint && <span className='text-xs text-slate-400 dark:text-gray-400'>{hint}</span>}
	</CardCustom>
)

export const ChartCard = ({ title, subtitle, help, className = '', children }) => (
	<CardCustom className={`rounded-xl p-4 flex flex-col ${className}`}>
		<div className='flex items-center gap-1.5'>
			<h3 className='text-sm font-semibold text-slate-700 dark:text-gray-200'>{title}</h3>
			{help && <HelpIcon help={help} />}
		</div>
		{subtitle && <p className='text-xs text-slate-400 dark:text-gray-400 mb-1'>{subtitle}</p>}
		<div className='w-full flex-1 min-h-0'>{children}</div>
	</CardCustom>
)

// Barra de filtros comun: selector de organización + rango de días
export const DashboardFilters = ({ org, setOrg, orgOptions, days, setDays }) => (
	<div className='flex flex-wrap items-center justify-end gap-1.5'>
		<label className='flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-400'>
			Organización
			<select
				value={org}
				onChange={(e) => setOrg(e.target.value)}
				className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200'
			>
				<option value='all'>Todas las organizaciones</option>
				{orgOptions.map((o) => (
					<option key={o.key} value={o.key}>
						{o.name}
					</option>
				))}
			</select>
		</label>
		<span className='text-xs text-slate-400 dark:text-gray-400 ml-2 mr-1'>Rango</span>
		{RANGES.map((r) => (
			<button
				key={r.days}
				type='button'
				onClick={() => setDays(r.days)}
				className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
					days === r.days
						? 'border-primary bg-primary text-white'
						: 'border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-slate-300'
				}`}
			>
				{r.label}
			</button>
		))}
	</div>
)
