import { useState, useEffect, useCallback } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

// El back manda status 'off' tanto para una binaria apagada (kind 'binary', value 0)
// como para un sensor sin valor. Los separamos en 'apagado' vs 'off' (Sin datos)
// para que contador, filtro, pin y label los traten distinto.
const normalizeSnapshot = (data) => {
    const out = {}
    for (const [id, s] of Object.entries(data || {})) {
        out[id] =
            s && s.kind === 'binary' && s.status === 'off'
                ? { ...s, status: 'apagado' }
                : s
    }
    return out
}

export const useSensorSnapshot = (markers, { intervalMs = 15000 } = {}) => {
    const [snapshot, setSnapshot] = useState({})
    const [lastUpdate, setLastUpdate] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchSnapshot = useCallback(async () => {
        if (!markers || markers.length === 0) {
            setSnapshot({})
            setLoading(false)
            return
        }
        try {
            const markerIds = markers.map((m) => m.id).filter(Boolean)
            if (markerIds.length === 0) {
                setSnapshot({})
                setLoading(false)
                return
            }
            const { data: body } = await request(
                `${backend[import.meta.env.VITE_APP_NAME]}/markers/snapshot`,
                'POST',
                { markerIds }
            )
            setSnapshot(normalizeSnapshot(body?.data))
            setLastUpdate(new Date())
        } catch (err) {
            console.error('useSensorSnapshot error:', err)
        } finally {
            setLoading(false)
        }
    }, [markers])

    useEffect(() => {
        fetchSnapshot()
        const t = setInterval(fetchSnapshot, intervalMs)
        return () => clearInterval(t)
    }, [fetchSnapshot, intervalMs])

    return { snapshot, lastUpdate, loading, refresh: fetchSnapshot }
}
