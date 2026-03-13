import { useEffect, useState } from "react"
import { Autocomplete, TextField, Avatar, Chip, Typography } from "@mui/material"
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import Home from '../views/index'

export default function AdminDashboardPage() {

    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const { data } = await request(`${backend['Mas Agua']}/admin/users`, 'GET')
            setUsers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ width: "100%", padding: 5, boxSizing: "border-box" }}>
            {/* Header */}
            <Typography className='w-full text-center !mb-2' variant="h5" align="center">
                Administrador de Dashboard
            </Typography>

            {/* Selector de usuario */}
            <div style={{
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "8px 10px",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
            }}>
                <Autocomplete
                    options={users}
                    loading={loading}
                    value={selectedUser}
                    onChange={(_, newValue) => setSelectedUser(newValue)}
                    getOptionLabel={(user) => `${user.name} — ${user.email}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    sx={{ width: "33%" }}
                    renderOption={(props, user) => (
                        <li {...props} key={user.id}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12, background: "#2c6aa0" }}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>
                                        {user.email}
                                    </div>
                                </div>
                                <Chip
                                    label={`${user.widgetCount} widgets`}
                                    size="small"
                                    sx={{ fontSize: 10, height: 18, marginLeft: "auto" }}
                                />
                            </div>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Buscar usuario"
                            size="small"
                            placeholder="Nombre o email..."
                        />
                    )}
                />

                {/* Info del usuario seleccionado */}
                {selectedUser && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar sx={{ width: 34, height: 34, background: "#2c6aa0", fontSize: 14 }}>
                            {selectedUser.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                                {selectedUser.name}
                            </div>
                            <div style={{ fontSize: 14, color: "#64748b" }}>
                                {selectedUser.email} · {selectedUser.widgetCount} widgets
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dashboard del usuario seleccionado */}
            {selectedUser ? (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <Home key={selectedUser.id} targetUserId={selectedUser.id} />
                </div>
                // key={selectedUser.id} fuerza remount completo al cambiar de usuario
            ) : (
                <div style={{
                    textAlign: "center",
                    padding: "200px 0",
                    color: "#94a3b8",
                    fontSize: 16
                }}>
                    Seleccioná un usuario para ver y editar su dashboard
                </div>
            )}

        </div>
    )
}