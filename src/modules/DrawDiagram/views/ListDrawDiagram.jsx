import { useEffect, useMemo, useState } from 'react';
import { Button, Container, useMediaQuery } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import TableCustom from '../../../components/TableCustom';
import Swal from 'sweetalert2';
import LoaderComponent from '../../../components/Loader';
import { storage } from '../../../storage/storage';
import PageHeader from '../../../components/PageHeader';
import { ActionsRow, EditChip, StatusPill, StatusToggleChip, ToneChip } from '../../../components/TableActions';

const primaryActionSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	letterSpacing: '0.01em',
	px: 2.5,
	py: 1,
	minHeight: 0,
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
	transition: 'box-shadow 0.2s ease, transform 0.2s ease',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
		transform: 'translateY(-1px)',
	},
	'&:active': { transform: 'translateY(0)' },
};

const ListDrawDiagram = () => {
	const navigate = useNavigate();
	const [listDiagram, setListDiagram] = useState([]);
	const [columnsTable, setColumnsTable] = useState([]);
	const [loading, setLoading] = useState(true);
	const usuario = storage.get('usuario');
	const isSuperAdmin = usuario?.profile === 4;
	const isMobile = useMediaQuery('(max-width: 768px)');

	const columnVisibility = useMemo(
		() => (isMobile ? { id: false } : {}),
		[isMobile]
	);


	const fetchDiagrams = async () => {
		const url = backend[import.meta.env.VITE_APP_NAME];
		try {
			setLoading(true);
			const { data } = await request(`${url}/getDiagrams`, 'GET');

			const columns = [
				{
					header: 'ID',
					accessorKey: 'id',
					size: 120,
				},
				{
					header: 'Nombre',
					accessorKey: 'title',
				},
				{
					header: 'Estado',
					accessorKey: 'status',
					Cell: ({ row }) => <StatusPill active={!!row.original.status} />,
				},
				{
					header: 'Acciones',
					accessorKey: 'actions',
					Cell: ({ row }) => (
						<ActionsRow>
							<EditChip onClick={() => navigate(`/newDiagram/${row.original.id}`)} />
							<ToneChip tone='info' onClick={() => navigate(`/viewDiagram/${row.original.id}`)}>
								Ver
							</ToneChip>

							{isSuperAdmin && !row.original.inMenu && (
								<ToneChip tone='accent' onClick={() => navigate(`/config/menu`)}>
									Añadir a menú
								</ToneChip>
							)}

							<StatusToggleChip
								active={!!row.original.status}
								onClick={async (e) => {
									e.preventDefault();
									const confirm = await Swal.fire({
										icon: 'question',
										html: `¿Seguro que querés ${row.original.status ? 'desactivar' : 'activar'} este diagrama?`,
										showCancelButton: true,
										confirmButtonText: row.original.status ? 'Desactivar' : 'Activar',
										cancelButtonText: 'Cancelar',
									});
									if (!confirm.isConfirmed) return;

									try {
										const { data: res } = await request(
											`${url}/changeStatusDiagram`,
											'PUT',
											{
												id: row.original.id,
												status: row.original.status,
											}
										);
										if (res) {
											await Swal.fire({
												icon: 'success',
												text: 'Diagrama actualizado correctamente',
											});
											setListDiagram((prev) =>
												prev.map((d) =>
													d.id === row.original.id
														? { ...d, status: !d.status }
														: d
												)
											);
										}
									} catch (err) {
										console.error(err);
										Swal.fire({
											icon: 'error',
											text: 'No se pudo actualizar el estado del diagrama',
										});
									}
								}}
							/>
						</ActionsRow>
					),
				},
			];

			setColumnsTable(columns);
			setListDiagram(data);
		} catch (error) {
			console.error(error);
			Swal.fire({
				title: 'Error',
				text: 'No se pudieron obtener los diagramas.',
				icon: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDiagrams();
	}, []);

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			<PageHeader
				title='Diagramas'
				action={
					<div className='flex w-full justify-center sm:w-auto sm:justify-end'>
						<Button
							onClick={() => navigate('/newDiagram')}
							variant='contained'
							disableElevation
							startIcon={<Add sx={{ fontSize: 18 }} />}
							sx={primaryActionSx}
						>
							Crear diagrama
						</Button>
					</div>
				}
			/>

			{!loading ? (
				<div className='w-full overflow-x-auto'>
					<TableCustom
						columns={columnsTable}
						data={listDiagram.length ? listDiagram : []}
						pagination={true}
						pageSize={10}
						columnVisibility={columnVisibility}
						density={isMobile ? 'compact' : undefined}
					/>
				</div>
			) : (
				<LoaderComponent />
			)}
		</Container>
	)

};

export default ListDrawDiagram;
