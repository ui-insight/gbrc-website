import { User, Mail, Building2, FileText } from 'lucide-react'
import type { SubmissionData } from '../../hooks/useIntakeForm'

interface StepPIInfoProps {
  data: SubmissionData
  onChange: (updates: Partial<SubmissionData>) => void
}

const inputClass =
  'w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uidaho-gold focus:border-transparent text-sm'

export default function StepPIInfo({ data, onChange }: StepPIInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Principal Investigator Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <User className="w-4 h-4" /> Full Name
          </label>
          <input
            type="text"
            value={data.pi_name}
            onChange={(e) => onChange({ pi_name: e.target.value })}
            placeholder="Dr. Jane Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input
            type="email"
            value={data.pi_email}
            onChange={(e) => onChange({ pi_email: e.target.value })}
            placeholder="jsmith@uidaho.edu"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
          <Building2 className="w-4 h-4" /> Department
        </label>
        <input
          type="text"
          value={data.department}
          onChange={(e) => onChange({ department: e.target.value })}
          placeholder="Department of Biological Sciences"
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
          <FileText className="w-4 h-4" /> Project Title
        </label>
        <input
          type="text"
          value={data.project_title}
          onChange={(e) => onChange({ project_title: e.target.value })}
          placeholder="Genome-wide association study of..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Project Description
        </label>
        <textarea
          value={data.project_description}
          onChange={(e) => onChange({ project_description: e.target.value })}
          placeholder="Briefly describe your project and research questions..."
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Project Goals
        </label>
        <textarea
          value={data.project_goals}
          onChange={(e) => onChange({ project_goals: e.target.value })}
          placeholder="What do you hope to achieve with GBRC services?"
          rows={3}
          className={inputClass}
        />
      </div>
    </div>
  )
}
