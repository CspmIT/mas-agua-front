import Home from '../modules/home/views'
import ChartsDashboard from '../modules/dashBoard/views/ChartsDashboard'
import TabDinamic from '../modules/tabs/views'
import ConfigSecurity from '../modules/configSecurity/views'
import ConfigMenu from '../modules/ConfigMenu/view'
import Notification from '../modules/Notification'
import Profile from '../modules/profile/views'
import Notifications from '../modules/ConfigNotifications/views/index'
import ListDrawDiagram from '../modules/DrawDiagram/views/ListDrawDiagram'
import DrawDiagram from '../modules/DrawDiagram/views/DrawDiagram'
import ViewDiagram from '../modules/DrawDiagram/views/ViewDiagram'
import AddMenu from '../modules/ConfigMenu/components/AddMenu'
import SelectType from '../modules/Charts/views/SelectType'
import PumpControl from '../modules/Charts/views/ConfigBombs'
import ConfigBooleanChart from '../modules/Charts/views/ConfigBooleanChart'
import ConfigPie from '../modules/Charts/views/ConfigPie'
import ConfigGraphic from '../modules/Charts/views/ConfigGraphic'
import ChartsTable from '../modules/Charts/views/ChartsTable'
import ConfigMultipleBooleanChart from '../modules/Charts/views/ConfigMultipleBooleanChart'
import ConfigBoardChart from '../modules/Charts/views/ConfigBoardChart'
import MapView from '../modules/Map/Views/MapView'
import Maps from '../modules/Map/Views/Maps'
import Vars from '../modules/ConfigVars/views/Vars'
import ProfilePLC from '../modules/ProfilePLC/views/ProfilePLC'
import Alert from '../modules/alert/views'
import ConfigAlarms from '../modules/ConfigAlarms/views/index'
import ExternalUser from '../modules/ExternalUsers/views/index'
import PumpsTable from '../modules/PumpsTable/views/index'
import Boards from '../modules/Boards/views'

export const userRoutes = [
	{ path: '/', element: <Home /> },
	{ path: '/home', element: <Home /> },
    { path: '/graphics', element: <Home /> },
    { path: '/chart', element: <ChartsDashboard /> },
	{ path: '/tabs', element: <TabDinamic /> },
	{ path: '/config/security', element: <ConfigSecurity /> },
	{ path: '/config/accesses', element: <ConfigMenu /> },
	{ path: '/notificaciones', element: <Notification /> },
	{ path: '/profile', element: <Profile /> },
	{ path: '/config/notifications', element: <Notifications /> },
	{ path: '/config/diagram', element: <ListDrawDiagram /> },
	{ path: '/newDiagram', element: <DrawDiagram /> },
	{ path: '/newDiagram/:id', element: <DrawDiagram /> },
	{ path: '/viewDiagram/:id', element: <ViewDiagram /> },
	{ path: '/config/menu', element: <AddMenu /> },
	{ path: '/config/graphic', element: <SelectType /> },
	{ path: '/config/pumps', element: <PumpControl /> },
	{ path: '/config/graphic/boolean', element: <ConfigBooleanChart /> },
	{ path: '/config/graphic/boolean/:id', element: <ConfigBooleanChart /> },
	{ path: '/config/graphic/pie', element: <ConfigPie /> },
	{ path: '/config/graphic/pie/:id', element: <ConfigPie /> },
	{ path: '/config/graphic/:id', element: <ConfigGraphic /> },
	{ path: '/config/graphic/:id/:idChart', element: <ConfigGraphic /> },
	{ path: '/config/allGraphic', element: <ChartsTable /> },
	{ path: '/config/graphic/multipleBoolean', element: <ConfigMultipleBooleanChart /> },
	{ path: '/config/graphic/multipleBoolean/:id', element: <ConfigMultipleBooleanChart /> },
	{ path: '/config/graphic/board', element: <ConfigBoardChart /> },
	{ path: '/config/graphic/board/:id', element: <ConfigBoardChart /> },
	{ path: '/map', element: <MapView /> },
	{ path: '/maps', element: <Maps /> },
	{ path: '/map/create', element: <MapView create={true} /> },
	{ path: '/map/edit', element: <MapView create={true} search={true} /> },
	{ path: '/config/vars', element: <Vars /> },
	{ path: '/config/plc', element: <ProfilePLC /> },
	{ path: '/alert', element: <Alert /> },
	{ path: '/config/alarm', element: <ConfigAlarms /> },
	{ path: '/external', element: <ExternalUser /> },
	{ path: '/list/pumps', element: <PumpsTable /> },
	{ path: '/boards', element: <Boards /> },
]