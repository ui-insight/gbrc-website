import { useMemo, useState } from 'react'
import type {
  SimplifiedRevenueGapData,
  SimplifiedRevenueGapItem,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

type RowQueryKey = keyof SimplifiedRevenueGapItem
type SortDir = 'asc' | 'desc'

const formatDollar = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

const formatFullDollar = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function compareRows<T, K extends keyof T>(a: T, b: T, key: K, dir: SortDir) {
  const av = a[key] as string | number | boolean
  const bv = b[key] as string | number | boolean
  if (typeof av === 'number' && typeof bv === 'number') {
    return dir === 'asc' ? av - bv : bv - av
  }
  return dir === 'asc'
    ? String(av).localeCompare(String(bv))
    : String(bv).localeCompare(String(av))
}

function sortIndicator(active: boolean, dir: SortDir) {
  if (!active) return ''
  return dir === 'asc' ? ' ▲' : ' ▼'
}

interface Props {
  data: SimplifiedRevenueGapData | null
  loading: boolean
}

export default function SimplifiedRevenueGapTab({ data, loading }: Props) {
  const [selectedFY, setSelectedFY] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<RowQueryKey>('total_paid')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const currentView = useMemo(() => {
    if (!data) return null
    if (selectedFY === 'all') return data
    return data.by_fy[selectedFY] ?? { summary: data.summary, rows: [] }
  }, [data, selectedFY])

  const filteredRows = useMemo(() => {
    const rows = currentView?.rows ?? []
    if (!search) return rows
    const query = search.toLowerCase()
    return rows.filter((row) =>
      row.pi_name.toLowerCase().includes(query)
      || row.pi_email.toLowerCase().includes(query)
      || row.college_display.toLowerCase().includes(query)
      || row.payment_source.toLowerCase().includes(query)
      || row.payment_source_type.toLowerCase().includes(query)
      || row.payment_source_example.toLowerCase().includes(query)
      || row.pi_grant_codes_label.toLowerCase().includes(query),
    )
  }, [currentView, search])

  const sortedRows = useMemo(() => (
    [...filteredRows].sort((a, b) => compareRows(a, b, sortKey, sortDir))
  ), [filteredRows, sortDir, sortKey])

  const summary = currentView?.summary ?? data?.summary

  const toggleSort = (key: RowQueryKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(key)
    setSortDir(
      key === 'pi_name'
      || key === 'college_display'
      || key === 'payment_source'
      || key === 'payment_source_type'
      || key === 'pi_grant_codes_label'
      || key === 'latest_submission_date'
      ? 'asc'
      : 'desc',
    )
  }

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading simplified revenue gap analysis...</div>
  }

  if (!data || !summary) return null

  const proposalCoverage = summary.payment_sources > 0
    ? ((summary.sources_with_pi_proposals / summary.payment_sources) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Affected PIs"
          value={summary.total_pis.toLocaleString()}
          subtitle="Simplified PIs with non-IIDS paid service activity"
          highlight="default"
        />
        <StatCard
          label="Payment Sources"
          value={summary.payment_sources.toLocaleString()}
          subtitle="Grouped by PI plus payment source"
          highlight="gold"
        />
        <StatCard
          label="Non-IIDS Charges"
          value={summary.total_charges.toLocaleString()}
          subtitle="Internal GBRC service charges in this view"
          highlight="green"
        />
        <StatCard
          label="Non-IIDS Revenue"
          value={formatDollar(summary.total_revenue)}
          subtitle="Paid on sources outside the IIDS index map"
          highlight="default"
        />
        <StatCard
          label="Rows With PI Proposals"
          value={summary.sources_with_pi_proposals.toLocaleString()}
          subtitle={`${proposalCoverage}% have same-PI proposal context`}
          highlight="green"
        />
      </div>

      <ChartCard
        title="Simple Revenue Gap Readout"
        subtitle="Starting from the payment sources actually used on GBRC service charges"
      >
        <p className="text-sm text-neutral-600">
          This view starts with internal GBRC service charges tied to the simplified PI set where the normalized
          payment source does not appear in the IIDS index map. Each row is a PI plus payment-source pairing. Proposal
          columns currently show same-PI proposal context for the selected fiscal year, which lets us explore likely
          revenue-gap patterns even before we have a stronger charge-to-grant linkage dataset.
        </p>
      </ChartCard>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-neutral-500">Fiscal Year:</span>
        {data.available_fiscal_years.map((fy) => (
          <button
            key={fy}
            onClick={() => setSelectedFY(fy)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedFY === fy
                ? 'bg-amber-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {fy === 'all' ? 'All' : fy}
          </button>
        ))}
      </div>

      <ChartCard
        title="Non-IIDS Payment Sources"
        subtitle="Search the payment sources being used, then compare them to same-PI proposal activity"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search PI, college, payment source, or grant codes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-xl px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent text-sm"
          />
          <p className="text-sm text-neutral-500">{sortedRows.length} rows shown</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {([
                  ['pi_name', 'PI'],
                  ['college_display', 'College'],
                  ['payment_source', 'Payment Source'],
                  ['payment_source_type', 'Type'],
                  ['charge_count', 'Charges'],
                  ['total_paid', 'Paid $'],
                  ['pi_grant_codes_label', 'PI Grant Codes'],
                  ['pi_proposal_count', 'PI Proposals'],
                  ['pi_iids_proposal_count', 'PI IIDS'],
                  ['pi_funded_proposal_count', 'PI Funded'],
                  ['pi_requested_total', 'PI Requested $'],
                  ['latest_submission_date', 'Latest Proposal'],
                ] as [RowQueryKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${
                      key === 'pi_name'
                      || key === 'college_display'
                      || key === 'payment_source'
                      || key === 'payment_source_type'
                      || key === 'pi_grant_codes_label'
                      || key === 'latest_submission_date'
                        ? 'text-left'
                        : 'text-right'
                    }`}
                    onClick={() => toggleSort(key)}
                  >
                    {label}{sortIndicator(key === sortKey, sortDir)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={`${row.pi_email || row.pi_name}-${row.payment_source}`}
                  className="border-b border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{row.pi_name}</div>
                    <div className="text-xs text-neutral-500">{row.pi_email || 'No GBRC-linked email yet'}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.college_display}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{row.payment_source}</div>
                    {row.payment_source_example && (
                      <div className="text-xs text-neutral-500">{row.payment_source_example}</div>
                    )}
                    <div className="text-xs text-neutral-500">{row.fiscal_years_label}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.payment_source_type}</td>
                  <td className="px-4 py-3 text-right">{row.charge_count}</td>
                  <td className="px-4 py-3 text-right">{formatFullDollar(row.total_paid)}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {row.pi_grant_codes_label || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{row.pi_proposal_count}</td>
                  <td className="px-4 py-3 text-right">{row.pi_iids_proposal_count}</td>
                  <td className="px-4 py-3 text-right">{row.pi_funded_proposal_count}</td>
                  <td className="px-4 py-3 text-right">{formatFullDollar(row.pi_requested_total)}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.latest_submission_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
