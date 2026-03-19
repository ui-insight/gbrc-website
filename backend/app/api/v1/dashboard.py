"""Dashboard API endpoints for checkbox cost recovery data."""

from fastapi import APIRouter, Depends

from app.api.deps import verify_dashboard_token
from app.schemas.dashboard import (
    CRCYearData,
    EquipmentItem,
    PIBreakdownItem,
    ServiceCategoryItem,
    SummaryResponse,
    TrendsResponse,
)
from app.services.checkbox_data import get_dashboard_data, get_raw_data

router = APIRouter(dependencies=[Depends(verify_dashboard_token)])


@router.get("/summary", response_model=SummaryResponse)
async def get_summary():
    """Return top-level KPI summary."""
    data = get_dashboard_data()
    return data["summary"]


@router.get("/pi-breakdown", response_model=list[PIBreakdownItem])
async def get_pi_breakdown():
    """Return per-PI revenue breakdown sorted by gap."""
    data = get_dashboard_data()
    return data["pi_breakdown"]


@router.get("/trends", response_model=TrendsResponse)
async def get_trends():
    """Return fiscal year aggregates and monthly time series."""
    data = get_dashboard_data()
    return {"fiscal_years": data["fy_trends"], "monthly": data["monthly_series"]}


@router.get("/services", response_model=list[ServiceCategoryItem])
async def get_services():
    """Return revenue by service category."""
    data = get_dashboard_data()
    return data["services"]


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


@router.get("/raw/{table}")
async def get_raw_table(table: str):
    """Return raw data rows for a given table (charges, events, crc_users)."""
    data = get_raw_data()
    if table not in data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Table '{table}' not found")
    return data[table]
