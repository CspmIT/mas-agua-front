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
import { Delete } from '@mui/icons-material'

const ControlPanel = ({ markers, setMarkers }) => {
    const deleteMarker = (marker) => {
        setMarkers(markers.filter((mark) => marker !== mark))
    }
    return (
        <div className="control-panel h-[85%]">
            <h3>Marcadores</h3>
            <hr />
            <List>
                {markers?.map((marker) => (
                    <ListItem
                        key={marker.id || marker.name}
                        disablePadding
                        secondaryAction={
                            <IconButton onClick={() => deleteMarker(marker)}>
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
                                primary={marker.name}
                                secondary={`LAT: ${marker.latitude}  |  LNG: ${marker.longitude}`}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default ControlPanel
