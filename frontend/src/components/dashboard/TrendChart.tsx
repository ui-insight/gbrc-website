import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import type { MonthlyDataPoint } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface TrendChartProps {
  data: MonthlyDataPoint[]
}

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`
const formatPct = (v: number) => `${v}%`

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; dataKey: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-3 shadow-lg text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.dataKey === 'iids_percentage' ? `${entry.value}%` : `$${entry.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ChartCard
      title="Revenue Trend Over Time"
      subtitle="Monthly revenue and IIDS checkbox compliance rate"
    >
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
          <YAxis yAxisId="revenue" tickFormatter={formatDollar} />
          <YAxis yAxisId="pct" orientation="right" tickFormatter={formatPct} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area yAxisId="revenue" type="monotone" dataKey="iids_revenue" name="IIDS Checkbox Revenue" fill="#f1b300" fillOpacity={0.3} stroke="#f1b300" stackId="rev" />
          <Area yAxisId="revenue" type="monotone" dataKey="non_iids_revenue" name="Non-Checkbox Revenue" fill="#a3a3a3" fillOpacity={0.3} stroke="#a3a3a3" stackId="rev" />
          <Line yAxisId="pct" type="monotone" dataKey="iids_percentage" name="IIDS %" stroke="#16a34a" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
