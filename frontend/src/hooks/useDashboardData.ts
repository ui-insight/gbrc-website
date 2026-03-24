import { useState, useEffect } from 'react'
import type {
  DashboardSummary,
  PIBreakdown,
  PIBreakdownResponse,
  CollegeSummary,
  TrendsData,
  ServiceCategory,
  ServicesResponse,
  CRCYearData,
  EquipmentData,
  RevenueSourcesData,
  ProposalPortfolioData,
  CheckboxAnalysisData,
  SponsorAnalysisData,
  DepartmentInsightsData,
  CrossLinkageData,
  PIAffiliationData,
  PIUsageMappingData,
  EquipmentEnrichedData,
  CRCGrowthData,
  PIUsageSummaryData,
  SimplifiedProposalData,
  SimplifiedRevenueGapData,
} from '../types/dashboard'

async function fetchDashboard<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/v1/dashboard${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [piBreakdown, setPiBreakdown] = useState<PIBreakdown[]>([])
  const [piBreakdownByFY, setPiBreakdownByFY] = useState<Record<string, PIBreakdown[]>>({})
  const [collegeBreakdown, setCollegeBreakdown] = useState<CollegeSummary[]>([])
  const [collegeBreakdownByFY, setCollegeBreakdownByFY] = useState<Record<string, CollegeSummary[]>>({})
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [services, setServices] = useState<ServiceCategory[]>([])
  const [servicesByFY, setServicesByFY] = useState<Record<string, ServiceCategory[]>>({})
  const [crcUsers, setCrcUsers] = useState<CRCYearData[]>([])
  const [equipment, setEquipment] = useState<EquipmentData[]>([])
  const [availableFYs, setAvailableFYs] = useState<string[]>(['total'])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchDashboard<DashboardSummary>('/summary'),
      fetchDashboard<PIBreakdownResponse>('/pi-breakdown'),
      fetchDashboard<TrendsData>('/trends'),
      fetchDashboard<ServicesResponse>('/services'),
      fetchDashboard<CRCYearData[]>('/crc-users'),
      fetchDashboard<EquipmentData[]>('/equipment'),
    ])
      .then(([s, piResp, t, svcResp, crc, eq]) => {
        if (cancelled) return
        setSummary(s)
        setPiBreakdown(piResp.pis)
        setPiBreakdownByFY(piResp.by_fy)
        setCollegeBreakdown(piResp.colleges)
        setCollegeBreakdownByFY(piResp.colleges_by_fy)
        setTrends(t)
        setServices(svcResp.services)
        setServicesByFY(svcResp.by_fy)
        setCrcUsers(crc)
        setEquipment(eq)
        setAvailableFYs(s.available_fiscal_years ?? ['total'])
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const loading = summary === null && error === null

  return { summary, piBreakdown, piBreakdownByFY, collegeBreakdown, collegeBreakdownByFY, trends, services, servicesByFY, crcUsers, equipment, availableFYs, loading, error }
}

/** Lazy-loading hook for tab-specific analytics data. */
export function useTabData<T>(endpoint: string, active: boolean) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active || data !== null) return
    let cancelled = false

    fetchDashboard<T>(endpoint)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load data')
      })

    return () => {
      cancelled = true
    }
  }, [active, endpoint, data])

  const loading = active && data === null && error === null

  return { data, loading, error }
}

// Pre-typed hooks for each tab
export function useRevenueSourcesData(active: boolean) {
  return useTabData<RevenueSourcesData>('/revenue-sources', active)
}

export function useProposalPortfolioData(active: boolean) {
  return useTabData<ProposalPortfolioData>('/proposal-portfolio', active)
}

export function useCheckboxAnalysisData(active: boolean) {
  return useTabData<CheckboxAnalysisData>('/checkbox-analysis', active)
}

export function useSponsorAnalysisData(active: boolean) {
  return useTabData<SponsorAnalysisData>('/sponsor-analysis', active)
}

export function useDepartmentInsightsData(active: boolean) {
  return useTabData<DepartmentInsightsData>('/department-insights', active)
}

export function useCrossLinkageData(active: boolean) {
  return useTabData<CrossLinkageData>('/cross-linkage', active)
}

export function useEquipmentEnrichedData(active: boolean) {
  return useTabData<EquipmentEnrichedData>('/equipment-enriched', active)
}

export function useCRCGrowthData(active: boolean) {
  return useTabData<CRCGrowthData>('/crc-growth', active)
}

export function usePIAffiliationData(active: boolean) {
  return useTabData<PIAffiliationData>('/pi-affiliation', active)
}

export function usePIUsageMappingData(active: boolean) {
  return useTabData<PIUsageMappingData>('/pi-usage-mapping', active)
}

export function usePIUsageSummaryData(active: boolean) {
  return useTabData<PIUsageSummaryData>('/pi-usage-summary', active)
}

export function useSimplifiedProposalsData(active: boolean) {
  return useTabData<SimplifiedProposalData>('/simplified-proposals', active)
}

export function useSimplifiedRevenueGapData(active: boolean) {
  return useTabData<SimplifiedRevenueGapData>('/simplified-revenue-gap', active)
}
