import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	sendChat,
	sendChatStream,
	listConversations as apiListConversations,
	getConversation as apiGetConversation,
	deleteConversation as apiDeleteConversation,
	renameConversation as apiRenameConversation,
} from '../../../utils/js/assistant'
import { removeData } from '../../../storage/cookies-store'

const CONVERSATIONS_PAGE_SIZE = 20

/**
 * Mensaje del chat. Formas:
 *  - { id, role: 'user', content }
 *  - { id, role: 'assistant', content, sources, toolCalls, artifacts, traceId }
 *  - { id, role: 'assistant', status: 'pending', question, enableTools }
 *  - { id, role: 'assistant', status: 'streaming', content, artifacts, progress, traceId, question, enableTools }
 *  - { id, role: 'assistant', status: 'error', error, retryOf, question, enableTools }
 */

/**
 * Streaming on/off. Hardcoded a true porque el endpoint /ai/chat/stream del
 * gateway ya está desplegado. Si en algún momento hace falta volver al
 * comportamiento legacy (response única), cambiar esta constante a false:
 * el resto del flujo funciona idéntico.
 */
const USE_STREAMING = true

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

const TOOL_LABELS = {
	find_variable: { loading: 'Buscando variables…', done: 'Variables encontradas' },
	get_metric: { loading: 'Consultando valor actual…', done: 'Valor actual obtenido' },
	get_metric_history: { loading: 'Consultando histórico…', done: 'Histórico obtenido' },
}

const formatToolSummary = (name, summary) => {
	const fallback = TOOL_LABELS[name]?.done || `${name} completado`
	if (!summary) return fallback
	if (summary.error) {
		return `Error en ${name}: ${summary.error}`
	}
	if (name === 'find_variable') {
		const count = summary.count ?? 0
		if (count === 0) return 'No encontré variables que coincidan'
		if (count === 1) return 'Encontré 1 variable'
		return `Encontré ${count} variables candidatas`
	}
	if (name === 'get_metric_history') {
		const count = summary.count ?? 0
		return count > 0 ? `Histórico obtenido (${count} puntos)` : 'Histórico obtenido'
	}
	return fallback
}

