// Iconos compartidos por tipo de elemento (toolbar, marcadores del mapa y leyendas)
import HomeIcon from '@mui/icons-material/Home'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import PropaneTankOutlinedIcon from '@mui/icons-material/PropaneTankOutlined'
import TimelineIcon from '@mui/icons-material/Timeline'
import HeatPumpIcon from '@mui/icons-material/HeatPump'
import TuneIcon from '@mui/icons-material/Tune'

export const NODE_ICONS = {
	junction: HomeIcon,
	reservoir: WaterDropIcon,
	tank: PropaneTankOutlinedIcon,
}

export const LINK_ICONS = {
	pipe: TimelineIcon,
	pump: HeatPumpIcon,
	valve: TuneIcon,
}

export const ElementIcon = ({ kind, type, size = 18, color }) => {
	const Icon = (kind === 'node' ? NODE_ICONS : LINK_ICONS)[type]
	if (!Icon) return null
	return <Icon sx={{ fontSize: size, color }} />
}
