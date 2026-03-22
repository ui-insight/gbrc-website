import { Check } from 'lucide-react'

const steps = ['PI Information', 'Sample Details', 'Services & Files', 'Review & Submit']

interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isCompleted
                    ? 'bg-uidaho-gold border-uidaho-gold text-neutral-900'
                    : isCurrent
                      ? 'border-uidaho-gold text-uidaho-gold bg-white'
                      : 'border-neutral-300 text-neutral-400 bg-white'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={`mt-2 text-xs text-center hidden sm:block ${
                  isCurrent ? 'text-uidaho-gold font-semibold' : 'text-neutral-500'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  index < currentStep ? 'bg-uidaho-gold' : 'bg-neutral-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
