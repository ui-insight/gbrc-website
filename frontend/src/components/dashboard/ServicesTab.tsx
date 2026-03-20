import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import type { ServiceCategory } from '../../types/dashboard'
import ChartCard from './ChartCard'
import StatCard from './StatCard'

const COLORS = ['#f1b300', '#a3a3a3', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#84cc16']

const formatDollar = (v: number) => `$${(v / 1000).toFixed(0)}K`
const formatFullDollar = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

interface Props {
  services: ServiceCategory[]
  servicesByFY: Record<string, ServiceCategory[]>
  availableFYs: string[]
}

export default function ServicesTab({ services, servicesByFY, availableFYs }: Props) {
  const [selectedFY, setSelectedFY] = useState<string>('total')

  const data = servicesByFY[selectedFY] ?? services
  const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0)
  const totalCharges = data.reduce((sum, d) => sum + d.charge_count, 0)
  const totalIIDS = data.reduce((sum, d) => sum + d.iids_revenue, 0)
  const iidsRate = totalRevenue > 0 ? ((totalIIDS / totalRevenue) * 100).toFixed(1) : '0'

  // Pie data: combine small categories
  const threshold = 0.03
  const significant: Array<{ name: string; value: number }> = []
  let otherValue = 0
  for (const d of data) {
    if (totalRevenue > 0 && d.total_revenue / totalRevenue >= threshold) {
      significant.push({
        name: d.category.length > 30 ? d.category.slice(0, 28) + '...' : d.category,
        value: d.total_revenue,
      })
    } else {
      otherValue += d.total_revenue
    }
  }
  if (otherValue > 0) {
    significant.push({ name: 'Other', value: otherValue })
  }

  // Bar chart data: top 10 categories as horizontal bars
  const barData = data.slice(0, 10).map((d) => ({
    category: d.category.length > 25 ? d.category.slice(0, 23) + '...' : d.category,
    iids_revenue: d.iids_revenue,
    non_iids_revenue: d.non_iids_revenue,
    total_revenue: d.total_revenue,
    iids_percentage: d.iids_percentage,
    full_category: d.category,
  }))

  return (
    <div className="space-y-6">
      {/* FY selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-neutral-500">Fiscal Year:</span>
        {availableFYs.map((fy) => (
          <button
            key={fy}
            onClick={() => setSelectedFY(fy)}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatFullDollar(totalRevenue)} subtitle={`${totalCharges} charges`} highlight="default" />
        <StatCard label="IIDS Checkbox Revenue" value={formatFullDollar(totalIIDS)} subtitle={`${iidsRate}% of total`} highlight="gold" />
        <StatCard label="Service Categories" value={String(data.length)} subtitle="unique categories" highlight="default" />
        <StatCard
          label="Top Category"
          value={data.length > 0 ? (data[0].category.length > 18 ? data[0].category.slice(0, 16) + '...' : data[0].category) : '—'}
          subtitle={data.length > 0 ? formatFullDollar(data[0].total_revenue) : ''}
          highlight="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Distribution" subtitle="By service category">
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
                {significant.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatFullDollar(value)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Services — IIDS Breakdown" subtitle="Gold = IIDS affiliated grants, Gray = non IIDS affiliated grants">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={formatDollar} />
              <YAxis dataKey="category" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatFullDollar(value)}
                labelFormatter={(label) => {
                  const item = barData.find((b) => b.category === label)
                  return item?.full_category ?? label
                }}
              />
              <Legend />
              <Bar dataKey="iids_revenue" name="IIDS Checkbox Revenue" stackId="a" fill="#f1b300" />
              <Bar dataKey="non_iids_revenue" name="Non-Checkbox Revenue" stackId="a" fill="#d1d5db" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Full Service Table */}
      <ChartCard title="All Service Categories" subtitle="Sorted by revenue">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold text-right">Charges</th>
                <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                <th className="px-4 py-3 font-semibold text-right">IIDS Checkbox Revenue</th>
                <th className="px-4 py-3 font-semibold text-right">IIDS Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.category} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-2 font-medium">{d.category}</td>
                  <td className="px-4 py-2 text-right">{d.charge_count}</td>
                  <td className="px-4 py-2 text-right">{formatFullDollar(d.total_revenue)}</td>
                  <td className="px-4 py-2 text-right">{formatFullDollar(d.iids_revenue)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      d.iids_percentage >= 50
                        ? 'bg-green-100 text-green-800'
                        : d.iids_percentage > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {d.iids_percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
