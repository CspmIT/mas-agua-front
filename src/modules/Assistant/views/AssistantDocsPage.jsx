import { useCallback, useEffect, useMemo, useState } from 'react'
import { Container, IconButton, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { TbCloudUpload, TbArrowLeft } from 'react-icons/tb'
import { FaTrash } from 'react-icons/fa'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import TableCustom from '../../../components/TableCustom'
import { deleteDocument, listDocuments } from '../../../utils/js/assistant'
import { removeData } from '../../../storage/cookies-store'
import { getTypeMeta } from '../utils/docTypes'
import UploadDocumentModal from '../components/UploadDocumentModal'

const handleAuthLogout = async (navigate) => {
	try {
		localStorage.clear()
		await removeData('token')
	} catch (_) {
		/* noop */
	}
	navigate('/login', { replace: true })
}

const AssistantDocsPage = () => {
	const navigate = useNavigate()
	const [docs, setDocs] = useState([])
	const [loading, setLoading] = useState(true)
	const [uploadOpen, setUploadOpen] = useState(false)
	const [pendingEndpoint, setPendingEndpoint] = useState(false)

	const fetchDocs = useCallback(async () => {
		setLoading(true)
		try {
			const list = await listDocuments()
			setDocs(Array.isArray(list) ? list : [])
			setPendingEndpoint(false)
		} catch (err) {
			if (err?.code === 'auth') {
				await handleAuthLogout(navigate)
				return
			}
			if (err?.code === 'not_implemented') {
				setPendingEndpoint(true)
				setDocs([])
				return
			}
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: err?.message || 'No se pudieron cargar los documentos.',
			})
		} finally {
			setLoading(false)
		}
	}, [navigate])

	useEffect(() => {
		fetchDocs()
	}, [fetchDocs])

	const onDelete = async (row) => {
		const confirm = await Swal.fire({
			icon: 'warning',
			title: '¿Eliminar documento?',
			text: `Se borrará "${row.title}" y todos sus fragmentos del índice.`,
			showCancelButton: true,
			confirmButtonText: 'Eliminar',
			cancelButtonText: 'Cancelar',
			confirmButtonColor: '#b91c1c',
		})
		if (!confirm.isConfirmed) return
		try {
			await deleteDocument(row.doc_id)
			Swal.fire({
				icon: 'success',
				title: 'Documento eliminado',
				timer: 1400,
				showConfirmButton: false,
			})
			fetchDocs()
		} catch (err) {
			if (err?.code === 'auth') {
				await handleAuthLogout(navigate)
				return
			}
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: err?.message || 'No se pudo eliminar el documento.',
			})
		}
	}

	const columns = useMemo(
		() => [
			{
				accessorKey: 'title',
				header: 'Título',
				Cell: ({ row }) => (
					<div className='min-w-0'>
						<div className='text-[13.5px] font-medium text-slate-800 dark:text-slate-100 truncate'>
							{row.original.title || row.original.doc_id}
						</div>
						{row.original.filename && (
							<div className='text-[11px] text-slate-500 dark:text-slate-400 truncate'>
								{row.original.filename}
							</div>
						)}
					</div>
				),
			},
			{
				accessorKey: 'doc_type',
				header: 'Tipo',
				size: 160,
				Cell: ({ row }) => {
					const meta = getTypeMeta(row.original.doc_type)
					return (
						<span
							className='inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-[10.5px] font-semibold uppercase tracking-[0.10em]'
							style={{ color: meta.accent, backgroundColor: meta.soft }}
						>
							<span
								className='w-1.5 h-1.5 rounded-full'
								style={{ backgroundColor: meta.accent }}
								aria-hidden
							/>
							{meta.label}
						</span>
					)
				},
			},
			{
				accessorKey: 'uploaded_by',
				header: 'Subido por',
				size: 160,
				Cell: ({ row }) => (
					<span className='text-[12.5px] text-slate-600 dark:text-slate-300'>
						{row.original.uploaded_by || '—'}
					</span>
				),
			},
			{
				accessorKey: 'created_at',
				header: 'Fecha',
				size: 150,
				Cell: ({ row }) => {
					const raw = row.original.created_at
					if (!raw) return <span className='text-slate-400'>—</span>
					const d = dayjs(raw)
					if (!d.isValid()) return <span>{String(raw)}</span>
					return (
						<span className='text-[12.5px] tabular-nums text-slate-600 dark:text-slate-300'>
							{d.format('DD/MM/YYYY HH:mm')}
						</span>
					)
				},
			},
			{
				accessorKey: 'chunks',
				header: 'Fragmentos',
				size: 110,
				Cell: ({ row }) => (
					<span className='inline-flex items-center px-2 h-6 rounded-md text-[11px] font-mono tabular-nums bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/10'>
						{row.original.chunks ?? '—'}
					</span>
				),
			},
			{
				accessorKey: 'actions',
				header: 'Acciones',
				size: 100,
				enableSorting: false,
				Cell: ({ row }) => (
					<Tooltip title='Eliminar documento'>
						<IconButton
							onClick={() => onDelete(row.original)}
							size='small'
							sx={{
								color: '#b91c1c',
								borderRadius: '10px',
								'&:hover': { backgroundColor: 'rgba(244, 63, 94, 0.12)' },
							}}
						>
							<FaTrash size={13} />
						</IconButton>
					</Tooltip>
				),
			},
		],
		[]
	)

	return (
		<Container maxWidth={false} disableGutters className='w-full px-2 sm:px-4 pt-1 pb-2'>
			<Toolbar
				onBack={() => navigate('/assistant')}
				onUpload={() => setUploadOpen(true)}
				count={docs.length}
				pending={pendingEndpoint}
			/>

			{pendingEndpoint && import.meta.env.DEV && <DevPlaceholder />}

			{loading ? (
				<LoaderComponent />
			) : docs.length === 0 && !pendingEndpoint ? (
				<EmptyDocs onCreate={() => setUploadOpen(true)} />
			) : docs.length === 0 ? null : (
				<TableCustom
					columns={columns}
					data={docs}
					topToolbar
					pagination
					pageSize={10}
					sort
					filter={false}
				/>
			)}

			<UploadDocumentModal
				open={uploadOpen}
				onClose={() => setUploadOpen(false)}
				onSuccess={fetchDocs}
			/>
		</Container>
	)
}

