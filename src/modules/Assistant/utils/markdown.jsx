import { useState } from 'react'
import { TbChevronDown, TbTable } from 'react-icons/tb'

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
 *  - Tablas GFM con alineación (| col | col |\n| :--- | ---: |\n...)
 *  - Bloques de código ``` ```
 *  - Inline: **bold**, *italic*, _italic_, `code`
 *  - Citaciones [FUENTE N] -> chip clickeable
 *  - Saltos de párrafo (línea en blanco)
 */

const CITATION_RE = /\[FUENTE\s+(\d+)\]/gi
// `_italic_` exige no estar flanqueado por alfanuméricos para no romper
// identificadores tipo `snake_case` o `external_id` que el LLM emite.
const INLINE_RE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|(?<![A-Za-z0-9])_[^_\n]+?_(?![A-Za-z0-9])|`[^`\n]+`|\[FUENTE\s+\d+\])/gi

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
		if (/^_[^_\n]+_$/.test(part)) {
			return (
				<em key={k} className='italic text-slate-500 dark:text-slate-400'>
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
 * Tabla colapsable. Por defecto muestra sólo un botón "Ver tabla de valores"
 * con conteo de filas/columnas. Cada tabla mantiene su propio estado open/closed
 * vía useState — si en una respuesta hay N tablas, cada una se abre por separado.
 *
 * @param {{
 *   headers: string[],
 *   align: Array<'left'|'center'|'right'>,
 *   rows: string[][],
 *   onCitation?: (n: number) => void,
 *   keyPrefix: string,
 * }} props
 */
const CollapsibleTable = ({ headers, align, rows, onCitation, keyPrefix }) => {
	const [open, setOpen] = useState(false)

	const alignClass = (idx) => {
		const a = align?.[idx]
		if (a === 'right') return 'text-right'
		if (a === 'center') return 'text-center'
		return 'text-left'
	}

	const rowsLabel = `${rows.length} ${rows.length === 1 ? 'fila' : 'filas'}`
	const colsLabel = `${headers.length} ${headers.length === 1 ? 'columna' : 'columnas'}`

	return (
		<div className='rounded-2xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.025] overflow-hidden'>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className='w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors'
			>
				<span className='shrink-0 w-7 h-7 rounded-lg bg-[#368bed]/15 text-[#1f4e79] dark:text-[#7fb6ef] flex items-center justify-center'>
					<TbTable size={14} />
				</span>
				<div className='min-w-0 flex-1'>
					<div className='text-[12.5px] font-medium text-[#1f4e79] dark:text-[#9ec5f4]'>
						{open ? 'Ocultar tabla' : 'Ver tabla de valores'}
					</div>
					<div className='text-[11px] text-slate-500 dark:text-slate-400 tabular-nums'>
						{rowsLabel} · {colsLabel}
					</div>
				</div>
				<TbChevronDown
					size={16}
					className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>
			{open && (
				<div className='overflow-x-auto border-t border-[#1f4e79]/8 dark:border-white/5'>
					<table className='w-full text-[13px] border-collapse'>
						<thead>
							<tr className='bg-slate-50 dark:bg-white/[0.04]'>
								{headers.map((h, j) => (
									<th
										key={`${keyPrefix}-h-${j}`}
										className={[
											'px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1f4e79] dark:text-[#9ec5f4] border-b border-[#1f4e79]/10 dark:border-white/10',
											alignClass(j),
										].join(' ')}
									>
										{renderInline(h, onCitation, `${keyPrefix}-h-${j}`)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row, ri) => (
								<tr
									key={`${keyPrefix}-r-${ri}`}
									className='odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/[0.02]'
								>
									{row.map((cell, ci) => (
										<td
											key={`${keyPrefix}-r-${ri}-${ci}`}
											className={[
												'px-3 py-1.5 text-slate-700 dark:text-slate-200 border-b border-[#1f4e79]/5 dark:border-white/5 tabular-nums align-top',
												alignClass(ci),
											].join(' ')}
										>
											{renderInline(cell, onCitation, `${keyPrefix}-r-${ri}-${ci}`)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

/**
 * Parsea una fila `| a | b | c |` (con o sin pipes en los extremos).
 */
const parseTableRow = (line) => {
	const parts = line.split('|').map((c) => c.trim())
	if (parts.length > 0 && parts[0] === '') parts.shift()
	if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop()
	return parts
}

/**
 * Detecta el separador GFM `| --- | :---: | ---: |`. Devuelve true si todas
 * las celdas son del tipo `:?-+:?`. Acepta sin pipes laterales también.
 */
const isTableSeparator = (line) => {
	if (!line || !line.includes('|')) return false
	const cells = parseTableRow(line)
	if (cells.length === 0) return false
	return cells.every((c) => /^:?-{2,}:?$/.test(c))
}

const parseAlign = (sepLine) =>
	parseTableRow(sepLine).map((cell) => {
		const left = cell.startsWith(':')
		const right = cell.endsWith(':')
		if (left && right) return 'center'
		if (right) return 'right'
		return 'left'
	})

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
		// Table GFM: línea con pipes seguida de un separador.
		if (
			line.includes('|') &&
			i + 1 < lines.length &&
			isTableSeparator(lines[i + 1])
		) {
			const headers = parseTableRow(line)
			const align = parseAlign(lines[i + 1])
			i += 2
			const rows = []
			while (
				i < lines.length &&
				lines[i].trim() !== '' &&
				lines[i].includes('|')
			) {
				rows.push(parseTableRow(lines[i]))
				i++
			}
			blocks.push({ type: 'table', headers, align, rows })
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
			!/^```/.test(lines[i].trim()) &&
			!(lines[i].includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
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
				if (b.type === 'table') {
					return (
						<CollapsibleTable
							key={k}
							headers={b.headers}
							align={b.align}
							rows={b.rows}
							onCitation={onCitation}
							keyPrefix={k}
						/>
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
