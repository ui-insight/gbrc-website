import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const API_BASE = '/api/v1/intake'

export function useChat(submissionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const onFormUpdateRef = useRef<((updates: Record<string, any>) => void) | null>(null)

  const setOnFormUpdate = useCallback(
    (handler: (updates: Record<string, any>) => void) => {
      onFormUpdateRef.current = handler
    },
    []
  )

  const loadHistory = useCallback(async () => {
    if (!submissionId) return
    try {
      const res = await fetch(`${API_BASE}/${submissionId}/chat/history`)
      if (res.ok) {
        const data = await res.json()
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }))
        )
      }
    } catch {
      // Silently fail — chat history is optional
    }
  }, [submissionId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!submissionId || !content.trim()) return

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
      }
      setMessages((prev) => [...prev, userMsg])
      setStreaming(true)
      setError(null)

      // Add placeholder assistant message
      const assistantId = `assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ])

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `${API_BASE}/${submissionId}/chat/stream`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content.trim() }),
            signal: controller.signal,
          }
        )

        if (!res.ok) {
          throw new Error(`Chat failed: ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7).trim()
              // Next line should be data
              continue
            }
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6)
              try {
                const data = JSON.parse(dataStr)
                // Determine event type from the data structure
                if ('text' in data) {
                  // Token event
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + data.text }
                        : m
                    )
                  )
                } else if (
                  Object.keys(data).length > 0 &&
                  !('message' in data)
                ) {
                  // Form update event
                  onFormUpdateRef.current?.(data)
                } else if ('message' in data) {
                  // Error event
                  setError(data.message)
                }
              } catch {
                // Skip unparseable data
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setStreaming(false)
        abortRef.current = null
      }
    },
    [submissionId]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    streaming,
    error,
    sendMessage,
    stopStreaming,
    loadHistory,
    setOnFormUpdate,
  }
}
