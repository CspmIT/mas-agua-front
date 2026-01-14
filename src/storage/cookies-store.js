import Cookies from 'js-cookie'
//import { Store } from 'tauri-plugin-store-api'
import { load } from '@tauri-apps/plugin-store'

let storeInstance = null
// Función para detectar si estamos en un entorno Tauri
function isTauri() {
	return window.isTauri
	//return typeof window.__TAURI__ !== 'undefined'
}

// Crear una instancia de Store para Tauri
async function getStore() {
	if (!isTauri()) return null
	if (!storeInstance) {
		storeInstance = await load('store.json', { autoSave: false })
	}
	return storeInstance
}
// Guardar datos condicionalmente
export async function saveData(key, value, cookieOptions = {}) {
	try {
		if (isTauri()) {
			const store = await getStore()
			await store.set(key, value)
			await store.save()
		} else {
			Cookies.set(key, value, cookieOptions)
		}
	} catch (error) {
		console.error('Error saving data:', error)
	}
}

// Obtener datos condicionalmente
export async function getData(key) {
	try {
		if (isTauri()) {
			const store = await getStore()
			return await store.get(key)
		} else {
			return Cookies.get(key)
		}
	} catch (error) {
		console.error('Error getting data:', error)
	}
}

// Eliminar datos condicionalmente
export async function removeData(key) {
	try {
		if (isTauri()) {
			const store = await getStore()
			await store.delete(key)
			await store.save()
		} else {
			Cookies.remove(key)
		}
	} catch (error) {
		console.error('Error removing data:', error)
	}
}
