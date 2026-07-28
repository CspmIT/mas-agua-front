import { useEffect, useMemo, useState } from 'react'
import { Container } from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import PageHeader from '../../../components/PageHeader'
import FiltersBar from '../../../components/FiltersBar'
import LoaderComponent from '../../../components/Loader'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { ColumnsAudit } from '../utils/DataTable/ColumnsAudit'

const inputClass =
	'rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 outline-none focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200'

const emptyFilters = { dateFrom: '', dateTo: '', action: '' }

function ActionAudit() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState(emptyFilters)

	const columns = useMemo(() => ColumnsAudit(), [])

	const getLogs = async (activeFilters = filters) => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			if (activeFilters.dateFrom) params.set('dateFrom', activeFilters.dateFrom)
			if (activeFilters.dateTo) params.set('dateTo', activeFilters.dateTo)
			if (activeFilters.action) params.set('action', activeFilters.action)
			const query = params.toString()
			const response = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/audit/actions${query ? `?${query}` : ''}`,
				'GET'
			)
			setLogs(response?.data ?? [])
		} catch (error) {
			console.error('Error al obtener la auditoría de acciones:', error)
			setLogs([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getLogs()
	}, [])

	const handleReset = () => {
		setFilters(emptyFilters)
		getLogs(emptyFilters)
	}

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			<PageHeader title='Auditoría de acciones' />

			<FiltersBar onFilter={() => getLogs()} onReset={handleReset}>
				<div className='flex flex-wrap items-center gap-1.5 w-full justify-center sm:flex-1 sm:justify-start'>
					<label className='flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-300'>
						Desde
						<input
							type='date'
							className={inputClass}
							value={filters.dateFrom}
							onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
						/>
					</label>
					<label className='flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-300'>
						Hasta
						<input
							type='date'
							className={inputClass}
							value={filters.dateTo}
							onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
						/>
					</label>
					<input
						type='text'
						placeholder='Buscar por acción…'
						className={inputClass}
						value={filters.action}
						onChange={(e) => setFilters({ ...filters, action: e.target.value })}
					/>
				</div>
			</FiltersBar>

			{loading ? (
				<LoaderComponent />
			) : (
				<TableCustom columns={columns} data={logs} pagination pageSize={10} />
			)}
		</Container>
	)
}

export default ActionAudit
