import { ClipboardList, MessageCircle } from 'lucide-react'

interface DualModeToggleProps {
  mode: 'form' | 'chat'
  onToggle: (mode: 'form' | 'chat') => void
}

export default function DualModeToggle({ mode, onToggle }: DualModeToggleProps) {
  return (
    <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
      <button
        onClick={() => onToggle('form')}
        className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'form'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        Manual Form
      </button>
      <button
        onClick={() => onToggle('chat')}
        className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'chat'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        AI Assistant
      </button>
    </div>
  )
}
