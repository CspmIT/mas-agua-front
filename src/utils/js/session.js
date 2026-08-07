import { jwtDecode } from 'jwt-decode'
import { request } from './request'
import { backend } from '../routes/app.routes'
import { getData, saveData } from '../../storage/cookies-store'

// Renueva la sesion cuando quedan menos de 2 horas de vida del token
const RENEW_THRESHOLD_MS = 2 * 60 * 60 * 1000

// El backend firmaba exp en milisegundos y ahora usa segundos (estandar JWT); se soportan ambos formatos
export const getTokenExpiration = (decoded) => new Date(decoded.exp > 1e12 ? decoded.exp : decoded.exp * 1000)

export const isTokenExpired = (token) => {
	try {
		return getTokenExpiration(jwtDecode(token)) <= new Date()
	} catch (error) {
		return true
	}
}

// Renovacion deslizante: mientras la app este en uso, pide un token nuevo antes de que venza
// el actual y re-guarda la cookie con la nueva expiracion. Una sesion abandonada vence normalmente.
export const renewSessionIfNeeded = async () => {
	try {
		const token = await getData('token')
		if (!token) return
		const decoded = jwtDecode(token)
		const remaining = getTokenExpiration(decoded).getTime() - Date.now()
		if (remaining <= 0 || remaining > RENEW_THRESHOLD_MS) return
		const url = backend[import.meta.env.VITE_APP_NAME]
		const { data } = await request(`${url}/renewToken`, 'POST')
		if (!data?.token) return
		const newDecoded = jwtDecode(data.token)
		await saveData('token', data.token, {
			expires: getTokenExpiration(newDecoded),
			secure: import.meta.env.VITE_ENTORNO === 'desarrollo' ? false : true,
			// Lax: la cookie es solo el almacenamiento del token (se envia por header
			// Authorization), asi no viaja en requests cross-site
			sameSite: 'Lax',
		})
	} catch (error) {
		console.error('No se pudo renovar la sesión', error)
	}
}
