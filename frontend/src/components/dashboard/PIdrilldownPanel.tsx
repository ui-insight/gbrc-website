import { useState, useEffect } from 'react'
import { X, CheckCircle2, XCircle, FileText } from 'lucide-react'
import type { PIDetail } from '../../types/dashboard'

interface PIdrilldownPanelProps {
  piEmail: string
  token: string
  onClose: () => void
}

export default function PIdrilldownPanel({ piEmail, token, onClose }: PIdrilldownPanelProps) {
  const [data, setData] = useState<PIDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch(`/api/v1/dashboard/pi/${encodeURIComponent(piEmail)}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then((d: PIDetail) => setData(d))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [piEmail, token])

  return (
    <div className="bg-white rounded-lg border-2 border-[#f1b300] p-6 shadow-lg animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">
            {data?.pi_name || piEmail}
          </h3>
          {data && (
            <p className="text-sm text-neutral-500 mt-1">
              {data.department || 'No department'} &middot; {data.pi_email}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center text-neutral-500">Loading PI details...</div>
      )}

      {error && (
        <div className="py-12 text-center text-red-600">Error: {error}</div>
      )}

      {data && !loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <MiniStat label="Total Revenue" value={`$${data.total_revenue.toLocaleString()}`} />
            <MiniStat label="IIDS Checkbox Revenue" value={`$${data.iids_revenue.toLocaleString()}`} color="text-emerald-700" />
            <MiniStat label="Recovery Gap" value={`$${data.non_iids_revenue.toLocaleString()}`} color="text-red-700" />
            <MiniStat
              label="IIDS Rate"
              value={`${data.iids_percentage}%`}
              color={data.iids_percentage === 0 ? 'text-red-700' : data.iids_percentage >= 100 ? 'text-emerald-700' : 'text-yellow-700'}
            />
          </div>

          {/* Proposals table */}
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Proposals ({data.proposals.length})
            </h4>
            {data.proposals.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4">No proposals found for this PI.</p>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-neutral-200 text-left">
                      <th className="py-2 pr-3 text-neutral-500 font-medium">Title</th>
                      <th className="py-2 pr-3 text-neutral-500 font-medium">Sponsor</th>
                      <th className="py-2 pr-3 text-neutral-500 font-medium text-right">Total Cost</th>
                      <th className="py-2 pr-3 text-neutral-500 font-medium">Status</th>
                      <th className="py-2 pr-3 text-neutral-500 font-medium text-center">IIDS</th>
                      <th className="py-2 text-neutral-500 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.proposals.map((proposal, i) => (
                      <tr key={i} className={`border-b border-neutral-100 ${proposal.iids_affiliated ? 'bg-emerald-50/50' : ''}`}>
                        <td className="py-2 pr-3 text-neutral-900 max-w-xs">
                          <span className="line-clamp-2">{proposal.title}</span>
                        </td>
                        <td className="py-2 pr-3 text-neutral-600 whitespace-nowrap">{proposal.sponsor || '—'}</td>
                        <td className="py-2 pr-3 text-right text-neutral-900 font-medium whitespace-nowrap">
                          ${proposal.total_cost.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            proposal.status.includes('Awarded')
                              ? 'bg-emerald-100 text-emerald-800'
                              : proposal.status.includes('Declined')
                                ? 'bg-red-100 text-red-800'
                                : proposal.status.includes('Pending')
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {proposal.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-center">
                          {proposal.iids_affiliated ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 inline" />
                          )}
                        </td>
                        <td className="py-2 text-neutral-600 whitespace-nowrap">{proposal.submission_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Charges table */}
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">
              GBRC Charges ({data.charges.length})
            </h4>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200 text-left">
                    <th className="py-2 pr-3 text-neutral-500 font-medium">Date</th>
                    <th className="py-2 pr-3 text-neutral-500 font-medium">FY</th>
                    <th className="py-2 pr-3 text-neutral-500 font-medium">Charge</th>
                    <th className="py-2 pr-3 text-neutral-500 font-medium">Category</th>
                    <th className="py-2 pr-3 text-neutral-500 font-medium text-right">Amount</th>
                    <th className="py-2 pr-3 text-neutral-500 font-medium text-center">IIDS</th>
                    <th className="py-2 text-neutral-500 font-medium">User</th>
                  </tr>
                </thead>
                <tbody>
                  {data.charges.map((charge, i) => (
                    <tr key={i} className={`border-b border-neutral-100 ${charge.is_iids ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                      <td className="py-2 pr-3 text-neutral-600 whitespace-nowrap">{charge.billing_date}</td>
                      <td className="py-2 pr-3 text-neutral-600">{charge.fiscal_year}</td>
                      <td className="py-2 pr-3 text-neutral-900">{charge.charge_name}</td>
                      <td className="py-2 pr-3 text-neutral-600">{charge.category || '—'}</td>
                      <td className="py-2 pr-3 text-right text-neutral-900 font-medium">${charge.total_price.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-center">
                        {charge.is_iids ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                      </td>
                      <td className="py-2 text-neutral-600">{charge.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-neutral-50 rounded-md p-3">
      <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-neutral-900'}`}>{value}</p>
    </div>
  )
}
