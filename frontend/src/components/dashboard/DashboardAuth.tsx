import { useState, type FormEvent, type ReactNode } from 'react'

interface DashboardAuthProps {
  isAuthenticated: boolean
  checking: boolean
  authError: string
  onLogin: (token: string) => void
  children: ReactNode
}

export default function DashboardAuth({ isAuthenticated, checking, authError, onLogin, children }: DashboardAuthProps) {
  const [inputToken, setInputToken] = useState('')

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-neutral-500">Checking access...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onLogin(inputToken)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Cost Recovery Dashboard</h2>
        <p className="text-sm text-neutral-500 mb-6">Enter your access token to view the dashboard.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Access token"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent"
          />
          {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
          <button
            type="submit"
            className="mt-4 w-full bg-[#f1b300] text-white font-medium py-2 px-4 rounded-md hover:bg-[#d9a000] transition-colors"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
