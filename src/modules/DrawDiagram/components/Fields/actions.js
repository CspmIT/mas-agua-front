import { request } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
export const getVarsInflux = async () => {
    try {
        const list = await request(
            `${backend[import.meta.env.VITE_APP_NAME]}/getVarsInflux`,
            'GET'
        )
        if (!list?.data) return false
        return list.data
    } catch (error) {
        console.error(error)
    }
}
