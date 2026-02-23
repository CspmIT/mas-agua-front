import { useContext, useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Checkbox, Typography, List, Button, ListItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import { storage } from '../../../../storage/storage';
import { MainContext } from '../../../../context/MainContext';
import MenuItems from './components/MenuItems';

const PermissionMenu = ({ user }) => {
	const { setPermission } = useContext(MainContext);

	const [groupedMenus, setGroupedMenus] = useState({});
	const [expandedAccordions, setExpandedAccordions] = useState({});
	const [selectedMenus, setSelectedMenus] = useState({});
	const [userPermissions, setUserPermissions] = useState([]);
	const [profilePermissions, setProfilePermissions] = useState([]);
	const usuario = storage.get('usuario');
	const isSuperAdmin = usuario?.profile === 4;

	/* ---------------- MENUS ---------------- */

	const getDataMenu = async () => {
		const res = await request(`${backend[import.meta.env.VITE_APP_NAME]}/getAllMenu`, 'GET');
		const menusByOrder = res.data.sort((a, b) => a.order - b.order);
		setGroupedMenus(await groupedMenu(menusByOrder));
	};

	const groupedMenu = async (data) => {
		const result = data.reduce((acc, menu) => {
			const groupMenuId = parseInt(menu.group_menu);
			if (!acc[groupMenuId]) {
				acc[groupMenuId] = { ...menu, subMenus: [] };
			}
			if (menu.sub_menu) {
				const parentMenu = acc[groupMenuId];
				const subMenu = { ...menu, subMenus: [] };

				const findAndAddSubMenu = (parent, sub) => {
					if (parent.id === sub.sub_menu) {
						parent.subMenus.push(sub);
					} else {
						for (let i = 0; i < parent.subMenus.length; i++) {
							findAndAddSubMenu(parent.subMenus[i], sub);
						}
					}
				};

				findAndAddSubMenu(parentMenu, subMenu);
			}
			return acc;
		}, {});

		return Object.values(result).sort((a, b) => a.order - b.order);
	};

	const flattenMenus = (menus) => {
		return menus.reduce((acc, menu) => {
			acc.push({ id: menu.id });
			if (menu.subMenus?.length) {
				acc = acc.concat(flattenMenus(menu.subMenus));
			}
			return acc;
		}, []);
	};

	const collectChildrenIds = (menu) => {
		let ids = []
		if (menu.subMenus?.length) {
			for (const sub of menu.subMenus) {
				ids.push(sub.id)
				ids = ids.concat(collectChildrenIds(sub))
			}
		}
		return ids
	}
	
	const findMenuById = (menus, id) => {
		for (const m of menus) {
			if (m.id === id) return m
			if (m.subMenus?.length) {
				const found = findMenuById(m.subMenus, id)
				if (found) return found
			}
		}
		return null
	}

	/* ---------------- PERMISSIONS ---------------- */

	const getPermission = async () => {
		const permission = await request(
			`${backend[import.meta.env.VITE_APP_NAME]}/getPermission?id=${user.id}&type=id_user&profile=${user.profile}`,
			'GET'
		);

		const data = permission.data || [];

		const userPermRaw = data.filter(p => p.id_user !== null);
		const profilePermRaw = data.filter(p => p.id_profile !== null);

		const userMap = {};
		const profileMap = {};

		userPermRaw.forEach(p => {
			userMap[p.id_menu] = p;
		});

		profilePermRaw.forEach(p => {
			profileMap[p.id_menu] = p;
		});

		setUserPermissions(userPermRaw);
		setProfilePermissions(profilePermRaw);

		const allMenus = flattenMenus(groupedMenus);
		const menuState = {};

		allMenus.forEach((m) => {
			const u = userMap[m.id];
			const p = profileMap[m.id];

			let effective = false;
			let source = 'none';
			let userOverride = false;

			if (u) {
				effective = Boolean(u.status);
				source = 'user';
				userOverride = true;
			}
			else if (p) {
				effective = Boolean(p.status);
				source = 'profile';
				userOverride = false;
			}
			else {
				effective = false;
				source = 'none';
				userOverride = false;
			}

			menuState[m.id] = {
				effective,
				source,
				userOverride,
			};
		});

		setSelectedMenus(menuState);
	};

	useEffect(() => {
		getDataMenu();
	}, []);

	useEffect(() => {
		if (Object.values(groupedMenus).length) {
			getPermission();
		}
	}, [groupedMenus]);

	const handleAccordionChange = (id) => (event, isExpanded) => {
		setExpandedAccordions((prev) => ({
			...prev,
			[id]: isExpanded,
		}));
	};

	const toggleMenu = (id) => {
		if (!isSuperAdmin) return
	
		setSelectedMenus((prev) => {
			const newState = { ...prev }
	
			const menu = findMenuById(Object.values(groupedMenus), id)
			if (!menu) return prev
	
			const childrenIds = collectChildrenIds(menu)
			const current = prev[id]?.effective ?? false
			const nextValue = !current
	
			// toggle padre
			newState[id] = {
				effective: nextValue,
				source: 'user',
				userOverride: true,
			}
	
			// toggle hijos
			childrenIds.forEach((cid) => {
				newState[cid] = {
					effective: nextValue,
					source: 'user',
					userOverride: true,
				}
			})
	
			return newState
		})
	}

	const SaveMenu = async () => {
		try {
			const allMenus = flattenMenus(groupedMenus);

			const payload = allMenus.map((m) => {
				const state = selectedMenus[m.id];
				if (!state?.userOverride) return null;

				const existing = userPermissions.find((p) => p.id_menu === m.id);

				return {
					id: existing?.id || 0,
					id_menu: m.id,
					status: state.effective,
					id_user: user.id,
					id_profile: null,
				};
			}).filter(Boolean);

			await request(`${backend[import.meta.env.VITE_APP_NAME]}/savePermission`, 'POST', payload);

			Swal.fire({
				title: 'Perfecto!',
				text: 'Permisos guardados correctamente',
				icon: 'success',
			});

			await getPermission();
		} catch (error) {
			console.error(error);
			Swal.fire({
				title: 'Error',
				text: 'No se pudieron guardar los permisos',
				icon: 'error',
			});
		}
	};

	return (
		<div className="w-full">
			<div className="w-full flex justify-end p-2">
				<Button onClick={SaveMenu} variant="contained" disabled={!isSuperAdmin}>
					Guardar cambios
				</Button>
			</div>

			<div className="w-full">
				{Object.values(groupedMenus).map((groupMenu) => {
					const number = 240 - parseInt(groupMenu.level) * 10;
					const isExpanded = expandedAccordions[groupMenu.id] || false;

					return groupMenu.subMenus.length > 0 ? (
						<Accordion
							key={groupMenu.id}
							expanded={isExpanded}
							onChange={handleAccordionChange(groupMenu.id)}
							sx={{ backgroundColor: `rgb(${number},${number},${number})` }}
							className="!shadow-none border-2 border-solid border-white"
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								sx={{ flexDirection: 'row-reverse' }}
							>
								<Checkbox
									checked={!!selectedMenus[groupMenu.id]?.effective}
									disabled={!isSuperAdmin}
									onClick={(e) => {
										e.stopPropagation();
										toggleMenu(groupMenu.id);
									}}
								/>
								<Typography>{groupMenu.name}</Typography>
							</AccordionSummary>

							<AccordionDetails className="!pl-14">
								<List>
									<MenuItems
										items={groupMenu.subMenus}
										expandedAccordions={expandedAccordions}
										handleAccordionChange={handleAccordionChange}
										selectedMenus={selectedMenus}
										toggleMenu={toggleMenu}
										isSuperAdmin={isSuperAdmin}
									/>
								</List>
							</AccordionDetails>
						</Accordion>
					) : (
						<ListItem key={groupMenu.id} className="!pl-10">
							<Checkbox
								checked={!!selectedMenus[groupMenu.id]?.effective}
								disabled={!isSuperAdmin}
								onClick={() => toggleMenu(groupMenu.id)}
							/>
							<Typography>{groupMenu.name}</Typography>
						</ListItem>
					);
				})}
			</div>
		</div>
	);
};

export default PermissionMenu;