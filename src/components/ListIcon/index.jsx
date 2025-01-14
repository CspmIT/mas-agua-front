import { BsFillDiagram3Fill, BsFillMenuButtonWideFill } from 'react-icons/bs'
import { FaChartLine, FaCogs, FaFile, FaMapMarkedAlt, FaProjectDiagram } from 'react-icons/fa'
import { MdContentPaste, MdNotificationsActive } from 'react-icons/md'
import { RiAlertFill, RiDashboardFill } from 'react-icons/ri'

const ListIcon = () => [
	{ title: 'Mapa', name: 'FaMapMarkedAlt', icon: <FaMapMarkedAlt className=' text-3xl' /> },
	{ title: 'Diagrama', name: 'FaProjectDiagram', icon: <FaProjectDiagram className=' text-3xl' /> },
	{ title: 'Bitacora', name: 'MdContentPaste', icon: <MdContentPaste className=' text-3xl' /> },
	{ title: 'Configuración', name: 'FaCogs', icon: <FaCogs className=' text-3xl' /> },
	{ title: 'Access', name: 'BsFillMenuButtonWideFill', icon: <BsFillMenuButtonWideFill className=' text-3xl' /> },
	{ title: 'Diagrama', name: 'BsFillDiagram3Fill', icon: <BsFillDiagram3Fill className=' text-3xl' /> },
	{ title: 'Notificación', name: 'MdNotificationsActive', icon: <MdNotificationsActive className=' text-3xl' /> },
	{ title: 'Dashboard', name: 'RiDashboardFill', icon: <RiDashboardFill className=' text-3xl' /> },
	{ title: 'Alerta', name: 'RiAlertFill', icon: <RiAlertFill className=' text-3xl' /> },
	{ title: 'Pagina', name: 'FaFile', icon: <FaFile className=' text-3xl' /> },
	{ title: 'Graficos', name: 'FaChartLine', icon: <FaChartLine className=' text-3xl' /> },
]

export default ListIcon
