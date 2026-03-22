import { ChevronLeft, ChevronRight } from 'lucide-react'
import StepIndicator from './StepIndicator'
import StepPIInfo from './StepPIInfo'
import StepSamples from './StepSamples'
import StepServices from './StepServices'
import StepReview from './StepReview'
import type { useIntakeForm } from '../../hooks/useIntakeForm'

interface IntakeWizardProps {
  form: ReturnType<typeof useIntakeForm>
}

export default function IntakeWizard({ form }: IntakeWizardProps) {
  const { state, setStep, updateSubmission, updateSamples, addSample, removeSample, toggleService, saveStep1, saveStep2, saveStep3, uploadFile, submitForm } = form

  const handleNext = async () => {
    try {
      if (state.step === 0) await saveStep1()
      if (state.step === 1) await saveStep2()
      if (state.step === 2) await saveStep3()
      setStep(state.step + 1)
    } catch {
      // error already set in state
    }
  }

  const handleBack = () => {
    setStep(state.step - 1)
  }

  return (
    <div>
      <StepIndicator currentStep={state.step} />

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        {state.step === 0 && (
          <StepPIInfo data={state.submission} onChange={updateSubmission} />
        )}
        {state.step === 1 && (
          <StepSamples
            samples={state.samples}
            onUpdate={updateSamples}
            onAdd={addSample}
            onRemove={removeSample}
          />
        )}
        {state.step === 2 && (
          <StepServices
            services={state.services}
            submission={state.submission}
            files={state.files}
            onToggleService={toggleService}
            onUpdateSubmission={updateSubmission}
            onUploadFile={uploadFile}
          />
        )}
        {state.step === 3 && (
          <StepReview state={state} onSubmit={submitForm} />
        )}
      </div>

      {/* Navigation buttons */}
      {state.step < 3 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={state.step === 0}
            className="flex items-center gap-1 px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={state.loading}
            className="flex items-center gap-1 px-6 py-2 bg-uidaho-gold text-neutral-900 rounded-md text-sm font-semibold hover:bg-uidaho-gold-dark transition-colors disabled:opacity-50"
          >
            {state.loading ? 'Saving...' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {state.step === 3 && !state.submitted && (
        <div className="flex justify-start mt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      )}
    </div>
  )
}
