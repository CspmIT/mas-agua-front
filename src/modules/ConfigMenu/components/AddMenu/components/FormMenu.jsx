import { useState } from 'react'
import {
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material'
import ListIcon from '../../../../../components/ListIcon'
import { request } from '../../../../../utils/js/request'
import { backend } from '../../../../../utils/routes/app.routes'
import '../utils/css/styles.css'

function FormMenu({ value, onChange }) {
  const icons = ListIcon()

  const [maps, setMaps] = useState([])
  const [diagrams, setDiagrams] = useState([])
  const [loading, setLoading] = useState(false)
  const [openSelector, setOpenSelector] = useState(false)
  const [selectorType, setSelectorType] = useState(null) // 'map' | 'diagram'

  const changeValue = (e) => {
    onChange({
      ...value,
      [e.target.name]: e.target.value,
    })
  }

  const buildLink = (type, id) => {
    if (type === 'diagram') return `viewDiagram/${id}`
    if (type === 'map') return `map?id=${id}`
    return ''
  }

  const loadDiagrams = async () => {
    setLoading(true)
    try {
      const res = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/getDiagrams`,
        'GET'
      )
      setDiagrams(res.data || [])
    } catch (e) {
      console.error('Error cargando diagramas', e)
      setDiagrams([])
    } finally {
      setLoading(false)
    }
  }

  const loadMaps = async () => {
    setLoading(true)
    try {
      const res = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/maps`,
        'GET'
      )
      setMaps(res.data || [])
    } catch (e) {
      console.error('Error cargando mapas', e)
      setMaps([])
    } finally {
      setLoading(false)
    }
  }

  // -------- actions --------
  const handleAddDiagram = async () => {
    setSelectorType('diagram')
    setOpenSelector(true)

    if (diagrams.length === 0) {
      await loadDiagrams()
    }
  }

  const handleAddMap = async () => {
    setSelectorType('map')
    setOpenSelector(true)

    if (maps.length === 0) {
      await loadMaps()
    }
  }

  const handleSelectItem = (item) => {
    const link = buildLink(selectorType, item.id)

    onChange({
      ...value,
      link,
    })

    setOpenSelector(false)
  }

  const data = selectorType === 'diagram' ? diagrams : maps

  return (
    <>
      <div className='flex flex-col gap-5 mt-4'>

        {/* Nombre */}
        <TextField
          type='text'
          label='Nombre'
          name='name'
          value={value.name}
          onChange={changeValue}
          className='w-full'
        />

        {/* Link */}
        <TextField
          type='text'
          label='Link'
          name='link'
          value={value.link}
          onChange={changeValue}
          className='w-full'
        />

        {/* Acciones UX */}
        <Stack direction="row" className='justify-center' spacing={2}>
          <Button
            variant="outlined"
            onClick={handleAddDiagram}
          >
            Seleccionar diagrama
          </Button>

          <Button
            variant="outlined"
            onClick={handleAddMap}
          >
            Seleccionar mapa
          </Button>
        </Stack>

        <Divider />

        {/* Iconos */}
        <TextField
          label='Iconos'
          name='icon'
          className='w-full'
          select
          value={value.icon}
          onChange={changeValue}
          SelectProps={{
            renderValue: (selected) => {
              const selectedItem = icons.find((item) => item.name === selected)
              return (
                <div className='flex gap-3 items-center'>
                  {selectedItem ? (
                    <>
                      {selectedItem.icon}
                      <span>{selectedItem.title.toUpperCase()}</span>
                    </>
                  ) : (
                    <em>Iconos</em>
                  )}
                </div>
              )
            },
          }}
        >
          <MenuItem value=''>
            <em>Iconos</em>
          </MenuItem>

          {icons.map((item, index) => (
            <MenuItem key={index} value={item.name}>
              <div className='flex gap-3 items-center'>
                {item.icon} <span>{item.title.toUpperCase()}</span>
              </div>
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* -------- Selector Modal -------- */}
      <Dialog open={openSelector} onClose={() => setOpenSelector(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectorType === 'diagram' ? 'Seleccionar diagrama' : 'Seleccionar mapa'}
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <CircularProgress />
            </div>
          ) : (
            <List>
              {data.map((item) => (
                <ListItemButton
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                >
                  <ListItemText
                    primary={item.name || item.title || `ID ${item.id}`}
                    secondary={`ID: ${item.id}`}
                  />
                </ListItemButton>
              ))}

              {!data.length && (
                <div className="text-center p-4 opacity-60">
                  No hay datos disponibles
                </div>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FormMenu