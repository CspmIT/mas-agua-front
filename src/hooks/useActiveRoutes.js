import { useMemo } from 'react'
import { userRoutes } from '../routes/user.Routes'
import { externalRoutes } from '../routes/external.Routes'
import { clientRouteOverrides } from '../routes/client.Routes'

/**
 * Devuelve las rutas activas aplicando los overrides del cliente si existen.
 *
 * @param {boolean} isExternalUser
 * @param {string|null} client  - identificador del cliente (del JWT)
 * @returns {Array<{ path: string, element: JSX.Element }>}
 */
export function useActiveRoutes(isExternalUser, client) {
	return useMemo(() => {
		if (isExternalUser) return externalRoutes

		const overrides = clientRouteOverrides[client] ?? {}

		// Si no hay overrides para este cliente, devolver las rutas tal cual
		if (Object.keys(overrides).length === 0) return userRoutes

		// Aplicar overrides solo en las rutas que correspondan
		return userRoutes.map((route) =>
			overrides[route.path]
				? { ...route, element: overrides[route.path] }
				: route
		)
	}, [isExternalUser, client])
}