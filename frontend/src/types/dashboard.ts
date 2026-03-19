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

export interface PICharge {
  billing_date: string
  fiscal_year: string
  charge_name: string
  category: string
  service_id: string
  quantity: number
  unit_price: number
  total_price: number
  payment_index: string
  is_iids: boolean
  status: string
  user: string
  user_email: string
}

export interface PIProposal {
  proposal_number: string
  title: string
  sponsor: string
  department: string
  status: string
  agreement_type: string
  submission_date: string
  direct_cost: number
  indirect_cost: number
  total_cost: number
  iids_affiliated: boolean
}

export interface PIDetail {
  pi_email: string
  pi_name: string
  department: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
  charges: PICharge[]
  proposals: PIProposal[]
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
