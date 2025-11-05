import { useContext, useEffect, useRef, useState } from 'react'
import { FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { removeData } from '../../../../storage/cookies-store'
import { Button } from '@mui/material'
import { storage } from '../../../../storage/storage'
import { MainContext } from '../../../../context/MainContext'
import logo from '../../../../assets/img/Logo/Iso_Cooptech.png'

const DropdownImage = () => {
	const { setInfoNav, setTabs, setTabCurrent, setTabActive } = useContext(MainContext)
	const [isDropdownOpen, setDropdownOpen] = useState(false)
	const dropdownRef = useRef(null) // Referencia al dropdown
	const navigator = useNavigate()
	const toggleDropdown = () => {
		setDropdownOpen(!isDropdownOpen)
	}

	const handleLogout = async () => {
		localStorage.clear()
		setInfoNav('')
		setTabs([])
		setTabActive(0)
		setTabCurrent(0)
		await removeData('token')
		navigator('/')
	}
	const handleChangeClient = async () => {
		storage.remove('usuario')
		setInfoNav('')
		setTabs([])
		setTabActive(0)
		setTabCurrent(0)
		await removeData('token')
		navigator('/ListClients/1')
	}

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<div className='relative inline-block text-left' ref={dropdownRef}>
			<div>
				<button
					type='button'
					className='p-1 relative flex rounded-full bg-transparent shadow-none border-1 border-slate-500'
					id='user-menu-button'
					aria-expanded='false'
					aria-haspopup='true'
					onClick={toggleDropdown}
				>
					<img
						className='h-7 w-7 rounded-full'
						src={logo}
						alt='imagen de perfil'
					/>
				</button>
			</div>
			{isDropdownOpen && (
				<div
					className='absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white dark:bg-black shadow-lg  focus:outline-none'
					role='menu'
					aria-orientation='vertical'
					aria-labelledby='user-menu-button'
					tabIndex='-1'
				>
					<div className='p-1' role='none'>
						<Button
							className='!text-black hover:!bg-slate-200 w-full flex !justify-start'
							onClick={() => handleChangeClient()}
						>
							<FaExchangeAlt className='mr-2' /> Cambio de Organización
						</Button>
						<Button
							className='!text-black hover:!bg-slate-200 w-full flex !justify-start'
							onClick={() => handleLogout()}
						>
							<FaSignOutAlt className='mr-2' /> Cerrar Sesión
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

export default DropdownImage
