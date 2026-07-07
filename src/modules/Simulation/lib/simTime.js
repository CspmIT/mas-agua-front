/** Formatea segundos de simulación como hh:mm */
export function formatSimTime(seconds) {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
