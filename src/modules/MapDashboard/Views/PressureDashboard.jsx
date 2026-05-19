import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import LoaderComponent from '../../../components/Loader'
import StatusFilterBar from '../Components/StatusFilterBar'
import DashboardMap from '../Components/DashboardMap'
import { useSensorSnapshot } from '../hooks/useSensorSnapshot'
import CardCustom from '../../../components/CardCustom'

const ALL_STATUSES = new Set(['ok', 'warn', 'crit', 'stale', 'off'])

const PressureDashboard = () => {
    const [params] = useSearchParams()
    const mapId = params.get('id')

    const [mapData, setMapData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState(ALL_STATUSES)

    useEffect(() => {
        if (!mapId) {
            setLoading(false)
            return
        }
        const load = async () => {
            try {
                const { data } = await request(
                    `${backend[import.meta.env.VITE_APP_NAME]}/map?id=${mapId}`,
                    'GET',
                )
                setMapData(data?.[0] || null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [mapId])

    const markers = useMemo(() => {
        if (!mapData?.MarkersMaps) return []
        return mapData.MarkersMaps.map((mm) => ({
            id: mm.id,
            name: mm.name,
            longitude: Number(mm.longitude),
            latitude: Number(mm.latitude),
            sensor_type: mm.sensor_type,
            unit: mm.unit,
            anchor: mm.PopUpsMarkers?.anchor ?? '',
        }))
    }, [mapData])

    const initialViewState = useMemo(() => {
        if (!mapData) return null
        return {
            longitude: Number(mapData.longitude),
            latitude: Number(mapData.latitude),
            zoom: Number(mapData.zoom),
            bearing: Number(mapData.bearing),
            pitch: Number(mapData.pitch),
        }
    }, [mapData])

    const { snapshot, lastUpdate } = useSensorSnapshot(markers)

    const counts = useMemo(() => {
        const c = { ok: 0, warn: 0, crit: 0, stale: 0, off: 0 }
        Object.values(snapshot).forEach((s) => {
            if (c[s.status] !== undefined) c[s.status]++
        })
        return c
    }, [snapshot])

    if (loading) return <LoaderComponent />

    return (
        <div className='w-full px-2 sm:px-3 pt-2 pb-4'>
            <CardCustom className='p-1 rounded-xl w-full flex flex-col overflow-hidden'>
                <StatusFilterBar
                    title={mapData?.name || 'Dashboard de presión'}
                    counts={counts}
                    activeFilters={activeFilters}
                    setActiveFilters={setActiveFilters}
                    lastUpdate={lastUpdate}
                />
                {/* Map area: 9:16 portrait on mobile, fills viewport on desktop */}
                <div
                    className='relative w-full mx-auto aspect-[9/16] max-h-[calc(100vh-180px)] sm:aspect-auto sm:h-[calc(88vh-80px)] sm:max-h-none'
                >
                    <DashboardMap
                        markers={markers}
                        snapshot={snapshot}
                        activeFilters={activeFilters}
                        initialViewState={initialViewState}
                    />
                </div>
            </CardCustom>
        </div>
    )
}

export default PressureDashboard
