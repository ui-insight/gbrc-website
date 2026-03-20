import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { CollegeSummary } from '../../types/dashboard'
import ChartCard from './ChartCard'

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`
const formatFullDollar = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

interface Props {
  data: CollegeSummary[]
}

export default function CollegeBarChart({ data }: Props) {
  if (!data || data.length === 0) return null

  // Use college code as short label for the chart, display name in tooltip
  const chartData = data.map((c) => ({
    ...c,
    label: c.college,
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CollegeSummary }> }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-neutral-900 mb-1">{d.college_display || d.college}</p>
        <p className="text-amber-600">IIDS Checkbox Revenue: {formatFullDollar(d.iids_revenue)}</p>
        <p className="text-neutral-500">Non-Checkbox Revenue: {formatFullDollar(d.non_iids_revenue)}</p>
        <p className="text-neutral-700 font-medium mt-1">Total: {formatFullDollar(d.total_revenue)}</p>
        <p className="text-neutral-500 mt-1">IIDS Rate: {d.iids_percentage}% &middot; {d.unique_pis} PIs &middot; {d.charge_count} charges</p>
      </div>
    )
  }

  return (
    <ChartCard
      title="Internal Revenue by College"
      subtitle="UI researcher charges — IIDS affiliated grants (gold) vs non IIDS affiliated grants (gray)"
    >
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 60 + 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={formatDollar} />
          <YAxis
            dataKey="label"
            type="category"
            width={60}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="iids_revenue" name="IIDS Checkbox Revenue" stackId="a" fill="#f1b300">
            {chartData.map((_, i) => (
              <Cell key={i} fill="#f1b300" />
            ))}
          </Bar>
          <Bar dataKey="non_iids_revenue" name="Non-Checkbox Revenue" stackId="a" fill="#d1d5db" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill="#d1d5db" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table below chart */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
              <th className="px-4 py-2 font-semibold">College</th>
              <th className="px-4 py-2 font-semibold text-right">PIs</th>
              <th className="px-4 py-2 font-semibold text-right">Charges</th>
              <th className="px-4 py-2 font-semibold text-right">Revenue</th>
              <th className="px-4 py-2 font-semibold text-right">IIDS Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.college} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2 font-medium">{c.college_display || c.college}</td>
                <td className="px-4 py-2 text-right">{c.unique_pis}</td>
                <td className="px-4 py-2 text-right">{c.charge_count}</td>
                <td className="px-4 py-2 text-right">{formatFullDollar(c.total_revenue)}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    c.iids_percentage >= 50
                      ? 'bg-green-100 text-green-800'
                      : c.iids_percentage > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {c.iids_percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
