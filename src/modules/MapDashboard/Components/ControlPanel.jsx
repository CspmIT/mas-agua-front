import {
    Avatar,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    List,
    ListItemButton,
    Tooltip,
} from '@mui/material'
import { Delete, Edit, RoomOutlined } from '@mui/icons-material'
import CardCustom from '../../../components/CardCustom'

const avatarSx = {
    width: 34,
    height: 34,
    color: '#2c6aa0',
    background: 'linear-gradient(135deg, #eef4fb 0%, #d6e4f3 100%)',
    border: '1px solid rgba(44, 106, 160, 0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
}

const iconBtnSx = {
    width: 30,
    height: 30,
    color: '#475569',
    '&:hover': {
        color: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.08)',
    },
}

const dangerIconBtnSx = {
    ...iconBtnSx,
    '&:hover': {
        color: '#b91c1c',
        backgroundColor: 'rgba(185, 28, 28, 0.08)',
    },
}

const ControlPanel = ({ markers = [], setMarkers, onEdit = null, className = '' }) => {
    const deleteMarker = (marker) => {
        setMarkers(markers.filter((m) => m !== marker))
    }

    return (
        <CardCustom
            className={`rounded-xl overflow-hidden flex flex-col h-full ${className}`}
        >
            {/* Header — blue gradient with gray uppercase label */}
            <div
                className='flex items-center justify-between'
                style={{
                    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.25)',
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <span className='text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70'>
                    Marcadores
                </span>
                <span
                    className='inline-flex items-center justify-center'
                    style={{
                        minWidth: 26,
                        height: 22,
                        padding: '0 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        fontVariantNumeric: 'tabular-nums',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}
                >
                    {String(markers.length).padStart(2, '0')}
                </span>
            </div>

            {/* Body — scrollable list */}
            <div className='flex-1 overflow-y-auto'>
                {markers.length === 0 ? (
                    <div className='flex flex-col items-center justify-center gap-2 px-4 py-10 text-center'>
                        <div
                            className='rounded-full p-3'
                            style={{
                                background:
                                    'linear-gradient(135deg, #eef4fb 0%, #d6e4f3 100%)',
                                border: '1px solid rgba(44, 106, 160, 0.18)',
                            }}
                        >
                            <RoomOutlined sx={{ color: '#2c6aa0', fontSize: 22 }} />
                        </div>
                        <span className='text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-gray-400'>
                            Sin marcadores
                        </span>
                        <span className='text-xs text-slate-400 dark:text-gray-500'>
                            Agregá un marcador para verlo aquí
                        </span>
                    </div>
                ) : (
                    <List dense disablePadding sx={{ py: 0.5 }}>
                        {markers.map((marker, index) => (
                            <ListItem
                                key={marker.id || `${marker.name}-${index}`}
                                disablePadding
                                secondaryAction={
                                    <div className='flex gap-0.5'>
                                        {onEdit && (
                                            <Tooltip title='Editar' arrow>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onEdit(marker, index)
                                                    }}
                                                    size='small'
                                                    sx={iconBtnSx}
                                                >
                                                    <Edit fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title='Eliminar' arrow>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteMarker(marker)
                                                }}
                                                size='small'
                                                sx={dangerIconBtnSx}
                                            >
                                                <Delete fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                }
                                sx={{
                                    px: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(44, 106, 160, 0.04)',
                                    },
                                    'body.dark &:hover': {
                                        backgroundColor: 'rgba(94, 165, 240, 0.08)',
                                    },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => onEdit && onEdit(marker, index)}
                                    sx={{
                                        borderRadius: '10px',
                                        py: 0.75,
                                        pr: 7,
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={avatarSx}>
                                            <RoomOutlined sx={{ fontSize: 18 }} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <span className='text-sm font-semibold text-slate-800 dark:text-gray-100 truncate block'>
                                                {marker.name}
                                            </span>
                                        }
                                        secondary={
                                            <span
                                                className='text-[11px] text-slate-500 dark:text-gray-400 truncate block'
                                                style={{
                                                    fontVariantNumeric: 'tabular-nums',
                                                    letterSpacing: '0.02em',
                                                }}
                                            >
                                                {marker.popupInfo.data.name}      
                                            </span>
                                        }
                                        primaryTypographyProps={{
                                            component: 'div',
                                            title: marker.name,
                                        }}
                                        secondaryTypographyProps={{ component: 'div' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </div>
        </CardCustom>
    )
}

export default ControlPanel
