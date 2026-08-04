import { useContext, useEffect, useMemo, useState } from 'react'
import CardCustom from '../../../components/CardCustom'
import LoaderComponent from '../../../components/Loader'
import EChart from '../../Charts/components/EChart'
import { MainContext } from '../../../context/MainContext'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import {
	verticalBars,
	lineArea,
	horizontalBars,
	donut,
	formatMs,
	formatTotalMs,
} from '../utils/dashboardCharts'

// Un tono por gráfico: conteos en azul, tiempos/demanda en naranja,
// actividad de usuarios/sesiones en violeta. Los colores de estado
// (verde/ámbar/rojo) quedan reservados para la distribución de status.
const COLOR = {
	count: '#368bed',
	duration: '#d8621d',
	activity: '#8b5cf6',
}

const STATUS_META = {
	'2xx': { label: 'Éxito (2xx)', color: '#10B981' },
	'3xx': { label: 'Redirección (3xx)', color: '#94a3b8' },
	'4xx': { label: 'Error de cliente (4xx)', color: '#f59e0b' },
	'5xx': { label: 'Error de servidor (5xx)', color: '#ef4444' },
}

const RANGES = [
	{ days: 7, label: '7 días' },
	{ days: 30, label: '30 días' },
	{ days: 90, label: '90 días' },
]

const TOP_MODULES = 8

const pad = (n) => String(n).padStart(2, '0')

// Claves de día/hora en horario argentino (offset fijo -03), consistentes
// con el agrupamiento del backend. La DB guarda en UTC.
const artParts = (date) => new Date(date.getTime() - 3 * 60 * 60 * 1000)

