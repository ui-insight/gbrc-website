import { Plus, Trash2, FlaskConical } from 'lucide-react'
import type { Sample } from '../../hooks/useIntakeForm'

interface StepSamplesProps {
  samples: Sample[]
  onUpdate: (samples: Sample[]) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

const inputClass =
  'w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-uidaho-gold focus:border-transparent text-sm'

export default function StepSamples({ samples, onUpdate, onAdd, onRemove }: StepSamplesProps) {
  const updateSample = (index: number, field: keyof Sample, value: any) => {
    const updated = samples.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    onUpdate(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Sample Details</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-uidaho-gold text-neutral-900 rounded-md text-sm font-medium hover:bg-uidaho-gold-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Sample
        </button>
      </div>

      {samples.map((sample, index) => (
        <div
          key={index}
          className="border border-neutral-200 rounded-lg p-4 space-y-4 relative"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> Sample {index + 1}
            </h3>
            {samples.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sample Type
              </label>
              <input
                type="text"
                value={sample.sample_type}
                onChange={(e) => updateSample(index, 'sample_type', e.target.value)}
                placeholder="e.g., Genomic DNA, Total RNA, Tissue"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Organism
              </label>
              <input
                type="text"
                value={sample.organism}
                onChange={(e) => updateSample(index, 'organism', e.target.value)}
                placeholder="e.g., Homo sapiens, Mus musculus"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Number of Samples
              </label>
              <input
                type="number"
                value={sample.count ?? ''}
                onChange={(e) =>
                  updateSample(index, 'count', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="e.g., 24"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Extraction Method
              </label>
              <input
                type="text"
                value={sample.extraction_method}
                onChange={(e) => updateSample(index, 'extraction_method', e.target.value)}
                placeholder="e.g., Qiagen DNeasy, TRIzol"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={sample.notes}
              onChange={(e) => updateSample(index, 'notes', e.target.value)}
              placeholder="Any special considerations for these samples..."
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
