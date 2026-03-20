import Boards from '../modules/Boards/views'
import Home from '../modules/home/views'
/**
 * Mapa de overrides por cliente (client).
 * Cada entrada define qué rutas sobreescriben el elemento por defecto.
 *
 * Estructura:
 *   { [client]: { [path]: JSX.Element } }
 */
export const clientRouteOverrides = {
	'Rio Tercero': {
		'/': <Boards />,
		'/home': <Boards />,
		'/graphics': <Home />
	},
	'Coop desarrollo 2': {
		'/': <Boards />,
		'/home': <Boards />,
	},
}