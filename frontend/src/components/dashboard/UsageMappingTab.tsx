import { useMemo, useState } from 'react'
import type {
  PIUsageCollegeItem,
  PIUsageItem,
  PIUsageMappingData,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

const formatDollar = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function MappingBadge({ status }: { status: PIUsageItem['mapping_status'] }) {
  const tone = {
    matched: 'bg-green-100 text-green-800',
    proposals_only: 'bg-amber-100 text-amber-800',
    usage_only: 'bg-neutral-100 text-neutral-700',
  }[status]

  const label = {
    matched: 'Matched',
    proposals_only: 'Proposal Only',
    usage_only: 'Usage Only',
  }[status]

  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tone}`}>{label}</span>
}

function RateBadge({ rate }: { rate: number }) {
  const tone =
    rate >= 50
      ? 'bg-green-100 text-green-800'
      : rate > 0
        ? 'bg-amber-100 text-amber-800'
        : 'bg-neutral-100 text-neutral-600'

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tone}`}>
      {rate.toFixed(1)}%
    </span>
  )
}

type CollegeSortKey = 'college_display' | 'proposal_pis' | 'using_pis' | 'matched_pis' | 'affiliated_pis' | 'distinct_lab_users' | 'iids_proposal_rate'
type PISortKey = 'pi_name' | 'college_display' | 'proposal_count' | 'iids_proposal_count' | 'iids_proposal_rate' | 'unique_lab_users' | 'charge_revenue' | 'equipment_hours'

interface Props {
  data: PIUsageMappingData | null
  loading: boolean
  onPIClick?: (piEmail: string) => void
}

