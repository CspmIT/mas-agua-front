import { useEffect, useMemo, useState } from 'react'
import { Collapse } from '@mui/material'
import { ExpandMore, Star } from '@mui/icons-material'
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LoaderComponent from '../../../components/Loader'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import ChartAcorddion from '../components/ChartAcorddion'
import { isNewChart } from '../utils/newChart'

const SortableChartAccordion = ({ chart, onToggleFavorite }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: chart.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        zIndex: isDragging ? 10 : 'auto',
        position: 'relative',
    }

    return (
        <div ref={setNodeRef} style={style}>
            <ChartAcorddion
                chart={chart}
                favorite
                onToggleFavorite={onToggleFavorite}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    )
}

const SectionHeader = ({ children }) => (
    <div className="flex items-center gap-2 px-1 pt-1 pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
        {children}
    </div>
)

const ChartsDashboard = () => {
    const [loaderCooptech, setLoaderCooptech] = useState(true)
    const [charts, setCharts] = useState([])
    const [preferences, setPreferences] = useState([])
    const [showOthers, setShowOthers] = useState(false)

    const url = backend[import.meta.env.VITE_APP_NAME]

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    )

    const fetchData = async () => {
        const [chartsRes, prefsRes] = await Promise.all([
            request(`${url}/dashboardCharts`, 'GET'),
            request(`${url}/chartPreferences`, 'GET'),
        ])
        setCharts(chartsRes.data ?? [])
        setPreferences(prefsRes.data ?? [])
        setLoaderCooptech(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const favoritePositions = useMemo(() => {
        const map = new Map()
        for (const pref of preferences) {
            if (pref.favorite) map.set(pref.chart_id, pref.position ?? 0)
        }
        return map
    }, [preferences])

    const favorites = useMemo(
        () =>
            charts
                .filter((c) => favoritePositions.has(c.id))
                .sort((a, b) => favoritePositions.get(a.id) - favoritePositions.get(b.id)),
        [charts, favoritePositions]
    )

    const others = useMemo(
        () => charts.filter((c) => !favoritePositions.has(c.id)),
        [charts, favoritePositions]
    )

    const toggleFavorite = async (chartId, favorite) => {
        // Actualizacion optimista: al marcar se agrega al final de los favoritos
        setPreferences((prev) => {
            const rest = prev.filter((p) => p.chart_id !== chartId)
            const nextPosition = favorite
                ? Math.max(-1, ...prev.filter((p) => p.favorite).map((p) => p.position ?? 0)) + 1
                : null
            return [...rest, { chart_id: chartId, favorite, position: nextPosition }]
        })

        try {
            await request(`${url}/chartPreferences/favorite`, 'PUT', { chartId, favorite })
        } catch (error) {
            console.error('Error guardando favorito', error)
            fetchData()
        }
    }

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return

        const oldIndex = favorites.findIndex((c) => c.id === active.id)
        const newIndex = favorites.findIndex((c) => c.id === over.id)
        const reordered = arrayMove(favorites, oldIndex, newIndex)

        setPreferences((prev) =>
            prev.map((pref) => {
                const index = reordered.findIndex((c) => c.id === pref.chart_id)
                return pref.favorite && index !== -1 ? { ...pref, position: index } : pref
            })
        )

        try {
            await request(`${url}/chartPreferences/order`, 'PUT', {
                chartIds: reordered.map((c) => c.id),
            })
        } catch (error) {
            console.error('Error guardando el orden', error)
            fetchData()
        }
    }

    if (loaderCooptech) {
        return (
            <div className="w-full">
                <LoaderComponent />
            </div>
        )
    }

    // Sin favoritos: lista plana como siempre, con la estrella para descubrir la feature
    if (!favorites.length) {
        return (
            <div className="w-full">
                {charts.map((chart) => (
                    <ChartAcorddion
                        chart={chart}
                        key={chart.id}
                        favorite={false}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="w-full">
            <SectionHeader>
                <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                Favoritos
            </SectionHeader>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={favorites.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {favorites.map((chart) => (
                        <SortableChartAccordion
                            key={chart.id}
                            chart={chart}
                            onToggleFavorite={toggleFavorite}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {others.length > 0 && (
                <>
                    <button
                        type="button"
                        onClick={() => setShowOthers((prev) => !prev)}
                        className="bg-transparent border-0 p-0 w-full cursor-pointer"
                    >
                        <SectionHeader>
                            <ExpandMore
                                sx={{
                                    fontSize: 15,
                                    color: '#64748b',
                                    transform: showOthers ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s ease',
                                }}
                            />
                            Otros gráficos ({others.length})
                            {(() => {
                                const newCount = others.filter(isNewChart).length
                                if (!newCount) return null
                                return (
                                    <span className="inline-flex items-center px-2 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
                                        {newCount} {newCount === 1 ? 'nuevo' : 'nuevos'}
                                    </span>
                                )
                            })()}
                        </SectionHeader>
                    </button>

                    <Collapse in={showOthers}>
                        {others.map((chart) => (
                            <ChartAcorddion
                                chart={chart}
                                key={chart.id}
                                favorite={false}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </Collapse>
                </>
            )}
        </div>
    )
}

export default ChartsDashboard
