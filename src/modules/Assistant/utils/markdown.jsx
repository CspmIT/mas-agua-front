/**
 * Mini renderer de markdown para respuestas del asistente.
 *
 * Diseño: tokenize + render -> emite nodos React. NUNCA usa
 * dangerouslySetInnerHTML, así no abre superficie XSS si el modelo
 * devuelve HTML / scripts inline.
 *
 * Soporta:
 *  - Headings ## y ###
 *  - Listas con guion (-)
 *  - Listas numeradas (1. )
 *  - Bloques de código ``` ```
 *  - Inline: **bold**, *italic*, `code`
 *  - Citaciones [FUENTE N] -> chip clickeable
 *  - Saltos de párrafo (línea en blanco)
 */

const CITATION_RE = /\[FUENTE\s+(\d+)\]/gi
const INLINE_RE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[FUENTE\s+\d+\])/gi

const renderInline = (text, onCitation, keyPrefix) => {
	if (!text) return null
	const parts = text.split(INLINE_RE).filter((p) => p !== undefined && p !== '')
	return parts.map((part, i) => {
		const k = `${keyPrefix}-${i}`
		if (/^\*\*[^*\n]+\*\*$/.test(part)) {
			return (
				<strong key={k} className='font-semibold text-slate-900 dark:text-slate-100'>
					{part.slice(2, -2)}
				</strong>
			)
		}
		if (/^\*[^*\n]+\*$/.test(part)) {
			return (
				<em key={k} className='italic text-slate-700 dark:text-slate-300'>
					{part.slice(1, -1)}
				</em>
			)
		}
		if (/^`[^`\n]+`$/.test(part)) {
			return (
				<code
					key={k}
					className='px-1.5 py-0.5 mx-0.5 rounded-md text-[12.5px] font-mono bg-slate-100 dark:bg-white/10 text-[#1f4e79] dark:text-[#7fb6ef] border border-slate-200/60 dark:border-white/10'
				>
					{part.slice(1, -1)}
				</code>
			)
		}
		const cite = part.match(/^\[FUENTE\s+(\d+)\]$/i)
		if (cite) {
			const n = Number(cite[1])
			return (
				<button
					key={k}
					type='button'
					onClick={() => onCitation?.(n)}
					className='inline-flex align-super items-center px-1.5 mx-0.5 rounded-md text-[10px] font-semibold tabular-nums bg-[#368bed]/12 text-[#1f4e79] dark:text-[#9ec5f4] border border-[#368bed]/30 hover:bg-[#368bed]/22 hover:text-[#0f3a66] dark:hover:bg-[#368bed]/30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#368bed]/60'
					aria-label={`Ir a fuente ${n}`}
				>
					{n}
				</button>
			)
		}
		return <span key={k}>{part}</span>
	})
}

/**
 * Convierte un markdown plano en bloques tipados.
 * @param {string} text
 */
const tokenizeBlocks = (text) => {
	const lines = text.replace(/\r\n/g, '\n').split('\n')
	const blocks = []
	let i = 0
	while (i < lines.length) {
		const line = lines[i]
		// Code fence
		if (/^```/.test(line.trim())) {
			const buf = []
			i++
			while (i < lines.length && !/^```/.test(lines[i].trim())) {
				buf.push(lines[i])
				i++
			}
			i++ // skip closing fence
			blocks.push({ type: 'code', content: buf.join('\n') })
			continue
		}
		if (line.trim() === '') {
			i++
			continue
		}
		// Heading
		const h = line.match(/^(#{1,3})\s+(.*)$/)
		if (h) {
			blocks.push({ type: 'heading', level: h[1].length, content: h[2] })
			i++
			continue
		}
		// Bullet list
		if (/^\s*[-*]\s+/.test(line)) {
			const items = []
			while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
				items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
				i++
			}
			blocks.push({ type: 'ul', items })
			continue
		}
		// Numbered list
		if (/^\s*\d+\.\s+/.test(line)) {
			const items = []
			while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
				items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
				i++
			}
			blocks.push({ type: 'ol', items })
			continue
		}
		// Paragraph (acumula líneas hasta blanco / nuevo bloque)
		const buf = [line]
		i++
		while (
			i < lines.length &&
			lines[i].trim() !== '' &&
			!/^(#{1,3})\s+/.test(lines[i]) &&
			!/^\s*[-*]\s+/.test(lines[i]) &&
			!/^\s*\d+\.\s+/.test(lines[i]) &&
			!/^```/.test(lines[i].trim())
		) {
			buf.push(lines[i])
			i++
		}
		blocks.push({ type: 'p', content: buf.join(' ') })
	}
	return blocks
}

/**
 * @param {{ text: string, onCitation?: (n: number) => void }} props
 */
export const AnswerBody = ({ text, onCitation }) => {
	if (!text) return null
	const blocks = tokenizeBlocks(text)
	return (
		<div className='space-y-3 text-[14.5px] leading-[1.7] text-slate-700 dark:text-slate-200'>
			{blocks.map((b, idx) => {
				const k = `b-${idx}`
				if (b.type === 'heading') {
					const Tag = b.level === 1 ? 'h2' : b.level === 2 ? 'h3' : 'h4'
					return (
						<Tag
							key={k}
							className='font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-[15.5px] mt-1'
						>
							{renderInline(b.content, onCitation, k)}
						</Tag>
					)
				}
				if (b.type === 'code') {
					return (
						<pre
							key={k}
							className='overflow-x-auto rounded-xl bg-slate-900 text-slate-100 text-[12.5px] font-mono p-3.5 border border-slate-800 leading-[1.55]'
						>
							<code>{b.content}</code>
						</pre>
					)
				}
				if (b.type === 'ul') {
					return (
						<ul key={k} className='space-y-1.5 pl-1'>
							{b.items.map((it, j) => (
								<li
									key={`${k}-${j}`}
									className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#368bed]/70"
								>
									{renderInline(it, onCitation, `${k}-${j}`)}
								</li>
							))}
						</ul>
					)
				}
				if (b.type === 'ol') {
					return (
						<ol key={k} className='space-y-1.5 pl-5 list-decimal marker:text-[#368bed]/70 marker:font-semibold'>
							{b.items.map((it, j) => (
								<li key={`${k}-${j}`}>{renderInline(it, onCitation, `${k}-${j}`)}</li>
							))}
						</ol>
					)
				}
				return (
					<p key={k} className='whitespace-pre-line'>
						{renderInline(b.content, onCitation, k)}
					</p>
				)
			})}
		</div>
	)
}

/** @param {string} text */
export const extractCitations = (text) => {
	if (!text) return []
	const out = []
	let m
	const re = new RegExp(CITATION_RE.source, 'gi')
	while ((m = re.exec(text)) !== null) out.push(Number(m[1]))
	return out
}
