import { Collapse, ListItemButton, ListItemIcon, ListItemText, MenuItem, Popper, useMediaQuery } from '@mui/material'
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

	return (
		<div className='!w-full'>
			<ListItemButton
				onClick={(evento) => handleOpen(evento)}
				className='!w-full'
				sx={{
					justifyContent: isMobile ? 'center' : 'flex-start',
				}}
			>
				<ListItemIcon
					className={`${
						item.subMenus.some((value) => buttonActive?.includes(value.link))
							? ' !text-blue-500 dark:!text-blue-500'
							: ''
					}`}
					sx={{
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
						display: isMobile ? 'none !important' : 'block',
					}}
					className={`${
						item.subMenus.some((value) => buttonActive?.includes(value.link))
							? ' !text-blue-500 dark:!text-blue-500'
							: ''
					}`}
					primary={item.name}
				/>
			</ListItemButton>
			{openSideBar ? (
				<Collapse in={openSub} className='!w-full' timeout='auto' unmountOnExit>
					{item.subMenus.map((submenu, index) => {
						return (
							<ListItemButton key={index} onClick={() => activeButton(submenu.link)}>
								<Link to={submenu.link} className='text-black dark:text-white flex pl-5'>
									<ListItemIcon
										className={`${
											buttonActive?.includes(submenu.link)
												? ' !text-blue-500 dark:!text-blue-500'
												: ''
										}`}
									>
										{getIcon(submenu)}
									</ListItemIcon>
									<ListItemText
										className={`${
											buttonActive?.includes(submenu.link)
												? ' !text-blue-500 dark:!text-blue-500'
												: ''
										}`}
										primary={submenu.name}
									/>
								</Link>
							</ListItemButton>
						)
					})}
				</Collapse>
			) : anchorEl ? (
				<Popper
					id={item.name}
					key={item.name}
					className='p-2 bg-[#ffffff] z-50 rounded-md shadow-md flex flex-col justify-start'
					placement={isMobile ? 'top-end' : 'left-start'}
					open={openSub}
					anchorEl={anchorEl} 
					sx={{
						...(isMobile && {
							transform: 'translate3d(-50px, -76px, 0px) !important',
							position: isMobile ? 'fixed !important' : 'absolute !important',
						}),
					}}
				>
					{item.subMenus?.map((item2, index) => (
						<MenuItem
							className={`gap-3  ${
								buttonActive.includes(item2.link) ? ' !text-blue-500' : ' !text-gray-500'
							}`}
							key={index}
							onClick={() => activeButton(item2.link)}
						>
							{getIcon(item2)} {item2.name}
						</MenuItem>
					))}
				</Popper>
			) : null}
		</div>
	)
}
export default SubMenuCustom
