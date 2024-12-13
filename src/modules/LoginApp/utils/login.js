import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { request, requestAuth } from './requesLogin'

import { storage } from './storage'

export const logeoApp = async (usuarioId, schema, cliente = false) => {
	try {
		const urlUser = backend.Cooptech + `/getUser?id=${usuarioId}`
		const user = await requestAuth(urlUser, 'GET')
		const urlToken = backend[import.meta.env.VITE_APP_NAME] + '/loginCooptech'
		const info = {
			email: user.data.email,
			tokenApp: user.data.token_apps,
			schemaName: schema.schema_name,
			influx_name: schema.influx_name,
		}
		const token = await request(urlToken, 'POST', info)
		return token.data
	} catch (error) {
		Swal.fire({ title: 'Atención!', text: error, icon: 'warning' })
		return false
	}
}
export const schemaName = async (clientId, productId) => {
	try {
		const urlUser = backend.Cooptech + `/getSchemaProduct?clientId=${clientId}&productId=${productId}`
		const Response = await requestAuth(urlUser, 'GET')
		return Response.data[0]
	} catch (error) {
		throw new Error('errores')
	}
}

export const getProduct = async (productName, clientID, usuarioId) => {
	try {
		if (usuarioId) {
			let response = {}
			const url = backend.Cooptech + `/listProductxUserxClient?id_user=${usuarioId}&id_client=${clientID}`
			const respuesta = await requestAuth(url, 'GET').then((data) => {
				return data.data
			})
			for (const product of respuesta) {
				if (product.name === productName) {
					response = product
				}
			}
			return response
		}
	} catch (error) {
		console.error(error)
	}
}

export const getProductActive = async () => {
	try {
		const tokencooptech = storage.get('usuarioCooptech') || storage.get('usuario')
		const usuarioCooptech = storage.get('usuarioCooptech').id_user
		const clientID =
			tokencooptech.cliente?.length > 1
				? tokencooptech.cliente.find((item) => item.selected).id
				: tokencooptech.cliente.id
		const url =
			backend.Cooptech + `/getListProdct?id_user=${usuarioCooptech || tokencooptech.sub}&id_client=${clientID}`
		const product = await requestAuth(url, 'GET').then((data) => {
			return data.data
		})
		return product
	} catch (error) {
		console.error(error)
	}
}

export const saveDataUser = async (idClient, listCliente = false) => {
	let user = storage.get('usuario')
	const usuarioCooptech = storage.get('usuarioCooptech')
	if (!user?.cliente) {
		user = {
			cliente: listCliente,
			id: usuarioCooptech.id_user,
			token: usuarioCooptech.token,
		}
	}
	let cliente = user.cliente
	if (Array.isArray(user.cliente)) {
		user.cliente.map((element) => {
			if (element.id === idClient) {
				element.selected = true
			} else {
				element.selected = false
			}
			return element
		})
		cliente = user.cliente.find((item) => item.selected)
	}
	storage.set('usuario', user)

	const product = await getProduct(import.meta.env.VITE_APP_NAME, idClient, user.id)
	if (!product || !Object.keys(product).length) {
		throw new Error('No se encontro productos relacionados con el usuario')
	}
	storage.set('usuarioCooptech', {
		token: usuarioCooptech.token,
		id_user: usuarioCooptech.id_user,
		cliente: cliente,
	})
	const schema = await schemaName(idClient, product.id_product)
	const token = await logeoApp(user.id, schema, user.cliente)
	return token
}
