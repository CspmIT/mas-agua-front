import { Navigate } from 'react-router-dom'
import { storage } from '../storage/storage'

const SUPER_ADMIN_PROFILE_ID = 4

// Guard de ruta: solo deja pasar a usuarios con perfil Super Admin.
// Ocultar el menu no alcanza (la URL sigue siendo accesible tipeandola).
const SuperAdminRoute = ({ children }) => {
	const usuario = storage.get('usuario')
	if (usuario?.profile !== SUPER_ADMIN_PROFILE_ID) {
		return <Navigate to='/' replace />
	}
	return children
}

export default SuperAdminRoute
