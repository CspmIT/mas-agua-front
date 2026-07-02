import { Collapse, ListItemButton, ListItemIcon, ListItemText, MenuItem, Popper, Paper, ClickAwayListener, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ListIcon from '../../../components/ListIcon'

const SubMenuCustom = ({ item, openSideBar, activeButton, buttonActive }) => {
	const [anchorEl, setAnchorEl] = useState(null)
	const [openSub, setOpenSub] = useState(item.subMenus.some((value) => value.link == buttonActive))
	const isMobile = useMediaQuery('(max-width: 600px)')
	const handleOpen = (evento) => {
		setOpenSub(!openSub)
		setAnchorEl(evento.currentTarget)
	}
	const handleClose = () => {
		setOpenSub(false)
	}
	useEffect(() => {
		if (!openSideBar) {
			setOpenSub(false)
		} else {
			setOpenSub(item.subMenus.some((value) => value.link == buttonActive))
		}
	}, [openSideBar, buttonActive])
	const getIcon = (menu) => {
		const listIcon = ListIcon()
		const componentIcon = listIcon.filter((icono) => icono.name === menu.icon)?.[0] || ''
		return componentIcon.icon
	}

	const hasActiveChild = item.subMenus.some((value) => buttonActive?.includes(value.link))

	return (
		<div className='!w-full'>
			<ListItemButton
				onClick={(evento) => handleOpen(evento)}
				className='!w-full'
				sx={{
					minHeight: 32,
					justifyContent: !isMobile && openSideBar ? 'initial' : 'center',
					padding: !isMobile ? '1rem' : '0.2rem',
					py: 1.2,
					transition: 'background-color 180ms ease',
					backgroundColor: hasActiveChild ? 'rgba(54, 139, 237, 0.08)' : 'transparent',
					'&:hover': {
						backgroundColor: hasActiveChild
							? 'rgba(54, 139, 237, 0.12)'
							: 'rgba(54, 139, 237, 0.05)',
					},
				}}
			>
				<ListItemIcon
					className={`${!isMobile && openSideBar ? '!mr-3' : ''} ${
						hasActiveChild
							? ' !text-blue-500 dark:!text-blue-400'
							: ' !text-slate-500 dark:!text-slate-400'
					}`}
					sx={{
						minWidth: 0,
						justifyContent: 'center',
						transition: 'color 180ms ease, filter 180ms ease',
						'& svg': { fontSize: 24 },
						filter: hasActiveChild
							? 'drop-shadow(0 2px 5px rgba(54, 139, 237, 0.35))'
							: 'none',
						...(isMobile && {
							margin: -2,
							minWidth: 'auto !important',
						}),
					}}
				>
					{getIcon(item)}
				</ListItemIcon>
				<ListItemText
					sx={{
						display: !isMobile && openSideBar ? 'block' : 'none',
					}}
					primaryTypographyProps={{
						fontSize: '0.95rem',
						fontWeight: hasActiveChild ? 600 : 500,
					}}
					className={`${hasActiveChild ? ' !text-blue-500 dark:!text-blue-400' : ''}`}
					primary={item.name}
				/>
			</ListItemButton>
			{openSideBar ? (
				<Collapse in={openSub} className='!w-full' timeout='auto' unmountOnExit>
					<div className='relative ml-6 pl-3 border-l border-slate-200 dark:border-slate-700 py-1'>
						{item.subMenus.map((submenu, index) => {
							const isActive = buttonActive?.includes(submenu.link)
							return (
								<ListItemButton
									key={index}
									onClick={() => activeButton(submenu.link)}
									sx={{
										minHeight: 30,
										py: 0.5,
										px: 1,
										my: 0.25,
										borderRadius: '8px',
										transition: 'background-color 150ms ease',
										backgroundColor: isActive ? 'rgba(54, 139, 237, 0.10)' : 'transparent',
										'&:hover': {
											backgroundColor: isActive ? 'rgba(54, 139, 237, 0.14)' : 'rgba(54, 139, 237, 0.06)',
										},
									}}
								>
									<Link to={submenu.link} className='text-slate-600 dark:text-slate-300 flex items-center gap-2 w-full'>
										<ListItemIcon
											sx={{
												minWidth: 0,
												'& svg': { fontSize: 20 },
											}}
											className={`${isActive ? '!text-blue-500 dark:!text-blue-400' : '!text-slate-500 dark:!text-slate-400'}`}
										>
											{getIcon(submenu)}
										</ListItemIcon>
										<ListItemText
											primaryTypographyProps={{
												fontSize: '0.9rem',
												fontWeight: isActive ? 600 : 500,
												sx: { lineHeight: 1.2 },
											}}
											className={`${isActive ? '!text-blue-500 dark:!text-blue-400' : ''}`}
											primary={submenu.name}
										/>
									</Link>
								</ListItemButton>
							)
						})}
					</div>
				</Collapse>
			) : anchorEl ? (
				<Popper
					id={item.name}
					key={item.name}
					placement={isMobile ? 'top-end' : 'right-start'}
					open={openSub}
					anchorEl={anchorEl}
					modifiers={[
						{ name: 'offset', options: { offset: [0, 10] } },
						{ name: 'preventOverflow', options: { boundary: 'viewport', padding: 12, altAxis: true } },
						{ name: 'flip', options: { fallbackPlacements: ['right-end', 'left-start', 'left-end', 'bottom-start'] } },
					]}
					sx={{
						zIndex: 2500,
						...(isMobile && {
							transform: 'translate3d(-50px, -76px, 0px) !important',
							position: 'fixed !important',
						}),
					}}
				>
					<ClickAwayListener onClickAway={handleClose}>
						<Paper
							elevation={0}
							className='bg-white dark:bg-slate-900 !rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden'
							sx={{
								minWidth: 220,
								maxWidth: 280,
								maxHeight: 'calc(100vh - 96px)',
								overflowY: 'auto',
								display: 'flex',
								flexDirection: 'column',
								transformOrigin: 'left top',
								boxShadow: '0 18px 40px -12px rgba(15, 42, 68, 0.28), 0 4px 12px -4px rgba(15, 42, 68, 0.12)',
								animation: 'submenuPopIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
								'@keyframes submenuPopIn': {
									'0%': {
										opacity: 0,
										transform: 'translateX(-8px) scale(0.96)',
									},
									'100%': {
										opacity: 1,
										transform: 'translateX(0) scale(1)',
									},
								},
								'&::-webkit-scrollbar': { width: 6 },
								'&::-webkit-scrollbar-thumb': {
									backgroundColor: 'rgba(54, 139, 237, 0.35)',
									borderRadius: 3,
								},
								'&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
							}}
						>
							<div className='px-3 pt-2.5 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#368bed]/90 dark:text-[#60a5fa]/90'>
								{item.name}
							</div>
							<div className='p-1.5'>
								{item.subMenus?.map((item2, index) => {
									const isActive = buttonActive?.includes(item2.link)
									return (
										<MenuItem
											key={index}
											onClick={() => {
												activeButton(item2.link)
												handleClose()
											}}
											sx={{
												gap: 1.25,
												py: 0.75,
												px: 1.5,
												my: 0.25,
												borderRadius: '10px',
												fontSize: '0.9rem',
												fontWeight: isActive ? 600 : 500,
												'& .submenu-icon svg': { fontSize: 20 },
												color: isActive ? '#368bed' : 'inherit',
												backgroundColor: isActive ? 'rgba(54, 139, 237, 0.10)' : 'transparent',
												transition: 'background-color 150ms ease, color 150ms ease',
												'& .submenu-icon': {
													color: isActive ? '#368bed' : 'rgb(100, 116, 139)',
													transition: 'color 150ms ease',
												},
												'&:hover': {
													backgroundColor: isActive ? 'rgba(54, 139, 237, 0.16)' : 'rgba(54, 139, 237, 0.08)',
													color: '#368bed',
												},
												'&:hover .submenu-icon': {
													color: '#368bed',
												},
											}}
										>
											<span className='submenu-icon inline-flex items-center justify-center shrink-0 text-lg'>
												{getIcon(item2)}
											</span>
											<span className='truncate'>{item2.name}</span>
										</MenuItem>
									)
								})}
							</div>
						</Paper>
					</ClickAwayListener>
				</Popper>
			) : null}
		</div>
	)
}
export default SubMenuCustom
