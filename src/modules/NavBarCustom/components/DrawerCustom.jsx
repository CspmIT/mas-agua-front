import { styled } from '@mui/material/styles'
import MuiDrawer from '@mui/material/Drawer'
const drawerWidth = 240

const paperBase = {
	background: 'transparent !important',
	borderRight: 'none',
	overflowX: 'hidden',
	overflowY: 'auto',
	display: 'flex',
	flexDirection: 'column',
}

const openedMixin = (theme) => ({
	...paperBase,
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
	}),
})

const closedMixin = (theme) => ({
	...paperBase,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
})

const DrawerCustom = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: 'nowrap',
	boxSizing: 'border-box',
	...(open && {
		...openedMixin(theme),
		'& .MuiDrawer-paper': openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		'& .MuiDrawer-paper': closedMixin(theme),
	}),
}));

export default DrawerCustom
