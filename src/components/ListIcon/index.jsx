import { BsFillDiagram3Fill, BsFillMenuButtonWideFill } from 'react-icons/bs'
import {
    FaTachometerAlt,
    FaChartLine,
    FaCogs,
    FaFile,
    FaMapMarkedAlt,
    FaProjectDiagram,
    FaChartBar,
    FaMicrochip,
} from 'react-icons/fa'
import { HiVariable } from 'react-icons/hi2'
import { MdContentPaste, MdNotificationsActive, MdSchema } from 'react-icons/md'
import { RiAlertFill, RiDashboardFill } from 'react-icons/ri'

const ListIcon = () => [
    {
        title: 'SCADA',
        name: 'MdSchema',
        icon: <MdSchema className=" text-3xl" />,
    },
    {
        title: 'Mapa',
        name: 'FaMapMarkedAlt',
        icon: <FaMapMarkedAlt className=" text-3xl" />,
    },
    {
        title: 'Diagrama',
        name: 'FaProjectDiagram',
        icon: <FaProjectDiagram className=" text-3xl" />,
    },
    {
        title: 'Bitacora',
        name: 'MdContentPaste',
        icon: <MdContentPaste className=" text-3xl" />,
    },
    {
        title: 'Configuración',
        name: 'FaCogs',
        icon: <FaCogs className=" text-3xl" />,
    },
    {
        title: 'Access',
        name: 'BsFillMenuButtonWideFill',
        icon: <BsFillMenuButtonWideFill className=" text-3xl" />,
    },
    {
        title: 'Diagrama',
        name: 'BsFillDiagram3Fill',
        icon: <BsFillDiagram3Fill className=" text-3xl" />,
    },
    {
        title: 'Notificación',
        name: 'MdNotificationsActive',
        icon: <MdNotificationsActive className=" text-3xl" />,
    },
    {
        title: 'Dashboard',
        name: 'FaTachometerAlt',
        icon: <FaTachometerAlt className=" text-3xl" />,
    },
    {
        title: 'Alerta',
        name: 'RiAlertFill',
        icon: <RiAlertFill className=" text-3xl" />,
    },
    { title: 'Pagina', name: 'FaFile', icon: <FaFile className=" text-3xl" /> },
    {
        title: 'Graficos',
        name: 'FaChartLine',
        icon: <FaChartLine className=" text-3xl" />,
    },
    {
        title: 'Graficos Bar',
        name: 'FaChartBar',
        icon: <FaChartBar className=" text-3xl" />,
    },
    {
        title: 'Variables',
        name: 'HiVariable',
        icon: <HiVariable className=" text-3xl" />,
    },
    {
        title: 'Perfil PLC',
        name: 'FaMicrochip',
        icon: <FaMicrochip className=" text-3xl" />,
    },
]

export default ListIcon
