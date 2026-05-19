import { useState } from 'react'
import { TbChevronDown, TbBolt } from 'react-icons/tb'
import { MdErrorOutline } from 'react-icons/md'

const formatArgs = (args) => {
	if (!args || typeof args !== 'object') return String(args ?? '')
	const entries = Object.entries(args)
	if (!entries.length) return '—'
	return entries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('  ·  ')
}

const isTabular = (result) =>
	Array.isArray(result) &&
	result.length > 0 &&
	typeof result[0] === 'object' &&
	result[0] !== null

const ResultRender = ({ result }) => {
	if (result == null) return <em className='text-slate-400 text-[12px]'>Sin resultado</em>
	if (isTabular(result)) {
		const cols = Array.from(
			result.reduce((acc, row) => {
				Object.keys(row).forEach((k) => acc.add(k))
				return acc
			}, new Set())
		)
		return (
			<div className='overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10'>
				<table className='w-full text-[12px] font-mono'>
					<thead className='bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300'>
						<tr>
							{cols.map((c) => (
								<th
									key={c}
									className='px-2.5 py-1.5 text-left font-semibold tracking-tight border-b border-slate-200 dark:border-white/10'
								>
									{c}
								</th>
							))}
						</tr>
					</thead>
					<tbody className='text-slate-700 dark:text-slate-200'>
						{result.map((row, i) => (
							<tr
								key={i}
								className='odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/[0.02]'
							>
								{cols.map((c) => (
									<td
										key={c}
										className='px-2.5 py-1.5 border-b border-slate-100 dark:border-white/[0.05] tabular-nums'
									>
										{typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '')}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}
	return (
		<pre className='overflow-x-auto rounded-lg bg-slate-900 text-slate-100 text-[12px] font-mono p-3 leading-[1.55] border border-slate-800'>
			<code>{JSON.stringify(result, null, 2)}</code>
		</pre>
	)
}

/**
 * @param {{ toolCalls: Array<{ name: string, arguments: any, result?: any, error?: string|null }> }} props
 */
const ToolCallTrace = ({ toolCalls }) => {
	const [open, setOpen] = useState(false)
	if (!toolCalls?.length) return null
	const errCount = toolCalls.filter((t) => t.error).length

	return (
		<div className='mt-3 rounded-2xl border border-[#1f4e79]/10 bg-slate-50/70 dark:bg-white/[0.025] overflow-hidden'>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className='w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors'
			>
				<span className='shrink-0 w-7 h-7 rounded-lg bg-[#368bed]/15 text-[#1f4e79] dark:text-[#7fb6ef] flex items-center justify-center'>
					<TbBolt size={14} />
				</span>
				<div className='min-w-0 flex-1'>
					<div className='text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0] dark:text-[#7fb6ef]'>
						Telemetría · datos en tiempo real
					</div>
					<div className='text-[12.5px] text-slate-600 dark:text-slate-300 truncate'>
						Consultó {toolCalls.length} {toolCalls.length === 1 ? 'variable' : 'variables'}
						{errCount > 0 && (
							<span className='ml-2 inline-flex items-center gap-1 px-1.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 text-[10.5px] font-medium'>
								<MdErrorOutline size={11} /> {errCount} con error
							</span>
						)}
					</div>
				</div>
				<TbChevronDown
					size={16}
					className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>
			{open && (
				<div className='px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-200/80 dark:border-white/[0.06]'>
					{toolCalls.map((t, i) => (
						<div key={i} className='space-y-1.5'>
							<div className='flex items-center gap-2 flex-wrap'>
								<code className='px-1.5 py-0.5 rounded-md text-[11.5px] font-mono bg-slate-900 text-slate-100'>
									{t.name}
								</code>
								<span className='text-[11.5px] font-mono text-slate-500 dark:text-slate-400 break-all'>
									{formatArgs(t.arguments)}
								</span>
								{t.error && (
									<span className='inline-flex items-center gap-1 px-1.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 text-[10.5px] font-medium'>
										<MdErrorOutline size={11} /> Error
									</span>
								)}
							</div>
							{t.error ? (
								<p className='text-[12px] font-mono text-rose-700 dark:text-rose-300 pl-1'>{t.error}</p>
							) : (
								<ResultRender result={t.result} />
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default ToolCallTrace