export const useAssistantChat = () => {
	const navigate = useNavigate()
	const [messages, setMessages] = useState([])
	const [isSending, setIsSending] = useState(false)
	const inflight = useRef(null) // AbortController activo
	// Guard síncrono contra doble-fire de submit (doble-click, Ctrl+Enter
	// repetido, StrictMode). `isSending` viene de useState, no se actualiza
	// hasta el próximo render; este ref se setea/limpia inmediatamente.
	const submittingRef = useRef(false)

	// Sidebar de conversaciones
	const [conversations, setConversations] = useState([])
	const [conversationsHasMore, setConversationsHasMore] = useState(false)
	const [currentConversationId, setCurrentConversationId] = useState(null)
	const [loadingHistory, setLoadingHistory] = useState(false)
	// Ref para que callbacks de streaming siempre lean el id activo más reciente
	// sin depender de cierres con valores stale.
	const currentConversationIdRef = useRef(null)
	useEffect(() => {
		currentConversationIdRef.current = currentConversationId
	}, [currentConversationId])

	const bumpConversationToTop = useCallback((id) => {
		setConversations((prev) => {
			const idx = prev.findIndex((c) => c.id === id)
			if (idx < 0) return prev
			const updated = {
				...prev[idx],
				lastMessageAt: new Date().toISOString(),
				messageCount: (prev[idx].messageCount || 0) + 2,
			}
			return [updated, ...prev.filter((_, i) => i !== idx)]
		})
	}, [])

	const upsertConversationToTop = useCallback((conv) => {
		setConversations((prev) => {
			const filtered = prev.filter((c) => c.id !== conv.id)
			return [conv, ...filtered]
		})
	}, [])

	const replaceMessage = useCallback((id, patch) => {
		setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
	}, [])

	// Patch funcional: recibe el mensaje actual y devuelve los cambios.
	// Necesario en streaming porque el patch depende del estado previo
	// (acumular tokens, marcar el último chip loading como done, etc.) y
	// puede haber múltiples eventos dentro del mismo tick de React.
	const patchMessage = useCallback((id, updater) => {
		setMessages((prev) =>
			prev.map((m) => (m.id === id ? { ...m, ...updater(m) } : m))
		)
	}, [])

	const runStreaming = useCallback(
		async ({ trimmed, tools, pendingId, ctl, isRetry }) => {
			let receivedAny = false
			// Snapshot del id al momento de submit. Si era null y el back asigna
			// uno via conversation_assigned, lo guardamos acá también para que
			// el bump del sidebar en `done` use el id correcto.
			let activeConvId = currentConversationIdRef.current
			let wasNewConversation = activeConvId == null
			await sendChatStream({
				question: trimmed,
				enableTools: tools,
				conversationId: activeConvId,
				isRetry: !!isRetry,
				signal: ctl.signal,

				onConversationAssigned: ({ conversationId }) => {
					if (!conversationId || activeConvId) return
					activeConvId = conversationId
					setCurrentConversationId(conversationId)
					upsertConversationToTop({
						id: conversationId,
						title: trimmed.slice(0, 60),
						messageCount: 1,
						lastMessageAt: new Date().toISOString(),
						createdAt: new Date().toISOString(),
					})
				},

				onStarted: ({ trace_id }) => {
					receivedAny = true
					patchMessage(pendingId, () => ({
						status: 'streaming',
						content: '',
						artifacts: [],
						progress: [{ id: 'started', label: 'Pensando…', loading: true }],
						traceId: trace_id || null,
					}))
				},

				onRagDone: ({ sources_count }) => {
					const label =
						sources_count > 0
							? `Encontré ${sources_count} ${sources_count === 1 ? 'resultado' : 'resultados'} en la documentación`
							: 'Sin coincidencias en la documentación'
					patchMessage(pendingId, (m) => {
						const progress = m.progress ? [...m.progress] : []
						// Marcar el "Pensando…" como done.
						for (let i = progress.length - 1; i >= 0; i--) {
							if (progress[i].id === 'started') {
								progress[i] = { ...progress[i], label: 'Búsqueda iniciada', loading: false }
								break
							}
						}
						progress.push({ id: `rag-${progress.length}`, label, loading: false })
						return { progress }
					})
				},

				onToolCallStart: ({ name }) => {
					const label = TOOL_LABELS[name]?.loading || `Ejecutando ${name}…`
					patchMessage(pendingId, (m) => {
						const progress = m.progress ? [...m.progress] : []
						progress.push({
							id: `tool-${name}-${progress.length}`,
							label,
							loading: true,
							tool: name,
						})
						return { progress }
					})
				},

				onToolCallEnd: ({ name, summary }) => {
					patchMessage(pendingId, (m) => {
						const progress = m.progress ? [...m.progress] : []
						// Marcar el último chip loading del mismo tool como completado.
						for (let i = progress.length - 1; i >= 0; i--) {
							if (progress[i].tool === name && progress[i].loading) {
								progress[i] = {
									...progress[i],
									label: formatToolSummary(name, summary),
									loading: false,
									error: !!summary?.error,
								}
								break
							}
						}
						return { progress }
					})
				},

				onArtifact: (artifact) => {
					patchMessage(pendingId, (m) => ({
						artifacts: [...(m.artifacts || []), artifact],
					}))
				},

				onToken: ({ text }) => {
					if (!text) return
					patchMessage(pendingId, (m) => ({
						content: (m.content || '') + text,
					}))
				},

				onError: ({ message }) => {
					// Error recuperable: chip rojo, el stream puede seguir.
					patchMessage(pendingId, (m) => ({
						progress: [
							...(m.progress || []),
							{
								id: `err-${Date.now()}`,
								label: message || 'Hubo un problema',
								loading: false,
								error: true,
							},
						],
					}))
				},

				onDone: ({ trace_id, sources }) => {
					patchMessage(pendingId, (m) => ({
						status: undefined,
						error: undefined,
						content: m.content || '',
						sources: Array.isArray(sources) ? sources : [],
						traceId: trace_id || m.traceId || null,
						// Se conserva `progress` para auditoría visual; el bubble decide si mostrarlo.
					}))
					// Bumpear la conversación al tope del sidebar y actualizar metadata.
					// Si era nueva, conversation_assigned ya la insertó con messageCount: 1
					// (el user); acá sumamos +1 (el assistant). Si era existente, sumamos
					// +2 (user + assistant) porque no se tocó el contador antes.
					if (activeConvId) {
						const delta = wasNewConversation ? 1 : 2
						setConversations((prev) => {
							const idx = prev.findIndex((c) => c.id === activeConvId)
							if (idx < 0) return prev
							const updated = {
								...prev[idx],
								lastMessageAt: new Date().toISOString(),
								messageCount: (prev[idx].messageCount || 0) + delta,
							}
							return [updated, ...prev.filter((_, i) => i !== idx)]
						})
					}
				},
			})
			return receivedAny
		},
		[patchMessage, upsertConversationToTop]
	)

	const submit = useCallback(
		async ({ question, enableTools: tools, retryOf }) => {
			const trimmed = question.trim()
			if (!trimmed) return
			// Doble-click / doble-evento: si ya hay un submit en vuelo, ignorar.
			// El back persiste el user msg antes de llamar al AI service; sin este
			// guard, dos clicks rápidos crean dos mensajes (y dos conversaciones).
			if (submittingRef.current) return
			submittingRef.current = true
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
				if (USE_STREAMING) {
					await runStreaming({ trimmed, tools: !!tools, pendingId, ctl, isRetry: !!retryOf })
				} else {
					const snapshotConvId = currentConversationIdRef.current
					const wasNewConversation = snapshotConvId == null
					const data = await sendChat({
						question: trimmed,
						enableTools: !!tools,
						conversationId: snapshotConvId,
						isRetry: !!retryOf,
						signal: ctl.signal,
					})
					replaceMessage(pendingId, {
						status: undefined,
						error: undefined,
						content: data.answer,
						sources: data.sources,
						toolCalls: data.tool_calls,
						traceId: data.trace_id,
						artifacts: data.artifacts,
					})
					// Actualizar metadata del sidebar.
					if (wasNewConversation && data.conversationId != null) {
						setCurrentConversationId(data.conversationId)
						upsertConversationToTop({
							id: data.conversationId,
							title: trimmed.slice(0, 60),
							messageCount: 2,
							lastMessageAt: new Date().toISOString(),
							createdAt: new Date().toISOString(),
						})
					} else if (snapshotConvId != null) {
						bumpConversationToTop(snapshotConvId)
					}
				}
			} catch (err) {
				if (err?.code === 'cancelled') return
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				// Si el stream alcanzó a recibir contenido parcial, lo conservamos
				// y marcamos error encima para que el usuario no pierda la
				// salida visible. Si no recibimos nada, mostramos el error puro.
				patchMessage(pendingId, (m) => ({
					status: 'error',
					error: err?.message || 'Error desconocido',
					errorCode: err?.code || 'unknown',
					// content/artifacts/progress quedan tal cual estaban.
				}))
			} finally {
				if (inflight.current === ctl) inflight.current = null
				submittingRef.current = false
				setIsSending(false)
			}
		},
		[navigate, replaceMessage, patchMessage, runStreaming, upsertConversationToTop, bumpConversationToTop]
	)

	// enableTools siempre true: el LLM decide internamente si usa las tools
	// según la pregunta. El toggle del UI se eliminó porque generaba confusión
	// en los operadores. El gateway sigue aceptando el flag, así que reactivar
	// la opción es restaurar el control y pasar el valor por acá.
	const sendQuestion = useCallback(
		(text) => submit({ question: text, enableTools: true }),
		[submit]
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

	// ── Acciones del sidebar de conversaciones ──────────────────────────────
	// Mantenemos una ref con la lista para que loadConversations({ append: true })
	// pueda computar el cursor sin agregar `conversations` a sus deps (lo cual
	// invalidaría todos los callbacks dependientes en cada cambio del sidebar).
	const conversationsRef = useRef([])
	useEffect(() => {
		conversationsRef.current = conversations
	}, [conversations])

	const loadConversations = useCallback(
		async ({ append = false } = {}) => {
			try {
				const beforeId = append && conversationsRef.current.length > 0
					? conversationsRef.current[conversationsRef.current.length - 1].id
					: null
				const { conversations: rows, hasMore } = await apiListConversations({
					limit: CONVERSATIONS_PAGE_SIZE,
					beforeId,
				})
				setConversations((prev) => (append ? [...prev, ...rows] : rows))
				setConversationsHasMore(hasMore)
			} catch (err) {
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				console.error('[useAssistantChat] Error cargando conversaciones:', err)
			}
		},
		[navigate]
	)

	const selectConversation = useCallback(
		async (id) => {
			if (id === currentConversationIdRef.current) return
			if (inflight.current) inflight.current.abort()
			setLoadingHistory(true)
			try {
				const { id: convId, messages: rawMsgs } = await apiGetConversation(id)
				// El back devuelve los mensajes en camelCase. Mantener el shape
				// que esperan los componentes (MessageBubble, ArtifactRenderer, etc.)
				// y NO setear `status` en mensajes históricos: todos están finalizados.
				const restored = rawMsgs.map((m) => ({
					id: String(m.id),
					role: m.role,
					content: m.content || '',
					artifacts: Array.isArray(m.artifacts) ? m.artifacts : [],
					sources: Array.isArray(m.sources) ? m.sources : [],
					toolCalls: Array.isArray(m.toolCalls) ? m.toolCalls : [],
					traceId: m.traceId || null,
				}))
				setMessages(restored)
				setCurrentConversationId(convId)
			} catch (err) {
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				console.error('[useAssistantChat] Error cargando conversación:', err)
			} finally {
				setLoadingHistory(false)
			}
		},
		[navigate]
	)

	// "Nueva conversación" — limpia el chat y deja currentConversationId en null.
	// En el próximo sendMessage, el back crea la conversación y devuelve el id
	// (sync) o lo emite via conversation_assigned (stream).
	const startNewConversation = useCallback(() => {
		if (inflight.current) inflight.current.abort()
		setMessages([])
		setCurrentConversationId(null)
	}, [])

	const removeConversation = useCallback(
		async (id) => {
			try {
				await apiDeleteConversation(id)
				setConversations((prev) => prev.filter((c) => c.id !== id))
				if (id === currentConversationIdRef.current) {
					setMessages([])
					setCurrentConversationId(null)
				}
			} catch (err) {
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				console.error('[useAssistantChat] Error eliminando conversación:', err)
				throw err
			}
		},
		[navigate]
	)

	const renameConversationTitle = useCallback(
		async (id, newTitle) => {
			try {
				const updated = await apiRenameConversation(id, newTitle)
				setConversations((prev) =>
					prev.map((c) => (c.id === id ? { ...c, title: updated?.title ?? newTitle } : c))
				)
			} catch (err) {
				if (err?.code === 'auth') {
					await logout(navigate)
					return
				}
				console.error('[useAssistantChat] Error renombrando:', err)
				throw err
			}
		},
		[navigate]
	)

	// Carga inicial: traer la lista la primera vez que se monta el hook.
	useEffect(() => {
		loadConversations()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		// Estado del chat
		messages,
		isSending,
		// Estado del sidebar
		conversations,
		conversationsHasMore,
		currentConversationId,
		loadingHistory,
		// Acciones del chat
		sendQuestion,
		retryMessage,
		clearChat,
		// Acciones del sidebar
		loadConversations,
		selectConversation,
		startNewConversation,
		removeConversation,
		renameConversationTitle,
	}
}
