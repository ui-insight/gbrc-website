import { CheckCircle2, Send } from 'lucide-react'
import type { WizardState } from '../../hooks/useIntakeForm'

interface StepReviewProps {
  state: WizardState
  onSubmit: () => void
}

export default function StepReview({ state, onSubmit }: StepReviewProps) {
  const { submission, samples, services, files, loading, submitted } = state

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Submission Received!</h2>
        <p className="text-neutral-600">
          Thank you for your project intake submission. A GBRC team member will review
          your request and reach out within 2-3 business days.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Review & Submit</h2>

      {/* PI Info */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">PI Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><span className="text-neutral-500">Name:</span> {submission.pi_name || '—'}</div>
          <div><span className="text-neutral-500">Email:</span> {submission.pi_email || '—'}</div>
          <div><span className="text-neutral-500">Department:</span> {submission.department || '—'}</div>
          <div className="md:col-span-2"><span className="text-neutral-500">Project:</span> {submission.project_title || '—'}</div>
        </div>
        {submission.project_description && (
          <p className="text-sm text-neutral-600 mt-2">{submission.project_description}</p>
        )}
      </div>

      {/* Samples */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          Samples ({samples.length})
        </h3>
        {samples.map((s, i) => (
          <div key={i} className="text-sm mb-2">
            <span className="font-medium">{s.sample_type || 'Unnamed'}</span>
            {s.organism && <span className="text-neutral-500"> — {s.organism}</span>}
            {s.count && <span className="text-neutral-500"> ({s.count} samples)</span>}
          </div>
        ))}
      </div>

      {/* Services */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          Selected Services ({services.length})
        </h3>
        {services.length === 0 ? (
          <p className="text-sm text-neutral-500">No services selected</p>
        ) : (
          <ul className="list-disc list-inside text-sm space-y-1">
            {services.map((svc) => (
              <li key={svc.service_name}>{svc.service_name}</li>
            ))}
          </ul>
        )}
        {submission.timeline_preference && (
          <p className="text-sm text-neutral-500 mt-2">
            Timeline: {submission.timeline_preference}
          </p>
        )}
      </div>

      {/* Files */}
      {files.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Uploaded Files ({files.length})
          </h3>
          <ul className="text-sm space-y-1">
            {files.map((f) => (
              <li key={f.id}>{f.original_filename}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-uidaho-gold text-neutral-900 rounded-md font-semibold hover:bg-uidaho-gold-dark transition-colors disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
        {loading ? 'Submitting...' : 'Submit Project Intake'}
      </button>
    </div>
  )
}
