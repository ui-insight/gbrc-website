import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type {
  SimplifiedProposalData,
  SimplifiedProposalItem,
  SimplifiedProposalPIItem,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

type PIQueryKey = keyof SimplifiedProposalPIItem
type ProposalQueryKey = keyof SimplifiedProposalItem
type SortDir = 'asc' | 'desc'
type ProposalFilter = 'all' | 'iids' | 'funded' | 'unfunded'

interface CollegeProposalSummary {
  college: string
  college_display: string
  proposal_count: number
  iids_proposal_count: number
  funded_proposal_count: number
  requested_total: number
  funded_total: number
}

const USAGE_BADGE: Record<SimplifiedProposalPIItem['usage_type'], { label: string; tone: string }> = {
  paid: { label: 'Paid', tone: 'bg-emerald-100 text-emerald-800' },
  free: { label: 'Equipment Only', tone: 'bg-red-100 text-red-800' },
  both: { label: 'Paid + Equipment', tone: 'bg-amber-100 text-amber-800' },
}

const YES_BADGE = 'bg-green-100 text-green-800'
const NO_BADGE = 'bg-neutral-100 text-neutral-600'

const formatDollar = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

const formatFullDollar = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function CollegeProposalTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean
  payload?: Array<{ payload: CollegeProposalSummary }>
  mode: 'count' | 'dollars'
}) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{row.college_display}</p>
      <p className="text-neutral-700">
        {mode === 'count'
          ? `Proposals: ${row.proposal_count.toLocaleString()}`
          : `Requested total: ${formatFullDollar(row.requested_total)}`}
      </p>
      <p className="text-neutral-500 mt-1">
        {row.iids_proposal_count} IIDS · {row.funded_proposal_count} funded
      </p>
      <p className="text-neutral-500">
        Funded dollars: {formatFullDollar(row.funded_total)}
      </p>
    </div>
  )
}

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
  data: SimplifiedProposalData | null
  loading: boolean
}

