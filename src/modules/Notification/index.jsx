// import { getAuth, signInAnonymously } from 'firebase/auth'
// import { getToken, onMessage } from 'firebase/messaging'
// import { messaging } from '../../firebase'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect, useState } from 'react'
function Notification() {
	const loguearse = () => {
		signInAnonymously(getAuth()).then((usuario) => console.log(usuario))
	}
	const [tokenView, setTokenView] = useState('')
	const activarMensajes = async () => {
		const token = await getToken(messaging, {
			vapidKey: 'BHMQ3KSUNfj4j3qTUVadPqOPjaejIzsVHXq7-owOLLnEsnZD3GfhGWstVMp0LhZEG_XdZ_-CXXqDyqJVsYfgXGE',
		}).catch((error) => console.error('Error:', error))
		if (token) {
			setTokenView(token)
		}
		if (!token) {
			console.log('no tienes token')
		}
	}
	useEffect(() => {
		onMessage(messaging, (message) => {
			console.log('tu mensaje:', message)
			toast(message.notification.title)
		})
	}, [])

	return (
		<div className='bg-blue-400 p-4'>
			<h1>Notification</h1>
			<ToastContainer />
			<p>token {tokenView}</p>
			<button onClick={loguearse}>logearse</button>
			<button onClick={activarMensajes}>generar token</button>
		</div>
	)
}

export default Notification