export default function UsageMappingTab({ data, loading, onPIClick }: Props) {
  const [collegeSortKey, setCollegeSortKey] = useState<CollegeSortKey>('matched_pis')
  const [collegeSortAsc, setCollegeSortAsc] = useState(false)
  const [piSortKey, setPISortKey] = useState<PISortKey>('unique_lab_users')
  const [piSortAsc, setPISortAsc] = useState(false)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PIUsageItem['mapping_status']>('all')

  const sortedColleges = useMemo(() => {
    const colleges = data?.by_college ?? []
    return [...colleges].sort((a, b) => compareRows(a, b, collegeSortKey, collegeSortAsc))
  }, [data, collegeSortKey, collegeSortAsc])

  const filteredPIs = useMemo(() => {
    const piRows = data?.by_pi ?? []
    return piRows.filter((pi) => {
      if (statusFilter !== 'all' && pi.mapping_status !== statusFilter) return false
      if (!filter) return true
      const query = filter.toLowerCase()
      return pi.pi_name.toLowerCase().includes(query)
        || pi.college_display.toLowerCase().includes(query)
        || pi.mapping_status.toLowerCase().includes(query)
        || pi.pi_email.toLowerCase().includes(query)
    })
  }, [data, filter, statusFilter])

  const sortedPIs = useMemo(() => {
    return [...filteredPIs].sort((a, b) => compareRows(a, b, piSortKey, piSortAsc))
  }, [filteredPIs, piSortKey, piSortAsc])

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading PI-to-usage mapping...</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Matched PIs"
          value={data.summary.matched_pis.toLocaleString()}
          subtitle="Proposal PIs with observable GBRC lab usage"
          highlight="green"
        />
        <StatCard
          label="Affiliated And Using"
          value={data.summary.affiliated_using_pis.toLocaleString()}
          subtitle="PIs who checked IIDS and show GBRC lab usage"
          highlight="gold"
        />
        <StatCard
          label="Proposal-Only PIs"
          value={data.summary.proposals_only_pis.toLocaleString()}
          subtitle="No GBRC usage tied yet"
          highlight="red"
        />
        <StatCard
          label="Distinct Lab Users"
          value={data.summary.distinct_lab_users.toLocaleString()}
          subtitle="Charge and equipment users linked to PI labs"
          highlight="default"
        />
      </div>

      <ChartCard
        title="Question 2: How does proposal affiliation map to GBRC users?"
        subtitle="Lab users approximate trainees and other lab members billed or reserved under a PI's lab"
      >
        <p className="text-sm text-neutral-600">
          This view maps proposal PIs onto observable GBRC activity. It uses billed users and equipment reservation users
          associated with a PI's lab. CRC exports remain in the Infrastructure tab because the current CRC files do not carry PI identifiers.
        </p>
      </ChartCard>

      <ChartCard title="College Mapping" subtitle="Which colleges show the strongest PI-to-usage linkage?">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {([
                  ['college_display', 'College'],
                  ['proposal_pis', 'Proposal PIs'],
                  ['using_pis', 'Using PIs'],
                  ['matched_pis', 'Matched PIs'],
                  ['affiliated_pis', 'IIDS PIs'],
                  ['distinct_lab_users', 'Lab Users'],
                  ['iids_proposal_rate', 'IIDS Rate'],
                ] as [CollegeSortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${key === 'college_display' ? 'text-left' : 'text-right'}`}
                    onClick={() => toggleSort(key, collegeSortKey, collegeSortAsc, setCollegeSortKey, setCollegeSortAsc)}
                  >
                    {label}{sortIndicator(key, collegeSortKey, collegeSortAsc)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedColleges.map((college) => (
                <tr key={college.college} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{college.college_display}</td>
                  <td className="px-4 py-3 text-right">{college.proposal_pis}</td>
                  <td className="px-4 py-3 text-right">{college.using_pis}</td>
                  <td className="px-4 py-3 text-right">{college.matched_pis}</td>
                  <td className="px-4 py-3 text-right">{college.affiliated_pis}</td>
                  <td className="px-4 py-3 text-right">{college.distinct_lab_users}</td>
                  <td className="px-4 py-3 text-right"><RateBadge rate={college.iids_proposal_rate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard
        title="PI-to-Usage Detail"
        subtitle="Use this to spot labs that affiliate proposals but are not yet showing up in GBRC usage, and vice versa"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search PI, college, status, or email..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent text-sm"
            />
            <div className="flex items-center gap-2">
              {([
                ['all', 'All'],
                ['matched', 'Matched'],
                ['proposals_only', 'Proposal Only'],
                ['usage_only', 'Usage Only'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === value
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-neutral-500">{sortedPIs.length} PIs shown</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {([
                  ['pi_name', 'PI'],
                  ['college_display', 'College'],
                  ['proposal_count', 'Proposals'],
                  ['iids_proposal_count', 'IIDS Proposals'],
                  ['iids_proposal_rate', 'IIDS Rate'],
                  ['unique_lab_users', 'Lab Users'],
                  ['charge_revenue', 'GBRC Revenue'],
                  ['equipment_hours', 'Equip. Hours'],
                ] as [PISortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${key === 'pi_name' || key === 'college_display' ? 'text-left' : 'text-right'}`}
                    onClick={() => toggleSort(key, piSortKey, piSortAsc, setPISortKey, setPISortAsc)}
                  >
                    {label}{sortIndicator(key, piSortKey, piSortAsc)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPIs.map((pi) => {
                const isClickable = Boolean(pi.pi_email && onPIClick)
                return (
                  <tr
                    key={`${pi.pi_name}-${pi.mapping_status}`}
                    className={`border-b border-neutral-100 ${isClickable ? 'cursor-pointer hover:bg-amber-50/40' : 'hover:bg-neutral-50'}`}
                    onClick={() => {
                      if (!isClickable) return
                      onPIClick?.(pi.pi_email)
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{pi.pi_name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <MappingBadge status={pi.mapping_status} />
                        <span className="text-xs text-neutral-500">{pi.pi_email || 'No GBRC-linked email yet'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{pi.college_display}</td>
                    <td className="px-4 py-3 text-right">{pi.proposal_count}</td>
                    <td className="px-4 py-3 text-right">{pi.iids_proposal_count}</td>
                    <td className="px-4 py-3 text-right"><RateBadge rate={pi.iids_proposal_rate} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-neutral-900">{pi.unique_lab_users}</div>
                      <div className="text-xs text-neutral-500">
                        {pi.unique_charge_users} billed / {pi.unique_equipment_users} equipment
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{formatDollar(pi.charge_revenue)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-neutral-900">{pi.equipment_hours.toFixed(1)}</div>
                      <div className="text-xs text-neutral-500">{pi.reservation_count} reservations</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

function compareRows<T extends PIUsageCollegeItem | PIUsageItem>(
  a: T,
  b: T,
  key: keyof T,
  asc: boolean,
) {
  const aValue = a[key]
  const bValue = b[key]
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  }
  return asc ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
}

function toggleSort<T extends string>(
  key: T,
  currentKey: T,
  currentAsc: boolean,
  setKey: (value: T) => void,
  setAsc: (value: boolean) => void,
) {
  if (key === currentKey) {
    setAsc(!currentAsc)
    return
  }
  setKey(key)
  setAsc(false)
}

function sortIndicator<T extends string>(key: T, currentKey: T, asc: boolean) {
  return currentKey === key ? (asc ? ' ▲' : ' ▼') : ''
}
