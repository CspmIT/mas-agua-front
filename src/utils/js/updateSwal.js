import Swal from 'sweetalert2'

export const showUpdateProgress = () => {
	return Swal.fire({
		title: 'Actualizando aplicación',
		html: `
      <p>Descargando actualización...</p>
      <div style="background:#e5e7eb;border-radius:6px;overflow:hidden">
        <div id="update-progress-bar"
             style="height:12px;width:0%;background:#3b82f6;transition:width .2s"></div>
      </div>
      <b id="update-progress-text">0%</b>
    `,
		allowOutsideClick: false,
		allowEscapeKey: false,
		showConfirmButton: false,
		didOpen: () => {
			Swal.showLoading()
		},
	})
}

export const updateProgress = (percent) => {
	const bar = document.getElementById('update-progress-bar')
	const text = document.getElementById('update-progress-text')

	if (bar) bar.style.width = `${percent}%`
	if (text) text.innerText = `${percent}%`
}

export const showInstallMessage = () => {
	Swal.update({
		title: 'Instalando actualización',
		html: 'La aplicación se reiniciará automáticamente…',
	})
}

export const showUpdateError = (message) => {
	Swal.fire({
		icon: 'error',
		title: 'Error al actualizar',
		text: message,
	})
}
