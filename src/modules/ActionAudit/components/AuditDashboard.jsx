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
	timeLine,
	horizontalBars,
	donut,
	formatMs,
	formatTotalMs,
} from '../utils/dashboardCharts'
import {
	COLOR,
	artHourKey,
	lastNDayKeys,
	hourStampsBetween,
	dayLabel,
	formatHourTick,
	formatInt,
	KpiCard,
	ChartCard,
	DashboardFilters,
} from '../utils/dashboardShared'

const STATUS_META = {
	'2xx': { label: 'Éxito (2xx)', color: '#10B981' },
	'3xx': { label: 'Redirección (3xx)', color: '#94a3b8' },
	'4xx': { label: 'Error de cliente (4xx)', color: '#f59e0b' },
	'5xx': { label: 'Error de servidor (5xx)', color: '#ef4444' },
}

const TOP_MODULES = 8

// Ayudas para usuarios no técnicos (icono ⓘ en cada KPI y gráfico)
const HELP = {
	sesiones:
		'Cuenta cada vez que alguien entra a la aplicación. Si una persona entra tres veces, son tres sesiones (no es "usuarios distintos").',
	requests:
		'Todos los pedidos que la aplicación le hace al servidor. La mayoría son automáticos (las pantallas piden datos frescos cada pocos segundos), así que el número crece aunque nadie esté tocando nada.',
	respuesta:
		'Cuánto tarda el servidor en contestar un pedido, en promedio. Como referencia: menos de 200 ms es imperceptible, hasta 1 segundo es fluido, más de 3 segundos se siente lento.',
	errores:
		'Pedidos que no se pudieron completar. Lo importante es el porcentaje: unos pocos errores sobre miles de pedidos es normal.',
	trafico:
		'Por qué nunca baja a cero: las pantallas de monitoreo piden datos automáticamente todo el día, y eso forma la "base" del gráfico. Los picos por encima de esa base son actividad real de personas usando la aplicación.',
	tiempoRespuesta:
		'Promedio de cada día: un pico indica que ese día hubo consultas pesadas o el servidor estuvo exigido. Un pico aislado no es problema; una tendencia que sube día a día, sí.',
	perfilHorario:
		'Es el "día típico": el promedio de actividad para cada hora. Sirve para saber a qué hora conviene hacer mantenimiento (los valles) y cuándo hay más gente conectada (los picos).',
	modulosUsados:
		'Cada pedido se atribuye a la pantalla que estaba abierta cuando se hizo. Como las pantallas piden datos solas, también funciona como medida de dónde pasa más tiempo la gente.',
	modulosDemanda:
		'No es lo mismo que "más usados": acá se suma el tiempo de trabajo del servidor. Un módulo puede estar arriba por hacer muchos pedidos livianos o pocos pedidos muy pesados.',
	endpoints:
		'Un "endpoint" es un tipo de pedido específico: pedir las alertas, guardar un diagrama, traer los datos de un sensor. Es la versión detallada de "módulos": dice exactamente qué operación se usa más.',
	loginsDia:
		'Cada barra es la cantidad de veces que alguien entró a la aplicación ese día. Los días sin barra son días sin ingresos (fin de semana, feriado).',
	usuarios:
		'Cantidad de pedidos al servidor por usuario. Ojo al leerlo: alguien con una pantalla de monitoreo abierta todo el día va a figurar altísimo aunque no haya tocado nada.',
	orgsRequests:
		'Compara el nivel de uso del sistema entre cooperativas: cuántos pedidos al servidor generó cada una. Útil para ver cuáles adoptaron más la aplicación.',
	orgsSesiones:
		'Cuántas veces entró gente de cada cooperativa a la aplicación en el período. Complementa al gráfico de requests: mucha gente entrando con pocas requests indica visitas cortas.',
}

