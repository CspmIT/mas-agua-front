import { Box, Button, CircularProgress } from '@mui/material'
import { FaWindows, FaLinux } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { getDesktopDownloads } from '../../utils/getDesktopDownloads'
import ModalShell from '../../../../components/ModalShell'

const sectionBoxSx = {
	backgroundColor: 'transparent',
	border: '1px solid rgba(15, 42, 68, 0.06)',
	borderRadius: '10px',
	p: { xs: 1.25, sm: 1.5 },
	'body.dark &': {
		border: '1px solid rgba(255, 255, 255, 0.06)',
	},
}

const primaryButtonSx = {
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	color: '#ffffff',
	textTransform: 'none',
	fontWeight: 600,
	px: 2.5,
	py: 0.75,
	borderRadius: '999px',
	boxShadow: '0 6px 14px -6px rgba(31, 78, 121, 0.55)',
	transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		transform: 'translateY(-1px)',
		boxShadow: '0 10px 22px -8px rgba(31, 78, 121, 0.65)',
		filter: 'brightness(1.03)',
	},
	'&.Mui-disabled': {
		background: 'linear-gradient(135deg, #6b8faf 0%, #547394 100%)',
		color: 'rgba(255, 255, 255, 0.8)',
	},
}

const secondaryButtonSx = {
	color: '#475569',
	borderColor: 'rgba(15, 42, 68, 0.2)',
	textTransform: 'none',
	fontWeight: 500,
	px: 2,
	py: 0.75,
	borderRadius: '999px',
	'&:hover': {
		borderColor: 'rgba(15, 42, 68, 0.35)',
		backgroundColor: 'rgba(15, 42, 68, 0.06)',
	},
	'body.dark &': {
		color: '#cbd5e1',
		borderColor: 'rgba(255,255,255,0.2)',
		'&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
	},
}

function SectionHeader({ icon: Icon, title, badge }) {
	return (
		<div className='flex items-center gap-2 mb-1.5'>
			<Icon className='text-slate-500 dark:text-gray-400 shrink-0' size={15} />
			<span className='text-sm font-semibold text-slate-800 dark:text-gray-100 leading-tight'>
				{title}
			</span>
			{badge && (
				<span className='ml-auto whitespace-nowrap text-[10px] font-semibold text-[#2c6aa0] bg-[#2c6aa0]/10 border border-[#2c6aa0]/20 rounded-full px-2 py-[2px]'>
					{badge}
				</span>
			)}
		</div>
	)
}

const DesktopDownloadModal = ({ open, onClose }) => {
	const [downloads, setDownloads] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!open) return

		setLoading(true)
		getDesktopDownloads()
			.then(setDownloads)
			.finally(() => setLoading(false))
	}, [open])

	return (
		<ModalShell
			open={open}
			onClose={onClose}
			eyebrow='Versión de escritorio'
			title='Descargar Mas Agua'
			subtitle={downloads?.version ? `Versión ${downloads.version}` : undefined}
			maxWidth='560px'
		>
			{loading && (
				<Box textAlign='center' py={4}>
					<CircularProgress sx={{ color: '#2c6aa0' }} />
				</Box>
			)}

			{!loading && downloads && (
				<div className='flex flex-col sm:flex-row gap-3'>
					{/* Windows */}
					<Box
						sx={{
							...sectionBoxSx,
							flex: 1,
							minWidth: 0,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<SectionHeader icon={FaWindows} title='Windows' />
						<p className='text-[11px] text-slate-500 dark:text-gray-400 mb-3'>
							Instalador ejecutable (.exe)
						</p>
						<Button
							fullWidth
							sx={{ ...primaryButtonSx, mt: 'auto' }}
							href={downloads.windows?.browser_download_url}
							disabled={!downloads.windows}
						>
							Descargar
						</Button>
					</Box>

					{/* Linux */}
					<Box
						sx={{
							...sectionBoxSx,
							flex: 1,
							minWidth: 0,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<SectionHeader icon={FaLinux} title='Linux' badge='Recomendado' />
						<p className='text-[11px] text-slate-500 dark:text-gray-400 mb-3'>
							AppImage portable o paquete .deb
						</p>
						<Button
							fullWidth
							sx={{ ...primaryButtonSx, mt: 'auto' }}
							href={downloads.appImage?.browser_download_url}
							disabled={!downloads.appImage}
						>
							Descargar AppImage
						</Button>
						<Button
							fullWidth
							variant='outlined'
							sx={{ ...secondaryButtonSx, mt: 1 }}
							href={downloads.deb?.browser_download_url}
							disabled={!downloads.deb}
						>
							Descargar .deb
						</Button>
					</Box>
				</div>
			)}
		</ModalShell>
	)
}

export default DesktopDownloadModal
