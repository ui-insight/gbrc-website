export interface DashboardSummary {
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  total_charges: number
  iids_charges: number
  unique_pis: number
  pis_with_zero_affiliation: number
  available_fiscal_years?: string[]
  by_fy?: Record<string, DashboardSummary>
}

export interface CollegeSummary {
  college: string
  college_display: string
  total_revenue: number
  iids_revenue: number
  non_iids_revenue: number
  iids_percentage: number
  charge_count: number
  unique_pis: number
}

export interface PIBreakdownResponse {
  pis: PIBreakdown[]
  colleges: CollegeSummary[]
  available_fiscal_years: string[]
  by_fy: Record<string, PIBreakdown[]>
  colleges_by_fy: Record<string, CollegeSummary[]>
}

export interface ServicesResponse {
  services: ServiceCategory[]
  available_fiscal_years: string[]
  by_fy: Record<string, ServiceCategory[]>
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

// --- Revenue Sources ---

export interface PIInCollege {
  pi_name: string
  pi_email: string
  revenue: number
  iids_revenue: number
  iids_percentage: number
  charge_count: number
}

export interface CollegeBreakdown {
  college: string
  college_display?: string
  revenue: number
  iids_revenue: number
  iids_percentage: number
  charge_count: number
  pis: PIInCollege[]
}

export interface RevenueBySourceFY {
  fiscal_year: string
  internal: number
  external: number
  corporate: number
  total: number
}

export interface SourceSummary {
  internal: number
  external: number
  corporate: number
}

export interface RevenueSourcesData {
  fiscal_years: RevenueBySourceFY[]
  source_summary: SourceSummary
  internal_by_college: CollegeBreakdown[]
  internal_by_college_by_fy: Record<string, CollegeBreakdown[]>
  external_by_college: CollegeBreakdown[]
  external_by_college_by_fy: Record<string, CollegeBreakdown[]>
  available_fiscal_years: string[]
}

// --- Proposal Portfolio ---

export interface ProposalFYItem {
  fiscal_year: string
  submitted: number
  awarded: number
  declined: number
  pending: number
  other: number
  total_awarded_cost: number
}

export interface AgreementTypeItem {
  agreement_type: string
  count: number
  awarded_count: number
  awarded_cost: number
}

export interface ProposalPortfolioData {
  by_fiscal_year: ProposalFYItem[]
  by_agreement_type: AgreementTypeItem[]
  success_rate: number
  total_proposals: number
  total_awarded_cost: number
}

// --- Checkbox Analysis ---

export interface CheckboxItem {
  name: string
  count: number
  percentage: number
}

export interface CoOccurrenceItem {
  pair: string
  count: number
}

export interface CheckboxAnalysisData {
  by_checkbox: CheckboxItem[]
  by_fiscal_year: Record<string, number | string>[]
  co_occurrence: CoOccurrenceItem[]
  no_checkbox_count: number
}

// --- Sponsor Analysis ---

export interface SponsorItem {
  sponsor: string
  count: number
  awarded_count: number
  total_cost: number
  iids_count: number
  iids_percentage: number
}

export interface SponsorCategoryItem {
  category: string
  count: number
  awarded_count: number
  total_cost: number
}

export interface SponsorAnalysisData {
  top_sponsors: SponsorItem[]
  by_category: SponsorCategoryItem[]
}

// --- PI-Centric Affiliation ---

export interface PIAffiliationSummary {
  total_pis: number
  affiliated_pis: number
  total_proposals: number
  iids_proposals: number
  iids_proposal_rate: number
  total_awarded_cost: number
}

export interface PIAffiliationItem {
  pi_name: string
  pi_email: string
  college: string
  college_display: string
  proposal_count: number
  iids_proposal_count: number
  iids_proposal_rate: number
  awarded_count: number
  awarded_cost: number
}

export interface CollegeAffiliationItem {
  college: string
  college_display: string
  pi_count: number
  affiliated_pi_count: number
  proposal_count: number
  iids_proposal_count: number
  iids_proposal_rate: number
  awarded_cost: number
}

export interface PIAffiliationData {
  summary: PIAffiliationSummary
  by_college: CollegeAffiliationItem[]
  by_pi: PIAffiliationItem[]
}

// --- Department Insights ---

export interface CollegeInsight {
  college: string
  college_display?: string
  proposal_count: number
  awarded_count: number
  awarded_cost: number
  charge_revenue: number
  charge_pi_count: number
  iids_checkbox_rate: number
  iids_charge_rate: number
}

export interface DepartmentInsightsData {
  by_college: CollegeInsight[]
}

// --- Cross-Linkage ---

export interface MatchedPI {
  pi_name: string
  pi_email: string
  charge_revenue: number
  proposal_count: number
  awarded_cost: number
}

export interface ChargesOnlyPI {
  pi_name: string
  pi_email: string
  charge_revenue: number
}

export interface ProposalsOnlyPI {
  pi_name: string
  department: string
  proposal_count: number
  awarded_cost: number
}

export interface CrossLinkageData {
  matched_pis: MatchedPI[]
  charges_only_pis: ChargesOnlyPI[]
  proposals_only_pis: ProposalsOnlyPI[]
  match_rate: number
}

// --- PI-to-Usage Mapping ---

export interface PIUsageMappingSummary {
  total_pis: number
  matched_pis: number
  proposals_only_pis: number
  usage_only_pis: number
  affiliated_pis: number
  affiliated_using_pis: number
  distinct_lab_users: number
}

export interface PIUsageCollegeItem {
  college: string
  college_display: string
  total_pis: number
  proposal_pis: number
  using_pis: number
  matched_pis: number
  affiliated_pis: number
  distinct_lab_users: number
  proposal_count: number
  iids_proposal_count: number
  iids_proposal_rate: number
  charge_revenue: number
  equipment_hours: number
}

export interface PIUsageItem {
  pi_name: string
  pi_email: string
  college: string
  college_display: string
  mapping_status: 'matched' | 'proposals_only' | 'usage_only'
  proposal_count: number
  iids_proposal_count: number
  iids_proposal_rate: number
  awarded_cost: number
  charge_revenue: number
  charge_count: number
  unique_charge_users: number
  unique_equipment_users: number
  unique_lab_users: number
  equipment_hours: number
  reservation_count: number
}

export interface PIUsageMappingData {
  summary: PIUsageMappingSummary
  by_college: PIUsageCollegeItem[]
  by_pi: PIUsageItem[]
}

// --- Equipment Enriched ---

export interface EquipmentEnrichedItem {
  equipment: string
  total_hours: number
  reservation_count: number
  unique_users: number
  departments: Record<string, number>
}

export interface EquipmentMonthlyPoint {
  month: string
  total_hours: number
}

export interface EquipmentEnrichedData {
  by_equipment: EquipmentEnrichedItem[]
  monthly_trend: EquipmentMonthlyPoint[]
}

// --- CRC Growth ---

export interface CRCRetentionItem {
  fiscal_year: string
  total_users: number
  new_users: number
  returning_users: number
  departed_users: number
}

export interface CRCGrowthData {
  retention: CRCRetentionItem[]
  by_type: Record<string, number | string>[]
}

// --- Simplified PI Usage Summary ---

export interface PIUsageSummaryStats {
  total_pis: number
  paid_pis: number
  free_pis: number
  both_pis: number
  total_revenue: number
  total_equipment_hours: number
}

export interface PIUsageSummaryItem {
  pi_email: string
  pi_name: string
  department: string
  college: string
  college_display: string
  usage_type: 'paid' | 'free' | 'both'
  total_paid: number
  charge_count: number
  equipment_hours: number
  reservation_count: number
  distinct_users: number
  uses_crc: boolean
  crc_years_label: string
}

export interface CRCCollegeUsageItem {
  college: string
  unique_users: number
}

export interface PIUsageSummaryData {
  summary: PIUsageSummaryStats
  pis: PIUsageSummaryItem[]
  available_fiscal_years: string[]
  by_fy: Record<string, {
    summary: PIUsageSummaryStats
    pis: PIUsageSummaryItem[]
  }>
  crc_by_college: CRCCollegeUsageItem[]
  crc_by_college_by_fy: Record<string, CRCCollegeUsageItem[]>
}

export interface SimplifiedProposalStats {
  total_pis: number
  pis_with_proposals: number
  total_proposals: number
  iids_proposals: number
  funded_proposals: number
  requested_total: number
  funded_total: number
}

export interface SimplifiedProposalPIItem {
  pi_name: string
  pi_email: string
  college: string
  college_display: string
  usage_type: 'paid' | 'free' | 'both'
  proposal_count: number
  iids_proposal_count: number
  funded_proposal_count: number
  requested_total: number
  funded_total: number
  latest_submission_date: string
}

export interface SimplifiedProposalItem {
  proposal_number: string
  pi_name: string
  pi_email: string
  college: string
  college_display: string
  usage_type: 'paid' | 'free' | 'both'
  title: string
  sponsor: string
  department: string
  status: string
  agreement_type: string
  submission_date: string
  fiscal_year: string
  direct_cost: number
  indirect_cost: number
  total_cost: number
  iids_affiliated: boolean
  funded: boolean
}

export interface SimplifiedProposalData {
  summary: SimplifiedProposalStats
  by_pi: SimplifiedProposalPIItem[]
  proposals: SimplifiedProposalItem[]
}

// --- Tab Data Union ---

export type DashboardTab = 'simplified' | 'simplified-proposals' | 'overview' | 'affiliation' | 'usage' | 'revenue' | 'services' | 'infrastructure'
