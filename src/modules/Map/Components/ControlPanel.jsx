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
import { Delete, Folder } from '@mui/icons-material'

const ControlPanel = ({ markers, setMarkers }) => {
    const deleteMarker = (marker) => {
        setMarkers(markers.filter((mark) => marker !== mark))
    }
    return (
        <div className="control-panel">
            <h3>Marcadores</h3>
            <hr />
            <nav>
                <List className="!p-1">
                    {markers?.map((marker) => (
                        <ListItem
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => deleteMarker(marker)}
                                >
                                    <Delete />
                                </IconButton>
                            }
                        >
                            <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar>
                                        <FaMapMarkerAlt />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${marker.name}`}
                                    secondary={` LAT: ${marker.latitude} LNG: ${marker.longitude}`}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </nav>
        </div>
    )
}

export default ControlPanel
