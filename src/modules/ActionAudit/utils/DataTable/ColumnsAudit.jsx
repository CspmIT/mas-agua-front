import { Tooltip } from '@mui/material'

const TIMEZONE = 'America/Argentina/Cordoba'
const MAX_DETAIL_CHARS = 120

const formatDetail = (detail) => {
	if (detail === null || detail === undefined) return ''
	try {
		return typeof detail === 'string' ? detail : JSON.stringify(detail)
	} catch {
		return ''
	}
}

export const ColumnsAudit = () => [
	{
		header: 'Fecha',
		accessorKey: 'createdAt',
		size: 170,
		Cell: ({ row }) => {
			const raw = row.original.createdAt
			return (
				<p className='m-0 p-0 ml-2 text-base tabular-nums'>
					{raw ? new Date(raw).toLocaleString('es-AR', { timeZone: TIMEZONE }) : '—'}
				</p>
			)
		},
	},
	{
		header: 'Usuario',
		accessorKey: 'user_name',
		Cell: ({ row }) => {
			const { user_name, user_email } = row.original
			if (!user_name && !user_email) {
				return <p className='m-0 p-0 text-base italic text-slate-400'>Sistema</p>
			}
			return (
				<Tooltip title={user_email || 'Sin email'} placement='top' arrow>
					<p className='m-0 p-0 text-base w-fit cursor-default'>
						{user_name || user_email}
					</p>
				</Tooltip>
			)
		},
	},
	{
		header: 'Acción',
		accessorKey: 'action',
		Cell: ({ row }) => <p className='m-0 p-0 text-base'>{row.original.action}</p>,
	},
	{
		header: 'Detalle',
		accessorKey: 'detail',
		Cell: ({ row }) => {
			const text = formatDetail(row.original.detail)
			if (!text) return <p className='m-0 p-0 text-base'>—</p>
			const truncated =
				text.length > MAX_DETAIL_CHARS ? `${text.slice(0, MAX_DETAIL_CHARS)}…` : text
			return (
				<span className='font-mono text-sm text-slate-600 dark:text-slate-300' title={text}>
					{truncated}
				</span>
			)
		},
	},
]
