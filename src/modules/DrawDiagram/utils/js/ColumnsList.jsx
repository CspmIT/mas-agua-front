import { Circle, Edit } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { FaEye } from 'react-icons/fa'

export const ColumnsListDiagram = (editDiagram, viewDiagram) => [
	{
		header: 'Nombre',
		accessorKey: 'title',
	},
	{
		header: 'Estado',
		accessorKey: 'status',
		Cell: ({ row }) => {
			return (
				<div className='flex items-center w-full'>
					<Circle color={row.original?.status > 0 ? 'success' : 'error'} />
					<p className='m-0 p-0 ml-2 text-base'>{`${
						row.original?.status > 0 ? 'Habilitado' : 'Deshabilitado'
					}`}</p>
				</div>
			)
		},
	},
	{
		header: '',
		accessorKey: 'btn-dashboard',
		size: 10,
		enableSorting: false,
		enableColumnFilter: false,
		enableClickToCopy: false,
		Cell: ({ row }) => {
			const info = {
				Name: row.original.name,
				id: parseInt(row.original.id),
				type_recloser: 4,
				...row.origin,
			}
			return (
				<>
					<IconButton
						onClick={() => editDiagram(row.original)}
						className=' !bg-[#ffbf1e] hover:!bg-[#ffde89] !text-black !shadow-md'
					>
						<Edit />
					</IconButton>
					<IconButton
						onClick={() => viewDiagram(row.original)}
						className=' !bg-[#1eceff] hover:!bg-[#89e5ff] !text-black !shadow-md'
					>
						<FaEye />
					</IconButton>
				</>
			)
		},
	},
]
