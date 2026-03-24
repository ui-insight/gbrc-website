"""Dashboard response schemas."""

from pydantic import BaseModel


class SummaryResponse(BaseModel):
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    total_charges: int
    iids_charges: int
    unique_pis: int
    pis_with_zero_affiliation: int


class PIBreakdownItem(BaseModel):
    pi_email: str
    pi_name: str
    department: str
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    charge_count: int


class FYTrendItem(BaseModel):
    fiscal_year: str
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    charge_count: int


class MonthlyDataPoint(BaseModel):
    month: str
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    charge_count: int


class TrendsResponse(BaseModel):
    fiscal_years: list[FYTrendItem]
    monthly: list[MonthlyDataPoint]


class ServiceCategoryItem(BaseModel):
    category: str
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    charge_count: int


class CRCYearData(BaseModel):
    fiscal_year: str
    total_users: int
    departments: dict[str, int]
    institutions: dict[str, int]


class EquipmentItem(BaseModel):
    equipment: str
    total_hours: float
    reservation_count: int
    unique_users: int


class PIChargeItem(BaseModel):
    billing_date: str
    fiscal_year: str
    charge_name: str
    category: str
    service_id: str
    quantity: float
    unit_price: float
    total_price: float
    payment_index: str
    is_iids: bool
    status: str
    user: str
    user_email: str


class PIProposalItem(BaseModel):
    proposal_number: str
    title: str
    sponsor: str
    department: str
    status: str
    agreement_type: str
    submission_date: str
    direct_cost: float
    indirect_cost: float
    total_cost: float
    iids_affiliated: bool


class PIDetailResponse(BaseModel):
    pi_email: str
    pi_name: str
    department: str
    total_revenue: float
    iids_revenue: float
    non_iids_revenue: float
    iids_percentage: float
    charge_count: int
    charges: list[PIChargeItem]
    proposals: list[PIProposalItem]


# --- Revenue Sources ---


class PIInCollege(BaseModel):
    pi_name: str
    pi_email: str
    revenue: float
    iids_revenue: float = 0
    iids_percentage: float = 0
    charge_count: int


class CollegeBreakdown(BaseModel):
    college: str
    college_display: str = ""
    revenue: float
    iids_revenue: float = 0
    iids_percentage: float = 0
    charge_count: int
    pis: list[PIInCollege]


class RevenueBySourceFY(BaseModel):
    fiscal_year: str
    internal: float
    external: float
    corporate: float
    total: float


class SourceSummary(BaseModel):
    internal: float
    external: float
    corporate: float


class RevenueSourcesResponse(BaseModel):
    fiscal_years: list[RevenueBySourceFY]
    source_summary: SourceSummary
    internal_by_college: list[CollegeBreakdown]
    internal_by_college_by_fy: dict[str, list[CollegeBreakdown]] = {}
    external_by_college: list[CollegeBreakdown] = []
    external_by_college_by_fy: dict[str, list[CollegeBreakdown]] = {}
    available_fiscal_years: list[str] = []


# --- Proposal Portfolio ---


class ProposalFYItem(BaseModel):
    fiscal_year: str
    submitted: int
    awarded: int
    declined: int
    pending: int
    other: int
    total_awarded_cost: float


class AgreementTypeItem(BaseModel):
    agreement_type: str
    count: int
    awarded_count: int
    awarded_cost: float


class ProposalPortfolioResponse(BaseModel):
    by_fiscal_year: list[ProposalFYItem]
    by_agreement_type: list[AgreementTypeItem]
    success_rate: float
    total_proposals: int
    total_awarded_cost: float


# --- Checkbox Analysis ---


class CheckboxItem(BaseModel):
    name: str
    count: int
    percentage: float


class CoOccurrenceItem(BaseModel):
    pair: str
    count: int


class CheckboxAnalysisResponse(BaseModel):
    by_checkbox: list[CheckboxItem]
    by_fiscal_year: list[dict]
    co_occurrence: list[CoOccurrenceItem]
    no_checkbox_count: int


# --- Sponsor Analysis ---


class SponsorItem(BaseModel):
    sponsor: str
    count: int
    awarded_count: int
    total_cost: float
    iids_count: int
    iids_percentage: float


class SponsorCategoryItem(BaseModel):
    category: str
    count: int
    awarded_count: int
    total_cost: float


class SponsorAnalysisResponse(BaseModel):
    top_sponsors: list[SponsorItem]
    by_category: list[SponsorCategoryItem]


# --- Department Insights ---


class CollegeInsightItem(BaseModel):
    college: str
    college_display: str = ""
    proposal_count: int
    awarded_count: int
    awarded_cost: float
    charge_revenue: float
    charge_pi_count: int
    iids_checkbox_rate: float
    iids_charge_rate: float


class DepartmentInsightsResponse(BaseModel):
    by_college: list[CollegeInsightItem]


# --- Cross-Linkage ---


class MatchedPI(BaseModel):
    pi_name: str
    pi_email: str
    charge_revenue: float
    proposal_count: int
    awarded_cost: float


class ChargesOnlyPI(BaseModel):
    pi_name: str
    pi_email: str
    charge_revenue: float


class ProposalsOnlyPI(BaseModel):
    pi_name: str
    department: str
    proposal_count: int
    awarded_cost: float


