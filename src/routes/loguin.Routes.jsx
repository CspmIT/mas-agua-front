import LoginApp from '../modules/LoginApp/view'
import ListClients from '../modules/LoginApp/view/ListClient'
import LoginCooptech from '../modules/LoginApp/view/LoginCooptech'
import NotFound from '../modules/Errors/Not-Found'

export const loginRoutes = [
	{ path: '/login', element: <LoginApp /> },
	{ path: '/ListClients', element: <ListClients /> },
	{ path: '/ListClients/:action', element: <ListClients /> },
	{ path: '/LoginCooptech/:token', element: <LoginCooptech /> },
	{ path: '/*', element: <NotFound /> },
]