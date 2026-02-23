import { useContext, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Container,
	Typography,
} from '@mui/material';
import TableCustom from '../../../components/TableCustom';
import { MainContext } from '../../../context/MainContext';
import { useNavigate } from 'react-router-dom';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import PermissionMenu from '../components/PermissionMenu/PermissionMenu';
import LoaderComponent from '../../../components/Loader';
import Swal from 'sweetalert2';
import { storage } from '../../../storage/storage';
import { ColumnsUser } from '../utils/DataTable/ColumnsUsers';

function ConfigMenu() {
	const { tabs, setTabs, setTabCurrent } = useContext(MainContext);
	const navigate = useNavigate();
	const [listUsers, setListUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	const usuario = storage.get('usuario');
	const isSuperAdmin = usuario?.profile === 4;

	const getUsers = async () => {
		try {
			const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/listUsersPass`, 'GET');
			if (response?.data) {
				setListUsers(response.data);
			}
		} catch (error) {
			console.error('Error al obtener los usuarios:', error);
		}
	};

	const fetchAll = async () => {
		setLoading(true);
		await getUsers();
		setLoading(false);
	};

	useEffect(() => {
		fetchAll();
	}, []);

	const editUserAccess = (user) => {
		console.log
		const tabName = `Accesos de ${user.last_name} ${user.first_name}`;
		const existingTabIndex = tabs.findIndex((tab) => tab.name === tabName);

		if (existingTabIndex !== -1) {
			setTabCurrent(existingTabIndex);
		} else {
			setTabs((prevTabs) => [
				...prevTabs,
				{
					name: tabName,
					id: user.id,
					link: '/userAccess',
					component: <PermissionMenu user={user} />,
				},
			]);
			setTabCurrent(tabs.length);
		}
		navigate('/tabs');
	};

	return (
		<Container>
			{loading ? (
				<Box className="w-full h-full flex justify-center items-center">
					<LoaderComponent />
				</Box>
			) : (
				<Box className="flex flex-col gap-5 w-full">
					<Box>
						<Typography variant="h4" className="text-center !mb-2">
							Habilitación de accesos por usuario
						</Typography>

						<TableCustom
							columns={ColumnsUser(editUserAccess)}
							data={listUsers}
							pagination
							pageSize={10}
						/>
					</Box>

					{!isSuperAdmin && (
						<Typography className="text-center text-gray-500">
							Modo solo lectura. Solo super admin puede modificar accesos.
						</Typography>
					)}
				</Box>
			)}
		</Container>
	);
}

export default ConfigMenu;