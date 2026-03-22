import { useState } from 'react'
import type { DepartmentInsightsData, CrossLinkageData } from '../../types/dashboard'
import ChartCard from './ChartCard'

const formatDollar = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

type SortKey = 'college' | 'proposal_count' | 'awarded_cost' | 'charge_revenue' | 'iids_checkbox_rate' | 'iids_charge_rate'

interface Props {
  insights: DepartmentInsightsData | null
  crossLinkage: CrossLinkageData | null
  loading: boolean
}

export default function DepartmentsTab({ insights, crossLinkage, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('proposal_count')
  const [sortAsc, setSortAsc] = useState(false)

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading department analytics...</div>
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sortedColleges = insights
    ? [...insights.by_college].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
        return sortAsc ? cmp : -cmp
      })
    : []

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ''

  return (
    <div className="space-y-6">
      {/* College Scorecard */}
      {insights && (
        <ChartCard title="College Scorecard" subtitle="Proposals, charges, and IIDS checkbox rates by college">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  {([
                    ['college', 'College'],
                    ['proposal_count', 'Proposals'],
                    ['awarded_cost', 'Awarded $'],
                    ['charge_revenue', 'GBRC Revenue'],
                    ['iids_checkbox_rate', 'IIDS Checkbox %'],
                    ['iids_charge_rate', 'IIDS Charge %'],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${key === 'college' ? 'text-left' : 'text-right'}`}
                      onClick={() => handleSort(key)}
                    >
                      {label}{sortIcon(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedColleges.map((c) => (
                  <tr key={c.college} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{c.college_display || c.college}</td>
                    <td className="px-4 py-3 text-right">{c.proposal_count}</td>
                    <td className="px-4 py-3 text-right">{formatDollar(c.awarded_cost)}</td>
                    <td className="px-4 py-3 text-right">{c.charge_revenue > 0 ? formatDollar(c.charge_revenue) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        c.iids_checkbox_rate > 20 ? 'bg-amber-100 text-amber-800' :
                        c.iids_checkbox_rate > 0 ? 'bg-amber-50 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {c.iids_checkbox_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        c.iids_charge_rate > 50 ? 'bg-green-100 text-green-800' :
                        c.iids_charge_rate > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {c.iids_charge_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* Cross-Linkage Panel */}
      {crossLinkage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matched PIs */}
          <ChartCard title="Matched PIs" subtitle={`${crossLinkage.matched_pis.length} PIs with both charges & proposals`}>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 text-left font-semibold">PI</th>
                    <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                    <th className="px-3 py-2 text-right font-semibold">Proposals</th>
                  </tr>
                </thead>
                <tbody>
                  {crossLinkage.matched_pis.map((pi) => (
                    <tr key={pi.pi_email} className="border-b border-neutral-100">
                      <td className="px-3 py-2">{pi.pi_name}</td>
                      <td className="px-3 py-2 text-right">{formatDollar(pi.charge_revenue)}</td>
                      <td className="px-3 py-2 text-right">{pi.proposal_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Charges-Only PIs */}
          <ChartCard title="Charges-Only PIs" subtitle={`${crossLinkage.charges_only_pis.length} PIs using GBRC without proposals`}>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 text-left font-semibold">PI</th>
                    <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {crossLinkage.charges_only_pis.map((pi) => (
                    <tr key={pi.pi_email} className="border-b border-neutral-100">
                      <td className="px-3 py-2">{pi.pi_name}</td>
                      <td className="px-3 py-2 text-right">{formatDollar(pi.charge_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Proposals-Only PIs (top 50) */}
          <ChartCard title="Proposals-Only PIs" subtitle={`Top 50 PIs with proposals but no GBRC charges`}>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 text-left font-semibold">PI</th>
                    <th className="px-3 py-2 text-right font-semibold">Proposals</th>
                    <th className="px-3 py-2 text-right font-semibold">Awarded $</th>
                  </tr>
                </thead>
                <tbody>
                  {crossLinkage.proposals_only_pis.map((pi) => (
                    <tr key={pi.pi_name} className="border-b border-neutral-100">
                      <td className="px-3 py-2 max-w-[150px] truncate" title={pi.pi_name}>{pi.pi_name}</td>
                      <td className="px-3 py-2 text-right">{pi.proposal_count}</td>
                      <td className="px-3 py-2 text-right">{formatDollar(pi.awarded_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
