import React, { useEffect, useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Checkbox, FormControlLabel, CircularProgress,
    IconButton, Typography, Divider
} from '@mui/material'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'

const url = backend[import.meta.env.VITE_APP_NAME]

export default function AssignProfileDialog({ open, chartId, onClose }) {
    const [profiles, setProfiles] = useState([])
    const [selected, setSelected] = useState([]) // IDs de perfiles asignados
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open || !chartId) return
        fetchData()
    }, [open, chartId])

    async function fetchData() {
        setLoading(true)
        try {
            // Traer todos los perfiles y los ya asignados en paralelo
            const [allProfiles, assignedIds] = await Promise.all([
                request(`${url}/listProfiles`, 'GET').then(r => r.data),
                request(`${url}/charts/${chartId}/profiles`, 'GET').then(r => r.data)
            ])
            setProfiles(allProfiles)
            setSelected(assignedIds)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    function toggleProfile(profileId) {
        setSelected(prev =>
            prev.includes(profileId)
                ? prev.filter(id => id !== profileId)
                : [...prev, profileId]
        )
    }

    async function handleSave() {
        setSaving(true)
        try {
            await request(`${url}/charts/${chartId}/profiles`, 'PUT', {
                profileIds: selected
            })
            Swal.fire({
                icon: 'success',
                title: 'Perfiles actualizados',
                toast: true,
                position: 'top-end',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true
            })
            onClose()
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                pb: 1.5
            }}>
                <Typography fontWeight={600}>Asignar perfiles</Typography>
                <IconButton size="small" onClick={onClose}>✕</IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                        <CircularProgress size={28} />
                    </div>
                ) : profiles.length === 0 ? (
                    <Typography color="text.secondary" fontSize={14} textAlign="center" py={3}>
                        No hay perfiles disponibles
                    </Typography>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {profiles.map(profile => (
                            <FormControlLabel
                                key={profile.id}
                                control={
                                    <Checkbox
                                        checked={selected.includes(profile.id)}
                                        onChange={() => toggleProfile(profile.id)}
                                        size="small"
                                    />
                                }
                                label={
                                    <Typography fontSize={14}>
                                        {profile.description}
                                    </Typography>
                                }
                            />
                        ))}
                    </div>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" color="inherit" size="small">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    size="small"
                    disabled={saving || loading}
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}