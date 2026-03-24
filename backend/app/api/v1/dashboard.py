"""Dashboard API endpoints for checkbox cost recovery data."""

from fastapi import APIRouter

from app.schemas.dashboard import (
    CheckboxAnalysisResponse,
    CRCGrowthResponse,
    CRCYearData,
    CrossLinkageResponse,
    DepartmentInsightsResponse,
    EquipmentEnrichedResponse,
    EquipmentItem,
    PIBreakdownItem,
    PIDetailResponse,
    PIAffiliationResponse,
    PIUsageMappingResponse,
    PIUsageSummaryResponse,
    ProposalPortfolioResponse,
    RevenueSourcesResponse,
    ServiceCategoryItem,
    SimplifiedProposalResponse,
    SimplifiedRevenueGapResponse,
    SponsorAnalysisResponse,
    SummaryResponse,
    TrendsResponse,
)
from app.services.checkbox_data import (
    get_analytics_data,
    get_dashboard_data,
    get_pi_charges,
    get_simplified_proposals,
    get_simplified_revenue_gap,
    get_pi_usage_summary,
    get_raw_data,
)

router = APIRouter()


@router.get("/summary")
async def get_summary():
    """Return top-level KPI summary with per-FY breakdowns."""
    data = get_dashboard_data()
    return {
        **data["summary"],
        "available_fiscal_years": data["available_fiscal_years"],
        "by_fy": data["summary_by_fy"],
    }


@router.get("/pi-breakdown")
async def get_pi_breakdown():
    """Return per-PI revenue breakdown sorted by gap, with per-FY breakdowns."""
    data = get_dashboard_data()
    return {
        "pis": data["pi_breakdown"],
        "colleges": data["college_breakdown"],
        "available_fiscal_years": data["available_fiscal_years"],
        "by_fy": data["pi_breakdown_by_fy"],
        "colleges_by_fy": data["college_breakdown_by_fy"],
    }


@router.get("/trends", response_model=TrendsResponse)
async def get_trends():
    """Return fiscal year aggregates and monthly time series."""
    data = get_dashboard_data()
    return {"fiscal_years": data["fy_trends"], "monthly": data["monthly_series"]}


@router.get("/services")
async def get_services():
    """Return revenue by service category with per-FY breakdowns."""
    data = get_dashboard_data()
    return {
        "services": data["services"],
        "available_fiscal_years": data["available_fiscal_years"],
        "by_fy": data["services_by_fy"],
    }


@router.get("/crc-users", response_model=list[CRCYearData])
async def get_crc_users():
    """Return CRC user counts by fiscal year."""
    data = get_dashboard_data()
    return data["crc_users"]


@router.get("/equipment", response_model=list[EquipmentItem])
async def get_equipment():
    """Return equipment reservation hours."""
    data = get_dashboard_data()
    return data["equipment"]


# --- Extended Analytics Endpoints ---
# NOTE: These must be defined BEFORE /pi/{pi_email} and /raw/{table}
# to avoid the path parameter catching these literal paths.


@router.get("/revenue-sources", response_model=RevenueSourcesResponse)
async def get_revenue_sources():
    """Revenue by FY by source type with internal college breakdown."""
    return get_analytics_data()["revenue_sources"]


@router.get("/proposal-portfolio", response_model=ProposalPortfolioResponse)
async def get_proposal_portfolio():
    """Proposal volume, status breakdown, and success rates."""
    return get_analytics_data()["proposal_portfolio"]


@router.get("/checkbox-analysis", response_model=CheckboxAnalysisResponse)
async def get_checkbox_analysis():
    """IIDS/IMCI/ARI/etc. checkbox usage analysis."""
    return get_analytics_data()["checkbox_analysis"]


@router.get("/sponsor-analysis", response_model=SponsorAnalysisResponse)
async def get_sponsor_analysis():
    """Top sponsors and sponsor category breakdown."""
    return get_analytics_data()["sponsor_analysis"]


@router.get("/department-insights", response_model=DepartmentInsightsResponse)
async def get_department_insights():
    """College-level scorecard linking proposals to charges."""
    return get_analytics_data()["department_insights"]


@router.get("/cross-linkage", response_model=CrossLinkageResponse)
async def get_cross_linkage():
    """PI cross-linkage between charges and proposals."""
    return get_analytics_data()["cross_linkage"]


@router.get("/equipment-enriched", response_model=EquipmentEnrichedResponse)
async def get_equipment_enriched():
    """Equipment usage by department with monthly trends."""
    return get_analytics_data()["equipment_enriched"]


@router.get("/crc-growth", response_model=CRCGrowthResponse)
async def get_crc_growth():
    """CRC user retention/churn and type breakdown."""
    return get_analytics_data()["crc_growth"]


@router.get("/pi-affiliation", response_model=PIAffiliationResponse)
async def get_pi_affiliation():
    """PI-level proposal affiliation with college rollups."""
    return get_analytics_data()["pi_affiliation"]


@router.get("/pi-usage-mapping", response_model=PIUsageMappingResponse)
async def get_pi_usage_mapping():
    """Map proposal PIs to the GBRC users working in their labs."""
    return get_analytics_data()["pi_usage_mapping"]


@router.get("/pi-usage-summary", response_model=PIUsageSummaryResponse)
async def get_pi_usage_summary_endpoint():
    """Simplified view: which PIs use GBRC and do they pay or use for free."""
    return get_pi_usage_summary()


@router.get("/simplified-proposals", response_model=SimplifiedProposalResponse)
async def get_simplified_proposals_endpoint():
    """Proposal view limited to the simplified GBRC PI set."""
    return get_simplified_proposals()


@router.get("/simplified-revenue-gap", response_model=SimplifiedRevenueGapResponse)
async def get_simplified_revenue_gap_endpoint():
    """Non-IIDS payment sources used by the simplified GBRC PI set."""
    return get_simplified_revenue_gap()


# --- Parameterized routes (must be last to avoid catching literal paths) ---


@router.get("/pi/{pi_email}", response_model=PIDetailResponse)
async def get_pi_detail(pi_email: str):
    """Return detailed charge data for a specific PI."""
    from fastapi import HTTPException

    result = get_pi_charges(pi_email)
    if result is None:
        raise HTTPException(status_code=404, detail=f"PI '{pi_email}' not found")
    return result


@router.get("/raw/{table}")
async def get_raw_table(table: str):
    """Return raw data rows for a given table (charges, events, crc_users, proposals)."""
    data = get_raw_data()
    if table not in data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Table '{table}' not found")
    return data[table]
