import { Calendar, DollarSign } from 'lucide-react'
import type { ServiceSelection, SubmissionData } from '../../hooks/useIntakeForm'
import FileUpload from './FileUpload'
import type { FileUpload as FileUploadType } from '../../hooks/useIntakeForm'

const GBRC_SERVICES = [
  { name: 'PacBio Sequencing', description: 'Long-read sequencing for genome assembly, structural variants, and full-length transcripts' },
  { name: 'Illumina Sequencing', description: 'Short-read sequencing for WGS, WES, RNA-seq, and targeted panels' },
  { name: 'RNA-seq Analysis', description: 'Differential expression, pathway analysis, and transcriptome assembly' },
  { name: 'Bioinformatics Consulting', description: 'Custom analysis pipelines, data interpretation, and visualization' },
  { name: 'Sample Preparation', description: 'Library prep, QC, and extraction services' },
]

interface StepServicesProps {
  services: ServiceSelection[]
  submission: SubmissionData
  files: FileUploadType[]
  onToggleService: (name: string) => void
  onUpdateSubmission: (updates: Partial<SubmissionData>) => void
  onUploadFile: (file: File) => void
}

const inputClass =
  'w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uidaho-gold focus:border-transparent text-sm'

export default function StepServices({
  services,
  submission,
  files,
  onToggleService,
  onUpdateSubmission,
  onUploadFile,
}: StepServicesProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Select Services</h2>
        <div className="space-y-3">
          {GBRC_SERVICES.map((svc) => {
            const selected = services.some((s) => s.service_name === svc.name)
            return (
              <label
                key={svc.name}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selected
                    ? 'border-uidaho-gold bg-yellow-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleService(svc.name)}
                  className="mt-0.5 h-4 w-4 accent-[#f1b300]"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{svc.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{svc.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <Calendar className="w-4 h-4" /> Timeline Preference
          </label>
          <input
            type="text"
            value={submission.timeline_preference}
            onChange={(e) => onUpdateSubmission({ timeline_preference: e.target.value })}
            placeholder="e.g., Results needed by Fall 2026"
            className={inputClass}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <DollarSign className="w-4 h-4" /> Estimated Budget
          </label>
          <input
            type="text"
            value={
              submission.budget_estimate_cents != null
                ? (submission.budget_estimate_cents / 100).toString()
                : ''
            }
            onChange={(e) => {
              const val = e.target.value
              onUpdateSubmission({
                budget_estimate_cents: val ? Math.round(parseFloat(val) * 100) : null,
              })
            }}
            placeholder="e.g., 5000"
            className={inputClass}
          />
        </div>
      </div>

      <FileUpload files={files} onUpload={onUploadFile} />
    </div>
  )
}
