import { storage } from '../../../../storage/storage'
import { request } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
import { list_menu } from '../../../ConfigMenu/components/PermissionMenu/components/data'

export const getPermissionDb = async () => {
	let usuario = storage.get('usuario')

	const permissiondata =
		import.meta.env.VITE_WIFI == 'sin'
			? datapermisos
			: await request(
					`${backend[`${import.meta.env.VITE_APP_NAME}`]}/getPermission?id=${
						usuario.sub
					}&type=id_user&profile=${usuario.profile}`,
					'GET'
			  )

	const combinedPermissions = permissiondata.data.reduce((acc, current) => {
		const existingIndex = acc.findIndex((item) => item.id_menu === current.id_menu)
		if (existingIndex === -1) {
			acc.push({ ...current })
		} else {
			acc[existingIndex].status = acc[existingIndex].status || current.status
		}
		return acc
	}, [])
	const menus =
		import.meta.env.VITE_WIFI == 'sin'
			? { data: list_menu }
			: await request(`${backend[`${import.meta.env.VITE_APP_NAME}`]}/getAllMenu`, 'GET')
	const permisos = menus.data
		.map((item) => {
			const findPermissions = Object.values(combinedPermissions).find((perm) => perm.id_menu == item.id)
			item.status = findPermissions?.status || 0
			return item
		})
		.filter((item) => item.status)
	return permisos
}

const datapermisos = {
	data: [
		{
			id: 28,
			id_menu: 1,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 29,
			id_menu: 2,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 30,
			id_menu: 3,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 31,
			id_menu: 4,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 32,
			id_menu: 5,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 33,
			id_menu: 6,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 34,
			id_menu: 7,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 35,
			id_menu: 8,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 36,
			id_menu: 9,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-28T09:49:15.000Z',
			updatedAt: '2024-11-28T09:49:15.000Z',
		},
		{
			id: 37,
			id_menu: 10,
			id_profile: 4,
			id_user: null,
			status: true,
			createdAt: '2024-11-29T09:36:20.000Z',
			updatedAt: '2024-11-29T09:36:20.000Z',
		},
	],
}
