import { useState, useEffect, useCallback } from 'react'
import type {
  DashboardSummary,
  PIBreakdown,
  TrendsData,
  ServiceCategory,
  CRCYearData,
  EquipmentData,
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
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [services, setServices] = useState<ServiceCategory[]>([])
  const [crcUsers, setCrcUsers] = useState<CRCYearData[]>([])
  const [equipment, setEquipment] = useState<EquipmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    Promise.all([
      fetchWithAuth<DashboardSummary>('/summary', token),
      fetchWithAuth<PIBreakdown[]>('/pi-breakdown', token),
      fetchWithAuth<TrendsData>('/trends', token),
      fetchWithAuth<ServiceCategory[]>('/services', token),
      fetchWithAuth<CRCYearData[]>('/crc-users', token),
      fetchWithAuth<EquipmentData[]>('/equipment', token),
    ])
      .then(([s, pi, t, svc, crc, eq]) => {
        setSummary(s)
        setPiBreakdown(pi)
        setTrends(t)
        setServices(svc)
        setCrcUsers(crc)
        setEquipment(eq)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token, isAuthenticated])

  return { summary, piBreakdown, trends, services, crcUsers, equipment, loading, error }
}
