import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendChat } from '../../../utils/js/assistant'
import { removeData } from '../../../storage/cookies-store'

/**
 * Mensaje del chat. Tres formas:
 *  - { id, role: 'user', content }
 *  - { id, role: 'assistant', content, sources, toolCalls }
 *  - { id, role: 'assistant', status: 'pending'|'error', error?, retryOf, question, enableTools }
 */

let _id = 0
const nextId = () => `m-${++_id}`

const logout = async (navigate) => {
	try {
		localStorage.clear()
		await removeData('token')
	} catch (_) {
		/* noop: el flujo de login limpia el resto */
	}
	navigate('/login', { replace: true })
}

/**
 * @param {{ enableTools?: boolean }} [opts]
 */
export const useAssistantChat = ({ enableTools: initialTools = false } = {}) => {
	const navigate = useNavigate()
	const [messages, setMessages] = useState([])
	const [enableTools, setEnableTools] = useState(initialTools)
	const [isSending, setIsSending] = useState(false)
	const inflight = useRef(null) // AbortController activo

	const replaceMessage = useCallback((id, patch) => {
		setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
	}, [])

	const submit = useCallback(
		async ({ question, enableTools: tools, retryOf }) => {
			const trimmed = question.trim()
			if (!trimmed) return
			if (inflight.current) inflight.current.abort()

			const userMsg = retryOf
				? null
				: { id: nextId(), role: 'user', content: trimmed }
			const pendingId = retryOf || nextId()
			const pendingMsg = {
				id: pendingId,
				role: 'assistant',
				status: 'pending',
				question: trimmed,
				enableTools: !!tools,
			}

			setMessages((prev) => {
				if (retryOf) {
					return prev.map((m) =>
						m.id === retryOf ? { ...pendingMsg, retryOf } : m
					)
				}
				return [...prev, userMsg, pendingMsg]
			})

			const ctl = new AbortController()
			inflight.current = ctl
			setIsSending(true)
			try {
				const data = await sendChat({
					question: trimmed,
					enableTools: !!tools,
					signal: ctl.signal,
				})
				replaceMessage(pendingId, {
					status: undefined,
					error: undefined,
					content: data.answer,
					sources: data.sources,
					toolCalls: data.tool_calls,
					question: undefined,
				})
			} catch (err) {
				if (err?.code === 'cancelled') return
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				replaceMessage(pendingId, {
					status: 'error',
					error: err?.message || 'Error desconocido',
					errorCode: err?.code || 'unknown',
				})
			} finally {
				if (inflight.current === ctl) inflight.current = null
				setIsSending(false)
			}
		},
		[navigate, replaceMessage]
	)

	const sendQuestion = useCallback(
		(text, opts = {}) => submit({ question: text, enableTools: opts.enableTools ?? enableTools }),
		[submit, enableTools]
	)

	const retryMessage = useCallback(
		(id) => {
			setMessages((prev) => {
				const target = prev.find((m) => m.id === id)
				if (!target || !target.question) return prev
				submit({
					question: target.question,
					enableTools: target.enableTools,
					retryOf: id,
				})
				return prev
			})
		},
		[submit]
	)

	const clearChat = useCallback(() => {
		if (inflight.current) inflight.current.abort()
		setMessages([])
	}, [])

	const toggleTools = useCallback((next) => {
		setEnableTools((cur) => (typeof next === 'boolean' ? next : !cur))
	}, [])

	return {
		messages,
		enableTools,
		isSending,
		sendQuestion,
		retryMessage,
		clearChat,
		toggleTools,
	}
}
