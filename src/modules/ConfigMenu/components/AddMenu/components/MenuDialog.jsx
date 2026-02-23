// MUI Dialog component for Create/Edit Menu with Permissions
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { request } from '../../../../../utils/js/request'
import { backend } from '../../../../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import FormMenu from './FormMenu' 

const initialFormState = {
  name: '',
  link: '',
  icon: '',
  group_menu: null,
  level: 1,
  sub_menu: null,
  status: 1,
}

export default function MenuDialog({
  open,
  onClose,
  menu,
  parentMenu,
  profiles,
  mode = 'create',
  onSaved,
}) {
  const [form, setForm] = useState(initialFormState)
  const [selectedProfiles, setSelectedProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const titleMap = {
    menu: {
      edit: 'Editar menú',
      create: 'Nuevo menú',
    },
    submenu: {
      edit: 'Editar submenu',
      create: 'Crear submenu',
    },
  };
  const isSubmenu = parentMenu !== null
  const type = isSubmenu ? 'submenu' : 'menu';

  useEffect(() => {
    resetForm()
  
    if (mode === 'edit' && menu) {
      setForm(menu)
      loadPermissions(menu.id)
      return
    }
  
    if (mode === 'create' && parentMenu) {
      setForm({
        ...initialFormState,
        group_menu: parentMenu.group_menu,
        level: parentMenu.level + 1,
        sub_menu: parentMenu.id,
        status: 1,
      })
      return
    }
  
    if (mode === 'create' && !parentMenu) {
      setForm({
        ...initialFormState,
        level: 1,
        sub_menu: null,
        group_menu: null,
        status: 1,
      })
    }
  
  }, [open, mode, menu, parentMenu])

  const loadPermissions = async (id_menu) => {
    try {
      const res = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/getPermissionByMenu?id_menu=${id_menu}`,
        'GET'
      )
      setSelectedProfiles(res.data?.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const toggleProfile = (id) => {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const resetForm = () => {
    setForm(initialFormState)
    setSelectedProfiles([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = async () => {
    if (!form.name) {
      Swal.fire('Faltan datos', 'El nombre es obligatorio', 'warning')
      return
    }

    try {
      setLoading(true)

      // 1) Guardar menú
      const res = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/saveMenu`,
        'POST',
        {
          ...form,
          id: mode === 'edit' ? form.id : 0,
        }
      )

      if (!res || res.error) throw new Error(res?.message || 'Error al guardar menú')

      const menuSaved = res.data || form

      // 2) Guardar permisos
      await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/postPermissionByMenu`,
        'POST',
        {
          id_menu: menuSaved.id,
          profiles: selectedProfiles,
        }
      )

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text:
          mode === 'edit'
            ? 'Menú actualizado correctamente'
            : 'Menú creado correctamente',
        timer: 1500,
        showConfirmButton: false,
      })

      resetForm()
      onSaved()
      onClose()
    } catch (error) {
      console.error(error)

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar el menú',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600 }}>
        {titleMap[type][mode]}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>

          <Grid item xs={12}>
            <FormMenu value={form} onChange={setForm} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Permisos por perfil
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container>
              {profiles.map((p) => (
                <Grid item xs={6} md={4} key={p.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedProfiles.includes(p.id)}
                        onChange={() => toggleProfile(p.id)}
                      />
                    }
                    label={p.description}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} />}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
