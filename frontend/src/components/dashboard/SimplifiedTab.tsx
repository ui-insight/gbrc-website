import { useState, useMemo } from 'react'
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
  CollegeUserCount,
  CRCCollegeUsageItem,
  PIUsageSummaryData,
  PIUsageSummaryItem,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

type SortKey = keyof PIUsageSummaryItem
type SortDir = 'asc' | 'desc'
type UsageFilter = 'all' | PIUsageSummaryItem['usage_type']

const GRAPH_COLLEGE_CODES = ['CALS', 'COS', 'RCI', 'CNR', 'SHAMP', 'ENG'] as const
type GraphCollegeCode = typeof GRAPH_COLLEGE_CODES[number]

interface CollegeUsageSummary {
  college: string
  total_paid: number
  equipment_hours: number
  charge_count: number
  reservation_count: number
  pi_count: number
}

const USAGE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  free: { label: 'Free', bg: 'bg-red-100', text: 'text-red-800' },
  both: { label: 'Paid + Equipment', bg: 'bg-amber-100', text: 'text-amber-800' },
}

const CRC_BADGE = {
  yes: 'bg-blue-100 text-blue-800',
  no: 'bg-neutral-100 text-neutral-600',
}

const ROW_BG: Record<string, string> = {
  paid: '',
  free: 'bg-red-50/50',
  both: 'bg-amber-50/40',
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

function formatHours(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function isGraphCollegeCode(value: string): value is GraphCollegeCode {
  return GRAPH_COLLEGE_CODES.includes(value as GraphCollegeCode)
}

function CollegeUsageTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean
  payload?: Array<{ payload: CollegeUsageSummary }>
  mode: 'revenue' | 'equipment'
}) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{row.college}</p>
      <p className="text-neutral-700">
        {mode === 'revenue'
          ? `Paid revenue: ${formatCurrency(row.total_paid)}`
          : `Equipment hours: ${formatHours(row.equipment_hours)}`}
      </p>
      <p className="text-neutral-500 mt-1">
        {row.pi_count} PI{row.pi_count !== 1 ? 's' : ''} · {row.charge_count} charges · {row.reservation_count} reservations
      </p>
    </div>
  )
}

function CRCCollegeTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: CRCCollegeUsageItem }>
}) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{row.college}</p>
      <p className="text-neutral-700">
        Unique CRC users: {row.unique_users.toLocaleString()}
      </p>
    </div>
  )
}

function PICountTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: CollegeUsageSummary }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{row.college}</p>
      <p className="text-neutral-700">
        PIs: {row.pi_count.toLocaleString()}
      </p>
    </div>
  )
}

function UserCountTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: CollegeUserCount }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{row.college}</p>
      <p className="text-neutral-700">
        Unique iLab users: {row.unique_users.toLocaleString()}
      </p>
    </div>
  )
}

interface SimplifiedTabProps {
  data: PIUsageSummaryData | null
  loading: boolean
}

