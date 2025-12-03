import { Button, Box } from '@mui/material';

export const ColumnsProfile = (editProfile, setListProfile) => [
	{
		header: 'Perfil',
		accessorKey: 'description',
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
						size="small"
						color="primary"
						variant="contained"
						onClick={() => editProfile(row.original)}
					>
						Editar
					</Button>
				</Box>
			);
		},
	},
];
