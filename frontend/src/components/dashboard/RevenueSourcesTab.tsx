import { Fragment, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type { RevenueSourcesData, CollegeBreakdown } from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

const COLORS = { internal: '#f1b300', external: '#3b82f6', corporate: '#8b5cf6' }
const PIE_COLORS = ['#f1b300', '#3b82f6', '#8b5cf6']

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`
const formatFullDollar = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function IIDSBadge({ pct }: { pct: number }) {
  const color =
    pct >= 50
      ? 'bg-green-100 text-green-800'
      : pct > 0
        ? 'bg-amber-100 text-amber-800'
        : 'bg-red-100 text-red-800'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {pct.toFixed(1)}%
    </span>
  )
}

interface Props {
  data: RevenueSourcesData
  onPIClick?: (piEmail: string) => void
}

export default function RevenueSourcesTab({ data, onPIClick }: Props) {
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null)
  const [expandedExtCollege, setExpandedExtCollege] = useState<string | null>(null)
  const [selectedFY, setSelectedFY] = useState<string>('total')
  const [selectedExtFY, setSelectedExtFY] = useState<string>('total')
  const { source_summary, fiscal_years, internal_by_college_by_fy, external_by_college_by_fy, available_fiscal_years } = data

  const total = source_summary.internal + source_summary.external + source_summary.corporate

  const pieData = [
    { name: 'Internal', value: source_summary.internal },
    { name: 'External', value: source_summary.external },
    { name: 'Corporate', value: source_summary.corporate },
  ]

  // Get college data for the selected fiscal year
  const collegeData: CollegeBreakdown[] =
    internal_by_college_by_fy?.[selectedFY] ?? data.internal_by_college ?? []

  // Calculate totals for the selected FY view
  const fyInternalTotal = collegeData.reduce((sum, c) => sum + c.revenue, 0)

  // External college data for the selected fiscal year
  const extCollegeData: CollegeBreakdown[] =
    external_by_college_by_fy?.[selectedExtFY] ?? data.external_by_college ?? []
  const fyExternalTotal = extCollegeData.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatFullDollar(total)} highlight="default" />
        <StatCard
          label="Internal (UI)"
          value={formatFullDollar(source_summary.internal)}
          subtitle={`${total > 0 ? ((source_summary.internal / total) * 100).toFixed(1) : 0}%`}
          highlight="gold"
        />
        <StatCard
          label="External"
          value={formatFullDollar(source_summary.external)}
          subtitle={`${total > 0 ? ((source_summary.external / total) * 100).toFixed(1) : 0}%`}
          highlight="green"
        />
        <StatCard
          label="Corporate"
          value={formatFullDollar(source_summary.corporate)}
          subtitle={`${total > 0 ? ((source_summary.corporate / total) * 100).toFixed(1) : 0}%`}
          highlight="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Revenue by Source Type per Fiscal Year"
          subtitle="Stacked by Internal, External, Corporate"
        >
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={fiscal_years} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fiscal_year" />
                <YAxis tickFormatter={formatDollar} />
                <Tooltip formatter={(value: number) => formatFullDollar(value)} />
                <Legend />
                <Bar dataKey="internal" name="Internal" stackId="a" fill={COLORS.internal} />
                <Bar dataKey="external" name="External" stackId="a" fill={COLORS.external} />
                <Bar
                  dataKey="corporate"
                  name="Corporate"
                  stackId="a"
                  fill={COLORS.corporate}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Source Split" subtitle="Overall distribution">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatFullDollar(value)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* College Breakdown with FY selector */}
      <ChartCard
        title="Internal Revenue by College"
        subtitle="Click a college to see PI breakdown"
      >
        {/* Fiscal Year selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium text-neutral-500">Fiscal Year:</span>
          {(available_fiscal_years ?? ['total']).map((fy) => (
            <button
              key={fy}
              onClick={() => {
                setSelectedFY(fy)
                setExpandedCollege(null)
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedFY === fy
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {fy === 'total' ? 'All Years' : fy}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                <th className="px-4 py-3 font-semibold">College</th>
                <th className="px-4 py-3 font-semibold text-right">PIs</th>
                <th className="px-4 py-3 font-semibold text-right">Charges</th>
                <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                <th className="px-4 py-3 font-semibold text-right">
                  % of Internal{selectedFY !== 'total' ? ` (${selectedFY})` : ''}
                </th>
                <th className="px-4 py-3 font-semibold text-right">IIDS Rate</th>
              </tr>
            </thead>
            <tbody>
              {collegeData.map((college) => {
                const isExpanded = expandedCollege === college.college
                const pct =
                  fyInternalTotal > 0
                    ? ((college.revenue / fyInternalTotal) * 100).toFixed(1)
                    : '0'
                return (
                  <Fragment key={college.college}>
                    <tr
                      className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                      onClick={() =>
                        setExpandedCollege(isExpanded ? null : college.college)
                      }
                    >
                      <td className="px-4 py-3 font-medium">
                        <span className="mr-2 text-neutral-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        {college.college_display || college.college}
                      </td>
                      <td className="px-4 py-3 text-right">{college.pis.length}</td>
                      <td className="px-4 py-3 text-right">{college.charge_count}</td>
                      <td className="px-4 py-3 text-right">
                        {formatFullDollar(college.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right">{pct}%</td>
                      <td className="px-4 py-3 text-right">
                        <IIDSBadge pct={college.iids_percentage} />
                      </td>
                    </tr>
                    {isExpanded &&
                      college.pis.map((pi, idx) => (
                        <tr
                          key={`${pi.pi_email}-${idx}`}
                          className="border-b border-neutral-50 bg-amber-50/30 hover:bg-amber-50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            onPIClick?.(pi.pi_email)
                          }}
                        >
                          <td className="px-4 py-2 pl-12 text-neutral-600">
                            {pi.pi_name}
                          </td>
                          <td className="px-4 py-2 text-right text-neutral-400">—</td>
                          <td className="px-4 py-2 text-right text-neutral-600">
                            {pi.charge_count}
                          </td>
                          <td className="px-4 py-2 text-right text-neutral-600">
                            {formatFullDollar(pi.revenue)}
                          </td>
                          <td className="px-4 py-2 text-right text-neutral-400">
                            {fyInternalTotal > 0
                              ? ((pi.revenue / fyInternalTotal) * 100).toFixed(1)
                              : '0'}
                            %
                          </td>
                          <td className="px-4 py-2 text-right">
                            <IIDSBadge pct={pi.iids_percentage} />
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* External Revenue by Institution Breakdown */}
      <ChartCard
        title="External Revenue by Institution"
        subtitle="Click an institution to see researcher breakdown"
      >
        {/* Fiscal Year selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium text-neutral-500">Fiscal Year:</span>
          {(available_fiscal_years ?? ['total']).map((fy) => (
            <button
              key={fy}
              onClick={() => {
                setSelectedExtFY(fy)
                setExpandedExtCollege(null)
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedExtFY === fy
                  ? 'bg-blue-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {fy === 'total' ? 'All Years' : fy}
            </button>
          ))}
        </div>

        {extCollegeData.length === 0 ? (
          <p className="text-neutral-500 text-sm py-4">No external charges for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-semibold">Institution</th>
                  <th className="px-4 py-3 font-semibold text-right">Researchers</th>
                  <th className="px-4 py-3 font-semibold text-right">Charges</th>
                  <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    % of External{selectedExtFY !== 'total' ? ` (${selectedExtFY})` : ''}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">IIDS Rate</th>
                </tr>
              </thead>
              <tbody>
                {extCollegeData.map((college) => {
                  const isExpanded = expandedExtCollege === college.college
                  const pct =
                    fyExternalTotal > 0
                      ? ((college.revenue / fyExternalTotal) * 100).toFixed(1)
                      : '0'
                  return (
                    <Fragment key={college.college}>
                      <tr
                        className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                        onClick={() =>
                          setExpandedExtCollege(isExpanded ? null : college.college)
                        }
                      >
                        <td className="px-4 py-3 font-medium">
                          <span className="mr-2 text-neutral-400">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          {college.college_display || college.college}
                        </td>
                        <td className="px-4 py-3 text-right">{college.pis.length}</td>
                        <td className="px-4 py-3 text-right">{college.charge_count}</td>
                        <td className="px-4 py-3 text-right">
                          {formatFullDollar(college.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right">{pct}%</td>
                        <td className="px-4 py-3 text-right">
                          <IIDSBadge pct={college.iids_percentage} />
                        </td>
                      </tr>
                      {isExpanded &&
                        college.pis.map((pi, idx) => (
                          <tr
                            key={`${pi.pi_email}-${idx}`}
                            className="border-b border-neutral-50 bg-blue-50/30 hover:bg-blue-50 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onPIClick?.(pi.pi_email)
                            }}
                          >
                            <td className="px-4 py-2 pl-12 text-neutral-600">
                              {pi.pi_name}
                            </td>
                            <td className="px-4 py-2 text-right text-neutral-400">—</td>
                            <td className="px-4 py-2 text-right text-neutral-600">
                              {pi.charge_count}
                            </td>
                            <td className="px-4 py-2 text-right text-neutral-600">
                              {formatFullDollar(pi.revenue)}
                            </td>
                            <td className="px-4 py-2 text-right text-neutral-400">
                              {fyExternalTotal > 0
                                ? ((pi.revenue / fyExternalTotal) * 100).toFixed(1)
                                : '0'}
                              %
                            </td>
                            <td className="px-4 py-2 text-right">
                              <IIDSBadge pct={pi.iids_percentage} />
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
