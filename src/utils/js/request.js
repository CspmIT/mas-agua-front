import axios from 'axios'
import { storage } from '../../storage/storage'
import { getData } from '../../storage/cookies-store'

export const request = async (url, method, data = false) => {
	if (!url || !method) {
		throw new Error('URL o método no proporcionados')
	}
	let token = await getData('token')
	if (!token) {
		token = storage.get('tokenCooptech')
	}
	try {
		const response = await axios({
			method,
			url,
			data: data || {},
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: 'Bearer ' + token,
			},
		})
		return response
	} catch (error) {
		if (error.response?.status === 500) {
			let messageError = ''
			const errors = error.response.data
			for (const key in errors) {
				if (Object.hasOwnProperty.call(errors, key)) {
					messageError += ' ' + errors[key].message
				}
			}
			throw messageError
		} else {
			throw error
		}
	}
}

export const requestPublic = async (url, method, data = false) => {
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
		if (error.response?.status === 500) {
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

export const requestFile = async (url, method, data = false) => {
	if (!url || !method) {
		throw new Error('URL o método no proporcionados')
	}

	try {
		const response = await axios({
			method,
			url,
			data: data || {},
			headers: {
				accesskey: 'ZRJGodMUp2FzrLF9N9fg',
				secretkey: 'KYTjiz1pC6AGM1U07mlDl2mUmDvUSNqnX6iM6DjL',
				'Content-Type': 'multipart/form-data',
			},
		})
		return response
	} catch (error) {
		throw error
	}
}
