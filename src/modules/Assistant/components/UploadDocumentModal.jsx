import { useEffect, useRef, useState } from 'react'
import { Box, Button, MenuItem, TextField } from '@mui/material'
import { TbCloudUpload, TbFile, TbX } from 'react-icons/tb'
import Swal from 'sweetalert2'
import ModalShell from '../../../components/ModalShell'
import { ingestDocument } from '../../../utils/js/assistant'
import { UPLOADED_DOC_TYPES } from '../utils/docTypes'

const ACCEPTED = ['.pdf', '.docx', '.md', '.txt']
const MAX_BYTES = 25 * 1024 * 1024

const isAccepted = (file) => {
	if (!file?.name) return false
	const ext = '.' + file.name.split('.').pop().toLowerCase()
	return ACCEPTED.includes(ext)
}

const formatBytes = (n) => {
	if (n < 1024) return `${n} B`
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
	return `${(n / 1024 / 1024).toFixed(1)} MB`
}

const primarySx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	letterSpacing: '0.01em',
	px: 3,
	py: 1,
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
	transition: 'all 0.2s',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
		transform: 'translateY(-1px)',
	},
	'&.Mui-disabled': { background: 'rgba(148,163,184,0.4)', boxShadow: 'none', color: '#fff' },
}

const ghostSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 2.5,
	color: '#475569',
	'&:hover': { backgroundColor: 'rgba(15,42,68,0.05)' },
}

/**
 * @param {{ open: boolean, onClose: () => void, onSuccess: () => void }} props
 */
