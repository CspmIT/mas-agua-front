import MuiAppBar from '@mui/material/AppBar'
import { styled } from '@mui/material/styles'
const drawerWidth = 240
const AppBarCustom = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	background: 'linear-gradient(90deg, #2c6aa0  0%, #1f4e79 50%, #0f2a44 100%)',

	boxShadow: '0 4px 20px rgba(0,0,0,0.25)',

	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}))

export default AppBarCustom
