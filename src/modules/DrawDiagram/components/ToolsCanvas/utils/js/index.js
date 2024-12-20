export const cleanSelectionCanvas = (fabricCanvasRef) => {
	const canvas = fabricCanvasRef.current
	canvas.discardActiveObject()
	canvas.forEachObject((obj) => {
		if (obj.type == 'circle') {
			obj.visualize = false
		}
	})
	canvas.renderAll()
}

export const invertHexColor = (hex) => {
	// Asegúrate de que el color empiece con "#" y tenga 7 caracteres
	if (hex[0] === '#') {
		hex = hex.slice(1) // Eliminar el "#"
	}

	// Asegurarse de que sea un color válido de 6 caracteres
	if (hex.length !== 6) {
		throw new Error('El valor hexadecimal debe ser de 6 caracteres.')
	}

	// Convertir el valor hexadecimal a RGB
	let r = parseInt(hex.slice(0, 2), 16)
	let g = parseInt(hex.slice(2, 4), 16)
	let b = parseInt(hex.slice(4, 6), 16)

	// Invertir cada componente
	r = (255 - r).toString(16).padStart(2, '0')
	g = (255 - g).toString(16).padStart(2, '0')
	b = (255 - b).toString(16).padStart(2, '0')

	// Unirlos para obtener el color invertido
	return `#${r}${g}${b}`
}
