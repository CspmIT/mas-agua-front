import Boards from '../modules/Boards/views'
import Home from '../modules/home/views'

/**
 * Mapa de overrides por cliente (nameApp).
 * Cada entrada define qué rutas sobreescriben el elemento por defecto.
 *
 * Estructura:
 *   { [nameApp]: { [path]: JSX.Element } }
 */
export const clientRouteOverrides = {
	masagua_rio_tercero: {
		'/': <Boards />,
		'/home': <Boards />,
        '/graphics': <Home />,
	},
}