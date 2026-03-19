export interface DashboardSummary {
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  total_charges: number
  iids_charges: number
  unique_pis: number
  pis_with_zero_affiliation: number
}

export interface PIBreakdown {
  pi_email: string
  pi_name: string
  department: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
}

export interface FYTrend {
  fiscal_year: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
}

export interface MonthlyDataPoint {
  month: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
}

export interface TrendsData {
  fiscal_years: FYTrend[]
  monthly: MonthlyDataPoint[]
}

export interface ServiceCategory {
  category: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
}

export interface CRCYearData {
  fiscal_year: string
  total_users: number
  departments: Record<string, number>
  institutions: Record<string, number>
}

export interface EquipmentData {
  equipment: string
  total_hours: number
  reservation_count: number
  unique_users: number
}

export interface DashboardData {
  summary: DashboardSummary | null
  piBreakdown: PIBreakdown[]
  trends: TrendsData | null
  services: ServiceCategory[]
  crcUsers: CRCYearData[]
  equipment: EquipmentData[]
  loading: boolean
  error: string | null
}
