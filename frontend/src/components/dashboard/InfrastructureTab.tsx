import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import type {
  EquipmentEnrichedData,
  CRCGrowthData,
  CRCYearData,
  EquipmentData,
} from '../../types/dashboard'
import ChartCard from './ChartCard'
import CRCGrowthChart from './CRCGrowthChart'

interface Props {
  equipment: EquipmentData[]
  crcUsers: CRCYearData[]
  equipmentEnriched: EquipmentEnrichedData | null
  crcGrowth: CRCGrowthData | null
  loading: boolean
}

export default function InfrastructureTab({ equipment, crcUsers, equipmentEnriched, crcGrowth, loading }: Props) {
  return (
    <div className="space-y-6">
      {/* Equipment Monthly Trend */}
      {equipmentEnriched && equipmentEnriched.monthly_trend.length > 0 && (
        <ChartCard title="Equipment Usage Trend" subtitle="Total hours by month">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equipmentEnriched.monthly_trend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total_hours" name="Hours" stroke="#f1b300" fill="#f1b30033" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Equipment Detail Table */}
      <ChartCard title="Equipment Usage Detail" subtitle={equipmentEnriched ? 'With college breakdown' : 'Summary'}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left font-semibold">Equipment</th>
                <th className="px-4 py-3 text-right font-semibold">Total Hours</th>
                <th className="px-4 py-3 text-right font-semibold">Reservations</th>
                <th className="px-4 py-3 text-right font-semibold">Unique Users</th>
                {equipmentEnriched && <th className="px-4 py-3 text-left font-semibold">Top Colleges</th>}
              </tr>
            </thead>
            <tbody>
              {(equipmentEnriched ? equipmentEnriched.by_equipment : equipment).map((eq) => {
                const enriched = equipmentEnriched?.by_equipment.find((e) => e.equipment === eq.equipment)
                return (
                  <tr key={eq.equipment} className="border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium">{eq.equipment}</td>
                    <td className="px-4 py-3 text-right">{eq.total_hours.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">{eq.reservation_count}</td>
                    <td className="px-4 py-3 text-right">{eq.unique_users}</td>
                    {equipmentEnriched && (
                      <td className="px-4 py-3 text-neutral-600">
                        {enriched
                          ? Object.entries(enriched.departments)
                              .slice(0, 3)
                              .map(([dept, count]) => `${dept} (${count})`)
                              .join(', ')
                          : '—'}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* CRC Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CRCGrowthChart data={crcUsers} />
        </div>

        {/* CRC Retention Chart */}
        {crcGrowth && (
          <ChartCard title="CRC User Retention" subtitle="New vs returning vs departed users">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={crcGrowth.retention} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fiscal_year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="returning_users" name="Returning" stackId="a" fill="#16a34a" />
                <Bar dataKey="new_users" name="New" stackId="a" fill="#3b82f6" />
                <Bar dataKey="departed_users" name="Departed" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* CRC User Type Breakdown */}
        {crcGrowth && (
          <ChartCard title="CRC User Types" subtitle="By fiscal year">
            <div className="overflow-y-auto max-h-[300px]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                    {crcGrowth.by_type.map((fy) => (
                      <th key={fy.fiscal_year as string} className="px-3 py-2 text-right font-semibold">
                        {fy.fiscal_year as string}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allTypes = new Set<string>()
                    crcGrowth.by_type.forEach((fy) => {
                      Object.keys(fy).forEach((k) => { if (k !== 'fiscal_year') allTypes.add(k) })
                    })
                    return Array.from(allTypes).sort().map((type) => (
                      <tr key={type} className="border-b border-neutral-100">
                        <td className="px-3 py-2">{type}</td>
                        {crcGrowth.by_type.map((fy) => (
                          <td key={fy.fiscal_year as string} className="px-3 py-2 text-right">
                            {(fy[type] as number) || 0}
                          </td>
                        ))}
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
