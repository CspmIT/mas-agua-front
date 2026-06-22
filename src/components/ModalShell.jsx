import { Modal, Box, IconButton, Fade } from '@mui/material'
import { Close } from '@mui/icons-material'
import { createPortal } from 'react-dom'

const ModalShell = ({
	open,
	onClose,
	title,
	eyebrow,
	subtitle,
	children,
	footer,
	maxWidth = '90vw',
	showClose = true,
	disableBackdropClose = false,
}) => {
	if (!open) return null

	const handleBackdrop = (_, reason) => {
		if (disableBackdropClose && reason === 'backdropClick') return
		onClose?.()
	}

	return createPortal(
		<Modal
			open={open}
			onClose={handleBackdrop}
			closeAfterTransition
			slotProps={{
				backdrop: {
					sx: {
						backgroundColor: 'rgba(15, 23, 42, 0.65)',
						backdropFilter: 'blur(4px)',
					},
				},
			}}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: { xs: 1, sm: 2 },
			}}
		>
			<Fade in={open} timeout={280}>
				<Box
					sx={{
						position: 'relative',
						width: '100%',
						maxWidth,
						maxHeight: '94vh',
						display: 'flex',
						flexDirection: 'column',
						bgcolor: '#ffffff',
						borderRadius: '16px',
						overflow: 'hidden',
						boxShadow:
							'0 10px 30px rgba(15, 42, 68, 0.2), 0 25px 60px -20px rgba(15, 42, 68, 0.3)',
						opacity: 0,
						transform: 'translateY(12px) scale(0.985)',
						animation: 'modalShellIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards',
						outline: 'none',
						'@keyframes modalShellIn': {
							'0%': { opacity: 0, transform: 'translateY(12px) scale(0.985)' },
							'100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
						},
						'body.dark &': {
							bgcolor: 'rgba(17, 24, 39, 0.98)',
							boxShadow:
								'0 10px 30px rgba(0, 0, 0, 0.5), 0 25px 60px -20px rgba(0, 0, 0, 0.7)',
						},
					}}
				>
					{/* HEADER */}
					<Box
						sx={{
							backgroundColor: '#2c6aa0',
							color: '#ffffff',
							px: { xs: 2, sm: 2.5 },
							py: 1.25,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 2,
							flexShrink: 0,
							borderBottom: '1px solid rgba(255,255,255,0.08)',
							'body.dark &': { backgroundColor: '#1f4e79' },
						}}
					>
						<div className='min-w-0 flex-1'>
							{eyebrow && (
								<div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 mb-0.5'>
									{eyebrow}
								</div>
							)}
							{title && (
								<h2 className='text-lg sm:text-xl font-semibold tracking-tight text-white truncate'>
									{title}
								</h2>
							)}
							{subtitle && <p className='mt-0.5 text-xs text-white/75'>{subtitle}</p>}
						</div>
						{showClose && (
							<IconButton
								onClick={onClose}
								aria-label='Cerrar'
								sx={{
									color: '#ffffff',
									backgroundColor: 'rgba(255,255,255,0.1)',
									width: 34,
									height: 34,
									flexShrink: 0,
									transition: 'background-color 0.15s, transform 0.25s',
									'&:hover': {
										backgroundColor: 'rgba(255,255,255,0.22)',
										transform: 'rotate(90deg)',
									},
								}}
							>
								<Close sx={{ fontSize: 18 }} />
							</IconButton>
						)}
					</Box>

					{/* BODY */}
					<Box
						sx={{
							flex: 1,
							overflow: 'auto',
							px: { xs: 1.75, sm: 2.25 },
							py: { xs: 1.5, sm: 1.75 },
							backgroundColor: '#ffffff',
							'body.dark &': { backgroundColor: 'transparent' },
						}}
					>
						{children}
					</Box>

					{/* FOOTER */}
					{footer && (
						<Box
							sx={{
								flexShrink: 0,
								px: { xs: 2, sm: 2.5 },
								py: 1.25,
								backgroundColor: '#f8fafc',
								borderTop: '1px solid rgba(15, 42, 68, 0.08)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
								gap: 1.5,
								flexWrap: 'wrap',
								'body.dark &': {
									backgroundColor: 'rgba(31, 41, 55, 0.6)',
									borderTop: '1px solid rgba(255,255,255,0.06)',
								},
							}}
						>
							{footer}
						</Box>
					)}
				</Box>
			</Fade>
		</Modal>,
		document.body
	)
}

export default ModalShell
