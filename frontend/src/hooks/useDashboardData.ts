import { useState, useEffect, useCallback, useRef } from 'react'
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
} from '../types/dashboard'

const TOKEN_KEY = 'gbrc_dashboard_token'

async function fetchWithAuth<T>(endpoint: string, token: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`/api/v1/dashboard${endpoint}`, { headers })
  if (res.status === 401) {
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export function useDashboardAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [authError, setAuthError] = useState('')

  const checkAuth = useCallback(async (t: string) => {
    setChecking(true)
    setAuthError('')
    try {
      await fetchWithAuth('/summary', t)
      setIsAuthenticated(true)
      localStorage.setItem(TOKEN_KEY, t)
      setTokenState(t)
    } catch (err) {
      if (err instanceof Error && err.message === 'unauthorized') {
        setIsAuthenticated(false)
        setAuthError('Invalid access token')
        localStorage.removeItem(TOKEN_KEY)
      } else {
        // Non-auth error means the token worked but something else failed
        // Or no auth is required (dev mode)
        setIsAuthenticated(true)
        localStorage.setItem(TOKEN_KEY, t)
        setTokenState(t)
      }
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    // Try stored token or empty (dev mode)
    checkAuth(token)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = (newToken: string) => {
    checkAuth(newToken)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setTokenState('')
    setIsAuthenticated(false)
  }

  return { token, isAuthenticated, checking, authError, login, logout }
}

export function useDashboardData(token: string, isAuthenticated: boolean) {
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
    if (!isAuthenticated) return
    let cancelled = false

    Promise.all([
      fetchWithAuth<DashboardSummary>('/summary', token),
      fetchWithAuth<PIBreakdownResponse>('/pi-breakdown', token),
      fetchWithAuth<TrendsData>('/trends', token),
      fetchWithAuth<ServicesResponse>('/services', token),
      fetchWithAuth<CRCYearData[]>('/crc-users', token),
      fetchWithAuth<EquipmentData[]>('/equipment', token),
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
  }, [token, isAuthenticated])

  const loading = isAuthenticated && summary === null && error === null

  return { summary, piBreakdown, piBreakdownByFY, collegeBreakdown, collegeBreakdownByFY, trends, services, servicesByFY, crcUsers, equipment, availableFYs, loading, error }
}

/** Lazy-loading hook for tab-specific analytics data. */
export function useTabData<T>(token: string, isAuthenticated: boolean, endpoint: string, active: boolean) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (!active || !isAuthenticated || fetched.current) return
    let cancelled = false

    fetched.current = true

    fetchWithAuth<T>(endpoint, token)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load data')
        fetched.current = false
      })

    return () => {
      cancelled = true
    }
  }, [active, token, isAuthenticated, endpoint])

  const loading = active && isAuthenticated && data === null && error === null

  return { data, loading, error }
}

// Pre-typed hooks for each tab
export function useRevenueSourcesData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<RevenueSourcesData>(token, isAuthenticated, '/revenue-sources', active)
}

export function useProposalPortfolioData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<ProposalPortfolioData>(token, isAuthenticated, '/proposal-portfolio', active)
}

export function useCheckboxAnalysisData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<CheckboxAnalysisData>(token, isAuthenticated, '/checkbox-analysis', active)
}

export function useSponsorAnalysisData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<SponsorAnalysisData>(token, isAuthenticated, '/sponsor-analysis', active)
}

export function useDepartmentInsightsData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<DepartmentInsightsData>(token, isAuthenticated, '/department-insights', active)
}

export function useCrossLinkageData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<CrossLinkageData>(token, isAuthenticated, '/cross-linkage', active)
}

export function useEquipmentEnrichedData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<EquipmentEnrichedData>(token, isAuthenticated, '/equipment-enriched', active)
}

export function useCRCGrowthData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<CRCGrowthData>(token, isAuthenticated, '/crc-growth', active)
}

export function usePIAffiliationData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<PIAffiliationData>(token, isAuthenticated, '/pi-affiliation', active)
}

export function usePIUsageMappingData(token: string, isAuthenticated: boolean, active: boolean) {
  return useTabData<PIUsageMappingData>(token, isAuthenticated, '/pi-usage-mapping', active)
}
