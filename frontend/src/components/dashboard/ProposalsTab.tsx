import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type {
  ProposalPortfolioData,
  CheckboxAnalysisData,
  SponsorAnalysisData,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

const STATUS_COLORS = {
  awarded: '#16a34a',
  declined: '#ef4444',
  pending: '#f1b300',
  other: '#a3a3a3',
}

const CHECKBOX_COLORS = ['#f1b300', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4']

const SPONSOR_CAT_COLORS = ['#f1b300', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316', '#a3a3a3']

const formatDollar = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}
const formatFullDollar = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

interface Props {
  portfolio: ProposalPortfolioData | null
  checkboxes: CheckboxAnalysisData | null
  sponsors: SponsorAnalysisData | null
  loading: boolean
}

export default function ProposalsTab({ portfolio, checkboxes, sponsors, loading }: Props) {
  const [sponsorSort, setSponsorSort] = useState<'count' | 'total_cost'>('count')

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading proposal analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {portfolio && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Proposals" value={portfolio.total_proposals.toLocaleString()} highlight="default" />
            <StatCard label="Success Rate" value={`${portfolio.success_rate}%`} highlight="green" />
            <StatCard label="Total Awarded" value={formatDollar(portfolio.total_awarded_cost)} highlight="gold" />
            <StatCard
              label="IIDS Checkbox Rate"
              value={checkboxes ? `${checkboxes.by_checkbox.find(c => c.name === 'IIDS')?.percentage ?? 0}%` : '—'}
              subtitle={checkboxes ? `${checkboxes.by_checkbox.find(c => c.name === 'IIDS')?.count ?? 0} proposals` : ''}
              highlight="gold"
            />
          </div>

          {/* Proposal Status by FY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Proposal Outcomes by Fiscal Year" subtitle="Submitted vs Awarded vs Declined">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={portfolio.by_fiscal_year} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fiscal_year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="awarded" name="Awarded" stackId="a" fill={STATUS_COLORS.awarded} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.pending} />
                  <Bar dataKey="declined" name="Declined" stackId="a" fill={STATUS_COLORS.declined} />
                  <Bar dataKey="other" name="Other" stackId="a" fill={STATUS_COLORS.other} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Agreement Types" subtitle="By proposal count and awarded funding">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={portfolio.by_agreement_type}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="agreement_type" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number, name: string) =>
                    name === 'Awarded Cost' ? formatFullDollar(value) : value
                  } />
                  <Legend />
                  <Bar dataKey="count" name="Total" fill="#a3a3a3" />
                  <Bar dataKey="awarded_count" name="Awarded" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* Checkbox Analysis */}
      {checkboxes && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Institutional Checkbox Usage" subtitle="How often each checkbox is checked on proposals">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={checkboxes.by_checkbox}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={50} />
                <Tooltip formatter={(value: number, name: string) =>
                  name === 'percentage' ? `${value}%` : value
                } />
                <Bar dataKey="count" name="Proposals">
                  {checkboxes.by_checkbox.map((_, i) => (
                    <Cell key={i} fill={CHECKBOX_COLORS[i % CHECKBOX_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-neutral-500 mt-2 px-2">
              {checkboxes.no_checkbox_count.toLocaleString()} proposals ({
                portfolio ? ((checkboxes.no_checkbox_count / portfolio.total_proposals) * 100).toFixed(0) : '?'
              }%) had no checkbox selected
            </p>
          </ChartCard>

          <ChartCard title="Checkbox Co-occurrence" subtitle="Most common checkbox pairs">
            <div className="overflow-y-auto max-h-[350px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-2 text-left font-semibold">Pair</th>
                    <th className="px-4 py-2 text-right font-semibold">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {checkboxes.co_occurrence.map((item) => (
                    <tr key={item.pair} className="border-b border-neutral-100">
                      <td className="px-4 py-2">{item.pair.replace('+', ' + ')}</td>
                      <td className="px-4 py-2 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Sponsor Analysis */}
      {sponsors && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Top Sponsors" subtitle="By proposal count">
            <div className="mb-2 flex gap-2 px-2">
              <button
                onClick={() => setSponsorSort('count')}
                className={`text-xs px-2 py-1 rounded ${sponsorSort === 'count' ? 'bg-neutral-800 text-white' : 'bg-neutral-100'}`}
              >
                By Count
              </button>
              <button
                onClick={() => setSponsorSort('total_cost')}
                className={`text-xs px-2 py-1 rounded ${sponsorSort === 'total_cost' ? 'bg-neutral-800 text-white' : 'bg-neutral-100'}`}
              >
                By Funded Amount
              </button>
            </div>
            <div className="overflow-y-auto max-h-[400px] lg:col-span-2">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 text-left font-semibold">Sponsor</th>
                    <th className="px-3 py-2 text-right font-semibold">Proposals</th>
                    <th className="px-3 py-2 text-right font-semibold">Awarded</th>
                    <th className="px-3 py-2 text-right font-semibold">Funded $</th>
                    <th className="px-3 py-2 text-right font-semibold">IIDS %</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sponsors.top_sponsors]
                    .sort((a, b) => (b[sponsorSort] as number) - (a[sponsorSort] as number))
                    .map((s) => (
                    <tr key={s.sponsor} className="border-b border-neutral-100">
                      <td className="px-3 py-2 max-w-[200px] truncate" title={s.sponsor}>{s.sponsor}</td>
                      <td className="px-3 py-2 text-right">{s.count}</td>
                      <td className="px-3 py-2 text-right">{s.awarded_count}</td>
                      <td className="px-3 py-2 text-right">{formatDollar(s.total_cost)}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs ${s.iids_percentage > 0 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'}`}>
                          {s.iids_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Sponsor Categories" subtitle="Federal, State, University, etc.">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sponsors.by_category}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {sponsors.by_category.map((_, i) => (
                    <Cell key={i} fill={SPONSOR_CAT_COLORS[i % SPONSOR_CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} proposals`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
