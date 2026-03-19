import { useState, useRef } from 'react'
import { useDashboardAuth, useDashboardData } from '../hooks/useDashboardData'
import DashboardAuth from '../components/dashboard/DashboardAuth'
import StatCard from '../components/dashboard/StatCard'
import PIBarChart from '../components/dashboard/PIBarChart'
import TrendChart from '../components/dashboard/TrendChart'
import FYComparisonChart from '../components/dashboard/FYComparisonChart'
import ServicePieChart from '../components/dashboard/ServicePieChart'
import CRCGrowthChart from '../components/dashboard/CRCGrowthChart'
import PIDetailTable from '../components/dashboard/PIDetailTable'
import PIdrilldownPanel from '../components/dashboard/PIdrilldownPanel'
import DataInspector from '../components/dashboard/DataInspector'

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toLocaleString()}`
}

function DashboardContent({ token }: { token: string }) {
  const { summary, piBreakdown, trends, services, crcUsers, equipment, loading, error } = useDashboardData(token, true)
  const [selectedPI, setSelectedPI] = useState<string | null>(null)
  const drilldownRef = useRef<HTMLDivElement>(null)

  const handlePIClick = (piEmail: string) => {
    setSelectedPI((prev) => (prev === piEmail ? null : piEmail))
    setTimeout(() => drilldownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-neutral-500">Loading dashboard data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-red-600">Error loading data: {error}</div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">IIDS Cost Recovery Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Analysis of GBRC infrastructure usage and IIDS affiliation ("checkbox") compliance.
          Data covers FY2023 through partial FY2025.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.total_revenue)}
          subtitle={`${summary.total_charges} total charges`}
          highlight="default"
        />
        <StatCard
          label="IIDS-Affiliated Revenue"
          value={formatCurrency(summary.iids_revenue)}
          subtitle={`${summary.iids_charges} affiliated charges`}
          highlight="gold"
        />
        <StatCard
          label="Recovery Gap"
          value={formatCurrency(summary.non_iids_revenue)}
          subtitle="Revenue from non-affiliated grants"
          highlight="red"
        />
        <StatCard
          label="IIDS Affiliation Rate"
          value={`${summary.iids_percentage}%`}
          subtitle={`${summary.pis_with_zero_affiliation} of ${summary.unique_pis} PIs at 0%`}
          highlight={summary.iids_percentage < 20 ? 'red' : summary.iids_percentage < 50 ? 'gold' : 'green'}
        />
      </div>

      {/* PI Revenue Gap */}
      <PIBarChart data={piBreakdown} onPIClick={handlePIClick} selectedPI={selectedPI} />

      {/* PI Drill-down Panel */}
      {selectedPI && (
        <div ref={drilldownRef}>
          <PIdrilldownPanel
            piEmail={selectedPI}
            token={token}
            onClose={() => setSelectedPI(null)}
          />
        </div>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trends && <TrendChart data={trends.monthly} />}
        {trends && <FYComparisonChart data={trends.fiscal_years} />}
      </div>

      {/* Services and CRC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServicePieChart data={services} />
        </div>
        <CRCGrowthChart data={crcUsers} />
      </div>

      {/* PI Detail Table */}
      <PIDetailTable data={piBreakdown} onPIClick={handlePIClick} selectedPI={selectedPI} />

      {/* Data Inspector */}
      <DataInspector token={token} />

      {/* Equipment Usage */}
      {equipment.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Equipment Usage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="py-2 text-neutral-500 font-medium">Equipment</th>
                  <th className="py-2 text-neutral-500 font-medium text-right">Total Hours</th>
                  <th className="py-2 text-neutral-500 font-medium text-right">Reservations</th>
                  <th className="py-2 text-neutral-500 font-medium text-right">Unique Users</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq) => (
                  <tr key={eq.equipment} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-900">{eq.equipment}</td>
                    <td className="py-2 text-right text-neutral-900">{eq.total_hours.toLocaleString()}</td>
                    <td className="py-2 text-right text-neutral-600">{eq.reservation_count}</td>
                    <td className="py-2 text-right text-neutral-600">{eq.unique_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CostRecovery() {
  const { token, isAuthenticated, checking, authError, login } = useDashboardAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardAuth
        isAuthenticated={isAuthenticated}
        checking={checking}
        authError={authError}
        onLogin={login}
      >
        <DashboardContent token={token} />
      </DashboardAuth>
    </div>
  )
}
