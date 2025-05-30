import { Button, Card, IconButton, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import LogoBlanco from '/assets/img/logoCooptech.png'
import { useForm } from 'react-hook-form'
import { TbEye, TbEyeClosed } from 'react-icons/tb'
import Swal from 'sweetalert2'
import { ArrowBack } from '@mui/icons-material'
import { requestLogin } from '../utils/requesLogin'
import { useNavigate } from 'react-router-dom'
import { saveDataUser } from '../utils/login'
import { storage } from '../utils/storage'
import { getImgApp } from '../utils/images'
import { jwtDecode } from 'jwt-decode'
import styles from '../utils/style.module.css'
import { backend } from '../../../utils/routes/app.routes'
import { getData, removeData, saveData } from '../../../storage/cookies-store'
import LoaderComponent from '../../../components/Loader'
function LoginApp() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm()
	const navigate = useNavigate()
	const [imgApp, setImgApp] = useState(null)
	const [recovery, setRecovery] = useState(false)
	const [pass, setPass] = useState('password')
	const [eyePass, setEyePass] = useState(<TbEyeClosed />)
	const [loading, setLoading] = useState(false)
	const visiblePassword = () => {
		if (pass === 'password') {
			setPass('text')
			setEyePass(<TbEye />)
		} else {
			setPass('password')
			setEyePass(<TbEyeClosed />)
		}
	}
	const handleRecovery = () => {
		reset()
		setRecovery(!recovery)
	}
	const onSubmit = async (data) => {
		try {
			if (recovery) {
				setLoading(true)
				const url = backend.Cooptech + '/password_recover'
				await requestLogin(url, 'POST', data)
				setLoading(false)
				Swal.fire({
					icon: 'success',
					title: 'Perfecto!',
					text: `Se ha enviado un correo a ${data.email}, para restablecer su contraseña`,
				})
			} else {
				setLoading(true)
				const url = backend.Cooptech + '/login'
				const responseData = await requestLogin(url, 'POST', data)
				storage.set('usuario', responseData)
				storage.set('usuarioCooptech', {
					token: responseData.token,
					id_user: responseData.id,
					cliente: responseData.cliente,
				})
				if (responseData.cliente.length > 1) {
					navigate('/ListClients')
					setLoading(false)
				} else {
					if (responseData.cliente.length === 0) {
						setLoading(false)

						throw new Error('El usuario no existe...')
					}
					const token = await saveDataUser(responseData.cliente[0].id, responseData.cliente)
					if (token.error) {
						setLoading(false)
						Swal.fire('Atencion', token.error.message || token.error, 'error')
						await removeData('token')
						storage.remove('usuario')
						storage.remove('usuarioCooptech')
						storage.remove('tokenCooptech')
						return false
					}
					const decoded = jwtDecode(token.token)
					// Obtengo la fecha de expiracion del token y la guardo en una cookie
					const expirationDate = new Date(decoded.exp)
					await saveData('token', token.token, {
						expires: expirationDate,
						secure: false,
						sameSite: 'Lax',
					})
					storage.set('usuario', decoded)
					setLoading(false)

					navigate('/')
				}
			}
		} catch (error) {
			Swal.fire('Atencion', error.response?.data?.error || error.message, 'error')
			setLoading(false)
		}
	}
	const validateUser = async () => {
		const cookies = await getData('token')
		const localStorage = storage.get('usuario')
		if (cookies && localStorage) {
			navigate(`/`)
		} else {
			const img = getImgApp()
			setImgApp(img)
		}
	}
	useEffect(() => {
		validateUser()
	}, [])

	return (
		<div
			className={
				`min-h-[100vh] w-full flex justify-center items-center bg-gray-300 bg-cover ` + styles.fondoLogin
			}
		>
			<Card className='max-md:!min-w-[95vw] !min-w-[50vw] w-1/3 !max-w-[85vw] !min-h-[50vh] py-8 bg-white !rounded-2xl !shadow-lg !shadow-gray-400  flex justify-center items-center flex-col '>
				{loading ? (
					<LoaderComponent />
				) : (
					<>
						<img className='w-5/12 max-md:w-8/12 m-0 p-0 mb-5' src={imgApp} alt='logo Cooptech' />
						<form
							className='h-full max-md:w-11/12 w-3/5 flex flex-col gap-4'
							onSubmit={handleSubmit(onSubmit)}
						>
							<TextField
								error={!!errors.email}
								type='email'
								label='Email'
								{...register('email', {
									required: 'El Campo es requerido',
									pattern: {
										value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
										message: 'Debe escribir un email correctamente',
									},
								})}
								helperText={errors.email && errors.email.message}
								defaultValue={errors.email}
							/>
							{!recovery && (
								<TextField
									error={!!errors.password}
									type={pass}
									label='Contraseña'
									placeholder='Contraseña actual'
									{...register('password', {
										required: 'El Campo es requerido',
										minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
										pattern: {
											value: /^(?=.*[A-Z]).{8,}$/,
											message:
												'El Formato correcto debe tener al menos 1 Mayuscula, 1 Simbolo especial y 1 Numero',
										},
									})}
									InputProps={{
										endAdornment: (
											<IconButton
												size='small'
												type='button'
												onClick={visiblePassword}
												className='absolute right-0'
											>
												{eyePass}
											</IconButton>
										),
									}}
									helperText={errors.password && errors.password.message}
								/>
							)}
							<div className='w-full flex justify-center items-center'>
								<Button className='w-1/2 ' type='submit' variant='contained' title='Iniciar Session'>
									{!recovery ? 'Iniciar Sesion' : 'Recupeara'}
								</Button>
							</div>
							{!recovery ? (
								<div className='flex flex-row justify-center items-center'>
									<p className='m-0'>¿Se te olvido la contraseña?</p>
									<Button
										variant='text'
										title='Recupera la contraseña'
										type='button'
										onClick={() => handleRecovery()}
									>
										Recuperala
									</Button>
								</div>
							) : (
								<div className='flex flex-row justify-center items-center'>
									<Button variant='contained' type='Button' onClick={() => handleRecovery()}>
										<ArrowBack className='mr-3' /> Volver
									</Button>
								</div>
							)}
						</form>
					</>
				)}
			</Card>
			<img className='absolute bottom-5 right-5 max-w-52 max-md:max-w-36' src={LogoBlanco} alt='logo Cooptech' />
		</div>
	)
}

export default LoginApp
