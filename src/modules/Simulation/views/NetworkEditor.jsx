import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// Importar con alias: el default `Map` de react-map-gl pisaría al Map nativo de JS
import MapGL, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Alert, Badge, Button, CircularProgress, IconButton, MenuItem, TextField, Tooltip } from '@mui/material'
import {
    ArrowBack,
    PlayArrow,
    SaveOutlined,
    SettingsOutlined,
    UploadFileOutlined,
    FileDownloadOutlined,
    Terrain,
    UndoRounded,
    RedoRounded,
    LayersOutlined,
    SsidChart,
    ShowChart,
    Rule,
    SensorsOutlined,
    HelpOutline,
    MonitorHeartOutlined,
} from '@mui/icons-material'
import Swal from 'sweetalert2'
import CardCustom from '../../../components/CardCustom'
import ModalShell from '../../../components/ModalShell'
import LoaderComponent from '../../../components/Loader'
import EditorToolbar from '../components/EditorToolbar'
import PropertiesPanel from '../components/PropertiesPanel'
import PatternsModal from '../components/PatternsModal'
import CurvesModal from '../components/CurvesModal'
import ControlsModal from '../components/ControlsModal'
import MonitorModal from '../components/MonitorModal'
import ResultsBar from '../components/ResultsBar'
import GeoSearch from '../components/GeoSearch'
import { NodeMarker, LinkBadge, VertexMarker, stopColor, pathMidpoint } from '../components/MapMarkers'
import { NODE_PARAMS, LINK_PARAMS, computeStops } from '../lib/resultParams'
import { getNetworkById, createNetwork, editNetwork, getElevations, getLiveValues, getInfluxVars } from '../services/simNetworks'
import { buildInp } from '../lib/inpBuilder'
import { parseInp, looksLikeLatLng } from '../lib/inpParser'
import { toLatLng, PROJECTION_OPTIONS } from '../lib/projections'
import { nextTag, makeNode, makeLink, NODE_COLORS, LINK_COLORS, DEFAULT_NETWORK, DEFAULT_VIEW_STATE } from '../lib/editorDefaults'

const MAP_STYLES = {
    streets: 'https://api.maptiler.com/maps/streets/style.json?key=mHpRzO9eugI7vKv1drLO',
    satellite: 'https://api.maptiler.com/maps/hybrid/style.json?key=mHpRzO9eugI7vKv1drLO',
}

const HISTORY_LIMIT = 50

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
}

const outlinePillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    color: '#1f4e79',
    background: 'linear-gradient(180deg, #ffffff 0%, #d9e1ec 100%)',
    border: '1px solid rgba(44, 106, 160, 0.28)',
    boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,42,68,0.08), 0 4px 10px rgba(15,42,68,0.10)',
    '&:hover': {
        background: 'linear-gradient(180deg, #ffffff 0%, #c8d4e3 100%)',
        borderColor: 'rgba(44, 106, 160, 0.45)',
    },
    'body.dark &': {
        color: '#cfe1f7',
        background:
            'linear-gradient(180deg, rgba(94,165,240,0.12) 0%, rgba(31,78,121,0.35) 100%)',
        borderColor: 'rgba(94, 165, 240, 0.35)',
    },
}

const ghostCancelSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(15, 42, 68, 0.14)',
    color: '#475569',
}

const rampExpression = (property, stops) => [
    'step',
    ['coalesce', ['get', property], 0],
    stops[0].color,
    ...stops.slice(1).flatMap((s) => [s.value, s.color]),
]

