import React, { useEffect, useState } from 'react'
import { Box, Button, Checkbox, CircularProgress } from '@mui/material'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'

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
    '&.MuiCheckbox-indeterminate': { color: '#2c6aa0' },
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

const AssignChartDialog = ({ open, chartId, users, onClose }) => {
    const [assignedUsers, setAssignedUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [saving, setSaving] = useState(false)
    const allSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.id))
    const someSelected = users.some(u => selectedUsers.includes(u.id)) && !allSelected

    useEffect(() => {
        if (!open || !chartId) return
        const fetchData = async () => {
            const url = backend[import.meta.env.VITE_APP_NAME]
            const { data } = await request(`${url}/admin/userDashboard/chart/${chartId}`, 'GET')
            setAssignedUsers(data)
            setSelectedUsers(data)
            setLoaded(true)
        }
        fetchData()
    }, [open, chartId])

    const handleToggle = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    const handleToggleAll = () => {
        if (allSelected) setSelectedUsers([])
        else setSelectedUsers(users.map(u => u.id))
    }

    const handleSave = async () => {
        setSaving(true)
        const url = backend[import.meta.env.VITE_APP_NAME]
        const toAssign = selectedUsers.filter(id => !assignedUsers.includes(id))
        const toUnassign = assignedUsers.filter(id => !selectedUsers.includes(id))

        try {
            await Promise.all([
                ...toAssign.map(user_id =>
                    request(`${url}/admin/userDashboard/assign`, 'POST', { user_id, chart_id: chartId })
                ),
                ...toUnassign.map(user_id =>
                    request(`${url}/admin/userDashboard/assign`, 'DELETE', { user_id, chart_id: chartId })
                ),
            ])
            Swal.fire({ icon: 'success', title: '¡Guardado!', html: 'Asignaciones actualizadas' })
            handleClose()
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', html: error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setLoaded(false)
        setAssignedUsers([])
        setSelectedUsers([])
        onClose()
    }

    const selectedCount = selectedUsers.length

    return (
        <ModalShell
            open={open}
            onClose={handleClose}
            eyebrow='Gráfico · usuarios'
            title='Asignar a usuarios'
            subtitle='Elegí qué usuarios pueden ver este gráfico en su dashboard.'
            maxWidth='460px'
            footer={
                <>
                    <Button variant='outlined' sx={ghostPillSx} onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant='contained'
                        disableElevation
                        sx={primaryPillSx}
                        onClick={handleSave}
                        disabled={saving || !loaded}
                        startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </>
            }
        >
            {!loaded ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <Box sx={sectionSx}>
                    <div className='flex items-center justify-between px-1'>
                        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
                            Usuarios disponibles
                        </div>
                        <span className='text-[11px] font-semibold text-[#2c6aa0] dark:text-[#5ea5f0]'>
                            {selectedCount} / {users.length}
                        </span>
                    </div>

                    <Box
                        onClick={handleToggleAll}
                        sx={{
                            ...rowSx(allSelected || someSelected),
                            fontWeight: 600,
                        }}
                    >
                        <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            size='small'
                            sx={checkboxSx}
                            disableRipple
                        />
                        <span className='text-sm text-slate-700 dark:text-gray-200'>
                            Seleccionar todos
                        </span>
                    </Box>

                    <div className='flex flex-col gap-1 max-h-[45vh] overflow-auto pr-0.5'>
                        {users.map((u) => {
                            const checked = selectedUsers.includes(u.id)
                            return (
                                <Box
                                    key={u.id}
                                    sx={rowSx(checked)}
                                    onClick={() => handleToggle(u.id)}
                                >
                                    <Checkbox
                                        checked={checked}
                                        size='small'
                                        sx={checkboxSx}
                                        disableRipple
                                        tabIndex={-1}
                                    />
                                    <span className='text-sm text-slate-700 dark:text-gray-200 truncate'>
                                        {u.name}
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

export default AssignChartDialog
