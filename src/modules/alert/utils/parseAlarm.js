export const parseAlarmMessage = (message) => {
	if (!message) return { kind: 'simple', alarmName: null, condition: null }

	const nameMatch = message.match(/^\s*"([^"]+)"\s*/)
	const alarmName = nameMatch ? nameMatch[1].trim() : null
	const rest = (nameMatch ? message.slice(nameMatch[0].length) : message).trim()

	if (/^combinada\s+disparada/i.test(rest)) {
		const afterColon = rest.replace(/^combinada\s+disparada:?/i, '').trim()
		const splitPattern = /\s*\n\s*|\s+AND\s+|\s+OR\s+/i
		const operatorMatch = afterColon.match(/\s+(AND|OR)\s+/i)
		const operator = operatorMatch ? operatorMatch[1].toUpperCase() : 'AND'
		const parts = afterColon
			.split(splitPattern)
			.map((s) => s.trim())
			.filter(Boolean)
			.filter((s) => !/^(AND|OR)$/i.test(s))
		return { kind: 'combined', alarmName, operator, parts }
	}

	const condMatch = rest.match(/\((.+)\)\s*disparada\s*con\s*valor/is)
	if (condMatch) {
		return { kind: 'simple', alarmName, condition: condMatch[1].trim() }
	}

	return {
		kind: 'simple',
		alarmName,
		condition: rest.replace(/disparada.*/is, '').trim() || null,
	}
}

export const parseTriggeredAt = (str) => {
	if (!str) return null
	const [datePart, timePart] = str.split(',').map((s) => (s || '').trim())
	const dateBits = (datePart || '').split('/').map(Number)
	if (dateBits.length < 3 || dateBits.some(Number.isNaN)) return null
	const [d, mo, y] = dateBits
	const [h = 0, mi = 0] = (timePart || '0:0').split(':').map(Number)
	const year = y < 100 ? 2000 + y : y
	return new Date(year, mo - 1, d, h, mi)
}

const MS_MIN = 60_000
const MS_HOUR = 3_600_000
const MS_DAY = 86_400_000

export const relativeLabel = (date, now = new Date()) => {
	if (!date) return ''
	const diff = now - date
	if (diff < 0) return ''
	if (diff < MS_MIN) return 'recién'
	if (diff < MS_HOUR) return `hace ${Math.round(diff / MS_MIN)} min`
	if (diff < MS_DAY) return `hace ${Math.round(diff / MS_HOUR)} h`
	const days = Math.round(diff / MS_DAY)
	if (days < 7) return `hace ${days} d`
	if (days < 30) return `hace ${Math.round(days / 7)} sem`
	return ''
}

export const getTimeBucket = (date, now = new Date()) => {
	if (!date) return 'older'
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const startOfYesterday = new Date(startOfToday)
	startOfYesterday.setDate(startOfToday.getDate() - 1)
	const sevenDaysAgo = new Date(startOfToday)
	sevenDaysAgo.setDate(startOfToday.getDate() - 7)

	if (date >= startOfToday) return 'today'
	if (date >= startOfYesterday) return 'yesterday'
	if (date >= sevenDaysAgo) return 'week'
	return 'older'
}

export const BUCKET_LABELS = {
	today: 'Hoy',
	yesterday: 'Ayer',
	week: 'Esta semana',
	older: 'Anteriores',
}

export const BUCKET_ORDER = ['today', 'yesterday', 'week', 'older']
