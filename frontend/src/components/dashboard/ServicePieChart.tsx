import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ServiceCategory } from '../../types/dashboard'
import ChartCard from './ChartCard'

interface ServicePieChartProps {
  data: ServiceCategory[]
}

const COLORS = ['#f1b300', '#a3a3a3', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#84cc16']

export default function ServicePieChart({ data }: ServicePieChartProps) {
  // Combine small categories into "Other"
  const threshold = 0.03
  const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0)
  const significant: Array<{ name: string; value: number; iids_pct: number }> = []
  let otherValue = 0

  for (const d of data) {
    if (d.total_revenue / totalRevenue >= threshold) {
      significant.push({
        name: d.category.length > 30 ? d.category.slice(0, 28) + '...' : d.category,
        value: d.total_revenue,
        iids_pct: d.iids_percentage,
      })
    } else {
      otherValue += d.total_revenue
    }
  }
  if (otherValue > 0) {
    significant.push({ name: 'Other', value: otherValue, iids_pct: 0 })
  }

  return (
    <ChartCard
      title="Revenue by Service Category"
      subtitle="Distribution of charges across genomics services"
    >
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={significant}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine
          >
            {significant.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
      {/* Service table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="py-2 text-neutral-500 font-medium">Category</th>
              <th className="py-2 text-neutral-500 font-medium text-right">Revenue</th>
              <th className="py-2 text-neutral-500 font-medium text-right">IIDS %</th>
              <th className="py-2 text-neutral-500 font-medium text-right">Charges</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.category} className="border-b border-neutral-100">
                <td className="py-2 text-neutral-900">{d.category}</td>
                <td className="py-2 text-right text-neutral-900">${d.total_revenue.toLocaleString()}</td>
                <td className="py-2 text-right">
                  <span className={d.iids_percentage > 0 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}>
                    {d.iids_percentage}%
                  </span>
                </td>
                <td className="py-2 text-right text-neutral-600">{d.charge_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