const UploadDocumentModal = ({ open, onClose, onSuccess }) => {
	const [file, setFile] = useState(null)
	const [title, setTitle] = useState('')
	const [docType, setDocType] = useState('')
	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState('idle') // idle | uploading | error
	const [error, setError] = useState('')
	const [drag, setDrag] = useState(false)
	const inputRef = useRef(null)

	useEffect(() => {
		if (open) return
		// Reset al cerrar
		setFile(null)
		setTitle('')
		setDocType('')
		setProgress(0)
		setStatus('idle')
		setError('')
		setDrag(false)
	}, [open])

	const validateAndSet = (incoming) => {
		setError('')
		if (!incoming) return
		if (!isAccepted(incoming)) {
			setError(`Formato no soportado. Usá: ${ACCEPTED.join(', ')}`)
			return
		}
		if (incoming.size > MAX_BYTES) {
			setError('El archivo supera los 25 MB')
			return
		}
		if (incoming.size === 0) {
			setError('El archivo está vacío')
			return
		}
		setFile(incoming)
		if (!title) {
			const stem = incoming.name.replace(/\.[^.]+$/, '')
			setTitle(stem.slice(0, 300))
		}
	}

	const onDrop = (e) => {
		e.preventDefault()
		setDrag(false)
		const f = e.dataTransfer?.files?.[0]
		validateAndSet(f)
	}

	const onPickKey = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			inputRef.current?.click()
		}
	}

	const canSubmit =
		!!file && title.trim().length > 0 && title.trim().length <= 300 && !!docType && status !== 'uploading'

	const submit = async () => {
		if (!canSubmit) return
		setStatus('uploading')
		setError('')
		setProgress(0)
		try {
			const data = await ingestDocument({
				file,
				title: title.trim(),
				docType,
				onProgress: setProgress,
			})
			Swal.fire({
				icon: 'success',
				title: 'Documento indexado',
				text: `${data?.chunks ?? '?'} fragmentos generados.`,
				timer: 2000,
				showConfirmButton: false,
			})
			onSuccess?.()
			onClose?.()
		} catch (err) {
			setStatus('error')
			setError(err?.message || 'No se pudo subir el documento')
			setProgress(0)
		}
	}

	const footer = (
		<>
			<Button onClick={onClose} disabled={status === 'uploading'} sx={ghostSx}>
				Cancelar
			</Button>
			<Button onClick={submit} disabled={!canSubmit} sx={primarySx}>
				{status === 'uploading' ? `Subiendo… ${progress}%` : 'Subir documento'}
			</Button>
		</>
	)

	return (
		<ModalShell
			open={open}
			onClose={status === 'uploading' ? undefined : onClose}
			eyebrow='Asistente IA'
			title='Subir documento'
			subtitle='PDF, DOCX, MD o TXT. Máximo 25 MB.'
			maxWidth='560px'
			disableBackdropClose={status === 'uploading'}
			showClose={status !== 'uploading'}
			footer={footer}
		>
			<Box className='space-y-4'>
				{error && status === 'error' && (
					<div
						role='alert'
						className='rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-3 py-2.5 text-[12.5px] text-rose-700 dark:text-rose-200'
					>
						{error}
					</div>
				)}

				{/* DROP ZONE */}
				<div
					tabIndex={0}
					role='button'
					aria-label='Arrastrar archivo o seleccionar'
					onKeyDown={onPickKey}
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => {
						e.preventDefault()
						setDrag(true)
					}}
					onDragLeave={() => setDrag(false)}
					onDrop={onDrop}
					className={[
						'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all px-5 py-7 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#368bed]/60',
						drag
							? 'border-[#368bed] bg-[#368bed]/8'
							: 'border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-white/[0.02] hover:border-[#368bed]/45 hover:bg-[#368bed]/[0.04]',
					].join(' ')}
				>
					<input
						ref={inputRef}
						type='file'
						accept={ACCEPTED.join(',')}
						className='hidden'
						onChange={(e) => validateAndSet(e.target.files?.[0])}
					/>

					{!file ? (
						<div className='flex flex-col items-center'>
							<div className='w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-[#368bed]/25 text-[#1f4e79] dark:text-[#7fb6ef] flex items-center justify-center mb-2.5 shadow-[0_8px_22px_-10px_rgba(54,139,237,0.5)]'>
								<TbCloudUpload size={20} />
							</div>
							<div className='text-[14px] font-medium text-slate-700 dark:text-slate-200'>
								Arrastrá un archivo o{' '}
								<span className='text-[#1f4e79] dark:text-[#7fb6ef] underline underline-offset-2'>
									elegí uno
								</span>
							</div>
							<div className='mt-1 text-[11.5px] text-slate-500 dark:text-slate-400'>
								Formatos: {ACCEPTED.join(' · ')} · hasta 25 MB
							</div>
						</div>
					) : (
						<div className='flex items-center gap-3 text-left'>
							<div className='w-10 h-10 shrink-0 rounded-xl bg-[#368bed]/12 text-[#1f4e79] dark:text-[#7fb6ef] flex items-center justify-center'>
								<TbFile size={18} />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='text-[13.5px] font-medium text-slate-800 dark:text-slate-100 truncate'>
									{file.name}
								</div>
								<div className='text-[11.5px] text-slate-500 dark:text-slate-400 tabular-nums'>
									{formatBytes(file.size)}
								</div>
							</div>
							<button
								type='button'
								onClick={(e) => {
									e.stopPropagation()
									setFile(null)
								}}
								disabled={status === 'uploading'}
								aria-label='Quitar archivo'
								className='shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center disabled:opacity-50'
							>
								<TbX size={13} />
							</button>
						</div>
					)}
				</div>

				{/* TITULO */}
				<div>
					<label className='block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c6aa0] dark:text-[#7fb6ef] mb-1.5'>
						Título
					</label>
					<TextField
						value={title}
						onChange={(e) => setTitle(e.target.value.slice(0, 300))}
						placeholder='Ej: Manual KSB Movitec V20'
						fullWidth
						size='small'
						disabled={status === 'uploading'}
						helperText={`${title.length}/300`}
						FormHelperTextProps={{
							sx: { textAlign: 'right', fontSize: '10.5px', mt: 0.5, mr: 0 },
						}}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '12px' },
						}}
					/>
				</div>

				{/* TIPO */}
				<div>
					<label className='block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2c6aa0] dark:text-[#7fb6ef] mb-1.5'>
						Tipo de documento
					</label>
					<TextField
						select
						value={docType}
						onChange={(e) => setDocType(e.target.value)}
						fullWidth
						size='small'
						disabled={status === 'uploading'}
						placeholder='Elegí un tipo'
						SelectProps={{ displayEmpty: true }}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
					>
						<MenuItem value='' disabled>
							Elegí un tipo
						</MenuItem>
						{UPLOADED_DOC_TYPES.map((t) => (
							<MenuItem key={t.value} value={t.value}>
								{t.label}
							</MenuItem>
						))}
					</TextField>
				</div>

				{/* PROGRESS */}
				{status === 'uploading' && (
					<div className='space-y-1.5'>
						<div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
							<span>Subiendo e indexando…</span>
							<span className='font-mono tabular-nums'>{progress}%</span>
						</div>
						<div className='h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10'>
							<div
								className='h-full bg-gradient-to-r from-[#368bed] to-[#1f4e79] transition-all duration-200'
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}
			</Box>
		</ModalShell>
	)
}

export default UploadDocumentModal
