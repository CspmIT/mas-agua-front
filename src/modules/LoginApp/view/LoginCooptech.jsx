import { useNavigate, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { storage } from '../utils/storage'
import Swal from 'sweetalert2'
import { removeData, saveData } from '../../../storage/cookies-store'

const LoginCooptech = () => {
	const navigate = useNavigate()
	const { token } = useParams(['token'])
	const validateUserCooptech = async () => {
		try {
			if (token === 'null') {
				await removeData('token')
				storage.remove('usuario')
				storage.remove('tokenCooptech')
				navigate('/login')
			}
			storage.set('tokenCooptech', token)
			const decodedToken = jwtDecode(token)
			if (decodedToken.cliente) {
				const cliente = decodedToken.cliente.find((item) => item.selected)
				storage.set('usuarioCooptech', {
					cliente: cliente,
					id_user: decodedToken.user_id_cooptech,
					token: decodedToken.tokenCooptech,
				})
			}
			delete decodedToken.user_id_cooptech
			delete decodedToken.tokenCooptech
			// Obtengo la fecha de expiracion del token y la guardo en una cookie
			const expirationDate = new Date(decodedToken.exp)
			await saveData('token', token, {
				expires: expirationDate,
				secure: import.meta.env.VITE_ENTORNO === 'desarrollo' ? false : true,
				sameSite: import.meta.env.VITE_ENTORNO === 'desarrollo' ? 'Lax' : 'None',
			})
			storage.set('usuario', decodedToken)
			navigate('/')
		} catch (error) {
			Swal.fire('Atencion', error.response?.data?.error || error.response?.data || error.message, 'error')
			await removeData('token')
			storage.remove('usuario')
			storage.remove('tokenCooptech')
			navigate('/login')
			return false
		}
	}
	validateUserCooptech()
	return <></>
}

export default LoginCooptech
