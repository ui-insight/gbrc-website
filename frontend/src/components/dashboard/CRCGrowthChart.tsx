import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { CRCYearData } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface CRCGrowthChartProps {
  data: CRCYearData[]
}

export default function CRCGrowthChart({ data }: CRCGrowthChartProps) {
  const chartData = data.map((d) => ({
    name: d.fiscal_year,
    users: d.total_users,
  }))

  return (
    <ChartCard
      title="CRC Compute Users"
      subtitle="Unique users of high-performance computing infrastructure by fiscal year"
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" name="Users" fill="#f1b300" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="users" position="top" style={{ fontWeight: 'bold', fontSize: 14 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
