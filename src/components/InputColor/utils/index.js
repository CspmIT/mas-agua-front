// Utilidades para manejar colores
export const hexToRgb = (hex) => {
	hex = hex.replace('#', '')
	const bigint = parseInt(hex, 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255
	return [r, g, b]
}

export const parseRgba = (rgba) => {
	if (!rgba?.startsWith('rgba')) return { color: '#ffffff', opacity: 1 }
	const parts = rgba.match(/rgba?\((\d+), (\d+), (\d+), ([0-9.]+)\)/)
	if (!parts) return { color: '#ffffff', opacity: 1 }
	const [_, r, g, b, a] = parts
	return { color: rgbToHex(r, g, b), opacity: parseFloat(a) }
}

export const rgbToHex = (r, g, b) => {
	const toHex = (c) => parseInt(c).toString(16).padStart(2, '0')
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
