import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { FaEye } from 'react-icons/fa'
import { MdNotificationsActive } from 'react-icons/md'

const AlarmRow = ({ row, onMarkAsRead }) => {
    const { triggeredAt, message, viewed } = row.original

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-center',
                gap: 2,
                py: 0.5,
                px: 1.75,
                borderRadius: 2,
                backgroundColor: viewed ? 'transparent' : 'rgba(33, 150, 243, 0.08)',
                '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.12)',
                },

            }}
        >
            {/* Icono */}
            <Box sx={{ mt: 1.5 }}>
                <MdNotificationsActive
                    size={22}
                    color={viewed ? '#9ca3af' : '#1976d2'}
                />
            </Box>

            {/* Contenido */}
            <Box sx={{ flex: 1 }}>
                {/* Fecha + estado */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                        {triggeredAt}
                    </Typography>

                    {!viewed && (
                        <Chip
                            label="Nueva"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                        />
                    )}
                </Box>

                {/* Mensaje */}
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: viewed ? 400 : 600,
                        lineHeight: 1.4,
                    }}
                >
                    {message}
                </Typography>
            </Box>

            {/* Acción */}
            {!viewed && (
                <Tooltip title="Marcar como leída">
                    <IconButton
                        size="small"
                        onClick={() => onMarkAsRead(row.original.id)}
                        sx={{
                            color: 'primary.main',
                            p: 1.5,
                        }}
                    >
                        <FaEye
                            size={20}
                        />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    )
}

export default AlarmRow
