export const MAPTILER_KEY = 'mHpRzO9eugI7vKv1drLO'

// Catálogo de estilos MapTiler disponibles con la key del proyecto
// (todos verificados contra la API). El orden es el del panel selector.
export const MAP_STYLE_OPTIONS = [
    { id: 'streets-v2', label: 'Calles' },
    { id: 'streets-v2-light', label: 'Calles claro' },
    { id: 'streets-v2-dark', label: 'Calles oscuro' },
    { id: 'basic-v2', label: 'Básico' },
    { id: 'basic-v2-light', label: 'Básico claro' },
    { id: 'basic-v2-dark', label: 'Básico oscuro' },
    { id: 'openstreetmap', label: 'OpenStreetMap' },
    { id: 'bright-v2', label: 'Bright' },
    { id: 'dataviz', label: 'Dataviz' },
    { id: 'dataviz-light', label: 'Dataviz claro' },
    { id: 'dataviz-dark', label: 'Dataviz oscuro' },
    { id: 'satellite', label: 'Satélite' },
    { id: 'hybrid', label: 'Híbrido' },
    { id: 'outdoor-v2', label: 'Outdoor' },
    { id: 'topo-v2', label: 'Topográfico' },
    { id: 'landscape', label: 'Paisaje' },
    { id: 'winter-v2', label: 'Invierno' },
    { id: 'ocean', label: 'Océano' },
    { id: 'toner-v2', label: 'Toner' },
    { id: 'backdrop', label: 'Backdrop' },
    { id: 'aquarelle', label: 'Acuarela' },
]

// Estilo por defecto cuando el usuario todavía no eligió uno
export const DEFAULT_STYLE = { light: 'streets-v2', dark: 'streets-v2-dark' }

export const styleUrl = (id) =>
    `https://api.maptiler.com/maps/${id}/style.json?key=${MAPTILER_KEY}`

// Tile raster centrado en las coordenadas dadas, para las miniaturas del selector
export const thumbTileUrl = (id, lon, lat, z = 12) => {
    const x = Math.floor(((lon + 180) / 360) * 2 ** z)
    const latRad = (lat * Math.PI) / 180
    const y = Math.floor(
        ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** z
    )
    return `https://api.maptiler.com/maps/${id}/256/${z}/${x}/${y}.png?key=${MAPTILER_KEY}`
}
