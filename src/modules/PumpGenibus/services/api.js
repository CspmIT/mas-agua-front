import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

const url = backend[import.meta.env.VITE_APP_NAME]

// Ultimo estado decodificado del bombeo (lo refresca el cron cada 1 minuto)
export const getPumpStatus = () => request(`${url}/pump-genibus/status`, 'GET')

// Dispara un ciclo de lectura completo contra el CU352 (~10 s de espera)
export const refreshPumpStatus = () => request(`${url}/pump-genibus/refresh`, 'POST')

// Envia un nuevo setpoint de presion (bar, pasos de 0.1)
export const sendSetPoint = (pressure) =>
    request(`${url}/pump-genibus/set-point`, 'POST', { pressure })

export const listAutomations = () => request(`${url}/pump-genibus/automations`, 'GET')

// Programaciones que estan dentro de su ventana de ejecucion ahora
export const getActiveAutomations = () =>
    request(`${url}/pump-genibus/automations/active`, 'GET')

export const saveAutomation = (data) => request(`${url}/pump-genibus/automations`, 'POST', data)

export const deleteAutomation = (id) =>
    request(`${url}/pump-genibus/automations/${id}`, 'DELETE')

export const getAutomationLogs = (id) =>
    request(`${url}/pump-genibus/automations/${id}/logs`, 'GET')
