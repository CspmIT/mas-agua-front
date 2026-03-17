import React, { useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemIcon, ListItemText,
    Checkbox, Divider
} from '@mui/material'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Swal from 'sweetalert2'

const AssignChartDialog = ({ open, chartId, users, onClose }) => {
    const [assignedUsers, setAssignedUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loaded, setLoaded] = useState(false)
    const allSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.id))
    const someSelected = users.some(u => selectedUsers.includes(u.id)) && !allSelected

    const handleEntered = async () => {
        if (!chartId) return
        const url = backend[import.meta.env.VITE_APP_NAME]
        const { data } = await request(`${url}/admin/userDashboard/chart/${chartId}`, 'GET')
        setAssignedUsers(data)
        setSelectedUsers(data)
        setLoaded(true)
    }

    const handleToggle = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleToggleAll = () => {
        if (allSelected) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.id))
        }
    }

    const handleSave = async () => {
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
        }
    }

    const handleClose = () => {
        setLoaded(false)
        setAssignedUsers([])
        setSelectedUsers([])
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            TransitionProps={{ onEntered: handleEntered }}
        >
            <DialogTitle>Asignar gráfico a usuarios</DialogTitle>
            <DialogContent dividers className="!p-0">
                {loaded && (
                    <List dense disablePadding>
                        <ListItem button onClick={handleToggleAll}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                    edge="start"
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    tabIndex={-1}
                                    disableRipple
                                    size="small"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Seleccionar todos"
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                        </ListItem>
                        <Divider />
                        {users.map((u, i) => {
                            const checked = selectedUsers.includes(u.id)
                            return (
                                <React.Fragment key={u.id}>
                                    <ListItem button onClick={() => handleToggle(u.id)} selected={checked}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={checked}
                                                tabIndex={-1}
                                                disableRipple
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={u.name} />
                                    </ListItem>
                                    {i < users.length - 1 && <Divider />}
                                </React.Fragment>
                            )
                        })}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleSave}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AssignChartDialog