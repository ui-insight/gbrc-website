import { useMemo, useState } from 'react'
import type {
  CollegeAffiliationItem,
  PIAffiliationData,
  PIAffiliationItem,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

const formatDollar = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
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

type CollegeSortKey = 'college_display' | 'pi_count' | 'affiliated_pi_count' | 'proposal_count' | 'iids_proposal_count' | 'iids_proposal_rate' | 'awarded_cost'
type PISortKey = 'pi_name' | 'college_display' | 'proposal_count' | 'iids_proposal_count' | 'iids_proposal_rate' | 'awarded_count' | 'awarded_cost'

interface Props {
  data: PIAffiliationData | null
  loading: boolean
  onPIClick?: (piEmail: string) => void
}

export default function AffiliationTab({ data, loading, onPIClick }: Props) {
  const [collegeSortKey, setCollegeSortKey] = useState<CollegeSortKey>('iids_proposal_count')
  const [collegeSortAsc, setCollegeSortAsc] = useState(false)
  const [piSortKey, setPISortKey] = useState<PISortKey>('iids_proposal_count')
  const [piSortAsc, setPISortAsc] = useState(false)
  const [filter, setFilter] = useState('')

  const sortedColleges = useMemo(() => {
    const colleges = data?.by_college ?? []
    return [...colleges].sort((a, b) => compareRows(a, b, collegeSortKey, collegeSortAsc))
  }, [data, collegeSortKey, collegeSortAsc])

  const filteredPIs = useMemo(() => {
    const piRows = data?.by_pi ?? []
    if (!filter) return piRows
    const query = filter.toLowerCase()
    return piRows.filter((pi) =>
      pi.pi_name.toLowerCase().includes(query)
      || pi.college_display.toLowerCase().includes(query)
      || pi.college.toLowerCase().includes(query)
      || pi.pi_email.toLowerCase().includes(query)
    )
  }, [data, filter])

  const sortedPIs = useMemo(() => {
    return [...filteredPIs].sort((a, b) => compareRows(a, b, piSortKey, piSortAsc))
  }, [filteredPIs, piSortKey, piSortAsc])

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading PI affiliation analysis...</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Proposal PIs" value={data.summary.total_pis.toLocaleString()} highlight="default" />
        <StatCard
          label="PIs Using IIDS"
          value={data.summary.affiliated_pis.toLocaleString()}
          subtitle={`${data.summary.total_pis > 0 ? ((data.summary.affiliated_pis / data.summary.total_pis) * 100).toFixed(1) : '0.0'}% of proposal PIs`}
          highlight="gold"
        />
        <StatCard
          label="IIDS-Affiliated Proposals"
          value={data.summary.iids_proposals.toLocaleString()}
          subtitle={`${data.summary.iids_proposal_rate}% of all proposals`}
          highlight="green"
        />
        <StatCard
          label="Awarded Dollars"
          value={formatDollar(data.summary.total_awarded_cost)}
          subtitle={`${data.summary.total_proposals.toLocaleString()} total proposals in view`}
          highlight="default"
        />
      </div>

      <ChartCard
        title="Question 1: Which PIs affiliate proposals with IIDS?"
        subtitle="College rollups first, then the underlying PI list"
      >
        <p className="text-sm text-neutral-600">
          This view is proposal-first. It tells us which PIs checked IIDS on proposals, how consistently they did it,
          and how that behavior rolls up by college.
        </p>
      </ChartCard>

      <ChartCard title="College Breakdown" subtitle="Proposal affiliation summarized by college">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {([
                  ['college_display', 'College'],
                  ['pi_count', 'Proposal PIs'],
                  ['affiliated_pi_count', 'PIs Using IIDS'],
                  ['proposal_count', 'Proposals'],
                  ['iids_proposal_count', 'IIDS Proposals'],
                  ['iids_proposal_rate', 'IIDS Rate'],
                  ['awarded_cost', 'Awarded $'],
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
                  <td className="px-4 py-3 text-right">{college.pi_count}</td>
                  <td className="px-4 py-3 text-right">{college.affiliated_pi_count}</td>
                  <td className="px-4 py-3 text-right">{college.proposal_count}</td>
                  <td className="px-4 py-3 text-right">{college.iids_proposal_count}</td>
                  <td className="px-4 py-3 text-right"><RateBadge rate={college.iids_proposal_rate} /></td>
                  <td className="px-4 py-3 text-right">{formatDollar(college.awarded_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard
        title="PI Affiliation Detail"
        subtitle="Search by PI or college. Rows with a GBRC-linked PI email can open the drill-down panel."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search PI, college, or email..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent text-sm"
          />
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
                  ['awarded_count', 'Awarded'],
                  ['awarded_cost', 'Awarded $'],
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
                    key={`${pi.pi_name}-${pi.college}`}
                    className={`border-b border-neutral-100 ${isClickable ? 'cursor-pointer hover:bg-amber-50/40' : 'hover:bg-neutral-50'}`}
                    onClick={() => {
                      if (!isClickable) return
                      onPIClick?.(pi.pi_email)
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{pi.pi_name}</div>
                      <div className="text-xs text-neutral-500">
                        {pi.pi_email || 'No GBRC-linked email yet'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{pi.college_display}</td>
                    <td className="px-4 py-3 text-right">{pi.proposal_count}</td>
                    <td className="px-4 py-3 text-right">{pi.iids_proposal_count}</td>
                    <td className="px-4 py-3 text-right"><RateBadge rate={pi.iids_proposal_rate} /></td>
                    <td className="px-4 py-3 text-right">{pi.awarded_count}</td>
                    <td className="px-4 py-3 text-right">{formatDollar(pi.awarded_cost)}</td>
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

function compareRows<T extends CollegeAffiliationItem | PIAffiliationItem>(
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