// Ayuda para usuarios no técnicos: qué significa cada resultado HTTP
const statusHelp = (
	<div className='flex flex-col gap-1.5 p-0.5 text-xs leading-relaxed'>
		<span>
			Cada vez que la aplicación necesita algo del servidor (abrir una pantalla, cargar un
			gráfico, guardar un cambio) le manda un pedido, y el servidor responde indicando cómo
			terminó. Este gráfico agrupa esas respuestas:
		</span>
		<span>
			<b>Éxito (2xx):</b> el pedido se procesó correctamente. Lo normal es que sea la mayoría.
		</span>
		<span>
			<b>Redirección (3xx):</b> casi siempre significa &quot;esto no cambió desde la última
			vez&quot;, y el navegador reutiliza la copia que ya tenía. No es un error: ahorra tiempo
			y datos.
		</span>
		<span>
			<b>Error de cliente (4xx):</b> el pedido no se pudo atender porque estaba mal armado o
			sin permiso (típico: una sesión vencida que pide datos antes de renovarse). Unos pocos
			sueltos son normales.
		</span>
		<span>
			<b>Error de servidor (5xx):</b> el servidor falló al procesar el pedido. Es la porción
			que importa vigilar: si crece, algo anda mal en el sistema.
		</span>
	</div>
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
					org === 'all'
						? `/audit/dashboard/all?days=${days}`
						: `/audit/dashboard?days=${days}&org=${org}`
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

		// Serie horaria de todo el rango: puntos [ts, count] con las horas
		// vacías en 0, para que los valles se vean de verdad
		const requestsByHour = new Map(data.requests.seriesHourly.map((r) => [r.hour, r.count]))
		const hourlyPoints = hourStampsBetween(new Date(data.range.from).getTime(), Date.now()).map(
			(ts) => [ts, requestsByHour.get(artHourKey(new Date(ts))) ?? 0]
		)

		// Perfil horario: promedio de requests para cada hora del día (0-23)
		const profileSums = Array.from({ length: 24 }, () => 0)
		for (const r of data.requests.seriesHourly) {
			profileSums[Number(r.hour.slice(11, 13))] += r.count
		}
		const hourlyProfile = profileSums.map((sum) => Math.round((sum / days) * 10) / 10)

		const organizations = data.organizations ?? []

		const modulesByCount = [...data.modules].sort((a, b) => b.count - a.count).slice(0, TOP_MODULES)
		const modulesByDemand = [...data.modules].sort((a, b) => b.totalMs - a.totalMs).slice(0, TOP_MODULES)
		const users = data.users.slice(0, TOP_MODULES)

		// Endpoints más usados: etiqueta "MÉTODO /ruta" (sin el prefijo /api)
		const endpoints = (data.endpoints ?? []).slice(0, 10)
		const endpointLabel = (e) => `${e.method} ${e.path.replace(/^\/api/, '')}`
		const endpointByLabel = new Map(endpoints.map((e) => [endpointLabel(e), e]))

		return {
			traffic: timeLine({
				data: hourlyPoints,
				name: 'Requests',
				color: COLOR.count,
				darkMode,
				tooltipFormatter: (params) => {
					const p = Array.isArray(params) ? params[0] : params
					if (!p?.value) return ''
					return `${formatHourTick(p.value[0])}<br/>${formatInt(p.value[1])} requests`
				},
			}),
			responseTime: lineArea({
				labels: dayLabels,
				values: dayKeys.map((k) => requestsByDay.get(k)?.avgMs ?? null),
				name: 'Tiempo de respuesta',
				color: COLOR.duration,
				darkMode,
				valueFormatter: (v) => formatMs(v),
			}),
			hourlyProfile: lineArea({
				labels: hourlyProfile.map((_, h) => `${String(h).padStart(2, '0')} h`),
				values: hourlyProfile,
				name: 'Requests promedio',
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
			<DashboardFilters org={org} setOrg={setOrg} orgOptions={orgOptions} days={days} setDays={setDays} />

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
				<KpiCard
					label='Sesiones hoy'
					value={formatInt(data.logins.today)}
					hint='Inicios de sesión'
					help={HELP.sesiones}
				/>
				<KpiCard
					label='Sesiones del mes'
					value={formatInt(data.logins.month)}
					hint='Inicios de sesión'
					help={HELP.sesiones}
				/>
				<KpiCard
					label='Requests hoy'
					value={formatInt(data.requests.today)}
					hint='Solicitudes al backend'
					help={HELP.requests}
				/>
				<KpiCard
					label='Requests del mes'
					value={formatInt(data.requests.month)}
					hint='Solicitudes al backend'
					help={HELP.requests}
				/>
				<KpiCard
					label='Resp. promedio'
					value={formatMs(data.requests.avgMs)}
					hint={`Hoy: ${formatMs(data.requests.avgMsToday)} · Máx: ${formatMs(data.requests.maxMs)}`}
					help={HELP.respuesta}
				/>
				<KpiCard
					label='Errores'
					value={formatInt(data.requests.errors)}
					hint={`${errorRate.toFixed(1)}% de ${formatInt(data.requests.total)} requests`}
					help={HELP.errores}
				/>
			</div>

			{/* Desglose por organización (sólo en la vista global) */}
			{charts.orgsRequests && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
					<ChartCard
						title='Requests por organización'
						subtitle={`Solicitudes al backend (últimos ${days} días)`}
						help={HELP.orgsRequests}
						className='h-72'
					>
						<EChart config={charts.orgsRequests} />
					</ChartCard>
					<ChartCard
						title='Sesiones por organización'
						subtitle={`Inicios de sesión (últimos ${days} días)`}
						help={HELP.orgsSesiones}
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
					title='Tráfico'
					subtitle={`Requests al backend por hora (últimos ${days} días) — arrastrá o usá la rueda para hacer zoom en los picos y valles`}
					help={HELP.trafico}
					className='lg:col-span-2 h-80'
				>
					<EChart config={charts.traffic} />
				</ChartCard>
				<ChartCard
					title='Tiempo de respuesta'
					subtitle='Promedio diario del backend'
					help={HELP.tiempoRespuesta}
					className='h-64'
				>
					<EChart config={charts.responseTime} />
				</ChartCard>
				<ChartCard
					title='Perfil horario'
					subtitle={`Promedio de requests para cada hora del día (últimos ${days} días)`}
					help={HELP.perfilHorario}
					className='h-64'
				>
					<EChart config={charts.hourlyProfile} />
				</ChartCard>
			</div>

			{/* Módulos */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
				<ChartCard
					title='Módulos más usados'
					subtitle={`Requests por módulo (últimos ${days} días)`}
					help={HELP.modulosUsados}
					className='h-72'
				>
					<EChart config={charts.modulesByCount} />
				</ChartCard>
				<ChartCard
					title='Módulos que más demandan al backend'
					subtitle='Tiempo total de procesamiento (segundos)'
					help={HELP.modulosDemanda}
					className='h-72'
				>
					<EChart config={charts.modulesByDemand} />
				</ChartCard>
				{charts.endpoints && (
					<ChartCard
						title='Endpoints más usados'
						subtitle={`Top 10 de requests por método y ruta (últimos ${days} días)`}
						help={HELP.endpoints}
						className='lg:col-span-2 h-80'
					>
						<EChart config={charts.endpoints} />
					</ChartCard>
				)}
			</div>

			{/* Sesiones, usuarios y estados */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
				<ChartCard
					title='Inicios de sesión por día'
					subtitle={`Últimos ${days} días`}
					help={HELP.loginsDia}
					className='h-64'
				>
					<EChart config={charts.logins} />
				</ChartCard>
				<ChartCard
					title='Usuarios más activos'
					subtitle={`Requests por usuario (últimos ${days} días)`}
					help={HELP.usuarios}
					className='h-64'
				>
					<EChart config={charts.users} />
				</ChartCard>
				<ChartCard
					title='Resultado de las requests'
					subtitle='Cómo terminó cada solicitud al servidor'
					help={statusHelp}
					className='h-64'
				>
					<EChart config={charts.status} />
				</ChartCard>
			</div>
		</div>
	)
}

export default AuditDashboard
