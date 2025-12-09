import { Button, Box } from '@mui/material';

export const ColumnsProfile = (editProfile, setListProfile) => [
	{
		header: 'ID',
		accessorKey: 'id',
		size: 50,
	},
	{
		header: 'Perfil',
		accessorKey: 'description',
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
