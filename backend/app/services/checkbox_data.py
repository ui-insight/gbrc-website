"""Checkbox cost recovery data processing service.

Loads CSV/TSV data files and computes aggregated metrics for the
cost recovery dashboard. All results are cached in memory on first load.
"""

import csv
import os
from datetime import datetime
from functools import lru_cache
from pathlib import Path


def _data_dir() -> Path:
    """Return the path to the data directory."""
    env_dir = os.environ.get("GBRC_DASHBOARD_DATA_DIR", "")
    if env_dir:
        return Path(env_dir)
    return Path(__file__).resolve().parent.parent / "data"


def _parse_date(date_str: str) -> datetime | None:
    """Parse date strings like '2022-08-03 11:28:14 -0700'."""
    if not date_str or not date_str.strip():
        return None
    try:
        # Strip timezone offset and parse
        parts = date_str.rsplit(" ", 1)
        return datetime.strptime(parts[0].strip(), "%Y-%m-%d %H:%M:%S")
    except (ValueError, IndexError):
        return None


def _fiscal_year(dt: datetime) -> int:
    """Return fiscal year (e.g., 2023 for dates July 2022 - June 2023)."""
    return dt.year + 1 if dt.month >= 7 else dt.year


def _parse_float(val: str) -> float:
    """Parse a string to float, returning 0.0 on failure."""
    try:
        return float(val.strip()) if val and val.strip() else 0.0
    except ValueError:
        return 0.0


def _parse_hours(val: str) -> float:
    """Parse hours value from events data."""
    try:
        return float(val.strip()) if val and val.strip() else 0.0
    except ValueError:
        return 0.0


def _load_iids_index_set() -> set[str]:
    """Load the set of UI_INDEX values from the grant index map."""
    indices = set()
    path = _data_dir() / "grant_index_map.csv"
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            idx = row.get("UI_INDEX", "").strip().strip('"')
            if idx:
                indices.add(idx)
    return indices


def _load_charges() -> list[dict]:
    """Load and parse the charges CSV, filtering to Total Price > 0."""
    path = _data_dir() / "charges.csv"
    charges = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_price = _parse_float(row.get("Total Price", "0"))
            if total_price <= 0:
                continue
            charges.append(row)
    return charges


def _load_events() -> list[dict]:
    """Load and parse the events CSV."""
    path = _data_dir() / "events.csv"
    events = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Event Type", "").strip().lower() == "unavailable":
                continue
            events.append(row)
    return events


def _load_crc_users(fiscal_year: int) -> list[dict]:
    """Load CRC users for a given fiscal year."""
    fy_suffix = str(fiscal_year)[-4:] if fiscal_year >= 2023 else str(fiscal_year)
    path = _data_dir() / f"crc_users_fy{fy_suffix}.tsv"
    if not path.exists():
        return []
    users = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            users.append(row)
    return users


def _extract_pi_name(lab_field: str) -> str:
    """Extract PI name from lab field like 'Marx, Chris (UI) Lab'."""
    if not lab_field:
        return "Unknown"
    # Remove trailing ' Lab' or ' lab'
    name = lab_field.strip()
    if name.lower().endswith(" lab"):
        name = name[:-4].strip()
    # Remove institution in parens like '(UI)'
    import re
    name = re.sub(r"\s*\([^)]*\)\s*", " ", name).strip()
    # Convert "Last, First" to "First Last"
    if "," in name:
        parts = name.split(",", 1)
        name = f"{parts[1].strip()} {parts[0].strip()}"
    return name