const NetworkEditor = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const mapRef = useRef(null)
    const mapWrapRef = useRef(null)

    const [header, setHeader] = useState(DEFAULT_NETWORK)
    const [nodes, setNodes] = useState([])
    const [links, setLinks] = useState([])
    const [patterns, setPatterns] = useState([])
    const [patternsOpen, setPatternsOpen] = useState(false)
    const [curves, setCurves] = useState([])
    const [curvesOpen, setCurvesOpen] = useState(false)
    const [controls, setControls] = useState([])
    const [controlsOpen, setControlsOpen] = useState(false)
    const [influxVars, setInfluxVars] = useState([])
    const [liveLoading, setLiveLoading] = useState(false)
    const [monitor, setMonitorState] = useState({ enabled: false, threshold: 5 })
    const [monitorOpen, setMonitorOpen] = useState(false)
    const [pendingDeviations, setPendingDeviations] = useState(0)

    // Variables de InfluxDB del tenant, para vincular elementos a mediciones reales
    useEffect(() => {
        getInfluxVars()
            .then((vars) => setInfluxVars(Array.isArray(vars) ? vars : []))
            .catch(() => setInfluxVars([]))
    }, [])
    const [viewState, setViewState] = useState(null)
    const [loading, setLoading] = useState(Boolean(id))
    const [loadError, setLoadError] = useState(null)

    const [tool, setTool] = useState('select')
    const [pendingFrom, setPendingFrom] = useState(null)
    const [pendingVertices, setPendingVertices] = useState([]) // vértices del trazado en curso
    const [selection, setSelection] = useState([]) // [{kind, tag}] — múltiple con Shift+clic
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)

    const [basemap, setBasemap] = useState('streets')
    const [history, setHistory] = useState([]) // snapshots {nodes, links} para deshacer
    const [redoStack, setRedoStack] = useState([])
    const [importing, setImporting] = useState(null) // {parsed, fileName, epsg} → modal de proyección
    const [elevating, setElevating] = useState(false)
    const inpInputRef = useRef(null)

    const [result, setResult] = useState(null)
    const [stepIndex, setStepIndex] = useState(0)
    const [simulating, setSimulating] = useState(false)
    const [nodeParam, setNodeParam] = useState('pressure')
    const [linkParam, setLinkParam] = useState('velocity')
    const resultsMode = result !== null

    // Rampas de color calculadas sobre toda la simulación (no cambian con el slider)
    const nodeStops = useMemo(() => (result ? computeStops('node', nodeParam, result) : null), [result, nodeParam])
    const linkStops = useMemo(() => (result ? computeStops('link', linkParam, result) : null), [result, linkParam])

    useEffect(() => {
        if (!id) return
        ;(async () => {
            try {
                const net = await getNetworkById(id)
                setHeader({
                    name: net.name,
                    description: net.description ?? '',
                    flowUnits: net.flowUnits,
                    headlossFormula: net.headlossFormula,
                    duration: net.duration,
                    hydStep: net.hydStep,
                })
                // Los DECIMAL de MySQL llegan como string: normalizar a número
                setNodes(net.nodes.map((n) => ({ ...n, latitude: Number(n.latitude), longitude: Number(n.longitude) })))
                setLinks(net.links)
                setPatterns((net.patterns || []).map((p) => ({ tag: p.tag, multipliers: p.multipliers })))
                setCurves((net.curves || []).map((c) => ({ tag: c.tag, points: c.points })))
                setControls((net.controls || []).map(({ link, action, node, condition, level }) => ({ link, action, node, condition, level })))
                setMonitorState({ enabled: Boolean(net.monitorEnabled), threshold: net.deviationThreshold ?? 5 })
                setPendingDeviations(net.pendingDeviations ?? 0)
                if (net.latitude != null) {
                    setViewState({ latitude: Number(net.latitude), longitude: Number(net.longitude), zoom: Number(net.zoom) })
                }
            } catch (err) {
                setLoadError(err?.response?.data?.message || err?.message || 'No se pudo cargar la red')
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    // Snapshot para deshacer (cubre cambios de estructura y geometría; las
    // propiedades editadas en el panel no entran para no llenar el historial por tecla)
    const pushHistory = () => {
        setHistory((h) => [...h.slice(-(HISTORY_LIMIT - 1)), { nodes, links }])
        setRedoStack([])
    }

    const undo = () => {
        if (history.length === 0) return
        const prev = history[history.length - 1]
        setRedoStack((r) => [...r, { nodes, links }])
        setHistory((h) => h.slice(0, -1))
        setNodes(prev.nodes)
        setLinks(prev.links)
        setSelection([])
        setDirty(true)
    }

    const redo = () => {
        if (redoStack.length === 0) return
        const next = redoStack[redoStack.length - 1]
        setHistory((h) => [...h, { nodes, links }])
        setRedoStack((r) => r.slice(0, -1))
        setNodes(next.nodes)
        setLinks(next.links)
        setSelection([])
        setDirty(true)
    }

    // Completa la cota de terreno de un nodo recién creado (silencioso si falla)
    const autoElevation = (tag, lngLat) => {
        getElevations([{ latitude: lngLat.lat, longitude: lngLat.lng }])
            .then(([elevation]) => {
                if (elevation == null) return
                setNodes((prev) => prev.map((n) => (n.tag === tag && n.elevation === 0 ? { ...n, elevation } : n)))
            })
            .catch(() => {})
    }

    // Aviso del navegador al cerrar/recargar con cambios sin guardar
    useEffect(() => {
        if (!dirty) return
        const handler = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [dirty])

    const nodeByTag = useMemo(() => new Map(nodes.map((n) => [n.tag, n])), [nodes])
    const allTags = useMemo(() => new Set([...nodes.map((n) => n.tag), ...links.map((l) => l.tag)]), [nodes, links])

    const isSelected = (kind, tag) => selection.some((s) => s.kind === kind && s.tag === tag)

    const selectItem = (kind, tag, shift = false) => {
        if (shift) {
            setSelection((prev) =>
                prev.some((s) => s.kind === kind && s.tag === tag)
                    ? prev.filter((s) => !(s.kind === kind && s.tag === tag))
                    : [...prev, { kind, tag }]
            )
        } else {
            setSelection([{ kind, tag }])
        }
    }

    // Valores del paso de tiempo activo, indexados por tag, para colorear resultados
    const stepValues = useMemo(() => {
        if (!result) return null
        const step = result.steps[stepIndex]
        const byTag = new Map()
        result.nodes.forEach((n, i) => byTag.set(n.id, step.nodes[i]))
        result.links.forEach((l, i) => byTag.set(l.id, step.links[i]))
        return byTag
    }, [result, stepIndex])

    const linksGeojson = useMemo(
        () => ({
            type: 'FeatureCollection',
            features: links
                .filter((l) => nodeByTag.has(l.from) && nodeByTag.has(l.to))
                .map((l) => {
                    const from = nodeByTag.get(l.from)
                    const to = nodeByTag.get(l.to)
                    const values = stepValues?.get(l.tag)
                    let coordinates = [
                        [from.longitude, from.latitude],
                        ...(l.vertices || []).map((v) => [v.longitude, v.latitude]),
                        [to.longitude, to.latitude],
                    ]
                    // Con caudal negativo se invierte la geometría: las flechas de
                    // flujo siempre apuntan en el sentido real del agua
                    if (values && values.flow < 0) coordinates = [...coordinates].reverse()
                    return {
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates },
                        properties: {
                            tag: l.tag,
                            type: l.type,
                            color: LINK_COLORS[l.type],
                            selected: isSelected('link', l.tag),
                            flow: values?.flow ?? 0,
                            value: values ? LINK_PARAMS[linkParam].getValue(values) : null,
                        },
                    }
                }),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [links, nodeByTag, selection, stepValues, linkParam]
    )

    // Escala de los marcadores según el zoom (escrita como variable CSS para
    // no re-renderizar React en cada frame de zoom): 1 desde zoom 15.5,
    // bajando linealmente hasta 0.45 en zooms lejanos
    const updateMarkerScale = () => {
        const zoom = mapRef.current?.getMap()?.getZoom()
        if (zoom == null || !mapWrapRef.current) return
        const scale = Math.min(1, Math.max(0.45, 1 - (15.5 - zoom) * 0.13))
        mapWrapRef.current.style.setProperty('--marker-scale', scale.toFixed(3))
    }

    // Triángulo para las flechas de dirección de flujo (se re-agrega al cambiar el estilo del mapa)
    const ensureArrowImage = () => {
        const map = mapRef.current?.getMap()
        if (!map || map.hasImage('flow-arrow')) return
        const size = 22
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(5, 4)
        ctx.lineTo(18, 11)
        ctx.lineTo(5, 18)
        ctx.closePath()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = '#1e293b'
        ctx.fill()
        map.addImage('flow-arrow', ctx.getImageData(0, 0, size, size))
    }

    // Trazado en curso de una tubería (origen + vértices ya clickeados)
    const pendingGeojson = useMemo(() => {
        const origin = pendingFrom ? nodeByTag.get(pendingFrom) : null
        if (!origin || pendingVertices.length === 0) return null
        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [origin.longitude, origin.latitude],
                            ...pendingVertices.map((v) => [v.longitude, v.latitude]),
                        ],
                    },
                    properties: {},
                },
            ],
        }
    }, [pendingFrom, pendingVertices, nodeByTag])

    const exitResults = () => {
        setResult(null)
        setStepIndex(0)
    }

    const changeTool = (newTool) => {
        setTool(newTool)
        setPendingFrom(null)
        setPendingVertices([])
        if (newTool !== 'select') exitResults()
    }

    // Un solo elemento seleccionado → panel de propiedades individual
    const selectedElement = useMemo(() => {
        if (selection.length !== 1) return null
        const { kind, tag } = selection[0]
        const data = kind === 'node' ? nodeByTag.get(tag) : links.find((l) => l.tag === tag)
        return data ? { kind, data } : null
    }, [selection, nodeByTag, links])

    // Varios elementos → edición masiva (con tipo común si lo hay)
    const bulk = useMemo(() => {
        if (selection.length < 2) return null
        const items = selection
            .map(({ kind, tag }) => (kind === 'node' ? nodeByTag.get(tag) : links.find((l) => l.tag === tag)))
            .filter(Boolean)
        const kinds = new Set(selection.map((s) => s.kind))
        const kind = kinds.size === 1 ? [...kinds][0] : null
        const types = new Set(items.map((d) => d.type))
        const type = kind && types.size === 1 ? [...types][0] : null
        return { kind, type, items }
    }, [selection, nodeByTag, links])

    const updateBulk = (patch) => {
        if (!bulk?.kind) return
        const tags = new Set(bulk.items.map((d) => d.tag))
        if (bulk.kind === 'node') setNodes((prev) => prev.map((n) => (tags.has(n.tag) ? { ...n, ...patch } : n)))
        else setLinks((prev) => prev.map((l) => (tags.has(l.tag) ? { ...l, ...patch } : l)))
        setDirty(true)
    }

    // Serie temporal del elemento seleccionado (para el mini-gráfico del panel)
    const resultSeries = useMemo(() => {
        if (!result || selection.length !== 1) return null
        const { kind, tag } = selection[0]
        const list = kind === 'node' ? result.nodes : result.links
        const index = list.findIndex((x) => x.id === tag)
        if (index < 0) return null
        const param = kind === 'node' ? NODE_PARAMS[nodeParam] : LINK_PARAMS[linkParam]
        return {
            label: param.label,
            unit: param.unit(result),
            times: result.steps.map((s) => s.time),
            values: result.steps.map((s) => param.getValue((kind === 'node' ? s.nodes : s.links)[index])),
        }
    }, [result, selection, nodeParam, linkParam])

    const removeItems = (items) => {
        if (items.length === 0) return
        pushHistory()
        const nodeTags = new Set(items.filter((i) => i.kind === 'node').map((i) => i.tag))
        const linkTags = new Set(items.filter((i) => i.kind === 'link').map((i) => i.tag))
        // Al borrar un nodo caen también sus tramos conectados
        const removedLinkTags = new Set([
            ...linkTags,
            ...links.filter((l) => nodeTags.has(l.from) || nodeTags.has(l.to)).map((l) => l.tag),
        ])
        setNodes((prev) => prev.filter((n) => !nodeTags.has(n.tag)))
        setLinks((prev) => prev.filter((l) => !removedLinkTags.has(l.tag)))
        // Y los controles que referenciaban lo borrado
        setControls((prev) => prev.filter((c) => !removedLinkTags.has(c.link) && !nodeTags.has(c.node)))
        setSelection([])
        setPendingFrom(null)
        setDirty(true)
    }

    const handleNodeDragEnd = (tag, lngLat) => {
        pushHistory()
        setNodes((prev) => prev.map((n) => (n.tag === tag ? { ...n, latitude: lngLat.lat, longitude: lngLat.lng } : n)))
        setDirty(true)
    }

    const handleVertexDragEnd = (index, lngLat) => {
        if (selectedElement?.kind !== 'link') return
        const tag = selectedElement.data.tag
        pushHistory()
        setLinks((prev) =>
            prev.map((l) =>
                l.tag === tag
                    ? { ...l, vertices: l.vertices.map((v, i) => (i === index ? { latitude: lngLat.lat, longitude: lngLat.lng } : v)) }
                    : l
            )
        )
        setDirty(true)
    }

    const updateSelected = (patch) => {
        if (!selectedElement) return
        const { kind, data } = selectedElement
        if (patch.tag !== undefined) {
            if (!patch.tag || (patch.tag !== data.tag && allTags.has(patch.tag)) || /[\s;"]/.test(patch.tag)) return
        }
        if (kind === 'node') {
            const oldTag = data.tag
            setNodes((prev) => prev.map((n) => (n.tag === oldTag ? { ...n, ...patch } : n)))
            if (patch.tag && patch.tag !== oldTag) {
                setLinks((prev) =>
                    prev.map((l) => ({
                        ...l,
                        from: l.from === oldTag ? patch.tag : l.from,
                        to: l.to === oldTag ? patch.tag : l.to,
                    }))
                )
                setControls((prev) => prev.map((c) => (c.node === oldTag ? { ...c, node: patch.tag } : c)))
                setSelection([{ kind, tag: patch.tag }])
            }
        } else {
            const oldTag = data.tag
            setLinks((prev) => prev.map((l) => (l.tag === oldTag ? { ...l, ...patch } : l)))
            if (patch.tag && patch.tag !== oldTag) {
                setControls((prev) => prev.map((c) => (c.link === oldTag ? { ...c, link: patch.tag } : c)))
                setSelection([{ kind, tag: patch.tag }])
            }
        }
        setDirty(true)
    }

    // Clic cerca (18 px) de un nodo existente se engancha a él al dibujar
    const findNearbyNodeTag = (lngLat, px = 18) => {
        const map = mapRef.current?.getMap()
        if (!map) return null
        const point = map.project([lngLat.lng, lngLat.lat])
        let best = null
        let bestDistance = px
        for (const n of nodes) {
            const q = map.project([n.longitude, n.latitude])
            const d = Math.hypot(point.x - q.x, point.y - q.y)
            if (d < bestDistance) {
                bestDistance = d
                best = n.tag
            }
        }
        return best
    }

    // Clic sobre un marcador de nodo (los marcadores frenan la propagación al mapa)
    const handleNodeClick = (tag, shift = false) => {
        if (resultsMode || tool === 'select') {
            selectItem('node', tag, shift)
            return
        }
        if (tool === 'delete') {
            removeItems([{ kind: 'node', tag }])
            return
        }
        if (['pipe', 'pump', 'valve'].includes(tool)) {
            if (!pendingFrom) {
                setPendingFrom(tag)
                return
            }
            if (pendingFrom === tag) {
                setPendingFrom(null)
                setPendingVertices([])
                return
            }
            const newTag = nextTag(tool, allTags)
            pushHistory()
            setLinks((prev) => [...prev, makeLink(tool, newTag, pendingFrom, tag, pendingVertices)])
            setPendingFrom(null)
            setPendingVertices([])
            setSelection([{ kind: 'link', tag: newTag }])
            setDirty(true)
        }
    }

    const handleLinkClick = (tag, shift = false) => {
        if (tool === 'delete' && !resultsMode) {
            removeItems([{ kind: 'link', tag }])
            return
        }
        selectItem('link', tag, shift)
    }

    // Clic sobre el mapa: líneas de tramos o espacio vacío
    const onMapClick = (event) => {
        const feature = event.features?.[0]
        const shift = event.originalEvent?.shiftKey ?? false

        if (feature) {
            handleLinkClick(feature.properties.tag, shift)
            return
        }

        if (resultsMode) {
            if (!shift) setSelection([])
            return
        }

        // Clic cerca de un nodo existente: engancharse en lugar de crear/agregar
        const near = findNearbyNodeTag(event.lngLat)

        if (['junction', 'reservoir', 'tank'].includes(tool)) {
            if (near) {
                selectItem('node', near, shift)
                return
            }
            const tag = nextTag(tool, allTags)
            pushHistory()
            setNodes((prev) => [...prev, makeNode(tool, tag, event.lngLat)])
            setSelection([{ kind: 'node', tag }])
            setDirty(true)
            autoElevation(tag, event.lngLat)
            return
        }

        if (['pipe', 'pump', 'valve'].includes(tool)) {
            if (near) {
                handleNodeClick(near, false)
                return
            }
            // Dibujando una tubería: cada clic en el vacío agrega un vértice al trazado
            if (tool === 'pipe' && pendingFrom) {
                setPendingVertices((prev) => [...prev, { latitude: event.lngLat.lat, longitude: event.lngLat.lng }])
                return
            }
            // Empezar un tramo en el vacío crea un nodo de consumo automático
            if (!pendingFrom) {
                const tag = nextTag('junction', allTags)
                pushHistory()
                setNodes((prev) => [...prev, makeNode('junction', tag, event.lngLat)])
                setPendingFrom(tag)
                setDirty(true)
                autoElevation(tag, event.lngLat)
                return
            }
            return
        }

        if (!shift) setSelection([])
    }

    // Doble clic mientras se dibuja una tubería: crea el nodo de destino ahí y cierra el tramo
    const onMapDblClick = (event) => {
        if (tool !== 'pipe' || !pendingFrom || resultsMode) return
        event.preventDefault()
        // Si el doble clic cayó cerca de un nodo, los clics simples previos ya cerraron el tramo
        if (findNearbyNodeTag(event.lngLat)) return
        // El doble clic dispara antes dos clics simples que agregaron 2 vértices de más
        const vertices = pendingVertices.slice(0, -2)
        const nodeTag = nextTag('junction', allTags)
        const linkTag = nextTag('pipe', new Set([...allTags, nodeTag]))
        pushHistory()
        setNodes((prev) => [...prev, makeNode('junction', nodeTag, event.lngLat)])
        setLinks((prev) => [...prev, makeLink('pipe', linkTag, pendingFrom, nodeTag, vertices)])
        setPendingFrom(null)
        setPendingVertices([])
        setSelection([{ kind: 'link', tag: linkTag }])
        setDirty(true)
        autoElevation(nodeTag, event.lngLat)
    }

    // Atajos de teclado: Shift+Enter simula, Esc cancela, Supr borra,
    // Ctrl+Z deshace, Ctrl+Y / Ctrl+Shift+Z rehace
    useEffect(() => {
        const onKeyDown = (e) => {
            const target = e.target
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault()
                simulate()
            } else if (e.key === 'Escape') {
                if (pendingFrom) {
                    setPendingFrom(null)
                    setPendingVertices([])
                } else if (selection.length > 0) {
                    setSelection([])
                } else {
                    setTool('select')
                }
            } else if (e.key === 'Delete' && selection.length > 0 && !resultsMode) {
                removeItems(selection)
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
            } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
                e.preventDefault()
                redo()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    })

    const updateHeader = (patch) => {
        setHeader((h) => ({ ...h, ...patch }))
        setDirty(true)
    }

    const goBack = async () => {
        if (dirty) {
            const confirm = await Swal.fire({
                title: '¿Salir sin guardar?',
                text: 'Hay cambios sin guardar que se van a perder.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Salir',
                cancelButtonText: 'Quedarme',
                confirmButtonColor: '#e11d48',
            })
            if (!confirm.isConfirmed) return
        }
        navigate('/simulation')
    }

    const onInpFileSelected = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
            const parsed = parseInp(await file.text())
            if (parsed.nodes.length === 0) throw new Error('El archivo no tiene nodos.')
            if (nodes.length > 0) {
                const confirm = await Swal.fire({
                    title: '¿Reemplazar la red actual?',
                    text: 'Lo dibujado hasta ahora se reemplaza por el contenido del archivo (podés deshacer con Ctrl+Z).',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Reemplazar',
                    cancelButtonText: 'Cancelar',
                })
                if (!confirm.isConfirmed) return
            }
            setImporting({ parsed, fileName: file.name, epsg: looksLikeLatLng(parsed) ? 'latlng' : 'EPSG:5346' })
        } catch (err) {
            Swal.fire('No se pudo leer el archivo', String(err?.message || err), 'error')
        }
    }

    const applyImport = () => {
        const { parsed, epsg, fileName } = importing
        try {
            const converted = toLatLng(parsed, epsg === 'latlng' ? null : epsg)
            pushHistory()
            setHeader((h) => ({
                ...h,
                name: h.name || parsed.title.slice(0, 255) || fileName.replace(/\.inp$/i, ''),
                flowUnits: converted.flowUnits,
                headlossFormula: converted.headlossFormula,
                duration: converted.duration,
                hydStep: converted.hydStep,
            }))
            setNodes(converted.nodes)
            setLinks(converted.links)
            setPatterns(converted.patterns || [])
            setCurves(converted.curves || [])
            setControls(converted.controls || [])
            setSelection([])
            setDirty(true)
            exitResults()
            setImporting(null)

            // Encuadrar el mapa sobre la red importada
            const lats = converted.nodes.map((n) => n.latitude)
            const lngs = converted.nodes.map((n) => n.longitude)
            mapRef.current?.fitBounds(
                [
                    [Math.min(...lngs), Math.min(...lats)],
                    [Math.max(...lngs), Math.max(...lats)],
                ],
                { padding: 80, duration: 1200, maxZoom: 16 }
            )

            if (converted.warnings.length > 0) {
                Swal.fire({
                    title: `Importado con ${converted.warnings.length} advertencia(s)`,
                    html: `<ul style="text-align:left;font-size:0.85rem;max-height:280px;overflow-y:auto">${converted.warnings
                        .map((w) => `<li>• ${w}</li>`)
                        .join('')}</ul>`,
                    icon: 'warning',
                })
            }
        } catch (err) {
            Swal.fire('Error al convertir coordenadas', String(err?.message || err), 'error')
        }
    }

    const exportInp = () => {
        const inp = buildInp({ ...header, name: header.name || 'Red sin nombre', nodes, links, patterns, curves, controls })
        const blob = new Blob([inp], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(header.name || 'red').replace(/[^\w\-. ]+/g, '_')}.inp`
        a.click()
        URL.revokeObjectURL(url)
    }

    const fillElevations = async () => {
        if (nodes.length === 0) return
        setElevating(true)
        try {
            // El backend acepta hasta 500 puntos por llamada
            const points = nodes.map((n) => ({ latitude: n.latitude, longitude: n.longitude }))
            const elevations = []
            for (let i = 0; i < points.length; i += 500) {
                elevations.push(...(await getElevations(points.slice(i, i + 500))))
            }
            pushHistory()
            setNodes((prev) => prev.map((n, i) => (elevations[i] == null ? n : { ...n, elevation: elevations[i] })))
            setDirty(true)
            const filled = elevations.filter((e) => e != null).length
            Swal.fire({
                title: 'Cotas actualizadas',
                text: `${filled} de ${nodes.length} nodos con cota SRTM (30 m). Ojo: en reservorios la cota es la carga hidráulica — revisala.`,
                icon: 'success',
            })
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || 'No se pudieron obtener las cotas', 'error')
        } finally {
            setElevating(false)
        }
    }

    const save = async () => {
        if (!header.name.trim()) {
            setOptionsOpen(true)
            Swal.fire('Falta el nombre', 'Poné un nombre a la red antes de guardarla.', 'info')
            return
        }
        setSaving(true)
        try {
            const map = mapRef.current?.getMap()
            const center = map?.getCenter()
            const payload = {
                ...header,
                name: header.name.trim(),
                description: header.description?.trim() || null,
                viewState: center ? { latitude: center.lat, longitude: center.lng, zoom: map.getZoom() } : null,
                nodes: nodes.map(({ id: _id, idNetwork, createdAt, updatedAt, ...n }) => n),
                links: links.map(({ id: _id, idNetwork, idNodeFrom, idNodeTo, createdAt, updatedAt, ...l }) => l),
                patterns: patterns.map(({ tag, multipliers }) => ({ tag, multipliers })),
                curves: curves.map(({ tag, points }) => ({ tag, points })),
                controls: controls.map(({ link, action, node, condition, level }) => ({ link, action, node, condition, level })),
            }
            if (id) {
                await editNetwork(id, payload)
            } else {
                const created = await createNetwork(payload)
                navigate(`/simulation/editor/${created.id}`, { replace: true })
            }
            setDirty(false)
            Swal.fire({ title: 'Red guardada', icon: 'success', timer: 1400, showConfirmButton: false })
        } catch (err) {
            const detail = Array.isArray(err?.response?.data)
                ? err.response.data.map((e) => e.message).join('. ')
                : err?.response?.data?.message || err?.message
            Swal.fire('Error al guardar', detail || 'Error desconocido', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Corre la simulación sobre los arrays que se le pasan (o el estado actual)
    const runWith = async (simNodes, simLinks) => {
        setSimulating(true)
        setSelection([])
        try {
            const { runSimulation } = await import('../lib/epanetRunner')
            const simResult = await runSimulation(
                buildInp({ ...header, nodes: simNodes, links: simLinks, patterns, curves, controls })
            )
            setResult(simResult)
            setStepIndex(0)
            setTool('select')
        } catch (err) {
            Swal.fire('Error de simulación', String(err?.message || err), 'error')
        } finally {
            setSimulating(false)
        }
    }

    const simulate = () => {
        if (nodes.length === 0) return
        runWith(nodes, links)
    }

    // Trae los valores medidos de las variables vinculadas, los aplica al
    // modelo (demanda/nivel/estado) y simula desde el estado real de la planta
    const simulateWithLive = async () => {
        if (!id) {
            Swal.fire('Guardá la red primero', 'Los vínculos a variables se leen de la red guardada.', 'info')
            return
        }
        if (dirty) {
            const confirm = await Swal.fire({
                title: 'Hay cambios sin guardar',
                text: 'Los valores medidos se buscan según los vínculos guardados en el servidor. ¿Continuar igual?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
            })
            if (!confirm.isConfirmed) return
        }

        setLiveLoading(true)
        try {
            const live = await getLiveValues(id)
            const total = Object.keys(live.nodes).length + Object.keys(live.links).length
            if (total === 0) {
                Swal.fire(
                    'Sin elementos vinculados',
                    live.errors.length
                        ? live.errors.join(' ')
                        : 'Vinculá nodos, tanques o bombas a variables de InfluxDB desde el panel de propiedades y guardá la red.',
                    'info'
                )
                return
            }

            const applied = []
            const newNodes = nodes.map((n) => {
                const measured = live.nodes[n.tag]
                if (!measured) return n
                if (n.type === 'junction') {
                    applied.push(`${n.tag}: demanda ${measured.value} ${header.flowUnits} (${measured.varName})`)
                    // La demanda medida es instantánea: reemplaza al patrón horario
                    return { ...n, baseDemand: measured.value, demandPattern: null }
                }
                if (n.type === 'tank') {
                    const level = Math.min(n.maxLevel ?? measured.value, Math.max(n.minLevel ?? 0, measured.value))
                    applied.push(`${n.tag}: nivel inicial ${level} m (${measured.varName})`)
                    return { ...n, initLevel: level }
                }
                applied.push(`${n.tag}: carga ${measured.value} m (${measured.varName})`)
                return { ...n, elevation: measured.value }
            })
            const newLinks = links.map((l) => {
                const measured = live.links[l.tag]
                if (!measured) return l
                const open = measured.value >= 0.5
                applied.push(`${l.tag}: ${open ? 'abierto/en marcha' : 'cerrado/parado'} (${measured.varName})`)
                return { ...l, initialStatus: open ? 'OPEN' : 'CLOSED' }
            })

            pushHistory()
            setNodes(newNodes)
            setLinks(newLinks)
            setDirty(true)

            await Swal.fire({
                title: `Datos de las ${new Date(live.takenAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
                html: `<ul style="text-align:left;font-size:0.85rem;max-height:260px;overflow-y:auto">${applied
                    .map((a) => `<li>• ${a}</li>`)
                    .join('')}${live.errors.map((e) => `<li style="color:#b45309">• ⚠ ${e}</li>`).join('')}</ul>
                    <div style="font-size:0.75rem;color:#64748b;margin-top:8px">Los valores quedaron aplicados al modelo (Ctrl+Z para revertir).</div>`,
                icon: live.errors.length > 0 ? 'warning' : 'success',
                confirmButtonText: 'Simular',
            })
            await runWith(newNodes, newLinks)
        } catch (err) {
            Swal.fire('Error', err?.response?.data?.message || err?.message || 'No se pudieron obtener los datos actuales', 'error')
        } finally {
            setLiveLoading(false)
        }
    }

    if (loading) return <LoaderComponent />

    if (loadError) {
        return (
            <div className='px-8 py-6 max-w-3xl mx-auto'>
                <Alert severity='error' sx={{ borderRadius: '12px' }}>
                    {loadError}
                </Alert>
            </div>
        )
    }

    return (
        <div className='w-full h-[88vh] flex flex-col px-3 sm:px-5 pt-2 pb-4'>
            {/* ── Barra única: nombre + herramientas a la izquierda, acciones a la derecha ── */}
            <div className='flex flex-wrap items-center gap-1.5 mb-2'>
                <Tooltip title='Volver a la lista'>
                    <IconButton onClick={goBack}>
                        <ArrowBack sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <div
                    className='inline-flex items-center gap-2 text-white rounded-full shadow-md mr-1'
                    style={{
                        padding: '5px 18px',
                        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                        boxShadow: '0 4px 14px rgba(44, 106, 160, 0.3)',
                    }}
                >
                    <span className='text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75'>Red</span>
                    <span className='text-white/40'>·</span>
                    <span className='text-sm font-semibold text-white truncate max-w-[28vw]'>
                        {header.name.trim() || 'Sin guardar'}
                    </span>
                </div>
                <Tooltip title='Deshacer (Ctrl+Z)'>
                    <span>
                        <IconButton size='small' disabled={history.length === 0} onClick={undo}>
                            <UndoRounded sx={{ fontSize: 19 }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title='Rehacer (Ctrl+Y)'>
                    <span>
                        <IconButton size='small' disabled={redoStack.length === 0} onClick={redo}>
                            <RedoRounded sx={{ fontSize: 19 }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title='Importar archivo .INP'>
                    <IconButton size='small' onClick={() => inpInputRef.current?.click()}>
                        <UploadFileOutlined sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Exportar como .INP'>
                    <span>
                        <IconButton size='small' disabled={nodes.length === 0} onClick={exportInp}>
                            <FileDownloadOutlined sx={{ fontSize: 19 }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title='Completar cotas de terreno (SRTM 30 m)'>
                    <span>
                        <IconButton size='small' disabled={nodes.length === 0 || elevating || resultsMode} onClick={fillElevations}>
                            {elevating ? <CircularProgress size={16} /> : <Terrain sx={{ fontSize: 19 }} />}
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title='Patrones de demanda'>
                    <IconButton size='small' onClick={() => setPatternsOpen(true)}>
                        <SsidChart sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Curvas de bombas'>
                    <IconButton size='small' onClick={() => setCurvesOpen(true)}>
                        <ShowChart sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title='Controles por nivel'>
                    <IconButton size='small' onClick={() => setControlsOpen(true)}>
                        <Rule sx={{ fontSize: 19 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={id ? 'Monitoreo automático (simulado vs. medido)' : 'Guardá la red para configurar el monitoreo'}>
                    <span>
                        <IconButton size='small' disabled={!id} onClick={() => setMonitorOpen(true)}>
                            <Badge badgeContent={pendingDeviations} color='error' overlap='circular'>
                                <MonitorHeartOutlined
                                    sx={{ fontSize: 19, color: pendingDeviations > 0 ? '#e11d48' : monitor.enabled ? '#10B981' : undefined }}
                                />
                            </Badge>
                        </IconButton>
                    </span>
                </Tooltip>
                <input ref={inpInputRef} type='file' accept='.inp' hidden onChange={onInpFileSelected} />
                <div className='flex-1' />
                <Button
                    onClick={() => setOptionsOpen(true)}
                    variant='outlined'
                    startIcon={<SettingsOutlined sx={{ fontSize: 18 }} />}
                    sx={outlinePillSx}
                >
                    Opciones
                </Button>
                <Tooltip title='Trae las mediciones actuales de las variables asociadas y simula desde el estado real de la planta'>
                    <span>
                        <Button
                            onClick={simulateWithLive}
                            variant='outlined'
                            disabled={liveLoading || simulating || nodes.length === 0}
                            startIcon={liveLoading ? <CircularProgress size={15} /> : <SensorsOutlined sx={{ fontSize: 18 }} />}
                            sx={outlinePillSx}
                        >
                            Datos actuales
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title='¿Cómo funciona "Datos actuales"?'>
                    <IconButton
                        size='small'
                        sx={{ ml: -1 }}
                        onClick={() =>
                            Swal.fire({
                                title: '¿Cómo funciona "Datos actuales"?',
                                html: `<div style="text-align:left;font-size:0.9rem;line-height:1.55">
                                    <p>Simula la red partiendo del <b>estado real de la planta en este momento</b>, usando las mediciones del SCADA.</p>
                                    <p style="margin-top:8px"><b>Para usarlo:</b></p>
                                    <ol style="padding-left:20px;margin-top:4px">
                                        <li>Seleccioná un elemento del mapa y usá el campo <b>“Asociar a variable”</b> del panel para elegir una variable ya creada en el sistema.</li>
                                        <li><b>Guardá la red</b> (los vínculos se leen de lo guardado).</li>
                                        <li>Apretá <b>Datos actuales</b>: se consultan las mediciones, se aplican al modelo y se simula.</li>
                                    </ol>
                                    <p style="margin-top:8px"><b>Qué dato trae cada elemento:</b></p>
                                    <ul style="padding-left:20px;margin-top:4px">
                                        <li>Nodo de consumo → demanda medida del caudalímetro (reemplaza al patrón horario).</li>
                                        <li>Tanque → nivel inicial desde el sensor (acotado a su mín/máx).</li>
                                        <li>Reservorio → carga medida.</li>
                                        <li>Bomba / válvula → abierta o cerrada según la marcha real (0/1).</li>
                                    </ul>
                                    <p style="margin-top:8px;color:#64748b;font-size:0.8rem">Los valores quedan aplicados al modelo: podés revisarlos en cada elemento y revertirlos con Ctrl+Z. Los elementos sin variable asociada conservan sus valores de diseño.</p>
                                </div>`,
                                confirmButtonText: 'Entendido',
                                width: 560,
                            })
                        }
                    >
                        <HelpOutline sx={{ fontSize: 17 }} />
                    </IconButton>
                </Tooltip>
                <Button
                    onClick={simulate}
                    variant='outlined'
                    disabled={simulating || nodes.length === 0}
                    startIcon={simulating ? <CircularProgress size={15} /> : <PlayArrow sx={{ fontSize: 18 }} />}
                    sx={outlinePillSx}
                >
                    Simular
                </Button>
                <Button
                    onClick={save}
                    variant='contained'
                    disableElevation
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={15} color='inherit' /> : <SaveOutlined sx={{ fontSize: 18 }} />}
                    sx={primaryPillSx}
                >
                    Guardar
                </Button>
            </div>

            {/* ── Aviso de desviaciones del monitoreo (propio del simulador) ── */}
            {pendingDeviations > 0 && (
                <button
                    type='button'
                    onClick={() => setMonitorOpen(true)}
                    className='border border-solid border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl px-4 py-2 mb-2 text-sm font-medium text-left cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50'
                >
                    ⚠ El monitoreo detectó {pendingDeviations} desviación{pendingDeviations > 1 ? 'es' : ''} entre lo simulado y lo
                    medido — posible fuga o anomalía. Clic para ver el detalle.
                </button>
            )}

            {/* ── Mapa + panel de propiedades ── */}
            <div className='flex flex-col lg:flex-row gap-3 flex-1 min-h-0'>
                <CardCustom className='p-1.5 rounded-xl h-auto w-auto flex-1 min-h-[300px] flex flex-col'>
                    <div ref={mapWrapRef} className='relative flex-1 min-h-0 rounded-lg overflow-hidden'>
                        <MapGL
                            ref={mapRef}
                            initialViewState={viewState ?? DEFAULT_VIEW_STATE}
                            mapStyle={MAP_STYLES[basemap]}
                            onClick={onMapClick}
                            onDblClick={onMapDblClick}
                            onLoad={() => {
                                ensureArrowImage()
                                updateMarkerScale()
                            }}
                            onStyleData={ensureArrowImage}
                            onZoom={updateMarkerScale}
                            doubleClickZoom={!(tool === 'pipe' && pendingFrom)}
                            interactiveLayerIds={['sim-links']}
                            cursor={['junction', 'reservoir', 'tank'].includes(tool) ? 'crosshair' : 'auto'}
                        >
                            <NavigationControl position='bottom-right' showCompass={false} />

                            <Source id='sim-links' type='geojson' data={linksGeojson}>
                                <Layer
                                    id='sim-links'
                                    type='line'
                                    layout={{ 'line-cap': 'round' }}
                                    paint={{
                                        'line-color': resultsMode && linkStops ? rampExpression('value', linkStops) : ['get', 'color'],
                                        'line-width': ['case', ['get', 'selected'], 7, 4],
                                    }}
                                />
                                {resultsMode && (
                                    <Layer
                                        id='sim-flow-arrows'
                                        type='symbol'
                                        layout={{
                                            'symbol-placement': 'line',
                                            'symbol-spacing': 70,
                                            'icon-image': 'flow-arrow',
                                            'icon-size': 0.7,
                                            'icon-allow-overlap': true,
                                            'icon-ignore-placement': true,
                                            'icon-rotation-alignment': 'map',
                                        }}
                                        filter={['>', ['abs', ['get', 'flow']], 0.0001]}
                                    />
                                )}
                            </Source>

                            {/* Trazado en curso de la tubería que se está dibujando */}
                            {pendingGeojson && (
                                <Source id='sim-pending' type='geojson' data={pendingGeojson}>
                                    <Layer
                                        id='sim-pending'
                                        type='line'
                                        layout={{ 'line-cap': 'round' }}
                                        paint={{ 'line-color': '#d8621d', 'line-width': 3, 'line-dasharray': [1.5, 1.2] }}
                                    />
                                </Source>
                            )}

                            {/* Nodos como marcadores con icono */}
                            {nodes.map((n) => (
                                <NodeMarker
                                    key={n.tag}
                                    node={n}
                                    color={NODE_COLORS[n.type]}
                                    resultColor={
                                        stepValues && nodeStops
                                            ? stopColor(nodeStops, NODE_PARAMS[nodeParam].getValue(stepValues.get(n.tag) ?? {}) ?? 0)
                                            : null
                                    }
                                    selected={isSelected('node', n.tag)}
                                    pending={pendingFrom === n.tag}
                                    draggable={tool === 'select' && !resultsMode}
                                    onClick={handleNodeClick}
                                    onDragEnd={handleNodeDragEnd}
                                />
                            ))}

                            {/* Insignias de bombas y válvulas sobre el tramo */}
                            {links
                                .filter((l) => l.type !== 'pipe' && nodeByTag.has(l.from) && nodeByTag.has(l.to))
                                .map((l) => (
                                    <LinkBadge
                                        key={l.tag}
                                        link={l}
                                        position={pathMidpoint(nodeByTag.get(l.from), nodeByTag.get(l.to), l.vertices)}
                                        color={LINK_COLORS[l.type]}
                                        selected={isSelected('link', l.tag)}
                                        onClick={handleLinkClick}
                                    />
                                ))}

                            {/* Vértices editables de la tubería seleccionada */}
                            {!resultsMode &&
                                selectedElement?.kind === 'link' &&
                                (selectedElement.data.vertices || []).map((v, i) => (
                                    <VertexMarker key={`${selectedElement.data.tag}-v${i}`} vertex={v} index={i} onDragEnd={handleVertexDragEnd} />
                                ))}
                        </MapGL>

                        <EditorToolbar tool={tool} onToolChange={changeTool} disabled={simulating} />

                        {/* Toggle calles / satélite */}
                        <Tooltip title={basemap === 'streets' ? 'Ver satélite' : 'Ver calles'} placement='right'>
                            <button
                                type='button'
                                onClick={() => setBasemap((b) => (b === 'streets' ? 'satellite' : 'streets'))}
                                className='absolute bottom-4 left-3 z-10 p-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-white/95 dark:bg-slate-800/95 border border-solid border-slate-200 dark:border-slate-600 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700'
                            >
                                <LayersOutlined sx={{ fontSize: 19 }} className='text-slate-600 dark:text-gray-300' />
                            </button>
                        </Tooltip>

                        {['pipe', 'pump', 'valve'].includes(tool) && (
                            <div className='absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-600 shadow px-4 py-1.5 text-sm text-slate-600 dark:text-gray-300'>
                                {!pendingFrom
                                    ? 'Clic en un nodo (o en el vacío para crear uno) como origen'
                                    : tool === 'pipe'
                                    ? `Origen: ${pendingFrom} — clic agrega vértices, clic en nodo termina, doble clic crea nodo y termina`
                                    : `Origen: ${pendingFrom} — clic en el nodo de destino`}
                            </div>
                        )}

                        <GeoSearch
                            onSelect={({ center, bbox }) => {
                                if (bbox) {
                                    mapRef.current?.fitBounds(
                                        [
                                            [bbox[0], bbox[1]],
                                            [bbox[2], bbox[3]],
                                        ],
                                        { padding: 60, duration: 1200 }
                                    )
                                } else if (center) {
                                    mapRef.current?.flyTo({ center, zoom: 16, duration: 1200 })
                                }
                            }}
                        />

                        {resultsMode && (
                            <ResultsBar
                                result={result}
                                stepIndex={stepIndex}
                                onStepChange={setStepIndex}
                                onClose={exitResults}
                                nodeParam={nodeParam}
                                linkParam={linkParam}
                                onNodeParamChange={setNodeParam}
                                onLinkParamChange={setLinkParam}
                                nodeStops={nodeStops}
                                linkStops={linkStops}
                            />
                        )}
                    </div>
                </CardCustom>

                <div className='w-full lg:w-[300px] flex-shrink-0 h-[280px] lg:h-auto lg:max-h-full'>
                    <PropertiesPanel
                        element={selectedElement}
                        bulk={bulk}
                        flowUnits={header.flowUnits}
                        patterns={patterns}
                        curves={curves}
                        influxVars={influxVars}
                        readOnly={resultsMode}
                        onChange={updateSelected}
                        onDelete={() => removeItems(selection)}
                        onBulkChange={updateBulk}
                        onBulkDelete={() => removeItems(selection)}
                        resultSeries={
                            resultSeries
                                ? { ...resultSeries, currentIndex: stepIndex, onPointClick: setStepIndex }
                                : null
                        }
                    />
                </div>
            </div>

            {/* ── Modal de patrones de demanda ── */}
            <PatternsModal
                open={patternsOpen}
                onClose={() => setPatternsOpen(false)}
                patterns={patterns}
                usageByTag={
                    new Map(
                        patterns.map((p) => [p.tag, nodes.filter((n) => n.demandPattern === p.tag).length])
                    )
                }
                onChange={(newPatterns, remap) => {
                    setPatterns(newPatterns)
                    if (remap) {
                        setNodes((prev) =>
                            prev.map((n) =>
                                n.demandPattern != null && remap[n.demandPattern] !== undefined
                                    ? { ...n, demandPattern: remap[n.demandPattern] }
                                    : n
                            )
                        )
                    }
                    setDirty(true)
                }}
            />

            {/* ── Modal de curvas de bombas ── */}
            <CurvesModal
                open={curvesOpen}
                onClose={() => setCurvesOpen(false)}
                curves={curves}
                flowUnits={header.flowUnits}
                usageByTag={new Map(curves.map((c) => [c.tag, links.filter((l) => l.headCurve === c.tag).length]))}
                onChange={(newCurves, remap) => {
                    setCurves(newCurves)
                    if (remap) {
                        setLinks((prev) =>
                            prev.map((l) => {
                                if (l.headCurve == null || remap[l.headCurve] === undefined) return l
                                const newTag = remap[l.headCurve]
                                // Curva eliminada: la bomba vuelve a potencia constante
                                return newTag == null ? { ...l, headCurve: null, power: l.power ?? 5 } : { ...l, headCurve: newTag }
                            })
                        )
                    }
                    setDirty(true)
                }}
            />

            {/* ── Modal de controles por nivel ── */}
            <ControlsModal
                open={controlsOpen}
                onClose={() => setControlsOpen(false)}
                controls={controls}
                links={links}
                nodes={nodes}
                onChange={(newControls) => {
                    setControls(newControls)
                    setDirty(true)
                }}
            />

            {/* ── Modal de monitoreo automático ── */}
            <MonitorModal
                open={monitorOpen}
                onClose={() => setMonitorOpen(false)}
                networkId={id}
                monitor={monitor}
                onMonitorChange={setMonitorState}
                onViewed={() => setPendingDeviations(0)}
            />

            {/* ── Modal de importación: sistema de coordenadas del INP ── */}
            <ModalShell
                open={Boolean(importing)}
                onClose={() => setImporting(null)}
                eyebrow='Importar INP'
                title={importing?.fileName ?? ''}
                maxWidth='520px'
                footer={
                    <>
                        <Button variant='outlined' sx={ghostCancelSx} onClick={() => setImporting(null)}>
                            Cancelar
                        </Button>
                        <Button variant='contained' disableElevation sx={primaryPillSx} onClick={applyImport}>
                            Importar
                        </Button>
                    </>
                }
            >
                {importing && (
                    <div className='p-4 flex flex-col gap-3'>
                        <div className='text-sm text-slate-600 dark:text-gray-300'>
                            {importing.parsed.nodes.length} nodos y {importing.parsed.links.length} tramos.
                            {looksLikeLatLng(importing.parsed)
                                ? ' Las coordenadas parecen estar en lat/lng.'
                                : ' Las coordenadas parecen estar proyectadas (metros): elegí el sistema de origen.'}
                        </div>
                        <TextField
                            select
                            size='small'
                            label='Sistema de coordenadas del archivo'
                            value={importing.epsg}
                            onChange={(e) => setImporting((s) => ({ ...s, epsg: e.target.value }))}
                        >
                            {PROJECTION_OPTIONS.map((o) => (
                                <MenuItem key={o.code ?? 'latlng'} value={o.code ?? 'latlng'}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {importing.parsed.warnings.length > 0 && (
                            <div className='text-xs text-amber-700 dark:text-amber-400'>
                                {importing.parsed.warnings.length} advertencia(s) de compatibilidad — se muestran al importar.
                            </div>
                        )}
                    </div>
                )}
            </ModalShell>

            {/* ── Modal de opciones de la red ── */}
            <ModalShell
                open={optionsOpen}
                onClose={() => setOptionsOpen(false)}
                eyebrow='Simulación'
                title='Opciones de la red'
                maxWidth='520px'
                footer={
                    <>
                        <Button variant='outlined' sx={ghostCancelSx} onClick={() => setOptionsOpen(false)}>
                            Cerrar
                        </Button>
                        <Button variant='contained' disableElevation sx={primaryPillSx} onClick={() => setOptionsOpen(false)}>
                            Aceptar
                        </Button>
                    </>
                }
            >
                <div className='p-4 flex flex-col gap-1'>
                    <TextField
                        size='small'
                        margin='dense'
                        label='Nombre de la red *'
                        value={header.name}
                        onChange={(e) => updateHeader({ name: e.target.value })}
                    />
                    <TextField
                        size='small'
                        margin='dense'
                        label='Descripción'
                        value={header.description ?? ''}
                        onChange={(e) => updateHeader({ description: e.target.value })}
                    />
                    <div className='grid grid-cols-2 gap-x-3'>
                        <TextField
                            select
                            size='small'
                            margin='dense'
                            label='Unidades de caudal'
                            value={header.flowUnits}
                            onChange={(e) => updateHeader({ flowUnits: e.target.value })}
                        >
                            <MenuItem value='LPS'>L/s</MenuItem>
                            <MenuItem value='LPM'>L/min</MenuItem>
                            <MenuItem value='CMH'>m³/h</MenuItem>
                            <MenuItem value='CMD'>m³/día</MenuItem>
                            <MenuItem value='GPM'>gal/min</MenuItem>
                        </TextField>
                        <TextField
                            select
                            size='small'
                            margin='dense'
                            label='Fórmula de fricción'
                            value={header.headlossFormula}
                            onChange={(e) => updateHeader({ headlossFormula: e.target.value })}
                        >
                            <MenuItem value='H-W'>Hazen-Williams</MenuItem>
                            <MenuItem value='D-W'>Darcy-Weisbach</MenuItem>
                            <MenuItem value='C-M'>Chezy-Manning</MenuItem>
                        </TextField>
                        <TextField
                            size='small'
                            margin='dense'
                            type='number'
                            label='Duración (horas)'
                            value={header.duration / 3600}
                            onChange={(e) => updateHeader({ duration: Math.max(0, Number(e.target.value)) * 3600 })}
                        />
                        <TextField
                            size='small'
                            margin='dense'
                            type='number'
                            label='Paso hidráulico (minutos)'
                            value={header.hydStep / 60}
                            onChange={(e) => updateHeader({ hydStep: Math.max(1, Number(e.target.value)) * 60 })}
                        />
                    </div>
                </div>
            </ModalShell>
        </div>
    )
}

export default NetworkEditor
