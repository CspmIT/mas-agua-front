import AppsIcon from '@mui/icons-material/Apps'
import { Fade, IconButton, Popper } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { getProductActive } from '../../login' 
import { getLogo } from '../../images' 
import { front } from '../../../../../utils/routes/app.routes' 
import { getData } from '../../../../../storage/cookies-store'
function BottonApps() {
	const [anchorEl, setAnchorEl] = useState(null)
	const [products, setProducts] = useState([])
	const handleClick = async (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget)
		if (!anchorEl && event.currentTarget) {
			const listProducts = await getProductActive()
			setProducts(listProducts)
		}
	}
	const open = Boolean(anchorEl)
	const id = open ? 'simple-popper' : undefined
	const reDirection = async (key) => {
		const url = front[key]
		if (!url) throw new Error('No se encontró la Aplicación...')
		const tokencooptech = await getData('token')
		window.location.href = `${url}/LoginCooptech/${tokencooptech}`
	}
	const dropdownRef = useRef(null) // Referencia al dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				handleClick(false)
			}
		}
		// Agregar el escuchador de eventos al montar el componente
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			// Limpiar el escuchador de eventos al desmontar el componente
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<div ref={dropdownRef}>
			<IconButton
				id={id}
				color='inherit'
				onClick={(e) => {
					handleClick(e)
				}}
			>
				<AppsIcon sx={{ color: 'black' }} />
			</IconButton>
			<Popper className='z-50 p-3' id={id} open={open} anchorEl={anchorEl} transition placement={'bottom-end'}>
				{({ TransitionProps }) => (
					<Fade {...TransitionProps} timeout={350}>
						<ul className=' rounded-lg p-2 !shadow-gray-500 dark:!shadow-gray-900 grid grid-cols-3 max-sm:grid-cols-2 !shadow-lg border-gray-200 dark:border-gray-700 border-2 bg-white dark:bg-gray-700 '>
							{products.map((item, index) => {
								return (
									<li
										key={index}
										onClick={() => {
											if (item.profile !== 0) reDirection(item.name)
										}}
										className={`${
											item.profile !== 0 &&
											'hover:bg-slate-200 dark:hover:bg-slate-900 hover:cursor-pointer'
										}   select-none rounded-lg p-3  max-h-[13vh] transition-colors flex flex-col justify-center items-center`}
									>
										<img
											className={`${
												item.profile === 0 && 'opacity-15'
											} max-w-[10vw] max-sm:max-w-[20vw] max-h-[10vh]`}
											src={getLogo(item.name)}
										/>
										<p className='m-0 p-0 text-black dark:text-white'>{item.name}</p>
									</li>
								)
							})}
						</ul>
					</Fade>
				)}
			</Popper>
		</div>
	)
}

export default BottonApps
