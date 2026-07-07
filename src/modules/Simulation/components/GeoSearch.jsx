import { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

const MAPTILER_KEY = 'mHpRzO9eugI7vKv1drLO'

/**
 * Buscador de direcciones/lugares (geocoding de MapTiler) flotante sobre el mapa.
 * onSelect recibe {center: [lng, lat], bbox?: [minLng, minLat, maxLng, maxLat]}.
 */
const GeoSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([])
            return
        }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            try {
                const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query.trim())}.json?key=${MAPTILER_KEY}&language=es&country=ar&limit=5`
                const response = await fetch(url)
                const data = await response.json()
                setResults(data.features ?? [])
                setOpen(true)
            } catch {
                setResults([])
            }
        }, 400)
        return () => clearTimeout(debounceRef.current)
    }, [query])

    const pick = (feature) => {
        setOpen(false)
        setQuery(feature.place_name ?? feature.text ?? '')
        onSelect({ center: feature.center, bbox: feature.bbox })
    }

    return (
        <div className='absolute top-3 right-3 z-10 w-64'>
            <div className='flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-600 shadow-lg px-3 py-1.5'>
                <SearchIcon sx={{ fontSize: 17 }} className='text-slate-400 shrink-0' />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder='Buscar dirección o lugar…'
                    className='bg-transparent border-0 outline-none text-sm w-full text-slate-700 dark:text-gray-200 placeholder:text-slate-400'
                />
                {query && (
                    <button
                        type='button'
                        onClick={() => {
                            setQuery('')
                            setResults([])
                            setOpen(false)
                        }}
                        className='bg-transparent border-0 p-0 flex items-center cursor-pointer text-slate-400 hover:text-slate-600'
                    >
                        <CloseIcon sx={{ fontSize: 15 }} />
                    </button>
                )}
            </div>
            {open && results.length > 0 && (
                <div className='mt-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden'>
                    {results.map((f) => (
                        <button
                            key={f.id}
                            type='button'
                            onClick={() => pick(f)}
                            className='bg-transparent border-0 block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-gray-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
                        >
                            {f.place_name ?? f.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default GeoSearch