const artDayKey = (date) => {
	const s = artParts(date)
	return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`
}

const artHourKey = (date) => {
	const s = artParts(date)
	return `${artDayKey(date)} ${pad(s.getUTCHours())}:00`
}

const lastNDayKeys = (n) => {
	const now = Date.now()
	return Array.from({ length: n }, (_, i) => artDayKey(new Date(now - (n - 1 - i) * 86400000)))
}

const lastNHourKeys = (n) => {
	const now = Date.now()
	return Array.from({ length: n }, (_, i) => artHourKey(new Date(now - (n - 1 - i) * 3600000)))
}

const dayLabel = (key) => `${key.slice(8, 10)}/${key.slice(5, 7)}`
const hourLabel = (key) => `${key.slice(11, 13)} h`

const formatInt = (n) => (n == null ? '—' : Number(n).toLocaleString('es-AR'))

const KpiCard = ({ label, value, hint }) => (
	<CardCustom className='rounded-xl p-4 flex flex-col gap-0.5'>
		<span className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-gray-400'>
			{label}
		</span>
		<span className='text-2xl font-semibold text-slate-800 dark:text-gray-100 tabular-nums'>
			{value}
		</span>
		{hint && <span className='text-xs text-slate-400 dark:text-gray-400'>{hint}</span>}
	</CardCustom>
)

const ChartCard = ({ title, subtitle, className = '', children }) => (
	<CardCustom className={`rounded-xl p-4 flex flex-col ${className}`}>
		<h3 className='text-sm font-semibold text-slate-700 dark:text-gray-200'>{title}</h3>
		{subtitle && <p className='text-xs text-slate-400 dark:text-gray-400 mb-1'>{subtitle}</p>}
		<div className='w-full flex-1 min-h-0'>{children}</div>
	</CardCustom>
)

// Por defecto muestra todas las organizaciones combinadas; con el selector
// se filtra una específica sin cambiar de tenant (la vista es sólo SuperAdmin)
function AuditDashboard() {
	const { darkMode } = useContext(MainContext)
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [days, setDays] = useState(30)
	const [org, setOrg] = useState('all')
	// Opciones del selector: se completan con la primera respuesta global
	const [orgOptions, setOrgOptions] = useState([])

	useEffect(() => {
		let cancelled = false
		const getDashboard = async () => {
			setLoading(true)
			try {
				const endpoint =
					org === 'all' ? `/audit/dashboard/all?days=${days}` : `/audit/dashboard?days=${days}&org=${org}`
				const response = await request(
					`${backend[import.meta.env.VITE_APP_NAME]}${endpoint}`,
					'GET'
				)
				if (cancelled) return
				setData(response?.data ?? null)
				if (response?.data?.organizations) {
					setOrgOptions(
						[...response.data.organizations].sort((a, b) => a.name.localeCompare(b.name))
					)
				}
			} catch (error) {
				console.error('Error al obtener el dashboard de auditoría:', error)
				if (!cancelled) setData(null)
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		getDashboard()
		return () => {
			cancelled = true
		}
	}, [days, org])

	const charts = useMemo(() => {
		if (!data) return null

		// Series diarias completas (los días sin tráfico van en 0)
		const dayKeys = lastNDayKeys(days)
		const dayLabels = dayKeys.map(dayLabel)
		const requestsByDay = new Map(data.requests.seriesDaily.map((r) => [r.day, r]))
		const loginsByDay = new Map(data.logins.seriesDaily.map((r) => [r.day, r.count]))

		const hourKeys = lastNHourKeys(24)
		const requestsByHour = new Map(data.requests.seriesHourly.map((r) => [r.hour, r.count]))

		const organizations = data.organizations ?? []

		const modulesByCount = [...data.modules].sort((a, b) => b.count - a.count).slice(0, TOP_MODULES)
		const modulesByDemand = [...data.modules].sort((a, b) => b.totalMs - a.totalMs).slice(0, TOP_MODULES)
		const users = data.users.slice(0, TOP_MODULES)

		// Endpoints más usados: etiqueta "MÉTODO /ruta" (sin el prefijo /api)
		const endpoints = (data.endpoints ?? []).slice(0, 10)
		const endpointLabel = (e) => `${e.method} ${e.path.replace(/^\/api/, '')}`
		const endpointByLabel = new Map(endpoints.map((e) => [endpointLabel(e), e]))

		return {
			traffic: verticalBars({
				labels: dayLabels,
				values: dayKeys.map((k) => requestsByDay.get(k)?.count ?? 0),
				name: 'Requests',
				color: COLOR.count,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			responseTime: lineArea({
				labels: dayLabels,
				values: dayKeys.map((k) => requestsByDay.get(k)?.avgMs ?? null),
				name: 'Tiempo de respuesta',
				color: COLOR.duration,
				darkMode,
				valueFormatter: (v) => formatMs(v),
			}),
			hourly: verticalBars({
				labels: hourKeys.map(hourLabel),
				values: hourKeys.map((k) => requestsByHour.get(k) ?? 0),
				name: 'Requests',
				color: COLOR.count,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			logins: verticalBars({
				labels: dayLabels,
				values: dayKeys.map((k) => loginsByDay.get(k) ?? 0),
				name: 'Inicios de sesión',
				color: COLOR.activity,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			modulesByCount: horizontalBars({
				labels: modulesByCount.map((m) => m.module),
				values: modulesByCount.map((m) => m.count),
				name: 'Requests',
				color: COLOR.count,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			modulesByDemand: horizontalBars({
				labels: modulesByDemand.map((m) => m.module),
				values: modulesByDemand.map((m) => Math.round(m.totalMs / 1000)),
				name: 'Tiempo total',
				color: COLOR.duration,
				darkMode,
				valueFormatter: (v) => formatTotalMs(v * 1000),
			}),
			users: horizontalBars({
				labels: users.map((u) => u.user_name || `Usuario ${u.user_id}`),
				values: users.map((u) => u.count),
				name: 'Requests',
				color: COLOR.activity,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			endpoints: endpoints.length
				? horizontalBars({
						labels: endpoints.map(endpointLabel),
						values: endpoints.map((e) => e.count),
						name: 'Requests',
						color: COLOR.count,
						darkMode,
						labelWidth: 240,
						tooltipFormatter: (params) => {
							const p = Array.isArray(params) ? params[0] : params
							const e = endpointByLabel.get(p.name)
							if (!e) return p.name
							return `${p.name}<br/>${formatInt(e.count)} requests · prom. ${formatMs(e.avgMs)}`
						},
					})
				: null,
			orgsRequests: organizations.length
				? horizontalBars({
						labels: organizations.map((o) => o.name),
						values: organizations.map((o) => o.requests),
						name: 'Requests',
						color: COLOR.count,
						darkMode,
						valueFormatter: (v) => formatInt(v),
					})
				: null,
			orgsLogins: organizations.length
				? horizontalBars({
						labels: [...organizations].sort((a, b) => b.logins - a.logins).map((o) => o.name),
						values: [...organizations].sort((a, b) => b.logins - a.logins).map((o) => o.logins),
						name: 'Inicios de sesión',
						color: COLOR.activity,
						darkMode,
						valueFormatter: (v) => formatInt(v),
					})
				: null,
			status: donut({
				data: data.status.map((s) => ({
					name: STATUS_META[s.bucket]?.label ?? s.bucket,
					value: s.count,
					itemStyle: { color: STATUS_META[s.bucket]?.color ?? '#94a3b8' },
				})),
				darkMode,
			}),
		}
	}, [data, darkMode, days])

	if (loading) return <LoaderComponent />

	if (!data) {
		return (
			<CardCustom className='rounded-xl p-8 text-center'>
				<p className='text-slate-500 dark:text-gray-300'>
					No se pudo obtener la información del dashboard.
				</p>
			</CardCustom>
		)
	}

	const errorRate = data.requests.total > 0 ? (data.requests.errors / data.requests.total) * 100 : 0

	return (
		<div className='flex flex-col gap-3'>
			{/* Filtros: organización y rango */}
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

			{data.requests.total === 0 && (
				<CardCustom className='rounded-xl p-4'>
					<p className='text-sm text-slate-500 dark:text-gray-300'>
						Todavía no hay métricas de requests registradas: se empiezan a acumular a partir
						de la puesta en producción de esta versión del backend. Los inicios de sesión sí
						se muestran porque salen de la auditoría de acciones existente.
					</p>
				</CardCustom>
			)}

			{/* KPIs */}
			<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3'>
				<KpiCard label='Sesiones hoy' value={formatInt(data.logins.today)} hint='Inicios de sesión' />
				<KpiCard label='Sesiones del mes' value={formatInt(data.logins.month)} hint='Inicios de sesión' />
				<KpiCard label='Requests hoy' value={formatInt(data.requests.today)} hint='Solicitudes al backend' />
				<KpiCard label='Requests del mes' value={formatInt(data.requests.month)} hint='Solicitudes al backend' />
				<KpiCard
					label='Resp. promedio'
					value={formatMs(data.requests.avgMs)}
					hint={`Hoy: ${formatMs(data.requests.avgMsToday)} · Máx: ${formatMs(data.requests.maxMs)}`}
				/>
				<KpiCard
					label='Errores'
					value={formatInt(data.requests.errors)}
					hint={`${errorRate.toFixed(1)}% de ${formatInt(data.requests.total)} requests`}
				/>
			</div>

			{/* Desglose por organización (sólo en la vista global) */}
			{charts.orgsRequests && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
					<ChartCard
						title='Requests por organización'
						subtitle={`Solicitudes al backend (últimos ${days} días)`}
						className='h-72'
					>
						<EChart config={charts.orgsRequests} />
					</ChartCard>
					<ChartCard
						title='Sesiones por organización'
						subtitle={`Inicios de sesión (últimos ${days} días)`}
						className='h-72'
					>
						<EChart config={charts.orgsLogins} />
					</ChartCard>
				</div>
			)}

			{data.skipped?.length > 0 && (
				<p className='text-xs text-slate-400 dark:text-gray-400 px-1'>
					Sin datos de: {data.skipped.join(', ')}
				</p>
			)}

			{/* Tráfico y tiempos */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
				<ChartCard
					title='Tráfico diario'
					subtitle={`Requests al backend por día (últimos ${days} días)`}
					className='lg:col-span-2 h-72'
				>
					<EChart config={charts.traffic} />
				</ChartCard>
				<ChartCard
					title='Tiempo de respuesta'
					subtitle='Promedio diario del backend'
					className='h-64'
				>
					<EChart config={charts.responseTime} />
				</ChartCard>
				<ChartCard title='Tráfico por hora' subtitle='Requests en las últimas 24 horas' className='h-64'>
					<EChart config={charts.hourly} />
				</ChartCard>
			</div>

			{/* Módulos */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
				<ChartCard
					title='Módulos más usados'
					subtitle={`Requests por módulo (últimos ${days} días)`}
					className='h-72'
				>
					<EChart config={charts.modulesByCount} />
				</ChartCard>
				<ChartCard
					title='Módulos que más demandan al backend'
					subtitle='Tiempo total de procesamiento (segundos)'
					className='h-72'
				>
					<EChart config={charts.modulesByDemand} />
				</ChartCard>
				{charts.endpoints && (
					<ChartCard
						title='Endpoints más usados'
						subtitle={`Top 10 de requests por método y ruta (últimos ${days} días)`}
						className='lg:col-span-2 h-80'
					>
						<EChart config={charts.endpoints} />
					</ChartCard>
				)}
			</div>

			{/* Sesiones, usuarios y estados */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
				<ChartCard title='Inicios de sesión por día' subtitle={`Últimos ${days} días`} className='h-64'>
					<EChart config={charts.logins} />
				</ChartCard>
				<ChartCard
					title='Usuarios más activos'
					subtitle={`Requests por usuario (últimos ${days} días)`}
					className='h-64'
				>
					<EChart config={charts.users} />
				</ChartCard>
				<ChartCard title='Resultado de las requests' subtitle='Distribución por status HTTP' className='h-64'>
					<EChart config={charts.status} />
				</ChartCard>
			</div>
		</div>
	)
}

export default AuditDashboard
