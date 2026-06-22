import { useState } from 'react'
import { Box, Button, IconButton, TextField, Tooltip } from '@mui/material'
import { TbThumbUp, TbThumbDown, TbCheck } from 'react-icons/tb'
import ModalShell from '../../../components/ModalShell'
import { sendFeedback } from '../../../utils/js/assistant'

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

const iconSx = (active, color) => ({
	width: 30,
	height: 30,
	color: active ? color : '#94a3b8',
	transition: 'all 0.18s',
	'&:hover:not(.Mui-disabled)': {
		color,
		backgroundColor: `${color}14`,
		transform: 'translateY(-1px)',
	},
	'&.Mui-disabled': { opacity: 0.5 },
})

/**
 * Pulgar arriba / pulgar abajo al pie de cada respuesta del asistente.
 *
 * @param {{
 *   assistantMessage: {
 *     id: string,
 *     question?: string,
 *     content: string,
 *     sources?: any[],
 *     toolCalls?: any[],
 *     traceId?: string|null,
 *   },
 *   onFeedbackSent?: (rating: 'positive'|'negative') => void,
 * }} props
 */
const FeedbackButtons = ({ assistantMessage, onFeedbackSent }) => {
	const [sent, setSent] = useState(null)
	const [modalOpen, setModalOpen] = useState(false)
	const [expected, setExpected] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState(null)

	const submitFeedback = async (rating, expectedAnswer = null) => {
		setSubmitting(true)
		setError(null)
		try {
			await sendFeedback({
				question: assistantMessage.question || '',
				answer: assistantMessage.content,
				rating,
				expectedAnswer,
				sources: assistantMessage.sources || null,
				toolCalls: assistantMessage.toolCalls || null,
				traceId: assistantMessage.traceId || null,
			})
			setSent(rating)
			setModalOpen(false)
			setExpected('')
			onFeedbackSent?.(rating)
		} catch (err) {
			setError(err?.message || 'No se pudo enviar el feedback')
		} finally {
			setSubmitting(false)
		}
	}

	const handleThumbsUp = () => {
		if (sent || submitting) return
		submitFeedback('positive', null)
	}

	const handleThumbsDown = () => {
		if (sent || submitting) return
		setError(null)
		setModalOpen(true)
	}

	const closeModal = () => {
		if (submitting) return
		setModalOpen(false)
		setError(null)
	}

	if (sent) {
		const isPositive = sent === 'positive'
		return (
			<div
				className='mt-2 inline-flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 italic'
				role='status'
			>
				<TbCheck size={13} className={isPositive ? 'text-[#10B981]' : 'text-[#368bed]'} />
				<span>
					{isPositive
						? 'Gracias por tu feedback'
						: 'Feedback registrado, vamos a mejorar'}
				</span>
			</div>
		)
	}

	const expectedLen = expected.length
	const EXPECTED_MAX = 4000

	const modalFooter = (
		<>
			<Button onClick={() => submitFeedback('negative', null)} disabled={submitting} sx={ghostSx}>
				Saltar
			</Button>
			<Button
				onClick={() => submitFeedback('negative', expected.trim() || null)}
				disabled={submitting}
				sx={primarySx}
			>
				{submitting ? 'Enviando…' : 'Enviar'}
			</Button>
		</>
	)

	return (
		<>
			<div className='mt-2 flex items-center gap-1'>
				<Tooltip title='Esta respuesta me sirvió'>
					<span>
						<IconButton
							onClick={handleThumbsUp}
							disabled={submitting}
							aria-label='Respuesta útil'
							sx={iconSx(false, '#10B981')}
						>
							<TbThumbUp size={15} />
						</IconButton>
					</span>
				</Tooltip>
				<Tooltip title='Esta respuesta no me sirvió'>
					<span>
						<IconButton
							onClick={handleThumbsDown}
							disabled={submitting}
							aria-label='Respuesta no útil'
							sx={iconSx(false, '#ef4444')}
						>
							<TbThumbDown size={15} />
						</IconButton>
					</span>
				</Tooltip>
				{error && (
					<span className='ml-2 text-[12px] text-rose-600 dark:text-rose-300'>{error}</span>
				)}
			</div>

			<ModalShell
				open={modalOpen}
				onClose={closeModal}
				eyebrow='Asistente IA'
				title='¿Qué esperabas?'
				subtitle='Opcional. Contanos qué respuesta esperabas o por qué no te sirvió. Esta información se usa para mejorar el asistente.'
				maxWidth='520px'
				disableBackdropClose={submitting}
				showClose={!submitting}
				footer={modalFooter}
			>
				<Box className='space-y-3'>
					{error && (
						<div
							role='alert'
							className='rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-3 py-2.5 text-[12.5px] text-rose-700 dark:text-rose-200'
						>
							{error}
						</div>
					)}
					<TextField
						value={expected}
						onChange={(e) => setExpected(e.target.value.slice(0, EXPECTED_MAX))}
						placeholder='Ej: esperaba que me sugiriera MultipleBooleanChart en lugar de BoardChart…'
						multiline
						rows={4}
						fullWidth
						autoFocus
						disabled={submitting}
						helperText={`${expectedLen}/${EXPECTED_MAX}`}
						FormHelperTextProps={{
							sx: { textAlign: 'right', fontSize: '10.5px', mt: 0.5, mr: 0 },
						}}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
					/>
				</Box>
			</ModalShell>
		</>
	)
}

export default FeedbackButtons