export default function SimplifiedTab({ data, loading }: SimplifiedTabProps) {
  const [selectedFY, setSelectedFY] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('total_paid')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState('')
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all')

  const activeData = useMemo(() => {
    if (!data) return null
    if (selectedFY === 'all') return data
    return data.by_fy[selectedFY] ?? { summary: data.summary, pis: [] }
  }, [data, selectedFY])

  const filtered = useMemo(() => {
    if (!activeData) return []
    const source = usageFilter === 'all'
      ? activeData.pis
      : activeData.pis.filter((p) => p.usage_type === usageFilter)
    if (!filter) return source
    const q = filter.toLowerCase()
    return source.filter(
      (p) =>
        p.pi_name.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.college_display.toLowerCase().includes(q) ||
        p.pi_email.toLowerCase().includes(q)
    )
  }, [activeData, filter, usageFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir])

  const usageByCollege = useMemo<CollegeUsageSummary[]>(() => {
    const byCollege = new Map<string, CollegeUsageSummary>(
      GRAPH_COLLEGE_CODES.map((college) => [college, {
        college,
        total_paid: 0,
        equipment_hours: 0,
        charge_count: 0,
        reservation_count: 0,
        pi_count: 0,
      }]),
    )

    filtered.forEach((pi) => {
      const key = pi.college
      if (!isGraphCollegeCode(key)) {
        return
      }
      const existing = byCollege.get(key)
      if (!existing) return
      existing.total_paid += pi.total_paid
      existing.equipment_hours += pi.equipment_hours
      existing.charge_count += pi.charge_count
      existing.reservation_count += pi.reservation_count
      existing.pi_count += 1
    })

    return GRAPH_COLLEGE_CODES.map((college) => byCollege.get(college)!)
  }, [filtered])

  const revenueByCollege = usageByCollege

  const equipmentByCollege = usageByCollege

  const crcByCollege = useMemo(
    () => {
      const source = selectedFY === 'all'
        ? data?.crc_by_college ?? []
        : data?.crc_by_college_by_fy[selectedFY] ?? []
      const byCollege = new Map(
        GRAPH_COLLEGE_CODES.map((college) => [college, {
          college,
          unique_users: 0,
        }]),
      )
      source.forEach((row) => {
        if (isGraphCollegeCode(row.college) && byCollege.has(row.college)) {
          byCollege.set(row.college, {
            college: row.college,
            unique_users: row.unique_users,
          })
        }
      })
      return GRAPH_COLLEGE_CODES.map((college) => byCollege.get(college)!)
    },
    [data, selectedFY],
  )

  const usersByCollege = useMemo<CollegeUserCount[]>(
    () => {
      const source = selectedFY === 'all'
        ? data?.users_by_college ?? []
        : data?.by_fy[selectedFY]?.users_by_college ?? []
      const byCollege = new Map(
        GRAPH_COLLEGE_CODES.map((college) => [college, {
          college,
          unique_users: 0,
        }]),
      )
      source.forEach((row) => {
        if (isGraphCollegeCode(row.college) && byCollege.has(row.college)) {
          byCollege.set(row.college, {
            college: row.college,
            unique_users: row.unique_users,
          })
        }
      })
      return GRAPH_COLLEGE_CODES.map((college) => byCollege.get(college)!)
    },
    [data, selectedFY],
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'pi_name' || key === 'college_display' ? 'asc' : 'desc')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading PI usage summary...</div>
  }

  if (!data || !activeData) return null

  const { summary } = activeData

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Observable PIs"
          value={summary.total_pis.toString()}
          subtitle="Named labs with paid or equipment activity"
          highlight="default"
        />
        <StatCard
          label="Paying PIs"
          value={(summary.paid_pis + summary.both_pis).toString()}
          subtitle={`${summary.both_pis} also show equipment reservations`}
          highlight="green"
        />
        <StatCard
          label="Equipment-Only PIs"
          value={summary.free_pis.toString()}
          subtitle="Reservations without paid internal charges"
          highlight="red"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.total_revenue)}
          subtitle={`${summary.total_equipment_hours.toLocaleString()} equipment hours`}
          highlight="gold"
        />
      </div>

      <ChartCard
        title="Simple Readout"
        subtitle="A plain-language view of which labs show up in GBRC activity"
      >
        <p className="text-sm text-neutral-600">
          Paying PIs have internal charge activity. Equipment-only PIs show instrument reservations but no paid internal
          charges in the current export window. Rows are grouped by PI or lab name so named labs with missing PI emails
          still appear in this simplified view. The CRC columns mark cases where the PI themselves also appears in the
          CRC user exports by exact email or exact full-name match.
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

      {usageByCollege.length > 0 && (
        <>
          {/* Row 1: People counts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard
              title="PIs By College"
              subtitle="Principal investigators with paid or equipment activity by college"
            >
              <ResponsiveContainer width="100%" height={Math.max(260, usageByCollege.length * 56 + 40)}>
                <BarChart
                  data={usageByCollege}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="college"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<PICountTooltip />} />
                  <Bar
                    dataKey="pi_count"
                    name="PIs"
                    fill="#7c3aed"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="iLab Users By College"
              subtitle="Distinct users from charges and equipment reservations (not rolled up to PIs)"
            >
              <ResponsiveContainer width="100%" height={Math.max(260, usersByCollege.length * 56 + 40)}>
                <BarChart
                  data={usersByCollege}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="college"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<UserCountTooltip />} />
                  <Bar
                    dataKey="unique_users"
                    name="iLab Users"
                    fill="#0891b2"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Unique CRC Users By College"
              subtitle="Distinct CRC account holders by college for the selected fiscal year"
            >
              <ResponsiveContainer width="100%" height={Math.max(260, crcByCollege.length * 56 + 40)}>
                <BarChart
                  data={crcByCollege}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="college"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CRCCollegeTooltip />} />
                  <Bar
                    dataKey="unique_users"
                    name="Unique CRC Users"
                    fill="#2563eb"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: Financial metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard
              title="Paid Revenue By College"
              subtitle="Aggregated internal charges for the currently visible PI set"
            >
              <ResponsiveContainer width="100%" height={Math.max(260, revenueByCollege.length * 56 + 40)}>
                <BarChart
                  data={revenueByCollege}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="college"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CollegeUsageTooltip mode="revenue" />} />
                  <Bar
                    dataKey="total_paid"
                    name="Paid Revenue"
                    fill="#16a34a"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Shared Equipment By College"
              subtitle="Aggregated equipment reservation hours for the currently visible PI set"
            >
              <ResponsiveContainer width="100%" height={Math.max(260, equipmentByCollege.length * 56 + 40)}>
                <BarChart
                  data={equipmentByCollege}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatHours(Number(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="college"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CollegeUsageTooltip mode="equipment" />} />
                  <Bar
                    dataKey="equipment_hours"
                    name="Equipment Hours"
                    fill="#f1b300"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Filter by PI, department, college, or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 min-w-0 w-full sm:w-80 px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f1b300] focus:border-transparent"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {([
              ['all', 'All'],
              ['paid', 'Paid Only'],
              ['both', 'Paid + Equipment'],
              ['free', 'Equipment Only'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setUsageFilter(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  usageFilter === value
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-neutral-500">
          {sorted.length} PI{sorted.length !== 1 ? 's' : ''}
          {(filter || usageFilter !== 'all') && ` (filtered from ${activeData.pis.length})`}
        </span>
      </div>

      {/* PI Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                {([
                  ['pi_name', 'PI Name'],
                  ['department', 'Department'],
                  ['college_display', 'College'],
                  ['usage_type', 'Usage Type'],
                  ['uses_crc', 'CRC'],
                  ['crc_user_count', 'CRC Users'],
                  ['crc_years_label', 'CRC FYs'],
                  ['total_paid', 'Total Paid'],
                  ['equipment_hours', 'Equipment Hours'],
                  ['charge_count', 'Charges'],
                  ['reservation_count', 'Reservations'],
                  ['distinct_users', 'Lab Users'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`px-4 py-3 text-left font-medium cursor-pointer select-none whitespace-nowrap hover:text-neutral-900 ${
                      sortKey === key ? 'text-neutral-900' : 'text-neutral-500'
                    }`}
                  >
                    {label}
                    {sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((pi) => {
                const badge = USAGE_BADGE[pi.usage_type]
                return (
                  <tr
                    key={pi.pi_email || pi.pi_name}
                    className={`border-t border-neutral-100 hover:bg-neutral-50 ${ROW_BG[pi.usage_type]}`}
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">{pi.pi_name}</td>
                    <td className="px-4 py-3 text-neutral-600">{pi.department || '—'}</td>
                    <td className="px-4 py-3 text-neutral-600">{pi.college_display}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${pi.uses_crc ? CRC_BADGE.yes : CRC_BADGE.no}`}>
                        {pi.uses_crc ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{pi.crc_user_count || '—'}</td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                      {pi.crc_years_label || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">
                      {pi.total_paid > 0 ? `$${pi.total_paid.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">
                      {pi.equipment_hours > 0 ? pi.equipment_hours.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{pi.charge_count || '—'}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{pi.reservation_count || '—'}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{pi.distinct_users || '—'}</td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-neutral-400">
                    No PIs match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