class CrossLinkageResponse(BaseModel):
    matched_pis: list[MatchedPI]
    charges_only_pis: list[ChargesOnlyPI]
    proposals_only_pis: list[ProposalsOnlyPI]
    match_rate: float


# --- Equipment Enriched ---


class EquipmentEnrichedItem(BaseModel):
    equipment: str
    total_hours: float
    reservation_count: int
    unique_users: int
    departments: dict[str, int]


class EquipmentMonthlyPoint(BaseModel):
    month: str
    total_hours: float


class EquipmentEnrichedResponse(BaseModel):
    by_equipment: list[EquipmentEnrichedItem]
    monthly_trend: list[EquipmentMonthlyPoint]


# --- CRC Growth ---


class CRCRetentionItem(BaseModel):
    fiscal_year: str
    total_users: int
    new_users: int
    returning_users: int
    departed_users: int


class CRCGrowthResponse(BaseModel):
    retention: list[CRCRetentionItem]
    by_type: list[dict]


# --- PI-Centric Affiliation ---


class PIAffiliationSummary(BaseModel):
    total_pis: int
    affiliated_pis: int
    total_proposals: int
    iids_proposals: int
    iids_proposal_rate: float
    total_awarded_cost: float


class PIAffiliationItem(BaseModel):
    pi_name: str
    pi_email: str = ""
    college: str
    college_display: str = ""
    proposal_count: int
    iids_proposal_count: int
    iids_proposal_rate: float
    awarded_count: int
    awarded_cost: float


class CollegeAffiliationItem(BaseModel):
    college: str
    college_display: str = ""
    pi_count: int
    affiliated_pi_count: int
    proposal_count: int
    iids_proposal_count: int
    iids_proposal_rate: float
    awarded_cost: float


class PIAffiliationResponse(BaseModel):
    summary: PIAffiliationSummary
    by_college: list[CollegeAffiliationItem]
    by_pi: list[PIAffiliationItem]


# --- PI-to-Usage Mapping ---


class PIUsageMappingSummary(BaseModel):
    total_pis: int
    matched_pis: int
    proposals_only_pis: int
    usage_only_pis: int
    affiliated_pis: int
    affiliated_using_pis: int
    distinct_lab_users: int


class PIUsageCollegeItem(BaseModel):
    college: str
    college_display: str = ""
    total_pis: int
    proposal_pis: int
    using_pis: int
    matched_pis: int
    affiliated_pis: int
    distinct_lab_users: int
    proposal_count: int
    iids_proposal_count: int
    iids_proposal_rate: float
    charge_revenue: float
    equipment_hours: float


class PIUsageItem(BaseModel):
    pi_name: str
    pi_email: str = ""
    college: str
    college_display: str = ""
    mapping_status: str
    proposal_count: int
    iids_proposal_count: int
    iids_proposal_rate: float
    awarded_cost: float
    charge_revenue: float
    charge_count: int
    unique_charge_users: int
    unique_equipment_users: int
    unique_lab_users: int
    equipment_hours: float
    reservation_count: int


class PIUsageMappingResponse(BaseModel):
    summary: PIUsageMappingSummary
    by_college: list[PIUsageCollegeItem]
    by_pi: list[PIUsageItem]


# --- Simplified PI Usage Summary ---


class PIUsageSummaryStats(BaseModel):
    total_pis: int
    paid_pis: int
    free_pis: int
    both_pis: int
    total_revenue: float
    total_equipment_hours: float


class PIUsageSummaryItem(BaseModel):
    pi_email: str
    pi_name: str
    department: str
    college: str
    college_display: str
    usage_type: str  # "paid", "free", "both"
    total_paid: float
    charge_count: int
    equipment_hours: float
    reservation_count: int
    distinct_users: int


class PIUsageSummaryYear(BaseModel):
    summary: PIUsageSummaryStats
    pis: list[PIUsageSummaryItem]


class PIUsageSummaryResponse(BaseModel):
    summary: PIUsageSummaryStats
    pis: list[PIUsageSummaryItem]
    available_fiscal_years: list[str] = []
    by_fy: dict[str, PIUsageSummaryYear] = {}


class SimplifiedProposalStats(BaseModel):
    total_pis: int
    pis_with_proposals: int
    total_proposals: int
    iids_proposals: int
    funded_proposals: int
    requested_total: float
    funded_total: float


class SimplifiedProposalPIItem(BaseModel):
    pi_name: str
    pi_email: str
    college: str
    college_display: str
    usage_type: str
    proposal_count: int
    iids_proposal_count: int
    funded_proposal_count: int
    requested_total: float
    funded_total: float
    latest_submission_date: str


class SimplifiedProposalItem(BaseModel):
    proposal_number: str
    pi_name: str
    pi_email: str
    college: str
    college_display: str
    usage_type: str
    title: str
    sponsor: str
    department: str
    status: str
    agreement_type: str
    submission_date: str
    fiscal_year: str
    direct_cost: float
    indirect_cost: float
    total_cost: float
    iids_affiliated: bool
    funded: bool


class SimplifiedProposalResponse(BaseModel):
    summary: SimplifiedProposalStats
    by_pi: list[SimplifiedProposalPIItem]
    proposals: list[SimplifiedProposalItem]
