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
import { ColumnsProfile } from '../utils/DataTable/ColumnsProfile'
import { ColumnsUser } from '../utils/DataTable/ColumnsUsers'

function ConfigMenu() {
	const { tabs, setTabs, setTabCurrent } = useContext(MainContext);
	const navigate = useNavigate();
	const [listUsers, setListUsers] = useState([]);
	const [listProfile, setListProfile] = useState([]);
	const [loading, setLoading] = useState(true);

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

	const getProfiles = async () => {
		try {
			const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/listProfiles`, 'GET');
			if (response?.data) {
				setListProfile(response.data);
			}
		} catch (error) {
			console.error('Error al obtener perfiles:', error);
		}
	};

	const fetchAll = async () => {
		setLoading(true);
		await Promise.all([getProfiles(), getUsers()]);
		setLoading(false);
	};

	useEffect(() => {
		fetchAll();
	}, []);

	const editProfile = (data) => {
		const existingTabIndex = tabs.findIndex((tab) => tab.name === `Edicion Menu Perfil ${data.name}`);
		if (existingTabIndex !== -1) {
			setTabCurrent(existingTabIndex);
		} else {
			setTabs((prevTabs) => [
				...prevTabs,
				{
					name: `Edicion Menu Perfil ${data.description}`,
					id: data.id,
					link: '/userEdit',
					component: <PermissionMenu data={data} profile={data.id} />,
				},
			]);
			setTabCurrent(tabs.length);
		}
		navigate('/tabs');
	};

	const editUser = (data) => {
		const existingTabIndex = tabs.findIndex((tab) => tab.name === `Edicion Menu de:${data.last_name}`);
		if (existingTabIndex !== -1) {
			setTabCurrent(existingTabIndex);
		} else {
			setTabs((prevTabs) => [
				...prevTabs,
				{
					name: `Edicion Menu de:${data.last_name}`,
					id: data.id,
					link: '/userEdit',
					component: <PermissionMenu data={data} id_user={data.id} />,
				},
			]);
			setTabCurrent(tabs.length);
		}
		navigate('/tabs');
	};

	const swalNewPassword = async (info) => {
		const result = await Swal.fire({
			title: 'Crear nueva contraseña',
			input: 'text',
			inputLabel: 'Ingrese la nueva contraseña',
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: async (password) => {
				if (!password) {
					Swal.showValidationMessage('La contraseña no puede estar vacía');
				} else {
					await savePassword(info, password);
				}
			},
		});
	};

	const savePassword = async (info, password) => {
		try {
			const data = {
				id_user: info?.id,
				id: info?.passwordRecloser?.id || 0,
				password: password,
			};
			await request(`${backend[import.meta.env.VITE_APP_NAME]}/savePass`, 'POST', data);
			await getUsers();
			Swal.fire({
				title: 'Perfecto!',
				text: 'Se guardó correctamente',
				icon: 'success',
			});
		} catch (error) {
			Swal.fire({
				title: 'Atención!',
				text: 'Hubo un error en el guardado',
				icon: 'warning',
			});
		}
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
							Habilitaciones por Perfiles
						</Typography>
						<TableCustom
							columns={ColumnsProfile(editProfile, setListProfile)}
							data={listProfile}
							pagination
							pageSize={10}
						/>
					</Box>

					<Box>
						<Typography variant="h4" className="text-center !mb-2">
							Habilitaciones por Usuarios
						</Typography>
						<TableCustom
							columns={ColumnsUser(editUser, swalNewPassword, listProfile, setListUsers)}
							data={listUsers}
							pagination
							pageSize={10}
						/>
					</Box>
				</Box>
			)}
		</Container>
	);
}

export default ConfigMenu;