@lru_cache(maxsize=1)
def get_dashboard_data() -> dict:
    """Compute all dashboard data. Cached after first call."""
    iids_indices = _load_iids_index_set()
    charges = _load_charges()

    # Annotate charges with IIDS affiliation and fiscal year
    for charge in charges:
        payment_info = charge.get("Payment Information", "").strip()
        charge["_is_iids"] = payment_info in iids_indices
        charge["_total_price"] = _parse_float(charge.get("Total Price", "0"))
        dt = _parse_date(charge.get("Billing Date", "") or charge.get("Purchase Date", ""))
        charge["_date"] = dt
        charge["_fy"] = _fiscal_year(dt) if dt else None
        charge["_pi_email"] = charge.get("PI Email", "").strip().lower()
        charge["_pi_name"] = _extract_pi_name(charge.get("Customer Lab", ""))
        charge["_department"] = charge.get("Customer Department", "").strip()
        charge["_category"] = charge.get("Category", "").strip()

    # Filter to charges within FY2023-FY2025 range (billing date July 2022+)
    valid_charges = [c for c in charges if c["_fy"] and c["_fy"] >= 2023]

    # --- Summary KPIs ---
    total_revenue = sum(c["_total_price"] for c in valid_charges)
    iids_revenue = sum(c["_total_price"] for c in valid_charges if c["_is_iids"])
    non_iids_revenue = total_revenue - iids_revenue
    total_charges = len(valid_charges)
    iids_charges = sum(1 for c in valid_charges if c["_is_iids"])

    pi_emails = set(c["_pi_email"] for c in valid_charges if c["_pi_email"])
    pis_with_zero = set()
    for pi in pi_emails:
        pi_charges = [c for c in valid_charges if c["_pi_email"] == pi]
        pi_iids = sum(c["_total_price"] for c in pi_charges if c["_is_iids"])
        if pi_iids == 0:
            pis_with_zero.add(pi)

    summary = {
        "total_revenue": round(total_revenue, 2),
        "iids_revenue": round(iids_revenue, 2),
        "non_iids_revenue": round(non_iids_revenue, 2),
        "iids_percentage": round(iids_revenue / total_revenue * 100, 1) if total_revenue > 0 else 0,
        "total_charges": total_charges,
        "iids_charges": iids_charges,
        "unique_pis": len(pi_emails),
        "pis_with_zero_affiliation": len(pis_with_zero),
    }

    # --- PI Breakdown ---
    pi_data = {}
    for c in valid_charges:
        pi = c["_pi_email"]
        if not pi:
            continue
        if pi not in pi_data:
            pi_data[pi] = {
                "pi_email": pi,
                "pi_name": c["_pi_name"],
                "department": c["_department"],
                "total_revenue": 0.0,
                "iids_revenue": 0.0,
                "non_iids_revenue": 0.0,
                "charge_count": 0,
            }
        pi_data[pi]["total_revenue"] += c["_total_price"]
        if c["_is_iids"]:
            pi_data[pi]["iids_revenue"] += c["_total_price"]
        else:
            pi_data[pi]["non_iids_revenue"] += c["_total_price"]
        pi_data[pi]["charge_count"] += 1

    pi_breakdown = []
    for pi_info in pi_data.values():
        total = pi_info["total_revenue"]
        pi_info["iids_percentage"] = round(pi_info["iids_revenue"] / total * 100, 1) if total > 0 else 0
        pi_info["total_revenue"] = round(pi_info["total_revenue"], 2)
        pi_info["iids_revenue"] = round(pi_info["iids_revenue"], 2)
        pi_info["non_iids_revenue"] = round(pi_info["non_iids_revenue"], 2)
        pi_breakdown.append(pi_info)
    pi_breakdown.sort(key=lambda x: x["non_iids_revenue"], reverse=True)

    # --- Fiscal Year Trends ---
    fy_data: dict[int, dict] = {}
    for c in valid_charges:
        fy = c["_fy"]
        if fy not in fy_data:
            fy_data[fy] = {"fiscal_year": f"FY{str(fy)[-2:]}", "total_revenue": 0.0, "iids_revenue": 0.0, "non_iids_revenue": 0.0, "charge_count": 0}
        fy_data[fy]["total_revenue"] += c["_total_price"]
        if c["_is_iids"]:
            fy_data[fy]["iids_revenue"] += c["_total_price"]
        else:
            fy_data[fy]["non_iids_revenue"] += c["_total_price"]
        fy_data[fy]["charge_count"] += 1

    fy_trends = []
    for fy in sorted(fy_data.keys()):
        entry = fy_data[fy]
        total = entry["total_revenue"]
        entry["iids_percentage"] = round(entry["iids_revenue"] / total * 100, 1) if total > 0 else 0
        entry["total_revenue"] = round(entry["total_revenue"], 2)
        entry["iids_revenue"] = round(entry["iids_revenue"], 2)
        entry["non_iids_revenue"] = round(entry["non_iids_revenue"], 2)
        fy_trends.append(entry)

    # --- Monthly Time Series ---
    monthly_data: dict[str, dict] = {}
    for c in valid_charges:
        dt = c["_date"]
        if not dt:
            continue
        key = dt.strftime("%Y-%m")
        if key not in monthly_data:
            monthly_data[key] = {"month": key, "total_revenue": 0.0, "iids_revenue": 0.0, "non_iids_revenue": 0.0, "charge_count": 0}
        monthly_data[key]["total_revenue"] += c["_total_price"]
        if c["_is_iids"]:
            monthly_data[key]["iids_revenue"] += c["_total_price"]
        else:
            monthly_data[key]["non_iids_revenue"] += c["_total_price"]
        monthly_data[key]["charge_count"] += 1

    monthly_series = []
    for key in sorted(monthly_data.keys()):
        entry = monthly_data[key]
        total = entry["total_revenue"]
        entry["iids_percentage"] = round(entry["iids_revenue"] / total * 100, 1) if total > 0 else 0
        entry["total_revenue"] = round(entry["total_revenue"], 2)
        entry["iids_revenue"] = round(entry["iids_revenue"], 2)
        entry["non_iids_revenue"] = round(entry["non_iids_revenue"], 2)
        monthly_series.append(entry)

    # --- Service Categories ---
    category_data: dict[str, dict] = {}
    for c in valid_charges:
        cat = c["_category"] or "Uncategorized"
        if cat not in category_data:
            category_data[cat] = {"category": cat, "total_revenue": 0.0, "iids_revenue": 0.0, "non_iids_revenue": 0.0, "charge_count": 0}
        category_data[cat]["total_revenue"] += c["_total_price"]
        if c["_is_iids"]:
            category_data[cat]["iids_revenue"] += c["_total_price"]
        else:
            category_data[cat]["non_iids_revenue"] += c["_total_price"]
        category_data[cat]["charge_count"] += 1

    services = []
    for entry in category_data.values():
        total = entry["total_revenue"]
        entry["iids_percentage"] = round(entry["iids_revenue"] / total * 100, 1) if total > 0 else 0
        entry["total_revenue"] = round(entry["total_revenue"], 2)
        entry["iids_revenue"] = round(entry["iids_revenue"], 2)
        entry["non_iids_revenue"] = round(entry["non_iids_revenue"], 2)
        services.append(entry)
    services.sort(key=lambda x: x["total_revenue"], reverse=True)

    # --- CRC Users ---
    crc_users = []
    for fy in [2023, 2024, 2025]:
        users = _load_crc_users(fy)
        unique_usernames = set(u.get("username", "").strip() for u in users if u.get("username", "").strip())
        # Count by department
        dept_counts: dict[str, int] = {}
        inst_counts: dict[str, int] = {}
        for u in users:
            dept = u.get("dept", "").strip() or "Unknown"
            inst = u.get("inst", "").strip() or "Unknown"
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            inst_counts[inst] = inst_counts.get(inst, 0) + 1

        crc_users.append({
            "fiscal_year": f"FY{str(fy)[-2:]}",
            "total_users": len(unique_usernames),
            "departments": dict(sorted(dept_counts.items(), key=lambda x: x[1], reverse=True)),
            "institutions": dict(sorted(inst_counts.items(), key=lambda x: x[1], reverse=True)),
        })

    # --- Equipment Usage ---
    events = _load_events()
    equip_data: dict[str, dict] = {}
    for e in events:
        equip = e.get("Equipment Name", "").strip()
        if not equip:
            continue
        hours = _parse_hours(e.get("Actual Hours", "0"))
        if equip not in equip_data:
            equip_data[equip] = {"equipment": equip, "total_hours": 0.0, "reservation_count": 0, "unique_users": set()}
        equip_data[equip]["total_hours"] += hours
        equip_data[equip]["reservation_count"] += 1
        user_email = e.get("User Login Email", "").strip()
        if user_email:
            equip_data[equip]["unique_users"].add(user_email)

    equipment = []
    for entry in equip_data.values():
        equipment.append({
            "equipment": entry["equipment"],
            "total_hours": round(entry["total_hours"], 1),
            "reservation_count": entry["reservation_count"],
            "unique_users": len(entry["unique_users"]),
        })
    equipment.sort(key=lambda x: x["total_hours"], reverse=True)

    return {
        "summary": summary,
        "pi_breakdown": pi_breakdown,
        "fy_trends": fy_trends,
        "monthly_series": monthly_series,
        "services": services,
        "crc_users": crc_users,
        "equipment": equipment,
    }


