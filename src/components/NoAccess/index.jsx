import { MdLockOutline } from 'react-icons/md'
import { Link } from 'react-router-dom'

// Pantalla que se muestra cuando el usuario navega a una sección
// cuyo menú existe en el tenant pero no tiene permiso asignado
function NoAccess() {
	return (
		<div className='w-full flex flex-col items-center justify-center py-24 text-center'>
			<MdLockOutline className='text-6xl text-gray-400 dark:text-gray-500 mb-4' />
			<h2 className='text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2'>
				No tenés acceso a esta sección
			</h2>
			<p className='text-gray-500 dark:text-gray-400 mb-6'>
				Si necesitás ingresar, comunicate con el administrador.
			</p>
			<Link to='/' className='text-primary hover:underline'>
				Volver al inicio
			</Link>
		</div>
	)
}

export default NoAccess