export default function SimplifiedProposalsTab({ data, loading }: Props) {
  const [piSortKey, setPISortKey] = useState<PIQueryKey>('proposal_count')
  const [piSortDir, setPISortDir] = useState<SortDir>('desc')
  const [proposalSortKey, setProposalSortKey] = useState<ProposalQueryKey>('submission_date')
  const [proposalSortDir, setProposalSortDir] = useState<SortDir>('desc')
  const [piFilter, setPIFilter] = useState('')
  const [proposalFilter, setProposalFilter] = useState('')
  const [proposalMode, setProposalMode] = useState<ProposalFilter>('all')

  const filteredPIs = useMemo(() => {
    const rows = data?.by_pi ?? []
    if (!piFilter) return rows
    const query = piFilter.toLowerCase()
    return rows.filter((row) =>
      row.pi_name.toLowerCase().includes(query)
      || row.college_display.toLowerCase().includes(query)
      || row.pi_email.toLowerCase().includes(query)
    )
  }, [data, piFilter])

  const sortedPIs = useMemo(() => {
    return [...filteredPIs].sort((a, b) => compareRows(a, b, piSortKey, piSortDir))
  }, [filteredPIs, piSortKey, piSortDir])

  const filteredProposals = useMemo(() => {
    let rows = data?.proposals ?? []
    if (proposalMode === 'iids') {
      rows = rows.filter((row) => row.iids_affiliated)
    } else if (proposalMode === 'funded') {
      rows = rows.filter((row) => row.funded)
    } else if (proposalMode === 'unfunded') {
      rows = rows.filter((row) => !row.funded)
    }
    if (!proposalFilter) return rows
    const query = proposalFilter.toLowerCase()
    return rows.filter((row) =>
      row.pi_name.toLowerCase().includes(query)
      || row.title.toLowerCase().includes(query)
      || row.sponsor.toLowerCase().includes(query)
      || row.status.toLowerCase().includes(query)
      || row.department.toLowerCase().includes(query)
      || row.proposal_number.toLowerCase().includes(query)
    )
  }, [data, proposalFilter, proposalMode])

  const sortedProposals = useMemo(() => {
    return [...filteredProposals].sort((a, b) => {
      if (proposalSortKey === 'submission_date') {
        const ad = Date.parse(a.submission_date) || 0
        const bd = Date.parse(b.submission_date) || 0
        return proposalSortDir === 'asc' ? ad - bd : bd - ad
      }
      return compareRows(a, b, proposalSortKey, proposalSortDir)
    })
  }, [filteredProposals, proposalSortKey, proposalSortDir])

  const proposalsByCollege = useMemo<CollegeProposalSummary[]>(() => {
    const byCollege = new Map<string, CollegeProposalSummary>()

    filteredProposals.forEach((proposal) => {
      const key = proposal.college_display || proposal.college || 'Unknown'
      const existing = byCollege.get(key)

      if (existing) {
        existing.proposal_count += 1
        existing.requested_total += proposal.total_cost
        if (proposal.iids_affiliated) existing.iids_proposal_count += 1
        if (proposal.funded) {
          existing.funded_proposal_count += 1
          existing.funded_total += proposal.total_cost
        }
        return
      }

      byCollege.set(key, {
        college: proposal.college,
        college_display: proposal.college_display,
        proposal_count: 1,
        iids_proposal_count: proposal.iids_affiliated ? 1 : 0,
        funded_proposal_count: proposal.funded ? 1 : 0,
        requested_total: proposal.total_cost,
        funded_total: proposal.funded ? proposal.total_cost : 0,
      })
    })

    return Array.from(byCollege.values())
  }, [filteredProposals])

  const proposalCountByCollege = useMemo(
    () => [...proposalsByCollege].sort((a, b) => b.proposal_count - a.proposal_count),
    [proposalsByCollege],
  )

  const proposalDollarsByCollege = useMemo(
    () => [...proposalsByCollege].sort((a, b) => b.requested_total - a.requested_total),
    [proposalsByCollege],
  )

  const toggleSort = <T extends string>(key: T, currentKey: T, currentDir: SortDir, setKey: (value: T) => void, setDir: (value: SortDir) => void) => {
    if (key === currentKey) {
      setDir(currentDir === 'asc' ? 'desc' : 'asc')
      return
    }
    setKey(key)
    setDir(
      key === 'pi_name'
      || key === 'college_display'
      || key === 'title'
      || key === 'status'
      || key === 'sponsor'
      || key === 'proposal_number'
      ? 'asc'
      : 'desc'
    )
  }

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading simplified proposal analysis...</div>
  }

  if (!data) return null

  const iidsRate = data.summary.total_proposals > 0
    ? ((data.summary.iids_proposals / data.summary.total_proposals) * 100).toFixed(1)
    : '0.0'
  const fundedRate = data.summary.total_proposals > 0
    ? ((data.summary.funded_proposals / data.summary.total_proposals) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Proposal PIs"
          value={data.summary.pis_with_proposals.toLocaleString()}
          subtitle={`${data.summary.total_pis.toLocaleString()} observable PIs total`}
          highlight="default"
        />
        <StatCard
          label="Total Proposals"
          value={data.summary.total_proposals.toLocaleString()}
          subtitle="Submitted by the simplified PI set"
          highlight="gold"
        />
        <StatCard
          label="IIDS Proposals"
          value={data.summary.iids_proposals.toLocaleString()}
          subtitle={`${iidsRate}% of proposals in this view`}
          highlight="green"
        />
        <StatCard
          label="Funded Proposals"
          value={data.summary.funded_proposals.toLocaleString()}
          subtitle={`${fundedRate}% currently marked funded`}
          highlight="green"
        />
        <StatCard
          label="Requested Total"
          value={formatDollar(data.summary.requested_total)}
          subtitle={`${formatDollar(data.summary.funded_total)} funded total`}
          highlight="default"
        />
      </div>

      <ChartCard
        title="Simple Proposal Readout"
        subtitle="All proposal rows tied to the simplified GBRC PI set"
      >
        <p className="text-sm text-neutral-600">
          This view starts with the PIs who visibly benefit from GBRC through paid services, shared equipment, or both,
          then pulls in every proposal submitted by those labs. Use it to see which labs affiliate with IIDS, which
          proposals are currently marked funded, and the amount requested across the portfolio.
        </p>
      </ChartCard>

      {proposalsByCollege.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            title="Proposal Volume By College"
            subtitle="Aggregated proposal counts for the currently visible proposal set"
          >
            <ResponsiveContainer width="100%" height={Math.max(260, proposalCountByCollege.length * 56 + 40)}>
              <BarChart
                data={proposalCountByCollege}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="college"
                  width={70}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CollegeProposalTooltip mode="count" />} />
                <Bar
                  dataKey="proposal_count"
                  name="Proposal Count"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Requested Dollars By College"
            subtitle="Aggregated requested totals for the currently visible proposal set"
          >
            <ResponsiveContainer width="100%" height={Math.max(260, proposalDollarsByCollege.length * 56 + 40)}>
              <BarChart
                data={proposalDollarsByCollege}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatDollar(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="college"
                  width={70}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CollegeProposalTooltip mode="dollars" />} />
                <Bar
                  dataKey="requested_total"
                  name="Requested Dollars"
                  fill="#f1b300"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      <ChartCard
        title="PI Proposal Rollup"
        subtitle="How proposal activity is distributed across the simplified PI set"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search PI, college, or email..."
            value={piFilter}
            onChange={(event) => setPIFilter(event.target.value)}
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
                  ['usage_type', 'GBRC Usage'],
                  ['proposal_count', 'Proposals'],
                  ['iids_proposal_count', 'IIDS'],
                  ['funded_proposal_count', 'Funded'],
                  ['requested_total', 'Requested $'],
                  ['funded_total', 'Funded $'],
                  ['latest_submission_date', 'Latest Submission'],
                ] as [PIQueryKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${key === 'pi_name' || key === 'college_display' || key === 'usage_type' || key === 'latest_submission_date' ? 'text-left' : 'text-right'}`}
                    onClick={() => toggleSort(key, piSortKey, piSortDir, setPISortKey, setPISortDir)}
                  >
                    {label}{sortIndicator(key === piSortKey, piSortDir)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPIs.map((row) => {
                const usageBadge = USAGE_BADGE[row.usage_type]
                return (
                  <tr key={row.pi_email || row.pi_name} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{row.pi_name}</div>
                      <div className="text-xs text-neutral-500">{row.pi_email || 'No GBRC-linked email yet'}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{row.college_display}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${usageBadge.tone}`}>
                        {usageBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{row.proposal_count}</td>
                    <td className="px-4 py-3 text-right">{row.iids_proposal_count}</td>
                    <td className="px-4 py-3 text-right">{row.funded_proposal_count}</td>
                    <td className="px-4 py-3 text-right">{formatDollar(row.requested_total)}</td>
                    <td className="px-4 py-3 text-right">{formatDollar(row.funded_total)}</td>
                    <td className="px-4 py-3 text-neutral-700">{row.latest_submission_date || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard
        title="Proposal Detail"
        subtitle="Search the underlying proposals by PI, sponsor, title, status, or proposal number"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search proposal title, PI, sponsor, status, or number..."
              value={proposalFilter}
              onChange={(event) => setProposalFilter(event.target.value)}
              className="w-full max-w-xl px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent text-sm"
            />
            <div className="flex items-center gap-2 flex-wrap">
              {([
                ['all', 'All'],
                ['iids', 'IIDS'],
                ['funded', 'Funded'],
                ['unfunded', 'Not Funded'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setProposalMode(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    proposalMode === value
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-neutral-500">{sortedProposals.length} proposals shown</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {([
                  ['submission_date', 'Submitted'],
                  ['pi_name', 'PI'],
                  ['college_display', 'College'],
                  ['proposal_number', 'Proposal #'],
                  ['title', 'Title'],
                  ['status', 'Status'],
                  ['iids_affiliated', 'IIDS'],
                  ['funded', 'Funded'],
                  ['total_cost', 'Requested $'],
                  ['sponsor', 'Sponsor'],
                ] as [ProposalQueryKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3 font-semibold cursor-pointer hover:text-amber-600 ${key === 'submission_date' || key === 'pi_name' || key === 'college_display' || key === 'proposal_number' || key === 'title' || key === 'status' || key === 'sponsor' ? 'text-left' : 'text-right'}`}
                    onClick={() => toggleSort(key, proposalSortKey, proposalSortDir, setProposalSortKey, setProposalSortDir)}
                  >
                    {label}{sortIndicator(key === proposalSortKey, proposalSortDir)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedProposals.map((row) => (
                <tr key={`${row.proposal_number || row.title}-${row.pi_name}-${row.submission_date}`} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{row.submission_date || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{row.pi_name}</div>
                    <div className="text-xs text-neutral-500">
                      <span className={`inline-block px-2 py-0.5 rounded ${USAGE_BADGE[row.usage_type].tone}`}>
                        {USAGE_BADGE[row.usage_type].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{row.college_display}</td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{row.proposal_number || '—'}</td>
                  <td className="px-4 py-3 min-w-[22rem]">
                    <div className="font-medium text-neutral-900">{row.title || 'Untitled proposal'}</div>
                    <div className="text-xs text-neutral-500">{row.department || 'No department listed'}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.status}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${row.iids_affiliated ? YES_BADGE : NO_BADGE}`}>
                      {row.iids_affiliated ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${row.funded ? YES_BADGE : NO_BADGE}`}>
                      {row.funded ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatFullDollar(row.total_cost)}</td>
                  <td className="px-4 py-3 min-w-[14rem] text-neutral-700">{row.sponsor || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
