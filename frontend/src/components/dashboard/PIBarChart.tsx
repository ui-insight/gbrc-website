import {
  BarChart,
  Bar,
  Cell,
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
  onPIClick?: (piEmail: string) => void
  selectedPI?: string | null
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

export default function PIBarChart({ data, onPIClick, selectedPI }: PIBarChartProps) {
  // Show top 15 PIs by total revenue
  const chartData = data.slice(0, 15).map((pi) => ({
    name: pi.pi_name.length > 20 ? pi.pi_name.slice(0, 18) + '...' : pi.pi_name,
    fullName: pi.pi_name,
    piEmail: pi.pi_email,
    'Non-Checkbox Revenue': pi.non_iids_revenue,
    'IIDS Checkbox Revenue': pi.iids_revenue,
    department: pi.department,
    iids_pct: pi.iids_percentage,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any) => {
    const piEmail = data?.piEmail || data?.payload?.piEmail
    if (onPIClick && piEmail) {
      onPIClick(piEmail as string)
    }
  }

  return (
    <ChartCard
      title="Revenue Gap by PI"
      subtitle="Top 15 PIs by total revenue — click a bar to drill down into charges"
    >
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis type="number" tickFormatter={formatDollar} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="IIDS Checkbox Revenue" stackId="a" fill="#f1b300" onClick={handleBarClick} style={{ cursor: onPIClick ? 'pointer' : undefined }}>
            {chartData.map((entry, index) => (
              <Cell key={`iids-${index}`} fill={selectedPI === entry.piEmail ? '#d4a017' : '#f1b300'} />
            ))}
          </Bar>
          <Bar dataKey="Non-Checkbox Revenue" stackId="a" fill="#a3a3a3" onClick={handleBarClick} style={{ cursor: onPIClick ? 'pointer' : undefined }}>
            {chartData.map((entry, index) => (
              <Cell key={`non-${index}`} fill={selectedPI === entry.piEmail ? '#737373' : '#a3a3a3'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selectedPI && (
        <p className="text-xs text-neutral-400 mt-2 text-center">
          Showing details for selected PI below
        </p>
      )}
    </ChartCard>
  )
}
