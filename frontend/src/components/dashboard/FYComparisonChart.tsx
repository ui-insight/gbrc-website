import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { FYTrend } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface FYComparisonChartProps {
  data: FYTrend[]
}

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`

export default function FYComparisonChart({ data }: FYComparisonChartProps) {
  return (
    <ChartCard
      title="Fiscal Year Comparison"
      subtitle="IIDS-affiliated vs non-affiliated revenue by fiscal year"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ left: 10, right: 30, top: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="fiscal_year" />
          <YAxis tickFormatter={formatDollar} />
          <Tooltip
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          />
          <Legend />
          <Bar dataKey="iids_revenue" name="IIDS Revenue" fill="#f1b300">
            <LabelList
              dataKey="iids_percentage"
              position="top"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 12, fontWeight: 'bold', fill: '#16a34a' }}
            />
          </Bar>
          <Bar dataKey="non_iids_revenue" name="Non-IIDS Revenue" fill="#a3a3a3" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
