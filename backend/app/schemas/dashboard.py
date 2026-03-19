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
