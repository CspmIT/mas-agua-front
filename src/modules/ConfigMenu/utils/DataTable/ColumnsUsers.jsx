import { Button, Box } from '@mui/material';
import { FaKey } from 'react-icons/fa';


export const ColumnsUser = (editUser, swalNewPassword, profile, setListUsers) => [
	{
		header: 'Nombre',
		accessorKey: 'first_name',
		Cell: ({ row }) => (
			<p className='m-0 p-0 ml-2 text-base'>
				{`${row.original?.first_name} ${row.original?.last_name}`}
			</p>
		),
	},
	{
		header: 'Email',
		accessorKey: 'email',
	},
	{
		header: 'Perfil',
		accessorKey: 'profile',
		Cell: ({ row }) => (
			<p className='m-0 p-0 ml-2 text-base'>
				{
					profile.find((item) => item.id === row.original?.profile)?.description || ''
				}
			</p>
		),
	},
	{
		header: 'Estado',
		accessorKey: 'status',
		Cell: ({ row }) => (
			<span className={`text-sm font-semibold ${row.original.status ? 'text-green-600' : 'text-red-600'}`}>
				{row.original.status ? 'Habilitado' : 'Deshabilitado'}
			</span>
		),
	},
	{
		header: 'Acciones',
		accessorKey: 'actions',
		Cell: ({ row }) => {
			return (
				<Box display="flex" gap={1}>
					<Button
						variant="outlined"
						color="warning"
						size="small"
						onClick={() => swalNewPassword(row.original)}
					>
						Clave de operacion
					</Button>
					<Button
						variant="outlined"
						color="primary"
						size="small"
						onClick={() => editUser(row.original)}
					>
						Editar
					</Button>
				</Box>
			);
		},
	},
];
