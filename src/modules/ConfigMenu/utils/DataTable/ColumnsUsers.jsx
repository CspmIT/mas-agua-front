import { Button, Box } from '@mui/material';
import { FaKey } from 'react-icons/fa';

const PROFILE_MAP = {
	1: 'Moderador',
	2: 'Operador',
	3: 'Lector',
	4: 'Super Admin',
	5: 'Externo',
}

export const ColumnsUser = (editUser, swalNewPassword) => [
	{
		header: 'Nombre',
		accessorKey: 'first_name',
		Cell: ({ row }) => (
			<p className='m-0 p-0 ml-2 text-base'>
				{`${row.original?.first_name ?? ''} ${row.original?.last_name ?? ''}`}
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
		Cell: ({ row }) => {
			const profile = row.original?.profile
			return (
				<p className='m-0 p-0 text-base'>
					{PROFILE_MAP[profile] ?? 'Desconocido'}
				</p>
			)
		},
	},
	{
		header: 'Estado',
		accessorKey: 'status',
		size: 100,
		Cell: ({ row }) => (
			<span
				className={`text-sm font-semibold ${
					row.original.status ? 'text-green-600' : 'text-red-600'
				}`}
			>
				{row.original.status ? 'Habilitado' : 'Deshabilitado'}
			</span>
		),
	},
	{
		header: 'Acciones',
		accessorKey: 'actions',
		size: 300,
		Cell: ({ row }) => {
			return (
				<Box display="flex" gap={1}>
					<Button
						size="small"
						color="primary"
						variant="contained"
						onClick={() => editUser(row.original)}
					>
						Editar
					</Button>

					<Button
						size="small"
						color="warning"
						variant="outlined"
						onClick={() => swalNewPassword?.(row.original)}
						startIcon={<FaKey />}
					>
						Clave de operación
					</Button>
				</Box>
			);
		},
	},
];