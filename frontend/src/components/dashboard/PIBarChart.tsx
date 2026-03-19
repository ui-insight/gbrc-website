import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PIBreakdown } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface PIBarChartProps {
  data: PIBreakdown[]
}

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-3 shadow-lg text-sm">
      <p className="font-semibold text-neutral-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function PIBarChart({ data }: PIBarChartProps) {
  // Show top 15 PIs by total revenue
  const chartData = data.slice(0, 15).map((pi) => ({
    name: pi.pi_name.length > 20 ? pi.pi_name.slice(0, 18) + '...' : pi.pi_name,
    fullName: pi.pi_name,
    'Non-IIDS Revenue': pi.non_iids_revenue,
    'IIDS Revenue': pi.iids_revenue,
    department: pi.department,
    iids_pct: pi.iids_percentage,
  }))

  return (
    <ChartCard
      title="Revenue Gap by PI"
      subtitle="Top 15 PIs by total revenue — gold = IIDS-affiliated, gray = not affiliated"
    >
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis type="number" tickFormatter={formatDollar} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="IIDS Revenue" stackId="a" fill="#f1b300" />
          <Bar dataKey="Non-IIDS Revenue" stackId="a" fill="#a3a3a3" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
