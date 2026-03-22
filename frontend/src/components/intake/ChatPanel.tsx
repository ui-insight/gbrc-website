import { useState, useRef, useEffect } from 'react'
import { Send, Square, Bot, User } from 'lucide-react'
import type { ChatMessage } from '../../hooks/useChat'

interface ChatPanelProps {
  messages: ChatMessage[]
  streaming: boolean
  error: string | null
  onSend: (content: string) => void
  onStop: () => void
}

export default function ChatPanel({
  messages,
  streaming,
  error,
  onSend,
  onStop,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !streaming) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-neutral-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-uidaho-gold" />
          <span className="text-sm font-semibold text-neutral-900">
            GBRC Intake Assistant
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Describe your project and I'll help fill out the intake form
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="text-center text-neutral-400 text-sm py-8">
            <Bot className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
            <p>Hi! Tell me about your genomics project and I'll help guide you through the intake process.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-uidaho-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-neutral-900" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-neutral-900 text-white rounded-br-sm'
                  : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && streaming && msg.content === '' && (
                <span className="inline-block w-2 h-4 bg-uidaho-gold animate-pulse ml-0.5" />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-neutral-600" />
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project..."
            rows={2}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uidaho-gold focus:border-transparent text-sm resize-none"
          />
          {streaming ? (
            <button
              onClick={onStop}
              className="self-end px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="self-end px-3 py-2 bg-uidaho-gold text-neutral-900 rounded-md hover:bg-uidaho-gold-dark transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
