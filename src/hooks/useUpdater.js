import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import Swal from 'sweetalert2'
import { showInstallMessage, showUpdateError, showUpdateProgress, updateProgress } from '../utils/js/updateSwal'

export const useUpdater = () => {
	const checkForUpdates = async () => {
		try {
			const update = await check()

			if (!update) return

			const confirm = await Swal.fire({
				title: 'Nueva versión disponible',
				text: '¿Deseás actualizar ahora?',
				icon: 'info',
				showCancelButton: true,
				confirmButtonText: 'Actualizar',
				cancelButtonText: 'Más tarde',
			})

			if (!confirm.isConfirmed) return

			let downloaded = 0
			let contentLength = 0
			let downloadStarted = false

			showUpdateProgress()
			const timeoutId = setTimeout(() => {
				if (!downloadStarted) {
					Swal.fire({
						icon: 'error',
						title: 'No se pudo descargar la actualización',
						text: 'Intenta nuevamente o descárgala manualmente',
					})
				}
			}, 20000)
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						contentLength = event.data.contentLength
						downloaded = 0
						downloadStarted = true
						break

					case 'Progress':
						downloaded += event.data.chunkLength
						if (contentLength > 0) {
							const percent = Math.floor((downloaded / contentLength) * 100)
							updateProgress(percent)
						}
						break

					case 'Finished':
						clearTimeout(timeoutId)
						showInstallMessage()
						break
				}
			})

			await relaunch()
		} catch (error) {
			console.error('Updater error:', error)
			showUpdateError('No se pudo completar la actualización. Verificá tu conexión e intentá nuevamente.')
		}
	}

	return { checkForUpdates }
}
