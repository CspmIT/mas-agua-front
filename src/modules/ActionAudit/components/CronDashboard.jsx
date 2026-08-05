import { useContext, useEffect, useMemo, useState } from 'react'
import CardCustom from '../../../components/CardCustom'
import LoaderComponent from '../../../components/Loader'
import EChart from '../../Charts/components/EChart'
import { MainContext } from '../../../context/MainContext'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { lineArea, timeLine, horizontalBars, donut, formatMs } from '../utils/dashboardCharts'
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

// Nombre legible de cada tarea automática a partir de su endpoint
const TASK_LABELS = {
	'/api/public_CheckAlarms': 'Chequeo de alarmas',
	'/api/public_SimMonitor': 'Monitoreo de simulaciones',
	'/api/public_AutoRebootOsmosis': 'Reinicio de ósmosis',
	'/api/public_PumpGenibusRead': 'Lectura de bombas',
	'/api/public_PumpAutomation': 'Automatización de bombas',
	'/api/public_SensorData': 'Datos de sensores (API)',
}

const taskLabel = (path) => TASK_LABELS[path] ?? path.replace(/^\/api\/(public_)?/, '')

// Ayudas para usuarios no técnicos
const HELP = {
	general:
		'Las tareas automáticas (cronjobs) son procesos que el sistema ejecuta solo, sin que nadie los dispare: chequear alarmas, leer bombas, monitorear simulaciones. Corren cada pocos minutos, las 24 horas.',
	corridas:
		'Cada "corrida" es una ejecución de una tarea automática sobre una cooperativa. Como corren cada pocos minutos, es normal que el número sea alto.',
	duracion:
		'Cuánto tarda cada corrida, en promedio. Si este número crece con el tiempo, las tareas están tardando cada vez más y conviene revisar por qué.',
	duracionMax: 'La corrida más lenta del período. Sirve para detectar casos puntuales extremos.',
	errores:
		'Corridas que fallaron. A diferencia del tráfico de usuarios, acá lo ideal es cero: una tarea automática que falla seguido significa que algo (una base, un PLC, Influx) no está respondiendo.',
	tareas: 'Cuántos tipos de tarea automática registraron actividad en el período.',
	actividad:
		'Corridas por hora. Este gráfico debería ser una línea pareja, porque las tareas corren a ritmo fijo: un bache (la línea en cero) significa que los crons no corrieron en ese momento — eso es exactamente lo que hay que mirar acá.',
	duracionDia:
		'Duración promedio de las corridas, día por día. Una tendencia que sube indica que algo se está degradando (bases más lentas, más datos que procesar).',
	erroresDia: 'Corridas fallidas por día. Lo normal es que esté en cero; los picos marcan días con problemas.',
	corridasTarea: 'Cuántas veces corrió cada tarea. Las que corren cada 1 minuto naturalmente dominan.',
	duracionTarea:
		'Cuánto tarda en promedio cada tarea. Acá se compara el "peso" real de cada una, sin importar cuántas veces corre.',
	orgs: 'Cuántas corridas se procesaron para cada cooperativa. Las tareas globales (como el chequeo de alarmas) recorren todas; otras aplican a una sola.',
	orgsDuracion:
		'Duración promedio del procesamiento por cooperativa. Si una cooperativa tarda mucho más que el resto, su base o sus datos merecen una revisión.',
	resultado:
		'Cómo terminaron las corridas: éxito o error. Lo saludable es que el verde sea prácticamente todo.',
}

