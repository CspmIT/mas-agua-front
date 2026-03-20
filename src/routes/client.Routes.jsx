import Boards from '../modules/Boards/views'

/**
 * Mapa de overrides por cliente (nameApp).
 * Cada entrada define qué rutas sobreescriben el elemento por defecto.
 *
 * Estructura:
 *   { [nameApp]: { [path]: JSX.Element } }
 */
export const clientRouteOverrides = {
	'Rio Tercero': {
		'/': <Boards />,
		'/home': <Boards />,
	},
	'Coop desarrollo 2': {
		'/': <Boards />,
		'/home': <Boards />,
	},
}