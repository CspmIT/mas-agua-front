import { request } from '../../../utils/js/request'
import { backend as backendUrls } from '../../../utils/routes/app.routes'

const backend = backendUrls[import.meta.env.VITE_APP_NAME]

export const getNetworks = async () => {
	const { data } = await request(`${backend}/sim/networks`, 'GET')
	return data
}

export const getNetworkById = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}`, 'GET')
	return data
}

export const createNetwork = async (network) => {
	const { data } = await request(`${backend}/sim/network`, 'POST', network)
	return data
}

export const editNetwork = async (id, network) => {
	const { data } = await request(`${backend}/sim/network/${id}`, 'POST', network)
	return data
}

export const deleteNetwork = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}`, 'DELETE')
	return data
}

/** Cotas de terreno (SRTM 30 m) para una lista de puntos {latitude, longitude} */
export const getElevations = async (points) => {
	const { data } = await request(`${backend}/sim/elevations`, 'POST', { points })
	return data.elevations
}

/** Valores medidos actuales de los elementos vinculados a variables de InfluxDB */
export const getLiveValues = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}/live`, 'GET')
	return data
}

/** Lista de variables de InfluxDB del tenant (para vincular elementos) */
export const getInfluxVars = async () => {
	const { data } = await request(`${backend}/getVarsInflux`, 'GET')
	return data
}

/** Habilita/deshabilita el monitoreo automático de una red */
export const setMonitor = async (id, { enabled, threshold }) => {
	const { data } = await request(`${backend}/sim/network/${id}/monitor`, 'POST', { enabled, threshold })
	return data
}

/** Corre un chequeo de monitoreo ahora */
export const runCheckNow = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}/check`, 'POST')
	return data
}

/** Últimas corridas de monitoreo de una red */
export const getRuns = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}/runs`, 'GET')
	return data
}

/** Marca las desviaciones pendientes de una red como vistas */
export const markRunsViewed = async (id) => {
	const { data } = await request(`${backend}/sim/network/${id}/runs/viewed`, 'POST')
	return data
}
