import '../Style/ControlPanel.css'
import { FaMapMarkerAlt } from 'react-icons/fa'
import {
    Avatar,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    List,
    ListItemButton,
} from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'

const ControlPanel = ({ markers, setMarkers, onEdit = null }) => {
    const deleteMarker = (marker) => {
        setMarkers(markers.filter((mark) => marker !== mark))
    }

    const getVarLabel = (marker) => {
        const data = marker.popupInfo?.data
        if (!data) return 'Sin variable'
        if (data.binary_compressed && marker.popupInfo.id_bit != null) {
            const bit = data.bits?.find((b) => b.id === marker.popupInfo.id_bit)
            return bit ? `${data.name} · ${bit.name}` : data.name
        }
        return data.name ?? 'Sin variable'
    }
    return (
        <div className="control-panel h-[85%]">
            <h3>Marcadores</h3>
            <hr />
            <List>
                {markers?.map((marker, index) => (
                    <ListItem
                        key={marker.id || marker.name}
                        disablePadding
                        secondaryAction={
                            <div className="flex pb-5">
                                {onEdit && (
                                    <IconButton onClick={() => onEdit(marker, index)}>
                                        <Edit />
                                    </IconButton>
                                )}
                                <IconButton onClick={() => deleteMarker(marker)}>
                                    <Delete />
                                </IconButton>
                            </div>
                        }
                    >
                        <ListItemButton onClick={() => onEdit && onEdit(marker, index)}>
                            <ListItemAvatar>
                                <Avatar sx={{ maxHeight: 35, maxWidth: 35 }}>
                                    <FaMapMarkerAlt />
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                primary={marker.name}
                                secondary={getVarLabel(marker)}
                                primaryTypographyProps={{
                                    noWrap: true,
                                    title: marker.name,
                                }}
                                secondaryTypographyProps={{
                                    noWrap: true,
                                    title: getVarLabel(marker),
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default ControlPanel
