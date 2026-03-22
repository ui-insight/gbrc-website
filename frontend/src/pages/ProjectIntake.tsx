import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import IntakeWizard from '../components/intake/IntakeWizard'
import ChatPanel from '../components/intake/ChatPanel'
import DualModeToggle from '../components/intake/DualModeToggle'
import { useIntakeForm } from '../hooks/useIntakeForm'
import { useChat } from '../hooks/useChat'

export default function ProjectIntake() {
  const form = useIntakeForm()
  const chat = useChat(form.state.submissionId)
  const [mode, setMode] = useState<'form' | 'chat'>('form')

  // Connect chat form updates to the wizard
  useEffect(() => {
    chat.setOnFormUpdate(form.applyAIUpdates)
  }, [chat.setOnFormUpdate, form.applyAIUpdates])

  // Load chat history when submission exists
  useEffect(() => {
    if (form.state.submissionId) {
      chat.loadHistory()
    }
  }, [form.state.submissionId, chat.loadHistory])

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ClipboardList className="w-12 h-12 text-uidaho-gold mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Project Intake</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Tell us about your genomics or bioinformatics project. Fill out the form
            manually or chat with our AI assistant to get started.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: toggle between form and chat */}
          <div className="lg:hidden">
            <DualModeToggle mode={mode} onToggle={setMode} />
            {mode === 'form' ? (
              <IntakeWizard form={form} />
            ) : (
              <ChatPanel
                messages={chat.messages}
                streaming={chat.streaming}
                error={chat.error}
                onSend={chat.sendMessage}
                onStop={chat.stopStreaming}
              />
            )}
          </div>

          {/* Desktop: side-by-side */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            <div className="col-span-3">
              <IntakeWizard form={form} />
            </div>
            <div className="col-span-2">
              <div className="sticky top-20">
                <ChatPanel
                  messages={chat.messages}
                  streaming={chat.streaming}
                  error={chat.error}
                  onSend={chat.sendMessage}
                  onStop={chat.stopStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
