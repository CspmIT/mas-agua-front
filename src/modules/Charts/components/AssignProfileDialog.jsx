import React, { useEffect, useState } from 'react'
import { Box, Button, Checkbox, CircularProgress } from '@mui/material'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'

const url = backend[import.meta.env.VITE_APP_NAME]

const sectionSx = {
    borderRadius: '14px',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    backgroundColor: 'transparent',
    p: { xs: 1.25, sm: 1.5 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const rowSx = (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1,
    py: 0.5,
    borderRadius: '10px',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    backgroundColor: selected ? 'rgba(44, 106, 160, 0.06)' : '#ffffff',
    borderColor: selected ? 'rgba(44, 106, 160, 0.3)' : 'rgba(15, 42, 68, 0.06)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    '&:hover': {
        borderColor: 'rgba(44, 106, 160, 0.4)',
        backgroundColor: 'rgba(44, 106, 160, 0.04)',
    },
    'body.dark &': {
        backgroundColor: selected ? 'rgba(44, 106, 160, 0.18)' : 'rgba(17, 24, 39, 0.6)',
        borderColor: selected ? 'rgba(94, 165, 240, 0.4)' : 'rgba(255, 255, 255, 0.06)',
    },
})

const checkboxSx = {
    color: 'rgba(15, 42, 68, 0.3)',
    p: 0.5,
    '&.Mui-checked': { color: '#2c6aa0' },
}

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
    },
}

const ghostPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(15, 42, 68, 0.14)',
    color: '#475569',
}

export default function AssignProfileDialog({ open, chartId, onClose }) {
    const [profiles, setProfiles] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open || !chartId) return
        fetchData()
    }, [open, chartId])

    async function fetchData() {
        setLoading(true)
        try {
            const [allProfiles, assignedIds] = await Promise.all([
                request(`${url}/listProfiles`, 'GET').then(r => r.data),
                request(`${url}/charts/${chartId}/profiles`, 'GET').then(r => r.data),
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
            prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
        )
    }

    async function handleSave() {
        setSaving(true)
        try {
            await request(`${url}/charts/${chartId}/profiles`, 'PUT', { profileIds: selected })
            Swal.fire({
                icon: 'success',
                title: 'Perfiles actualizados',
                toast: true,
                position: 'top-end',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
            })
            onClose()
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            eyebrow='Gráfico · perfiles'
            title='Asignar a perfiles'
            subtitle='Seleccioná qué perfiles de usuario pueden acceder a este gráfico.'
            maxWidth='440px'
            footer={
                <>
                    <Button variant='outlined' sx={ghostPillSx} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant='contained'
                        disableElevation
                        sx={primaryPillSx}
                        onClick={handleSave}
                        disabled={saving || loading}
                        startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </>
            }
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : profiles.length === 0 ? (
                <div className='text-center text-sm text-slate-500 dark:text-gray-400 py-6'>
                    No hay perfiles disponibles
                </div>
            ) : (
                <Box sx={sectionSx}>
                    <div className='flex items-center justify-between px-1'>
                        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
                            Perfiles disponibles
                        </div>
                        <span className='text-[11px] font-semibold text-[#2c6aa0] dark:text-[#5ea5f0]'>
                            {selected.length} / {profiles.length}
                        </span>
                    </div>
                    <div className='flex flex-col gap-1 max-h-[45vh] overflow-auto pr-0.5'>
                        {profiles.map(profile => {
                            const checked = selected.includes(profile.id)
                            return (
                                <Box
                                    key={profile.id}
                                    sx={rowSx(checked)}
                                    onClick={() => toggleProfile(profile.id)}
                                >
                                    <Checkbox
                                        checked={checked}
                                        size='small'
                                        sx={checkboxSx}
                                        disableRipple
                                        tabIndex={-1}
                                    />
                                    <span className='text-sm text-slate-700 dark:text-gray-200 truncate'>
                                        {profile.description}
                                    </span>
                                </Box>
                            )
                        })}
                    </div>
                </Box>
            )}
        </ModalShell>
    )
}
