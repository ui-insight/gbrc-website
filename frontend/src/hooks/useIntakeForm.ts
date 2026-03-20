import { useState, useCallback } from 'react'

const API_BASE = '/api/v1/intake'

export interface Sample {
  id?: string
  sample_type: string
  organism: string
  count: number | null
  extraction_method: string
  quality_metrics: Record<string, string> | null
  notes: string
}

export interface ServiceSelection {
  id?: string
  service_name: string
  notes: string
}

export interface FileUpload {
  id: string
  original_filename: string
  file_size: number
  mime_type: string
  ai_summary: string | null
  uploaded_at: string
}

export interface SubmissionData {
  pi_name: string
  pi_email: string
  department: string
  project_title: string
  project_description: string
  project_goals: string
  timeline_preference: string
  budget_estimate_cents: number | null
}

export interface WizardState {
  submissionId: string | null
  step: number
  submission: SubmissionData
  samples: Sample[]
  services: ServiceSelection[]
  files: FileUpload[]
  loading: boolean
  error: string | null
  submitted: boolean
}

const emptySubmission: SubmissionData = {
  pi_name: '',
  pi_email: '',
  department: '',
  project_title: '',
  project_description: '',
  project_goals: '',
  timeline_preference: '',
  budget_estimate_cents: null,
}

const emptySample: Sample = {
  sample_type: '',
  organism: '',
  count: null,
  extraction_method: '',
  quality_metrics: null,
  notes: '',
}

export function useIntakeForm() {
  const [state, setState] = useState<WizardState>({
    submissionId: null,
    step: 0,
    submission: { ...emptySubmission },
    samples: [{ ...emptySample }],
    services: [],
    files: [],
    loading: false,
    error: null,
    submitted: false,
  })

  const setStep = useCallback((step: number) => {
    setState((s) => ({ ...s, step }))
  }, [])

  const updateSubmission = useCallback((updates: Partial<SubmissionData>) => {
    setState((s) => ({
      ...s,
      submission: { ...s.submission, ...updates },
    }))
  }, [])

  const updateSamples = useCallback((samples: Sample[]) => {
    setState((s) => ({ ...s, samples }))
  }, [])

  const addSample = useCallback(() => {
    setState((s) => ({ ...s, samples: [...s.samples, { ...emptySample }] }))
  }, [])

  const removeSample = useCallback((index: number) => {
    setState((s) => ({
      ...s,
      samples: s.samples.filter((_, i) => i !== index),
    }))
  }, [])

  const updateServices = useCallback((services: ServiceSelection[]) => {
    setState((s) => ({ ...s, services }))
  }, [])

  const toggleService = useCallback((serviceName: string) => {
    setState((s) => {
      const exists = s.services.find((svc) => svc.service_name === serviceName)
      if (exists) {
        return {
          ...s,
          services: s.services.filter((svc) => svc.service_name !== serviceName),
        }
      }
      return {
        ...s,
        services: [...s.services, { service_name: serviceName, notes: '' }],
      }
    })
  }, [])

  // Save step 1 (PI info) — creates or updates submission
  const saveStep1 = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      if (!state.submissionId) {
        const res = await fetch(API_BASE + '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.submission),
        })
        if (!res.ok) throw new Error('Failed to create submission')
        const data = await res.json()
        setState((s) => ({ ...s, submissionId: data.id, loading: false }))
      } else {
        const res = await fetch(`${API_BASE}/${state.submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.submission),
        })
        if (!res.ok) throw new Error('Failed to update submission')
        setState((s) => ({ ...s, loading: false }))
      }
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
      throw err
    }
  }, [state.submissionId, state.submission])

  // Save step 2 (samples)
  const saveStep2 = useCallback(async () => {
    if (!state.submissionId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(`${API_BASE}/${state.submissionId}/samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.samples),
      })
      if (!res.ok) throw new Error('Failed to save samples')
      const data = await res.json()
      setState((s) => ({ ...s, samples: data, loading: false }))
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
      throw err
    }
  }, [state.submissionId, state.samples])

  // Save step 3 (services + submission update for timeline/budget)
  const saveStep3 = useCallback(async () => {
    if (!state.submissionId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await Promise.all([
        fetch(`${API_BASE}/${state.submissionId}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.services),
        }),
        fetch(`${API_BASE}/${state.submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeline_preference: state.submission.timeline_preference,
            budget_estimate_cents: state.submission.budget_estimate_cents,
          }),
        }),
      ])
      setState((s) => ({ ...s, loading: false }))
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
      throw err
    }
  }, [state.submissionId, state.services, state.submission])

  // Upload a file
  const uploadFile = useCallback(
    async (file: File) => {
      if (!state.submissionId) return
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(
          `${API_BASE}/${state.submissionId}/files`,
          { method: 'POST', body: formData }
        )
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail || 'Upload failed')
        }
        const data = await res.json()
        setState((s) => ({
          ...s,
          files: [...s.files, data],
          loading: false,
        }))
      } catch (err: any) {
        setState((s) => ({ ...s, loading: false, error: err.message }))
      }
    },
    [state.submissionId]
  )

  // Submit the form
  const submitForm = useCallback(async () => {
    if (!state.submissionId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(
        `${API_BASE}/${state.submissionId}/submit`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Failed to submit')
      setState((s) => ({ ...s, submitted: true, loading: false }))
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }, [state.submissionId])

  // Apply AI-provided form updates
  const applyAIUpdates = useCallback((updates: Record<string, any>) => {
    setState((s) => {
      const newState = { ...s }
      const submissionKeys = Object.keys(emptySubmission)
      const submissionUpdates: Partial<SubmissionData> = {}

      for (const [key, value] of Object.entries(updates)) {
        if (submissionKeys.includes(key)) {
          ;(submissionUpdates as any)[key] = value
        }
      }

      if (Object.keys(submissionUpdates).length > 0) {
        newState.submission = { ...s.submission, ...submissionUpdates }
      }

      if (updates.samples) {
        newState.samples = updates.samples
      }
      if (updates.services) {
        newState.services = updates.services
      }

      return newState
    })
  }, [])

  return {
    state,
    setStep,
    updateSubmission,
    updateSamples,
    addSample,
    removeSample,
    updateServices,
    toggleService,
    saveStep1,
    saveStep2,
    saveStep3,
    uploadFile,
    submitForm,
    applyAIUpdates,
  }
}
