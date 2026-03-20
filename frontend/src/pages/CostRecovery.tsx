import { useState, useRef } from 'react'
import {
  useDashboardAuth,
  useDashboardData,
  useRevenueSourcesData,
  useProposalPortfolioData,
  useCheckboxAnalysisData,
  useSponsorAnalysisData,
  useDepartmentInsightsData,
  useCrossLinkageData,
  useEquipmentEnrichedData,
  useCRCGrowthData,
} from '../hooks/useDashboardData'
import type { DashboardTab } from '../types/dashboard'
import DashboardAuth from '../components/dashboard/DashboardAuth'
import StatCard from '../components/dashboard/StatCard'
import CollegeBarChart from '../components/dashboard/CollegeBarChart'
import TrendChart from '../components/dashboard/TrendChart'
import FYComparisonChart from '../components/dashboard/FYComparisonChart'
import PIDetailTable from '../components/dashboard/PIDetailTable'
import ServicesTab from '../components/dashboard/ServicesTab'
import PIdrilldownPanel from '../components/dashboard/PIdrilldownPanel'
import DataInspector from '../components/dashboard/DataInspector'
import RevenueSourcesTab from '../components/dashboard/RevenueSourcesTab'
import ProposalsTab from '../components/dashboard/ProposalsTab'
import DepartmentsTab from '../components/dashboard/DepartmentsTab'
import InfrastructureTab from '../components/dashboard/InfrastructureTab'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'revenue', label: 'Revenue Sources' },
  { id: 'services', label: 'Services' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'departments', label: 'Departments' },
  { id: 'infrastructure', label: 'Infrastructure' },
]

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toLocaleString()}`
}

function FYSelector({ available, selected, onChange }: { available: string[]; selected: string; onChange: (fy: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-neutral-500">Fiscal Year:</span>
      {available.map((fy) => (
        <button
          key={fy}
          onClick={() => onChange(fy)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === fy
              ? 'bg-amber-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {fy === 'total' ? 'All Years' : fy}
        </button>
      ))}
    </div>
  )
}

function DashboardContent({ token }: { token: string }) {
  const { summary, piBreakdown, piBreakdownByFY, collegeBreakdown, collegeBreakdownByFY, trends, services, servicesByFY, crcUsers, equipment, availableFYs, loading, error } = useDashboardData(token, true)
  const [selectedPI, setSelectedPI] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [overviewFY, setOverviewFY] = useState<string>('total')
  const drilldownRef = useRef<HTMLDivElement>(null)

  // Lazy-loaded tab data
  const revenueSources = useRevenueSourcesData(token, true, activeTab === 'revenue')
  const proposalPortfolio = useProposalPortfolioData(token, true, activeTab === 'proposals')
  const checkboxAnalysis = useCheckboxAnalysisData(token, true, activeTab === 'proposals')
  const sponsorAnalysis = useSponsorAnalysisData(token, true, activeTab === 'proposals')
  const departmentInsights = useDepartmentInsightsData(token, true, activeTab === 'departments')
  const crossLinkage = useCrossLinkageData(token, true, activeTab === 'departments')
  const equipmentEnriched = useEquipmentEnrichedData(token, true, activeTab === 'infrastructure')
  const crcGrowth = useCRCGrowthData(token, true, activeTab === 'infrastructure')

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">IIDS Cost Recovery Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Analysis of GBRC infrastructure usage, IIDS checkbox compliance, revenue sources, and proposal analytics.
          Data covers FY2023 through partial FY2025.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Dashboard tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (() => {
        const fySummary = overviewFY === 'total' ? summary : (summary.by_fy?.[overviewFY] ?? summary)
        const fyPIs = piBreakdownByFY[overviewFY] ?? piBreakdown
        const fyColleges = collegeBreakdownByFY[overviewFY] ?? collegeBreakdown
        const fySvcs = servicesByFY[overviewFY] ?? services

        return (
        <div className="space-y-8">
          {/* Fiscal Year Selector */}
          <FYSelector available={availableFYs} selected={overviewFY} onChange={setOverviewFY} />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(fySummary.total_revenue)}
              subtitle={`${fySummary.total_charges} total charges`}
              highlight="default"
            />
            <StatCard
              label="IIDS Checkbox Rate"
              value={`${fySummary.iids_percentage}%`}
              subtitle={`${fySummary.pis_with_zero_affiliation} of ${fySummary.unique_pis} PIs at 0%`}
              highlight={fySummary.iids_percentage < 20 ? 'red' : fySummary.iids_percentage < 50 ? 'gold' : 'green'}
            />
            <StatCard
              label="IIDS Checkbox Revenue"
              value={formatCurrency(fySummary.iids_revenue)}
              subtitle={`${fySummary.iids_charges} affiliated charges`}
              highlight="gold"
            />
            <StatCard
              label="Recovery Gap"
              value={formatCurrency(fySummary.non_iids_revenue)}
              subtitle="Revenue from non IIDS affiliated grants"
              highlight="red"
            />
          </div>

          {/* College Revenue Breakdown */}
          <CollegeBarChart data={fyColleges} />

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

          {/* Trends (always show all years — these are time-based charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends && <TrendChart data={trends.monthly} />}
            {trends && <FYComparisonChart data={trends.fiscal_years} />}
          </div>

          {/* PI Detail Table */}
          <PIDetailTable data={fyPIs} onPIClick={handlePIClick} selectedPI={selectedPI} />

          {/* Data Inspector */}
          <DataInspector token={token} />
        </div>
        )
      })()}

      {activeTab === 'revenue' && (
        revenueSources.loading
          ? <div className="text-center py-12 text-neutral-500">Loading revenue sources...</div>
          : revenueSources.data
            ? <RevenueSourcesTab data={revenueSources.data} onPIClick={handlePIClick} />
            : revenueSources.error
              ? <div className="text-center py-12 text-red-600">Error: {revenueSources.error}</div>
              : null
      )}

      {activeTab === 'services' && (
        <ServicesTab
          services={services}
          servicesByFY={servicesByFY}
          availableFYs={availableFYs}
        />
      )}

      {activeTab === 'proposals' && (
        <ProposalsTab
          portfolio={proposalPortfolio.data}
          checkboxes={checkboxAnalysis.data}
          sponsors={sponsorAnalysis.data}
          loading={proposalPortfolio.loading || checkboxAnalysis.loading || sponsorAnalysis.loading}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab
          insights={departmentInsights.data}
          crossLinkage={crossLinkage.data}
          loading={departmentInsights.loading || crossLinkage.loading}
        />
      )}

      {activeTab === 'infrastructure' && (
        <InfrastructureTab
          equipment={equipment}
          crcUsers={crcUsers}
          equipmentEnriched={equipmentEnriched.data}
          crcGrowth={crcGrowth.data}
          loading={equipmentEnriched.loading || crcGrowth.loading}
        />
      )}

      {/* PI Drill-down Panel (available from any tab) */}
      {selectedPI && activeTab !== 'overview' && (
        <div ref={drilldownRef}>
          <PIdrilldownPanel
            piEmail={selectedPI}
            token={token}
            onClose={() => setSelectedPI(null)}
          />
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
