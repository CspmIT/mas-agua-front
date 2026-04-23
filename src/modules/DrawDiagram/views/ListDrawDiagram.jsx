import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import TableCustom from '../../../components/TableCustom';
import Swal from 'sweetalert2';
import LoaderComponent from '../../../components/Loader';
import { storage } from '../../../storage/storage';
import PageHeader from '../../../components/PageHeader';
import { ActionsRow, EditChip, StatusPill, StatusToggleChip, ToneChip } from '../../../components/TableActions';

const ListDrawDiagram = () => {
	const navigate = useNavigate();
	const [listDiagram, setListDiagram] = useState([]);
	const [columnsTable, setColumnsTable] = useState([]);
	const [loading, setLoading] = useState(true);
	const usuario = storage.get('usuario');
	const isSuperAdmin = usuario?.profile === 4;


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
				createLabel='Crear diagrama'
				onCreate={() => navigate('/newDiagram')}
			/>

			{!loading ? (
				<div className='w-full overflow-x-auto'>
					<TableCustom
						columns={columnsTable}
						data={listDiagram.length ? listDiagram : []}
						pagination={true}
						pageSize={10}
					/>
				</div>
			) : (
				<LoaderComponent />
			)}
		</Container>
	)

};

export default ListDrawDiagram;