// Dashboard de las tareas automáticas (cronjobs): mismos filtros que el
// dashboard de uso, pero mirando sólo el tráfico method=CRON (mode=cron)
function CronDashboard() {
	const { darkMode } = useContext(MainContext)
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [days, setDays] = useState(30)
	const [org, setOrg] = useState('all')
	const [orgOptions, setOrgOptions] = useState([])

	useEffect(() => {
		let cancelled = false
		const getDashboard = async () => {
			setLoading(true)
			try {
				const endpoint =
					org === 'all'
						? `/audit/dashboard/all?days=${days}&mode=cron`
						: `/audit/dashboard?days=${days}&org=${org}&mode=cron`
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
				console.error('Error al obtener el dashboard de tareas automáticas:', error)
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

		const dayKeys = lastNDayKeys(days)
		const dayLabels = dayKeys.map(dayLabel)
		const runsByDay = new Map(data.requests.seriesDaily.map((r) => [r.day, r]))

		const runsByHour = new Map(data.requests.seriesHourly.map((r) => [r.hour, r.count]))
		const hourlyPoints = hourStampsBetween(new Date(data.range.from).getTime(), Date.now()).map(
			(ts) => [ts, runsByHour.get(artHourKey(new Date(ts))) ?? 0]
		)

		// Ranking por tarea (viene en endpoints: una fila por path)
		const tasks = [...(data.endpoints ?? [])].sort((a, b) => b.count - a.count)
		const tasksByAvg = [...tasks].sort((a, b) => (b.avgMs ?? 0) - (a.avgMs ?? 0))

		const organizations = data.organizations ?? []
		const orgsByAvg = [...organizations].sort((a, b) => (b.avgMs ?? 0) - (a.avgMs ?? 0))

		const okCount = data.status
			.filter((s) => s.bucket === '2xx' || s.bucket === '3xx')
			.reduce((acc, s) => acc + s.count, 0)
		const errorCount = data.status
			.filter((s) => s.bucket === '4xx' || s.bucket === '5xx')
			.reduce((acc, s) => acc + s.count, 0)

		return {
			activity: timeLine({
				data: hourlyPoints,
				name: 'Corridas',
				color: COLOR.activity,
				darkMode,
				tooltipFormatter: (params) => {
					const p = Array.isArray(params) ? params[0] : params
					if (!p?.value) return ''
					return `${formatHourTick(p.value[0])}<br/>${formatInt(p.value[1])} corridas`
				},
			}),
			durationDaily: lineArea({
				labels: dayLabels,
				values: dayKeys.map((k) => runsByDay.get(k)?.avgMs ?? null),
				name: 'Duración promedio',
				color: COLOR.duration,
				darkMode,
				valueFormatter: (v) => formatMs(v),
			}),
			errorsDaily: lineArea({
				labels: dayLabels,
				values: dayKeys.map((k) => runsByDay.get(k)?.errors ?? 0),
				name: 'Errores',
				color: COLOR.error,
				darkMode,
				valueFormatter: (v) => formatInt(v),
			}),
			tasksByCount: tasks.length
				? horizontalBars({
						labels: tasks.map((t) => taskLabel(t.path)),
						values: tasks.map((t) => t.count),
						name: 'Corridas',
						color: COLOR.count,
						darkMode,
						labelWidth: 190,
						valueFormatter: (v) => formatInt(v),
					})
				: null,
			tasksByAvg: tasks.length
				? horizontalBars({
						labels: tasksByAvg.map((t) => taskLabel(t.path)),
						values: tasksByAvg.map((t) => t.avgMs ?? 0),
						name: 'Duración promedio',
						color: COLOR.duration,
						darkMode,
						labelWidth: 190,
						valueFormatter: (v) => formatMs(v),
					})
				: null,
			orgsRuns: organizations.length
				? horizontalBars({
						labels: organizations.map((o) => o.name),
						values: organizations.map((o) => o.requests),
						name: 'Corridas',
						color: COLOR.count,
						darkMode,
						valueFormatter: (v) => formatInt(v),
					})
				: null,
			orgsAvg: organizations.length
				? horizontalBars({
						labels: orgsByAvg.map((o) => o.name),
						values: orgsByAvg.map((o) => o.avgMs ?? 0),
						name: 'Duración promedio',
						color: COLOR.duration,
						darkMode,
						valueFormatter: (v) => formatMs(v),
					})
				: null,
			result: donut({
				data: [
					{ name: 'Éxito', value: okCount, itemStyle: { color: COLOR.ok } },
					{ name: 'Con error', value: errorCount, itemStyle: { color: COLOR.error } },
				],
				darkMode,
			}),
		}
	}, [data, darkMode, days])

	if (loading) return <LoaderComponent />

	if (!data) {
		return (
			<CardCustom className='rounded-xl p-8 text-center'>
				<p className='text-slate-500 dark:text-gray-300'>
					No se pudo obtener la información de las tareas automáticas.
				</p>
			</CardCustom>
		)
	}

	const errorRate = data.requests.total > 0 ? (data.requests.errors / data.requests.total) * 100 : 0
	const taskCount = (data.endpoints ?? []).length

	return (
		<div className='flex flex-col gap-3'>
			<DashboardFilters org={org} setOrg={setOrg} orgOptions={orgOptions} days={days} setDays={setDays} />

			{data.requests.total === 0 && (
				<CardCustom className='rounded-xl p-4'>
					<p className='text-sm text-slate-500 dark:text-gray-300'>
						Todavía no hay corridas de tareas automáticas registradas: se empiezan a acumular
						a partir de la puesta en producción de esta versión del backend.
					</p>
				</CardCustom>
			)}

			{/* KPIs */}
			<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3'>
				<KpiCard
					label='Corridas hoy'
					value={formatInt(data.requests.today)}
					hint='Ejecuciones de tareas'
					help={HELP.corridas}
				/>
				<KpiCard
					label='Corridas del mes'
					value={formatInt(data.requests.month)}
					hint='Ejecuciones de tareas'
					help={HELP.corridas}
				/>
				<KpiCard
					label='Duración promedio'
					value={formatMs(data.requests.avgMs)}
					hint={`Hoy: ${formatMs(data.requests.avgMsToday)}`}
					help={HELP.duracion}
				/>
				<KpiCard
					label='Duración máxima'
					value={formatMs(data.requests.maxMs)}
					hint={`Últimos ${days} días`}
					help={HELP.duracionMax}
				/>
				<KpiCard
					label='Errores'
					value={formatInt(data.requests.errors)}
					hint={`${errorRate.toFixed(1)}% de ${formatInt(data.requests.total)} corridas`}
					help={HELP.errores}
				/>
				<KpiCard label='Tareas activas' value={formatInt(taskCount)} hint='Tipos de tarea' help={HELP.tareas} />
			</div>

			{/* Actividad y tendencias */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
				<ChartCard
					title='Actividad'
					subtitle={`Corridas por hora (últimos ${days} días) — un bache en la línea significa que los crons no corrieron`}
					help={HELP.actividad}
					className='lg:col-span-2 h-80'
				>
					<EChart config={charts.activity} />
				</ChartCard>
				<ChartCard
					title='Duración promedio por día'
					subtitle='Tendencia de cuánto tardan las corridas'
					help={HELP.duracionDia}
					className='h-64'
				>
					<EChart config={charts.durationDaily} />
				</ChartCard>
				<ChartCard
					title='Errores por día'
					subtitle='Corridas fallidas (lo normal es cero)'
					help={HELP.erroresDia}
					className='h-64'
				>
					<EChart config={charts.errorsDaily} />
				</ChartCard>
			</div>

			{/* Por tarea */}
			{charts.tasksByCount && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
					<ChartCard
						title='Corridas por tarea'
						subtitle={`Ejecuciones de cada tarea (últimos ${days} días)`}
						help={HELP.corridasTarea}
						className='h-72'
					>
						<EChart config={charts.tasksByCount} />
					</ChartCard>
					<ChartCard
						title='Duración promedio por tarea'
						subtitle='Qué tarea le cuesta más al servidor'
						help={HELP.duracionTarea}
						className='h-72'
					>
						<EChart config={charts.tasksByAvg} />
					</ChartCard>
				</div>
			)}

			{/* Por organización y resultado */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
				{charts.orgsRuns && (
					<ChartCard
						title='Corridas por organización'
						subtitle={`Últimos ${days} días`}
						help={HELP.orgs}
						className='h-64'
					>
						<EChart config={charts.orgsRuns} />
					</ChartCard>
				)}
				{charts.orgsAvg && (
					<ChartCard
						title='Duración por organización'
						subtitle='Promedio del procesamiento'
						help={HELP.orgsDuracion}
						className='h-64'
					>
						<EChart config={charts.orgsAvg} />
					</ChartCard>
				)}
				<ChartCard
					title='Resultado de las corridas'
					subtitle='Éxito vs. error'
					help={HELP.resultado}
					className='h-64'
				>
					<EChart config={charts.result} />
				</ChartCard>
			</div>

			{data.skipped?.length > 0 && (
				<p className='text-xs text-slate-400 dark:text-gray-400 px-1'>
					Sin datos de: {data.skipped.join(', ')}
				</p>
			)}
		</div>
	)
}

export default CronDashboard
