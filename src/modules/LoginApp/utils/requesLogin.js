import axios from 'axios'
import Axios from 'axios'
import { storage } from './storage'

export const request = async (url, method, data = false) => {
	if (!url || !method) {
		throw new Error('URL o método no proporcionados')
	}

	try {
		const response = await axios({
			method,
			url,
			data: data || {},
			withCredentials: true,
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		})
		return response
	} catch (error) {
		if (error.response.status === 500) {
			let messageError = ''
			const errors = error.response.data
			for (const key in errors) {
				if (Object.hasOwnProperty.call(errors, key)) {
					messageError += ' ' + errors[key].message
				}
			}
			throw messageError
		} else {
			throw error.response.data
		}
	}
}

export const requestLogin = async (url, method, data) => {
	try {
		const response = await Axios({
			method,
			url,
			data: data || '',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		})
		return response.data
	} catch (error) {
		throw error
	}
}
export const requestAuth = async (url, method, data) => {
	const token = storage.get('usuarioCooptech').token
	try {
		const response = await Axios({
			method,
			url,
			data: data || '',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
			},
			// headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420', Accept: 'application/json', Authorization: `Bearer ${token}` },
		})
		return response.data
	} catch (error) {
		console.error('Error al enviar la solicitud:', error)
		throw error
	}
}
