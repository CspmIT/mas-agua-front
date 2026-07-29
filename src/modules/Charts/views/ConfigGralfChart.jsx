import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'
import HeaderForms from '../components/HeaderForms'
import GralfChart from '../components/GralfChart'

const shellSx = {
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(15, 42, 68, 0.06)',
  boxShadow:
    '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.12)',
  p: { xs: 2, sm: 2.5 },
  'body.dark &': {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
}

const sectionSx = {
  borderRadius: '14px',
  border: '1px solid rgba(15, 42, 68, 0.06)',
  backgroundColor: 'transparent',
  p: { xs: 1.75, sm: 2 },
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const submitPillSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 500,
  px: 3,
  py: 1,
  minHeight: 0,
  background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
  boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
  },
}

const SectionTitle = ({ children }) => (
  <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 px-1 -mt-0.5'>
    {children}
  </div>
)

const ConfigGralfChart = () => {
  const { id = false } = useParams()
  const navigate = useNavigate()

  const [loader, setLoader] = useState(true)
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState('')
  const [varId, setVarId] = useState('')
  const [gralfVars, setGralfVars] = useState([])

  const fetchGralfVars = async () => {
    try {
      const vars = await getVarsInflux()
      setGralfVars((vars || []).filter((v) => v?.varsInflux?.gralf))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchChart = async () => {
    if (!id) {
      setLoader(false)
      return
    }
    try {
      const { data } = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`,
        'GET'
      )
      setTitle(data.name || '')
      setOrder(data.order ?? '')
      const valueItem = (data.ChartData || []).find((d) => d.key === 'value')
      setVarId(valueItem?.InfluxVars?.id ?? '')
    } catch (e) {
      await Swal.fire('Error', 'Error al cargar el gráfico', 'error')
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    fetchGralfVars()
    fetchChart()
  }, [id])

  const send = async () => {
    if (!title) {
      await Swal.fire('Error', 'Debe ingresar un título', 'error')
      return
    }
    if (!varId) {
      await Swal.fire('Error', 'Debe elegir la variable Gralf del medidor', 'error')
      return
    }

    const payload = {
      title,
      order,
      type: 'GralfChart',
      idVar: varId,
    }
    try {
      await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/charts${id ? `/${id}` : ''}`,
        'POST',
        payload
      )
      await Swal.fire('OK', id ? 'Gráfico editado' : 'Gráfico creado', 'success')
      navigate('/config/graphic')
    } catch {
      await Swal.fire('Error', 'No se pudo guardar el gráfico', 'error')
    }
  }

  if (loader) {
    return (
      <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
        <Box sx={shellSx}>
          <Typography variant='body1' align='center' color='textSecondary'>
            Cargando...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
      <HeaderForms idChart={id} chart={{ name: title }} backTo='/config/graphic' />

      <Box sx={shellSx}>
        <div className='flex flex-col gap-4 w-full'>
          <Box sx={sectionSx}>
            <SectionTitle>Configuración</SectionTitle>
            <div className='flex flex-wrap gap-2'>
              <TextField
                size='small'
                label='Título del gráfico'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ flex: '2 1 260px' }}
              />
              <TextField
                size='small'
                label='Orden'
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                sx={{ flex: '1 1 120px' }}
              />
              <FormControl size='small' sx={{ flex: '2 1 260px' }}>
                <InputLabel>Variable Gralf (medidor)</InputLabel>
                <Select
                  label='Variable Gralf (medidor)'
                  value={varId}
                  onChange={(e) => setVarId(e.target.value)}
                >
                  <MenuItem value=''><em>Ninguna</em></MenuItem>
                  {gralfVars.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name} — {v.varsInflux?.gralf?.calc_topic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            {gralfVars.length === 0 && (
              <Typography variant='caption' color='textSecondary'>
                No hay variables Gralf creadas: generá una desde Configuración → Variables
                con el switch Gralf (medidor de energía).
              </Typography>
            )}
            <div className='flex justify-end'>
              <Button variant='contained' disableElevation sx={submitPillSx} onClick={send}>
                Guardar
              </Button>
            </div>
          </Box>

          <Box sx={sectionSx}>
            <SectionTitle>Vista previa</SectionTitle>
            {varId ? (
              <GralfChart varId={varId} title={title || 'Monitoreo de energía'} />
            ) : (
              <Typography variant='body2' color='textSecondary' align='center' className='py-6'>
                Elegí la variable Gralf para ver la vista previa con datos reales.
              </Typography>
            )}
          </Box>
        </div>
      </Box>
    </Container>
  )
}

export default ConfigGralfChart