const Toolbar = ({ onBack, onUpload, count, pending }) => (
	<div className='flex items-center justify-between gap-2 mb-3 px-1'>
		<div className='flex items-center gap-3 min-w-0'>
			<button
				type='button'
				onClick={onBack}
				aria-label='Volver al chat'
				className='inline-flex items-center gap-2 h-9 pl-2.5 pr-3.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-[12.5px] font-medium text-[#1f4e79] dark:text-[#7fb6ef] shadow-[0_1px_2px_rgba(15,42,68,0.04),0_4px_12px_-6px_rgba(15,42,68,0.18)] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-[#368bed]/35 hover:-translate-y-px transition-all'
			>
				<span className='inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#368bed]/12 text-[#1f4e79] dark:text-[#7fb6ef]'>
					<TbArrowLeft size={12} />
				</span>
				<span>Volver al chat</span>
			</button>
			{!pending && count > 0 && (
				<span className='hidden sm:inline-flex items-center px-2.5 h-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-medium tabular-nums text-slate-600 dark:text-slate-300'>
					{count} {count === 1 ? 'documento' : 'documentos'}
				</span>
			)}
		</div>
		<button
			type='button'
			onClick={onUpload}
			className='inline-flex items-center gap-2 h-9 px-4 rounded-full text-white font-medium tracking-tight text-[13px] shadow-[0_4px_14px_rgba(44,106,160,0.35)] hover:shadow-[0_8px_24px_rgba(44,106,160,0.45)] hover:-translate-y-px transition-all'
			style={{ background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)' }}
		>
			<TbCloudUpload size={15} />
			Subir documento
		</button>
	</div>
)

const DevPlaceholder = () => (
	<div className='mb-4 rounded-2xl border border-amber-300/70 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-4 py-3 text-[12.5px] text-amber-900 dark:text-amber-200'>
		<div className='font-semibold uppercase tracking-[0.14em] text-[10.5px] mb-1'>
			Endpoint pendiente · solo dev
		</div>
		<p>
			El backend Node todavía no expone <code className='font-mono'>GET /api/ai/ingest/documents</code>.
			La pantalla queda lista; cuando el endpoint exista, esta vista carga la lista del tenant.
		</p>
	</div>
)

const EmptyDocs = ({ onCreate }) => (
	<div className='flex flex-col items-center justify-center py-14 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-center'>
		<div className='w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3'>
			<TbCloudUpload size={26} />
		</div>
		<h3 className='text-[15px] font-semibold text-slate-700 dark:text-slate-200'>
			Aún no hay documentos indexados
		</h3>
		<p className='mt-1 text-[13px] text-slate-500 dark:text-slate-400 max-w-sm'>
			Subí manuales, procedimientos o fichas técnicas para que el asistente pueda citarlos en sus
			respuestas.
		</p>
		<button
			type='button'
			onClick={onCreate}
			className='mt-3 inline-flex items-center gap-2 h-9 px-4 rounded-full text-white text-[12.5px] font-medium tracking-tight shadow-[0_4px_14px_rgba(44,106,160,0.35)] hover:shadow-[0_8px_24px_rgba(44,106,160,0.45)] hover:-translate-y-px transition-all'
			style={{ background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)' }}
		>
			<TbCloudUpload size={14} />
			Subir el primero
		</button>
	</div>
)

export default AssistantDocsPage
