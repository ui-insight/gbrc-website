import { useState, useRef } from 'react'
import {
  useDashboardData,
  usePIAffiliationData,
  usePIUsageMappingData,
  useRevenueSourcesData,
  useEquipmentEnrichedData,
  useCRCGrowthData,
} from '../hooks/useDashboardData'
import type { DashboardTab } from '../types/dashboard'
import ChartCard from '../components/dashboard/ChartCard'
import StatCard from '../components/dashboard/StatCard'
import CollegeBarChart from '../components/dashboard/CollegeBarChart'
import TrendChart from '../components/dashboard/TrendChart'
import FYComparisonChart from '../components/dashboard/FYComparisonChart'
import PIDetailTable from '../components/dashboard/PIDetailTable'
import ServicesTab from '../components/dashboard/ServicesTab'
import PIdrilldownPanel from '../components/dashboard/PIdrilldownPanel'
import DataInspector from '../components/dashboard/DataInspector'
import AffiliationTab from '../components/dashboard/AffiliationTab'
import UsageMappingTab from '../components/dashboard/UsageMappingTab'
import RevenueSourcesTab from '../components/dashboard/RevenueSourcesTab'
import InfrastructureTab from '../components/dashboard/InfrastructureTab'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'affiliation', label: 'Proposal Affiliation' },
  { id: 'usage', label: 'PI To GBRC Usage' },
  { id: 'revenue', label: 'Revenue Sources' },
  { id: 'services', label: 'Services' },
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

export default function CostRecovery() {
  const { summary, piBreakdown, piBreakdownByFY, collegeBreakdown, collegeBreakdownByFY, trends, services, servicesByFY, crcUsers, equipment, availableFYs, loading, error } = useDashboardData()
  const [selectedPI, setSelectedPI] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [overviewFY, setOverviewFY] = useState<string>('total')
  const drilldownRef = useRef<HTMLDivElement>(null)

  // Lazy-loaded tab data
  const piAffiliation = usePIAffiliationData(activeTab === 'overview' || activeTab === 'affiliation')
  const piUsageMapping = usePIUsageMappingData(activeTab === 'overview' || activeTab === 'usage')
  const revenueSources = useRevenueSourcesData(activeTab === 'revenue')
  const equipmentEnriched = useEquipmentEnrichedData(activeTab === 'infrastructure')
  const crcGrowth = useCRCGrowthData(activeTab === 'infrastructure')

  const handlePIClick = (piEmail: string) => {
    setSelectedPI((prev) => (prev === piEmail ? null : piEmail))
    setTimeout(() => drilldownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-neutral-500">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-red-600">Error loading data: {error}</div>
        </div>
      </div>
    )
  }

  if (!summary) return null

  const chargeCoverage = availableFYs.filter((fy) => fy !== 'total').join(', ') || 'the available fiscal years'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">IIDS Cost Recovery Dashboard</h1>
          <p className="mt-2 text-neutral-600">
            Analysis of GBRC infrastructure usage, IIDS checkbox compliance, revenue sources, and proposal analytics.
            Charge-based metrics currently cover {chargeCoverage}. Proposal analytics use the full proposal dataset available in the backend.
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
          const topAffiliationCollege = piAffiliation.data?.by_college[0]
          const topUsageCollege = piUsageMapping.data?.by_college[0]
          return (
          <div className="space-y-8">
            {/* Fiscal Year Selector */}
            <FYSelector available={availableFYs} selected={overviewFY} onChange={setOverviewFY} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard
                title="Question 1 Snapshot"
                subtitle="Which PIs are affiliating proposals with IIDS, and where are they concentrated?"
              >
                {piAffiliation.loading ? (
                  <div className="text-sm text-neutral-500">Loading proposal affiliation snapshot...</div>
                ) : piAffiliation.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <StatCard
                        label="PIs Using IIDS"
                        value={piAffiliation.data.summary.affiliated_pis.toLocaleString()}
                        subtitle={`${piAffiliation.data.summary.total_pis.toLocaleString()} proposal PIs`}
                        highlight="gold"
                      />
                      <StatCard
                        label="IIDS Proposals"
                        value={piAffiliation.data.summary.iids_proposals.toLocaleString()}
                        subtitle={`${piAffiliation.data.summary.iids_proposal_rate}% of proposals`}
                        highlight="green"
                      />
                      <StatCard
                        label="Top College"
                        value={topAffiliationCollege?.college ?? '—'}
                        subtitle={topAffiliationCollege ? `${topAffiliationCollege.iids_proposal_count} IIDS proposals` : 'No proposal data'}
                        highlight="default"
                      />
                    </div>
                    <p className="text-sm text-neutral-600">
                      {topAffiliationCollege
                        ? `${topAffiliationCollege.college_display} currently leads this view with ${topAffiliationCollege.iids_proposal_count} IIDS-affiliated proposals and an ${topAffiliationCollege.iids_proposal_rate}% affiliation rate.`
                        : 'Proposal affiliation data is not available yet.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('affiliation')}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Open Proposal Affiliation
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">Proposal affiliation data is not available yet.</div>
                )}
              </ChartCard>

              <ChartCard
                title="Question 2 Snapshot"
                subtitle="How do those PIs map onto the users actually showing up in GBRC activity?"
              >
                {piUsageMapping.loading ? (
                  <div className="text-sm text-neutral-500">Loading PI-to-usage snapshot...</div>
                ) : piUsageMapping.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <StatCard
                        label="Matched PIs"
                        value={piUsageMapping.data.summary.matched_pis.toLocaleString()}
                        subtitle="Proposal plus GBRC usage"
                        highlight="green"
                      />
                      <StatCard
                        label="Affiliated And Using"
                        value={piUsageMapping.data.summary.affiliated_using_pis.toLocaleString()}
                        subtitle={`${piUsageMapping.data.summary.affiliated_pis.toLocaleString()} affiliated PIs total`}
                        highlight="gold"
                      />
                      <StatCard
                        label="Lab Users"
                        value={piUsageMapping.data.summary.distinct_lab_users.toLocaleString()}
                        subtitle={topUsageCollege ? `${topUsageCollege.college} leads by matched PI count` : 'Across billed and equipment activity'}
                        highlight="default"
                      />
                    </div>
                    <p className="text-sm text-neutral-600">
                      {topUsageCollege
                        ? `${topUsageCollege.college_display} currently has the strongest observed linkage in this view, with ${topUsageCollege.matched_pis} matched PIs and ${topUsageCollege.distinct_lab_users} distinct lab users tied to those labs.`
                        : 'PI-to-usage mapping data is not available yet.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('usage')}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      Open PI To GBRC Usage
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">PI-to-usage mapping data is not available yet.</div>
                )}
              </ChartCard>
            </div>

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
                  key={selectedPI}
                  piEmail={selectedPI}
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
            <DataInspector />
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

        {activeTab === 'affiliation' && (
          <AffiliationTab
            data={piAffiliation.data}
            loading={piAffiliation.loading}
            onPIClick={handlePIClick}
          />
        )}

        {activeTab === 'usage' && (
          <UsageMappingTab
            data={piUsageMapping.data}
            loading={piUsageMapping.loading}
            onPIClick={handlePIClick}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            services={services}
            servicesByFY={servicesByFY}
            availableFYs={availableFYs}
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
              key={selectedPI}
              piEmail={selectedPI}
              onClose={() => setSelectedPI(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