@lru_cache(maxsize=1)
def get_raw_data() -> dict:
    """Return raw data rows for the data inspector panel."""
    iids_indices = _load_iids_index_set()

    # --- Raw Charges ---
    charges = _load_charges()
    raw_charges = []
    for c in charges:
        payment_info = c.get("Payment Information", "").strip()
        dt = _parse_date(c.get("Billing Date", "") or c.get("Purchase Date", ""))
        fy = _fiscal_year(dt) if dt else None
        if not fy or fy < 2023:
            continue
        raw_charges.append({
            "billing_date": dt.strftime("%Y-%m-%d") if dt else "",
            "fiscal_year": f"FY{str(fy)[-2:]}",
            "pi_name": _extract_pi_name(c.get("Customer Lab", "")),
            "pi_email": c.get("PI Email", "").strip(),
            "user": c.get("Customer Name", "").strip(),
            "user_email": c.get("User Login Email", "").strip(),
            "department": c.get("Customer Department", "").strip(),
            "charge_name": c.get("Charge Name", "").strip(),
            "category": c.get("Category", "").strip(),
            "service_id": c.get("Service ID", "").strip(),
            "quantity": _parse_float(c.get("Quantity", "0")),
            "unit_price": _parse_float(c.get("Price", "0")),
            "total_price": _parse_float(c.get("Total Price", "0")),
            "payment_index": payment_info,
            "is_iids": payment_info in iids_indices,
            "status": c.get("Status", "").strip(),
            "billing_status": c.get("Billing Status", "").strip(),
            "core_name": c.get("Core Name", "").strip(),
        })
    raw_charges.sort(key=lambda x: x["billing_date"], reverse=True)

    # --- Raw Events ---
    events = _load_events()
    raw_events = []
    for e in events:
        dt = _parse_date(e.get("Scheduled Start", ""))
        raw_events.append({
            "date": dt.strftime("%Y-%m-%d") if dt else "",
            "equipment": e.get("Equipment Name", "").strip(),
            "user": e.get("Customer Name", "").strip(),
            "user_email": e.get("User Login Email", "").strip(),
            "pi_name": _extract_pi_name(e.get("Customer Lab", "")),
            "pi_email": e.get("PI Email", "").strip(),
            "title": e.get("Customer Title", "").strip(),
            "department": e.get("Customer Department", "").strip(),
            "scheduled_hours": _parse_hours(e.get("Scheduled Hours", "0")),
            "actual_hours": _parse_hours(e.get("Actual Hours", "0")),
            "event_type": e.get("Event Type", "").strip(),
        })
    raw_events.sort(key=lambda x: x["date"], reverse=True)

    # --- Raw CRC Users (all years combined) ---
    raw_crc = []
    for fy in [2023, 2024, 2025]:
        users = _load_crc_users(fy)
        for u in users:
            raw_crc.append({
                "fiscal_year": f"FY{str(fy)[-2:]}",
                "name": f"{u.get('fname', '').strip()} {u.get('lname', '').strip()}".strip(),
                "username": u.get("username", "").strip(),
                "email": u.get("email", "").strip(),
                "type": u.get("type", "").strip(),
                "service": u.get("service", "").strip(),
                "department": u.get("dept", "").strip(),
                "college": u.get("college", "").strip(),
                "institution": u.get("inst", "").strip(),
            })

    return {
        "charges": raw_charges,
        "events": raw_events,
        "crc_users": raw_crc,
    }
