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


# University of Idaho email domains
_UI_EMAIL_DOMAINS = {"uidaho.edu"}
_PI_NAME_ALIASES = {
    "chris caudill": "Christopher Caudill",
    "chris marx": "Christopher Marx",
    "jake bledsoe": "Jacob Bledsoe",
}


def _is_ui_email(email: str) -> bool:
    """Check if an email address belongs to University of Idaho."""
    if not email or "@" not in email:
        return False
    domain = email.strip().lower().split("@")[1]
    return domain in _UI_EMAIL_DOMAINS


def _user_key(email: str, name: str) -> str:
    """Create a stable per-user key from email or fallback name."""
    cleaned_email = email.strip().lower()
    if cleaned_email:
        return cleaned_email
    return name.strip().lower()


def _canonical_pi_name(name: str) -> str:
    """Normalize a PI name for matching while preserving display names elsewhere."""
    cleaned = " ".join(name.strip().split())
    if not cleaned:
        return cleaned
    return _PI_NAME_ALIASES.get(cleaned.lower(), cleaned)


@lru_cache(maxsize=1)
def get_dashboard_data() -> dict:
    """Compute all dashboard data. Cached after first call."""
    iids_indices = _load_iids_index_set()
    charges = _load_charges()

    # Annotate charges with IIDS affiliation, fiscal year, and source type
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
        charge["_price_type"] = charge.get("Price Type", "").strip() or "Internal"
        charge["_customer_institute"] = charge.get("Customer Institute", "").strip()

    # Filter to charges within FY2023-FY2025 range (billing date July 2022+)
    valid_charges = [c for c in charges if c["_fy"] and c["_fy"] >= 2023]

    # --- Helpers for per-FY computation ---
    fy_keys_all = sorted(set(c["_fy"] for c in valid_charges if c["_fy"]))
    fy_labels_map = {fy: f"FY{str(fy)[-2:]}" for fy in fy_keys_all}
    available_fiscal_years = ["total"] + [fy_labels_map[fy] for fy in fy_keys_all]

    def _compute_summary(charge_list: list[dict]) -> dict:
        tot_rev = sum(c["_total_price"] for c in charge_list)
        iids_rev = sum(c["_total_price"] for c in charge_list if c["_is_iids"])
        non_iids_rev = tot_rev - iids_rev
        tot_charges = len(charge_list)
        iids_chrg = sum(1 for c in charge_list if c["_is_iids"])
        int_charges = [
            c for c in charge_list
            if c["_price_type"] == "Internal" and _is_ui_email(c["_pi_email"])
        ]
        pi_em = set(c["_pi_email"] for c in int_charges if c["_pi_email"])
        pis_zero = set()
        for pi in pi_em:
            pi_chrgs = [c for c in int_charges if c["_pi_email"] == pi]
            if sum(c["_total_price"] for c in pi_chrgs if c["_is_iids"]) == 0:
                pis_zero.add(pi)
        return {
            "total_revenue": round(tot_rev, 2),
            "iids_revenue": round(iids_rev, 2),
            "non_iids_revenue": round(non_iids_rev, 2),
            "iids_percentage": round(iids_rev / tot_rev * 100, 1) if tot_rev > 0 else 0,
            "total_charges": tot_charges,
            "iids_charges": iids_chrg,
            "unique_pis": len(pi_em),
            "pis_with_zero_affiliation": len(pis_zero),
        }

    def _compute_pi_breakdown(charge_list: list[dict], proposals_list: list[dict] | None = None) -> list[dict]:
        from app.services.college_mapping import get_college_for_pi, get_college_display_name
        int_charges = [
            c for c in charge_list
            if c["_price_type"] == "Internal" and _is_ui_email(c["_pi_email"])
        ]
        pd: dict[str, dict] = {}
        _pi_college_cache: dict[str, str] = {}
        for c in int_charges:
            pi = c["_pi_email"]
            if not pi:
                continue
            if pi not in pd:
                pi_name = c["_pi_name"]
                if pi_name not in _pi_college_cache:
                    _pi_college_cache[pi_name] = get_college_for_pi(
                        pi_name, proposals_list or []
                    )
                college_code = _pi_college_cache[pi_name]
                pd[pi] = {
                    "pi_email": pi, "pi_name": pi_name,
                    "department": get_college_display_name(college_code),
                    "total_revenue": 0.0, "iids_revenue": 0.0,
                    "non_iids_revenue": 0.0, "charge_count": 0,
                }
            pd[pi]["total_revenue"] += c["_total_price"]
            if c["_is_iids"]:
                pd[pi]["iids_revenue"] += c["_total_price"]
            else:
                pd[pi]["non_iids_revenue"] += c["_total_price"]
            pd[pi]["charge_count"] += 1
        result = []
        for pi_info in pd.values():
            t = pi_info["total_revenue"]
            pi_info["iids_percentage"] = round(pi_info["iids_revenue"] / t * 100, 1) if t > 0 else 0
            pi_info["total_revenue"] = round(t, 2)
            pi_info["iids_revenue"] = round(pi_info["iids_revenue"], 2)
            pi_info["non_iids_revenue"] = round(pi_info["non_iids_revenue"], 2)
            result.append(pi_info)
        result.sort(key=lambda x: x["non_iids_revenue"], reverse=True)
        return result

    def _compute_services(charge_list: list[dict]) -> list[dict]:
        cat_data: dict[str, dict] = {}
        for c in charge_list:
            cat = c["_category"] or "Uncategorized"
            if cat not in cat_data:
                cat_data[cat] = {"category": cat, "total_revenue": 0.0, "iids_revenue": 0.0, "non_iids_revenue": 0.0, "charge_count": 0}
            cat_data[cat]["total_revenue"] += c["_total_price"]
            if c["_is_iids"]:
                cat_data[cat]["iids_revenue"] += c["_total_price"]
            else:
                cat_data[cat]["non_iids_revenue"] += c["_total_price"]
            cat_data[cat]["charge_count"] += 1
        result = []
        for entry in cat_data.values():
            t = entry["total_revenue"]
            entry["iids_percentage"] = round(entry["iids_revenue"] / t * 100, 1) if t > 0 else 0
            entry["total_revenue"] = round(t, 2)
            entry["iids_revenue"] = round(entry["iids_revenue"], 2)
            entry["non_iids_revenue"] = round(entry["non_iids_revenue"], 2)
            result.append(entry)
        result.sort(key=lambda x: x["total_revenue"], reverse=True)
        return result

    proposals = _load_proposals()

    def _compute_college_breakdown(charge_list: list[dict]) -> list[dict]:
        from app.services.college_mapping import (
            get_college_for_pi,
            get_college_display_name,
        )
        int_charges = [
            c for c in charge_list
            if c["_price_type"] == "Internal" and _is_ui_email(c["_pi_email"])
        ]
        col_data: dict[str, dict] = {}
        _pi_cache: dict[str, str] = {}
        for c in int_charges:
            pi_name = c["_pi_name"]
            if pi_name not in _pi_cache:
                _pi_cache[pi_name] = get_college_for_pi(pi_name, proposals)
            college = _pi_cache[pi_name]
            if college not in col_data:
                col_data[college] = {
                    "college": college,
                    "college_display": get_college_display_name(college),
                    "total_revenue": 0.0,
                    "iids_revenue": 0.0,
                    "non_iids_revenue": 0.0,
                    "charge_count": 0,
                    "pi_emails": set(),
                }
            col_data[college]["total_revenue"] += c["_total_price"]
            col_data[college]["charge_count"] += 1
            if c["_pi_email"]:
                col_data[college]["pi_emails"].add(c["_pi_email"])
            if c["_is_iids"]:
                col_data[college]["iids_revenue"] += c["_total_price"]
            else:
                col_data[college]["non_iids_revenue"] += c["_total_price"]
        result = []
        for entry in col_data.values():
            t = entry["total_revenue"]
            result.append({
                "college": entry["college"],
                "college_display": entry["college_display"],
                "total_revenue": round(t, 2),
                "iids_revenue": round(entry["iids_revenue"], 2),
                "non_iids_revenue": round(entry["non_iids_revenue"], 2),
                "iids_percentage": round(entry["iids_revenue"] / t * 100, 1) if t > 0 else 0,
                "charge_count": entry["charge_count"],
                "unique_pis": len(entry["pi_emails"]),
            })
        result.sort(key=lambda x: x["total_revenue"], reverse=True)
        return result

    # --- Compute totals and per-FY ---
    summary = _compute_summary(valid_charges)
    pi_breakdown = _compute_pi_breakdown(valid_charges, proposals)
    services_total = _compute_services(valid_charges)
    college_breakdown_total = _compute_college_breakdown(valid_charges)

    summary_by_fy: dict[str, dict] = {"total": summary}
    pi_breakdown_by_fy: dict[str, list] = {"total": pi_breakdown}
    services_by_fy: dict[str, list] = {"total": services_total}
    college_breakdown_by_fy: dict[str, list] = {"total": college_breakdown_total}

    for fy_num in fy_keys_all:
        fy_label = fy_labels_map[fy_num]
        fy_charges = [c for c in valid_charges if c["_fy"] == fy_num]
        summary_by_fy[fy_label] = _compute_summary(fy_charges)
        pi_breakdown_by_fy[fy_label] = _compute_pi_breakdown(fy_charges, proposals)
        services_by_fy[fy_label] = _compute_services(fy_charges)
        college_breakdown_by_fy[fy_label] = _compute_college_breakdown(fy_charges)

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
        "college_breakdown": college_breakdown_total,
        "fy_trends": fy_trends,
        "monthly_series": monthly_series,
        "services": services_total,
        "crc_users": crc_users,
        "equipment": equipment,
        "available_fiscal_years": available_fiscal_years,
        "summary_by_fy": summary_by_fy,
        "pi_breakdown_by_fy": pi_breakdown_by_fy,
        "college_breakdown_by_fy": college_breakdown_by_fy,
        "services_by_fy": services_by_fy,
    }


def _load_proposals() -> list[dict]:
    """Load and parse the proposals CSV."""
    path = _data_dir() / "proposals.csv"
    if not path.exists():
        return []
    proposals = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            proposals.append(row)
    return proposals


def _match_proposals_for_pi(pi_name: str) -> list[dict]:
    """Find all proposals for a given PI name."""
    proposals = _load_proposals()
    pi_name_lower = _canonical_pi_name(pi_name).lower()
    matched = []
    for p in proposals:
        proposal_pi = _canonical_pi_name(p.get("PI", "")).lower()
        if proposal_pi == pi_name_lower:
            iids_checked = bool(p.get("IIDS", "").strip())
            total_cost = _parse_float(p.get("TOTAL_COST", "0"))
            matched.append({
                "proposal_number": p.get("PROPOSAL_NUMBER", "").strip(),
                "title": p.get("PROJECT_TITLE", "").strip(),
                "sponsor": p.get("SPONSOR", "").strip() or p.get("PRIME", "").strip(),
                "department": p.get("DEPARTMENT", "").strip(),
                "status": p.get("PROJECT_STATUS", "").strip(),
                "agreement_type": p.get("AGREEMENT_TYPE", "").strip(),
                "submission_date": p.get("SUBMISSION_DATE", "").strip(),
                "direct_cost": _parse_float(p.get("DIRECT_COST", "0")),
                "indirect_cost": _parse_float(p.get("INDIRECT_COST", "0")),
                "total_cost": total_cost,
                "iids_affiliated": iids_checked,
            })
    matched.sort(key=lambda x: x["submission_date"], reverse=True)
    return matched


def get_pi_charges(pi_email: str) -> dict | None:
    """Return detailed charge breakdown for a specific PI."""
    iids_indices = _load_iids_index_set()
    charges = _load_charges()

    pi_email_lower = pi_email.strip().lower()
    pi_charges = []
    pi_name = ""
    department = ""
    total_revenue = 0.0
    iids_revenue = 0.0

    for c in charges:
        email = c.get("PI Email", "").strip().lower()
        if email != pi_email_lower:
            continue

        total_price = _parse_float(c.get("Total Price", "0"))
        if total_price <= 0:
            continue

        dt = _parse_date(c.get("Billing Date", "") or c.get("Purchase Date", ""))
        fy = _fiscal_year(dt) if dt else None
        if not fy or fy < 2023:
            continue

        payment_info = c.get("Payment Information", "").strip()
        is_iids = payment_info in iids_indices

        if not pi_name:
            pi_name = _extract_pi_name(c.get("Customer Lab", ""))
            department = c.get("Customer Department", "").strip()

        total_revenue += total_price
        if is_iids:
            iids_revenue += total_price

        pi_charges.append({
            "billing_date": dt.strftime("%Y-%m-%d") if dt else "",
            "fiscal_year": f"FY{str(fy)[-2:]}" if fy else "",
            "charge_name": c.get("Charge Name", "").strip(),
            "category": c.get("Category", "").strip(),
            "service_id": c.get("Service ID", "").strip(),
            "quantity": _parse_float(c.get("Quantity", "0")),
            "unit_price": _parse_float(c.get("Price", "0")),
            "total_price": total_price,
            "payment_index": payment_info,
            "is_iids": is_iids,
            "price_type": c.get("Price Type", "").strip() or "Internal",
            "status": c.get("Status", "").strip(),
            "user": c.get("Customer Name", "").strip(),
            "user_email": c.get("User Login Email", "").strip(),
        })

    if not pi_charges:
        return None

    pi_charges.sort(key=lambda x: x["billing_date"], reverse=True)
    non_iids_revenue = total_revenue - iids_revenue

    # Match proposals by PI name
    proposals = _match_proposals_for_pi(pi_name)

    return {
        "pi_email": pi_email_lower,
        "pi_name": pi_name,
        "department": department,
        "total_revenue": round(total_revenue, 2),
        "iids_revenue": round(iids_revenue, 2),
        "non_iids_revenue": round(non_iids_revenue, 2),
        "iids_percentage": round(iids_revenue / total_revenue * 100, 1) if total_revenue > 0 else 0,
        "charge_count": len(pi_charges),
        "charges": pi_charges,
        "proposals": proposals,
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
            "price_type": c.get("Price Type", "").strip() or "Internal",
            "customer_institute": c.get("Customer Institute", "").strip(),
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

    # --- Raw Proposals ---
    proposals = _load_proposals()
    raw_proposals = []
    for p in proposals:
        raw_proposals.append({
            "proposal_number": p.get("PROPOSAL_NUMBER", "").strip(),
            "title": p.get("PROJECT_TITLE", "").strip(),
            "pi": p.get("PI", "").strip(),
            "department": p.get("DEPARTMENT", "").strip(),
            "status": p.get("PROJECT_STATUS", "").strip(),
            "agreement_type": p.get("AGREEMENT_TYPE", "").strip(),
            "sponsor": p.get("SPONSOR", "").strip() or p.get("PRIME", "").strip(),
            "submission_date": p.get("SUBMISSION_DATE", "").strip(),
            "direct_cost": _parse_float(p.get("DIRECT_COST", "0")),
            "indirect_cost": _parse_float(p.get("INDIRECT_COST", "0")),
            "total_cost": _parse_float(p.get("TOTAL_COST", "0")),
            "iids": bool(p.get("IIDS", "").strip()),
            "imci": bool(p.get("IMCI", "").strip()),
            "ari": bool(p.get("ARI", "").strip()),
            "igs": bool(p.get("IGS", "").strip()),
            "ihhe": bool(p.get("IHHE", "").strip()),
            "iics": bool(p.get("IICS", "").strip()),
            "fii": bool(p.get("FII", "").strip()),
        })
    raw_proposals.sort(key=lambda x: x["submission_date"], reverse=True)

    return {
        "charges": raw_charges,
        "events": raw_events,
        "crc_users": raw_crc,
        "proposals": raw_proposals,
    }


def _parse_proposal_date(date_str: str) -> datetime | None:
    """Parse proposal date strings like '7/26/23' or '7/26/2023'."""
    if not date_str or not date_str.strip():
        return None
    date_str = date_str.strip()
    for fmt in ("%m/%d/%y", "%m/%d/%Y"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def _is_proposal_awarded(status: str) -> bool:
    """Check if a proposal status indicates it was awarded/funded."""
    s = status.lower()
    return any(kw in s for kw in (
        "awarded", "completed", "closed", "early setup",
        "early to full", "intent to award",
    ))


def _classify_sponsor(sponsor: str) -> str:
    """Classify a sponsor into a category."""
    s = sponsor.lower()
    federal_keywords = [
        "national science foundation", "national institutes of health",
        "national institute of food", "usda", "national aeronautic",
        "nasa", "us geological survey", "department of energy",
        "bureau of land management", "department of defense",
        "department of interior", "army research", "navy",
        "air force", "environmental protection agency",
        "fish and wildlife service", "national oceanic",
        "forest service", "animal and plant health",
    ]
    state_keywords = [
        "idaho department", "idaho state", "idaho wheat",
        "idaho potato", "idaho barley", "idaho oilseed",
        "idaho stem", "idaho board", "idaho space grant",
    ]
    university_keywords = [
        "university", "college", "boise state",
        "washington state", "montana state", "brigham young",
    ]
    for kw in federal_keywords:
        if kw in s:
            return "Federal"
    for kw in state_keywords:
        if kw in s:
            return "State"
    for kw in university_keywords:
        if kw in s:
            return "University"
    if any(kw in s for kw in ["inc.", "llc", "corp", "ltd", "laboratories"]):
        return "Private/Corporate"
    if any(kw in s for kw in ["foundation", "commission", "consortium", "society", "association", "institute"]):
        return "Foundation/NGO"
    return "Other"


@lru_cache(maxsize=1)
def get_analytics_data() -> dict:
    """Compute all extended analytics data. Cached after first call."""
    from app.services.college_mapping import (
        get_college_for_pi,
        get_college_from_department,
        get_college_display_name,
    )

    iids_indices = _load_iids_index_set()
    charges = _load_charges()
    proposals = _load_proposals()

    # Annotate charges
    for charge in charges:
        payment_info = charge.get("Payment Information", "").strip()
        charge["_is_iids"] = payment_info in iids_indices
        charge["_total_price"] = _parse_float(charge.get("Total Price", "0"))
        dt = _parse_date(
            charge.get("Billing Date", "") or charge.get("Purchase Date", "")
        )
        charge["_date"] = dt
        charge["_fy"] = _fiscal_year(dt) if dt else None
        charge["_pi_email"] = charge.get("PI Email", "").strip().lower()
        charge["_pi_name"] = _extract_pi_name(charge.get("Customer Lab", ""))
        charge["_price_type"] = charge.get("Price Type", "").strip() or "Internal"
        charge["_customer_institute"] = charge.get("Customer Institute", "").strip()

    valid_charges = [c for c in charges if c["_fy"] and c["_fy"] >= 2023]

    # ----------------------------------------------------------------
    # (a) Revenue by source type (Internal/External/Corporate) per FY
    # ----------------------------------------------------------------
    fy_source: dict[int, dict] = {}
    for c in valid_charges:
        fy = c["_fy"]
        if fy not in fy_source:
            fy_source[fy] = {
                "fiscal_year": f"FY{str(fy)[-2:]}",
                "internal": 0.0,
                "external": 0.0,
                "corporate": 0.0,
                "total": 0.0,
            }
        price = c["_total_price"]
        pt = c["_price_type"]
        fy_source[fy]["total"] += price
        if pt == "External":
            fy_source[fy]["external"] += price
        elif pt == "Corporate":
            fy_source[fy]["corporate"] += price
        else:
            fy_source[fy]["internal"] += price

    fy_source_list = []
    for fy in sorted(fy_source.keys()):
        entry = fy_source[fy]
        for k in ("internal", "external", "corporate", "total"):
            entry[k] = round(entry[k], 2)
        fy_source_list.append(entry)

    source_summary = {
        "internal": round(
            sum(c["_total_price"] for c in valid_charges if c["_price_type"] == "Internal"), 2
        ),
        "external": round(
            sum(c["_total_price"] for c in valid_charges if c["_price_type"] == "External"), 2
        ),
        "corporate": round(
            sum(c["_total_price"] for c in valid_charges if c["_price_type"] == "Corporate"), 2
        ),
    }

    # Internal revenue by college and PI (UI emails only), tracked per FY
    internal_charges = [
        c for c in valid_charges
        if c["_price_type"] == "Internal" and _is_ui_email(c["_pi_email"])
    ]
    pi_college_cache: dict[str, str] = {}

    # Build per-FY + total college→PI data in one pass
    # Structure: { fy_key: { college: { "pis": { email: {...} }, ... } } }
    fy_keys = sorted(set(c["_fy"] for c in internal_charges if c["_fy"]))
    fy_labels = {fy: f"FY{str(fy)[-2:]}" for fy in fy_keys}
    all_fy_keys = ["total"] + [fy_labels[fy] for fy in fy_keys]  # ["total", "FY23", ...]

    college_by_fy: dict[str, dict[str, dict]] = {k: {} for k in all_fy_keys}

    for c in internal_charges:
        pi_name = c["_pi_name"]
        pi_email = c["_pi_email"]
        price = c["_total_price"]
        is_iids = c["_is_iids"]
        fy_label = fy_labels.get(c["_fy"])
        if not fy_label:
            continue

        if pi_name not in pi_college_cache:
            pi_college_cache[pi_name] = get_college_for_pi(pi_name, proposals)
        college = pi_college_cache[pi_name]

        # Update both "total" and specific FY buckets
        for bucket_key in ("total", fy_label):
            bucket = college_by_fy[bucket_key]
            if college not in bucket:
                bucket[college] = {
                    "college": college,
                    "revenue": 0.0,
                    "iids_revenue": 0.0,
                    "charge_count": 0,
                    "pis": {},
                }
            bucket[college]["revenue"] += price
            bucket[college]["charge_count"] += 1
            if is_iids:
                bucket[college]["iids_revenue"] += price

            if pi_email not in bucket[college]["pis"]:
                bucket[college]["pis"][pi_email] = {
                    "pi_name": pi_name,
                    "pi_email": pi_email,
                    "revenue": 0.0,
                    "iids_revenue": 0.0,
                    "charge_count": 0,
                }
            bucket[college]["pis"][pi_email]["revenue"] += price
            bucket[college]["pis"][pi_email]["charge_count"] += 1
            if is_iids:
                bucket[college]["pis"][pi_email]["iids_revenue"] += price

    def _build_college_list(bucket: dict[str, dict]) -> list[dict]:
        result = []
        for entry in bucket.values():
            pis = list(entry["pis"].values())
            for pi in pis:
                pi_rev = pi["revenue"]
                pi["revenue"] = round(pi_rev, 2)
                pi["iids_revenue"] = round(pi["iids_revenue"], 2)
                pi["iids_percentage"] = (
                    round(pi["iids_revenue"] / pi_rev * 100, 1) if pi_rev > 0 else 0
                )
            pis.sort(key=lambda x: x["revenue"], reverse=True)
            col_rev = entry["revenue"]
            result.append({
                "college": entry["college"],
                "college_display": get_college_display_name(entry["college"]),
                "revenue": round(col_rev, 2),
                "iids_revenue": round(entry["iids_revenue"], 2),
                "iids_percentage": (
                    round(entry["iids_revenue"] / col_rev * 100, 1) if col_rev > 0 else 0
                ),
                "charge_count": entry["charge_count"],
                "pis": pis,
            })
        result.sort(key=lambda x: x["revenue"], reverse=True)
        return result

    internal_by_college_by_fy = {
        fy_key: _build_college_list(college_by_fy[fy_key])
        for fy_key in all_fy_keys
    }

    # ----------------------------------------------------------------
    # External revenue by institution (grouped by email domain / Customer Institute)
    # ----------------------------------------------------------------
    def _is_corporate_email(email: str) -> bool:
        """Exclude corporate/commercial (.com) domains from external breakdown."""
        if not email or "@" not in email:
            return False
        domain = email.strip().lower().split("@")[1]
        return domain.endswith(".com")

    external_charges = [
        c for c in valid_charges
        if c["_price_type"] == "External" and not _is_corporate_email(c["_pi_email"])
    ]

    # Map email domains to institution display names
    _INSTITUTION_NAMES: dict[str, str] = {
        "ag.arizona.edu": "University of Arizona",
        "arizona.edu": "University of Arizona",
        "caryinstitute.org": "Cary Institute",
        "unr.edu": "University of Nevada, Reno",
        "wsu.edu": "Washington State University",
        "usda.gov": "USDA",
        "berkeley.edu": "UC Berkeley",
        "mso.umt.edu": "University of Montana",
        "ohsu.edu": "Oregon Health & Science University",
        "pugetsound.edu": "University of Puget Sound",
        "vmrd.com": "VMRD Inc.",
        "oregonstate.edu": "Oregon State University",
        "nih.gov": "NIH",
        "uidaho.edu": "University of Idaho",
    }

    def _institution_from_email(email: str) -> str:
        if not email or "@" not in email:
            return "Unknown"
        domain = email.strip().lower().split("@")[1]
        # Check exact match first, then parent domain
        if domain in _INSTITUTION_NAMES:
            return _INSTITUTION_NAMES[domain]
        parts = domain.split(".")
        if len(parts) > 2:
            parent = ".".join(parts[-2:])
            if parent in _INSTITUTION_NAMES:
                return _INSTITUTION_NAMES[parent]
        # Fall back to a cleaned-up domain name
        return domain.split(".")[0].upper() if domain else "Unknown"

    ext_inst_by_fy: dict[str, dict[str, dict]] = {k: {} for k in all_fy_keys}

    for c in external_charges:
        pi_name = c["_pi_name"]
        pi_email = c["_pi_email"]
        price = c["_total_price"]
        is_iids = c["_is_iids"]
        fy_label = fy_labels.get(c["_fy"])
        if not fy_label:
            continue

        # Use Customer Institute if available, else derive from email
        inst = c.get("_customer_institute", "").strip()
        if not inst:
            inst = _institution_from_email(pi_email)

        for bucket_key in ("total", fy_label):
            bucket = ext_inst_by_fy[bucket_key]
            if inst not in bucket:
                bucket[inst] = {
                    "college": inst,  # Reuse "college" field for institution name
                    "revenue": 0.0,
                    "iids_revenue": 0.0,
                    "charge_count": 0,
                    "pis": {},
                }
            bucket[inst]["revenue"] += price
            bucket[inst]["charge_count"] += 1
            if is_iids:
                bucket[inst]["iids_revenue"] += price

            if pi_email not in bucket[inst]["pis"]:
                bucket[inst]["pis"][pi_email] = {
                    "pi_name": pi_name,
                    "pi_email": pi_email,
                    "revenue": 0.0,
                    "iids_revenue": 0.0,
                    "charge_count": 0,
                }
            bucket[inst]["pis"][pi_email]["revenue"] += price
            bucket[inst]["pis"][pi_email]["charge_count"] += 1
            if is_iids:
                bucket[inst]["pis"][pi_email]["iids_revenue"] += price

    external_by_college_by_fy = {
        fy_key: _build_college_list(ext_inst_by_fy[fy_key])
        for fy_key in all_fy_keys
    }

    revenue_sources = {
        "fiscal_years": fy_source_list,
        "source_summary": source_summary,
        "internal_by_college": internal_by_college_by_fy.get("total", []),
        "internal_by_college_by_fy": internal_by_college_by_fy,
        "external_by_college": external_by_college_by_fy.get("total", []),
        "external_by_college_by_fy": external_by_college_by_fy,
        "available_fiscal_years": all_fy_keys,
    }

    # ----------------------------------------------------------------
    # (b) Proposal portfolio analysis
    # ----------------------------------------------------------------
    proposal_fy_data: dict[str, dict] = {}
    agreement_data: dict[str, dict] = {}
    total_proposals = 0
    total_awarded = 0
    total_awarded_cost = 0.0

    for p in proposals:
        dt = _parse_proposal_date(p.get("SUBMISSION_DATE", ""))
        fy_label = f"FY{str(_fiscal_year(dt))[-2:]}" if dt else "Unknown"
        status = p.get("PROJECT_STATUS", "").strip()
        total_cost = _parse_float(p.get("TOTAL_COST", "0"))
        agreement_type = p.get("AGREEMENT_TYPE", "").strip() or "Unknown"

        total_proposals += 1
        status_lower = status.lower()
        is_awarded = _is_proposal_awarded(status)

        if fy_label not in proposal_fy_data:
            proposal_fy_data[fy_label] = {
                "fiscal_year": fy_label,
                "submitted": 0,
                "awarded": 0,
                "declined": 0,
                "pending": 0,
                "other": 0,
                "total_awarded_cost": 0.0,
            }
        proposal_fy_data[fy_label]["submitted"] += 1
        if is_awarded:
            proposal_fy_data[fy_label]["awarded"] += 1
            proposal_fy_data[fy_label]["total_awarded_cost"] += total_cost
            total_awarded += 1
            total_awarded_cost += total_cost
        elif "decline" in status_lower or "not funded" in status_lower:
            proposal_fy_data[fy_label]["declined"] += 1
        elif "pending" in status_lower or "submitted" in status_lower or "in process" in status_lower or "negotiation" in status_lower:
            proposal_fy_data[fy_label]["pending"] += 1
        else:
            proposal_fy_data[fy_label]["other"] += 1

        if agreement_type not in agreement_data:
            agreement_data[agreement_type] = {
                "agreement_type": agreement_type,
                "count": 0,
                "awarded_count": 0,
                "awarded_cost": 0.0,
            }
        agreement_data[agreement_type]["count"] += 1
        if is_awarded:
            agreement_data[agreement_type]["awarded_count"] += 1
            agreement_data[agreement_type]["awarded_cost"] += total_cost

    proposal_fy_list = []
    for fy_label in sorted(proposal_fy_data.keys()):
        entry = proposal_fy_data[fy_label]
        entry["total_awarded_cost"] = round(entry["total_awarded_cost"], 2)
        proposal_fy_list.append(entry)

    agreement_list = []
    for entry in agreement_data.values():
        entry["awarded_cost"] = round(entry["awarded_cost"], 2)
        agreement_list.append(entry)
    agreement_list.sort(key=lambda x: x["count"], reverse=True)

    proposal_portfolio = {
        "by_fiscal_year": proposal_fy_list,
        "by_agreement_type": agreement_list,
        "success_rate": round(total_awarded / total_proposals * 100, 1) if total_proposals > 0 else 0,
        "total_proposals": total_proposals,
        "total_awarded_cost": round(total_awarded_cost, 2),
    }

    # ----------------------------------------------------------------
    # (c) Checkbox analysis
    # ----------------------------------------------------------------
    checkbox_names = ["IIDS", "IMCI", "ARI", "IGS", "IHHE", "IICS", "FII"]
    checkbox_counts = {name: 0 for name in checkbox_names}
    checkbox_fy: dict[str, dict] = {}
    co_occurrence: dict[str, int] = {}
    no_checkbox_count = 0

    for p in proposals:
        dt = _parse_proposal_date(p.get("SUBMISSION_DATE", ""))
        fy_label = f"FY{str(_fiscal_year(dt))[-2:]}" if dt else "Unknown"

        checked = [name for name in checkbox_names if p.get(name, "").strip()]
        if not checked:
            no_checkbox_count += 1

        for name in checked:
            checkbox_counts[name] += 1

        if fy_label not in checkbox_fy:
            checkbox_fy[fy_label] = {
                "fiscal_year": fy_label,
                **{name.lower(): 0 for name in checkbox_names},
            }
        for name in checked:
            checkbox_fy[fy_label][name.lower()] += 1

        # Co-occurrence pairs
        for i, a in enumerate(checked):
            for b in checked[i + 1 :]:
                pair = f"{a}+{b}"
                co_occurrence[pair] = co_occurrence.get(pair, 0) + 1

    by_checkbox = []
    for name in checkbox_names:
        by_checkbox.append({
            "name": name,
            "count": checkbox_counts[name],
            "percentage": round(
                checkbox_counts[name] / total_proposals * 100, 1
            )
            if total_proposals > 0
            else 0,
        })

    checkbox_fy_list = []
    for fy_label in sorted(checkbox_fy.keys()):
        checkbox_fy_list.append(checkbox_fy[fy_label])

    co_occurrence_list = [
        {"pair": pair, "count": count}
        for pair, count in sorted(co_occurrence.items(), key=lambda x: -x[1])
    ]

    checkbox_analysis = {
        "by_checkbox": by_checkbox,
        "by_fiscal_year": checkbox_fy_list,
        "co_occurrence": co_occurrence_list,
        "no_checkbox_count": no_checkbox_count,
    }

    # ----------------------------------------------------------------
    # (d) Sponsor analysis
    # ----------------------------------------------------------------
    sponsor_data: dict[str, dict] = {}
    sponsor_cat_data: dict[str, dict] = {}

    for p in proposals:
        sponsor = p.get("SPONSOR", "").strip() or p.get("PRIME", "").strip()
        if not sponsor:
            continue
        status = p.get("PROJECT_STATUS", "").strip()
        total_cost = _parse_float(p.get("TOTAL_COST", "0"))
        is_awarded = _is_proposal_awarded(status)
        iids_checked = bool(p.get("IIDS", "").strip())

        if sponsor not in sponsor_data:
            sponsor_data[sponsor] = {
                "sponsor": sponsor,
                "count": 0,
                "awarded_count": 0,
                "total_cost": 0.0,
                "iids_count": 0,
            }
        sponsor_data[sponsor]["count"] += 1
        if is_awarded:
            sponsor_data[sponsor]["awarded_count"] += 1
            sponsor_data[sponsor]["total_cost"] += total_cost
        if iids_checked:
            sponsor_data[sponsor]["iids_count"] += 1

        category = _classify_sponsor(sponsor)
        if category not in sponsor_cat_data:
            sponsor_cat_data[category] = {
                "category": category,
                "count": 0,
                "awarded_count": 0,
                "total_cost": 0.0,
            }
        sponsor_cat_data[category]["count"] += 1
        if is_awarded:
            sponsor_cat_data[category]["awarded_count"] += 1
            sponsor_cat_data[category]["total_cost"] += total_cost

    top_sponsors = []
    for entry in sponsor_data.values():
        entry["total_cost"] = round(entry["total_cost"], 2)
        entry["iids_percentage"] = (
            round(entry["iids_count"] / entry["count"] * 100, 1)
            if entry["count"] > 0
            else 0
        )
        top_sponsors.append(entry)
    top_sponsors.sort(key=lambda x: x["count"], reverse=True)
    top_sponsors = top_sponsors[:25]

    by_sponsor_category = []
    for entry in sponsor_cat_data.values():
        entry["total_cost"] = round(entry["total_cost"], 2)
        by_sponsor_category.append(entry)
    by_sponsor_category.sort(key=lambda x: x["count"], reverse=True)

    sponsor_analysis = {
        "top_sponsors": top_sponsors,
        "by_category": by_sponsor_category,
    }

    # ----------------------------------------------------------------
    # (e) Department insights — college-level scorecard
    # ----------------------------------------------------------------
    # Proposal side: aggregate by college
    college_proposals: dict[str, dict] = {}
    for p in proposals:
        dept = p.get("DEPARTMENT", "").strip()
        college = get_college_from_department(dept)
        status = p.get("PROJECT_STATUS", "").strip()
        total_cost = _parse_float(p.get("TOTAL_COST", "0"))
        is_awarded = _is_proposal_awarded(status)
        iids_checked = bool(p.get("IIDS", "").strip())

        if college not in college_proposals:
            college_proposals[college] = {
                "college": college,
                "proposal_count": 0,
                "awarded_count": 0,
                "awarded_cost": 0.0,
                "iids_checkbox_count": 0,
            }
        college_proposals[college]["proposal_count"] += 1
        if is_awarded:
            college_proposals[college]["awarded_count"] += 1
            college_proposals[college]["awarded_cost"] += total_cost
        if iids_checked:
            college_proposals[college]["iids_checkbox_count"] += 1

    # Charge side: aggregate internal charges by college
    college_charges: dict[str, dict] = {}
    for c in internal_charges:
        pi_name = c["_pi_name"]
        college = pi_college_cache.get(pi_name, "Unknown")

        if college not in college_charges:
            college_charges[college] = {
                "charge_revenue": 0.0,
                "charge_count": 0,
                "pi_emails": set(),
                "iids_charge_count": 0,
            }
        college_charges[college]["charge_revenue"] += c["_total_price"]
        college_charges[college]["charge_count"] += 1
        college_charges[college]["pi_emails"].add(c["_pi_email"])
        if c["_is_iids"]:
            college_charges[college]["iids_charge_count"] += 1

    # Merge proposal + charge data per college
    all_colleges = set(college_proposals.keys()) | set(college_charges.keys())
    by_college = []
    for college in all_colleges:
        prop = college_proposals.get(college, {})
        chrg = college_charges.get(college, {})
        prop_count = prop.get("proposal_count", 0)
        chrg_count = chrg.get("charge_count", 0)
        by_college.append({
            "college": college,
            "college_display": get_college_display_name(college),
            "proposal_count": prop_count,
            "awarded_count": prop.get("awarded_count", 0),
            "awarded_cost": round(prop.get("awarded_cost", 0), 2),
            "charge_revenue": round(chrg.get("charge_revenue", 0), 2),
            "charge_pi_count": len(chrg.get("pi_emails", set())),
            "iids_checkbox_rate": (
                round(prop.get("iids_checkbox_count", 0) / prop_count * 100, 1)
                if prop_count > 0
                else 0
            ),
            "iids_charge_rate": (
                round(chrg.get("iids_charge_count", 0) / chrg_count * 100, 1)
                if chrg_count > 0
                else 0
            ),
        })
    by_college.sort(key=lambda x: x["proposal_count"], reverse=True)

    department_insights = {"by_college": by_college}

    # ----------------------------------------------------------------
    # (f) Cross-linkage: charges PIs vs proposal PIs (UI PIs only)
    # ----------------------------------------------------------------
    charge_pi_names = {}
    for c in internal_charges:
        name = c["_pi_name"]
        canonical_name = _canonical_pi_name(name)
        email = c["_pi_email"]
        if name == "Unknown" or not email:
            continue
        if canonical_name not in charge_pi_names:
            charge_pi_names[canonical_name] = {
                "pi_name": canonical_name,
                "pi_email": email,
                "charge_revenue": 0.0,
            }
        charge_pi_names[canonical_name]["charge_revenue"] += c["_total_price"]

    proposal_pi_names: dict[str, dict] = {}
    for p in proposals:
        pi = _canonical_pi_name(p.get("PI", ""))
        if not pi:
            continue
        status = p.get("PROJECT_STATUS", "").strip()
        total_cost = _parse_float(p.get("TOTAL_COST", "0"))
        is_awarded = _is_proposal_awarded(status)
        dept = p.get("DEPARTMENT", "").strip()

        if pi not in proposal_pi_names:
            proposal_pi_names[pi] = {
                "pi_name": pi,
                "department": dept,
                "proposal_count": 0,
                "awarded_cost": 0.0,
            }
        proposal_pi_names[pi]["proposal_count"] += 1
        if is_awarded:
            proposal_pi_names[pi]["awarded_cost"] += total_cost

    # Match by name (case-insensitive)
    charge_names_lower = {n.lower(): n for n in charge_pi_names}
    proposal_names_lower = {n.lower(): n for n in proposal_pi_names}

    matched_set = set(charge_names_lower.keys()) & set(proposal_names_lower.keys())
    charges_only_set = set(charge_names_lower.keys()) - set(proposal_names_lower.keys())
    proposals_only_set = set(proposal_names_lower.keys()) - set(charge_names_lower.keys())

    matched_pis = []
    for name_lower in matched_set:
        cn = charge_pi_names[charge_names_lower[name_lower]]
        pn = proposal_pi_names[proposal_names_lower[name_lower]]
        matched_pis.append({
            "pi_name": cn["pi_name"],
            "pi_email": cn["pi_email"],
            "charge_revenue": round(cn["charge_revenue"], 2),
            "proposal_count": pn["proposal_count"],
            "awarded_cost": round(pn["awarded_cost"], 2),
        })
    matched_pis.sort(key=lambda x: x["charge_revenue"], reverse=True)

    charges_only_pis = []
    for name_lower in charges_only_set:
        cn = charge_pi_names[charge_names_lower[name_lower]]
        charges_only_pis.append({
            "pi_name": cn["pi_name"],
            "pi_email": cn["pi_email"],
            "charge_revenue": round(cn["charge_revenue"], 2),
        })
    charges_only_pis.sort(key=lambda x: x["charge_revenue"], reverse=True)

    proposals_only_pis = []
    for name_lower in proposals_only_set:
        pn = proposal_pi_names[proposal_names_lower[name_lower]]
        proposals_only_pis.append({
            "pi_name": pn["pi_name"],
            "department": pn["department"],
            "proposal_count": pn["proposal_count"],
            "awarded_cost": round(pn["awarded_cost"], 2),
        })
    proposals_only_pis.sort(key=lambda x: x["proposal_count"], reverse=True)

    total_unique = len(matched_set) + len(charges_only_set) + len(proposals_only_set)
    cross_linkage = {
        "matched_pis": matched_pis,
        "charges_only_pis": charges_only_pis,
        "proposals_only_pis": proposals_only_pis[:50],
        "match_rate": round(len(matched_set) / total_unique * 100, 1) if total_unique > 0 else 0,
    }

    # ----------------------------------------------------------------
    # (g) Equipment enrichment: by department + monthly trends
    # ----------------------------------------------------------------
    events = _load_events()
    equip_enriched: dict[str, dict] = {}
    monthly_equip: dict[str, float] = {}

    from app.services.college_mapping import get_college_from_charge_dept

    for e in events:
        equip = e.get("Equipment Name", "").strip()
        if not equip:
            continue
        hours = _parse_hours(e.get("Actual Hours", "0"))
        raw_dept = e.get("Customer Department", "").strip() or "Unknown"
        dept = get_college_from_charge_dept(raw_dept) if raw_dept != "Unknown" else "Unknown"
        dt = _parse_date(e.get("Scheduled Start", ""))

        if equip not in equip_enriched:
            equip_enriched[equip] = {
                "equipment": equip,
                "total_hours": 0.0,
                "reservation_count": 0,
                "unique_users": set(),
                "departments": {},
            }
        equip_enriched[equip]["total_hours"] += hours
        equip_enriched[equip]["reservation_count"] += 1
        user_email = e.get("User Login Email", "").strip()
        if user_email:
            equip_enriched[equip]["unique_users"].add(user_email)
        equip_enriched[equip]["departments"][dept] = (
            equip_enriched[equip]["departments"].get(dept, 0) + 1
        )

        if dt:
            month_key = dt.strftime("%Y-%m")
            monthly_equip[month_key] = monthly_equip.get(month_key, 0) + hours

    by_equipment = []
    for entry in equip_enriched.values():
        by_equipment.append({
            "equipment": entry["equipment"],
            "total_hours": round(entry["total_hours"], 1),
            "reservation_count": entry["reservation_count"],
            "unique_users": len(entry["unique_users"]),
            "departments": dict(
                sorted(entry["departments"].items(), key=lambda x: -x[1])
            ),
        })
    by_equipment.sort(key=lambda x: x["total_hours"], reverse=True)

    equip_monthly_trend = [
        {"month": m, "total_hours": round(h, 1)}
        for m, h in sorted(monthly_equip.items())
    ]

    equipment_enriched = {
        "by_equipment": by_equipment,
        "monthly_trend": equip_monthly_trend,
    }

    # ----------------------------------------------------------------
    # (h) PI-centric affiliation and PI-to-usage mapping
    # ----------------------------------------------------------------
    charge_usage_by_pi: dict[str, dict] = {}
    pi_email_by_name: dict[str, str] = {}
    pi_college_by_name: dict[str, str] = {}

    for c in internal_charges:
        pi_name = c["_pi_name"]
        pi_key = _canonical_pi_name(pi_name).lower()
        if pi_name == "Unknown" or not pi_key:
            continue

        if pi_key not in charge_usage_by_pi:
            charge_usage_by_pi[pi_key] = {
                "pi_name": pi_name,
                "pi_email": c["_pi_email"],
                "charge_revenue": 0.0,
                "charge_count": 0,
                "charge_users": set(),
            }

        charge_usage_by_pi[pi_key]["charge_revenue"] += c["_total_price"]
        charge_usage_by_pi[pi_key]["charge_count"] += 1

        user_key = _user_key(c.get("User Login Email", ""), c.get("Customer Name", ""))
        if user_key:
            charge_usage_by_pi[pi_key]["charge_users"].add(user_key)

        if c["_pi_email"]:
            pi_email_by_name.setdefault(pi_key, c["_pi_email"])
        pi_college_by_name.setdefault(pi_key, pi_college_cache.get(pi_name, "Unknown"))

    event_usage_by_pi: dict[str, dict] = {}
    for e in events:
        pi_name = _extract_pi_name(e.get("Customer Lab", ""))
        pi_email = e.get("PI Email", "").strip().lower()
        pi_key = _canonical_pi_name(pi_name).lower()

        if pi_name == "Unknown" or not pi_key:
            continue
        if not _is_ui_email(pi_email) and pi_key not in proposal_names_lower and pi_key not in charge_usage_by_pi:
            continue

        if pi_key not in event_usage_by_pi:
            event_usage_by_pi[pi_key] = {
                "pi_name": pi_name,
                "pi_email": pi_email,
                "equipment_hours": 0.0,
                "reservation_count": 0,
                "equipment_users": set(),
            }

        event_usage_by_pi[pi_key]["equipment_hours"] += _parse_hours(e.get("Actual Hours", "0"))
        event_usage_by_pi[pi_key]["reservation_count"] += 1

        user_key = _user_key(e.get("User Login Email", ""), e.get("Customer Name", ""))
        if user_key:
            event_usage_by_pi[pi_key]["equipment_users"].add(user_key)

        if pi_email:
            pi_email_by_name.setdefault(pi_key, pi_email)
        if pi_key not in pi_college_by_name:
            raw_dept = e.get("Customer Department", "").strip()
            pi_college_by_name[pi_key] = (
                get_college_from_charge_dept(raw_dept) if raw_dept else "Unknown"
            )

    proposal_affiliation_by_pi: dict[str, dict] = {}
    total_iids_proposals = 0
    total_affiliation_awarded_cost = 0.0
    total_affiliated_pis = 0

    for p in proposals:
        pi_name = p.get("PI", "").strip()
        if not pi_name:
            continue

        pi_key = _canonical_pi_name(pi_name).lower()
        dept = p.get("DEPARTMENT", "").strip()
        college = get_college_from_department(dept)
        status = p.get("PROJECT_STATUS", "").strip()
        total_cost = _parse_float(p.get("TOTAL_COST", "0"))
        is_awarded = _is_proposal_awarded(status)
        iids_checked = bool(p.get("IIDS", "").strip())

        if pi_key not in proposal_affiliation_by_pi:
            proposal_affiliation_by_pi[pi_key] = {
                "pi_name": pi_name,
                "pi_email": pi_email_by_name.get(pi_key, ""),
                "college": college,
                "college_display": get_college_display_name(college),
                "proposal_count": 0,
                "iids_proposal_count": 0,
                "awarded_count": 0,
                "awarded_cost": 0.0,
            }

        proposal_affiliation_by_pi[pi_key]["proposal_count"] += 1
        if iids_checked:
            proposal_affiliation_by_pi[pi_key]["iids_proposal_count"] += 1
            total_iids_proposals += 1
        if is_awarded:
            proposal_affiliation_by_pi[pi_key]["awarded_count"] += 1
            proposal_affiliation_by_pi[pi_key]["awarded_cost"] += total_cost
            total_affiliation_awarded_cost += total_cost

    pi_affiliation_rows = []
    for entry in proposal_affiliation_by_pi.values():
        proposal_count = entry["proposal_count"]
        iids_count = entry["iids_proposal_count"]
        if iids_count > 0:
            total_affiliated_pis += 1
        pi_affiliation_rows.append({
            **entry,
            "awarded_cost": round(entry["awarded_cost"], 2),
            "iids_proposal_rate": round(iids_count / proposal_count * 100, 1) if proposal_count > 0 else 0,
        })
    pi_affiliation_rows.sort(
        key=lambda x: (x["iids_proposal_count"], x["proposal_count"], x["awarded_cost"]),
        reverse=True,
    )

    affiliation_colleges: dict[str, dict] = {}
    for row in pi_affiliation_rows:
        college = row["college"]
        if college not in affiliation_colleges:
            affiliation_colleges[college] = {
                "college": college,
                "college_display": row["college_display"],
                "pi_count": 0,
                "affiliated_pi_count": 0,
                "proposal_count": 0,
                "iids_proposal_count": 0,
                "awarded_cost": 0.0,
            }

        affiliation_colleges[college]["pi_count"] += 1
        affiliation_colleges[college]["proposal_count"] += row["proposal_count"]
        affiliation_colleges[college]["iids_proposal_count"] += row["iids_proposal_count"]
        affiliation_colleges[college]["awarded_cost"] += row["awarded_cost"]
        if row["iids_proposal_count"] > 0:
            affiliation_colleges[college]["affiliated_pi_count"] += 1

    affiliation_by_college = []
    for entry in affiliation_colleges.values():
        proposal_count = entry["proposal_count"]
        affiliation_by_college.append({
            **entry,
            "awarded_cost": round(entry["awarded_cost"], 2),
            "iids_proposal_rate": round(entry["iids_proposal_count"] / proposal_count * 100, 1) if proposal_count > 0 else 0,
        })
    affiliation_by_college.sort(key=lambda x: (x["iids_proposal_count"], x["proposal_count"]), reverse=True)

    pi_affiliation = {
        "summary": {
            "total_pis": len(pi_affiliation_rows),
            "affiliated_pis": total_affiliated_pis,
            "total_proposals": total_proposals,
            "iids_proposals": total_iids_proposals,
            "iids_proposal_rate": round(total_iids_proposals / total_proposals * 100, 1) if total_proposals > 0 else 0,
            "total_awarded_cost": round(total_affiliation_awarded_cost, 2),
        },
        "by_college": affiliation_by_college,
        "by_pi": pi_affiliation_rows,
    }

    usage_rows_by_pi: dict[str, dict] = {}
    all_lab_users: set[str] = set()
    all_pi_keys = set(proposal_affiliation_by_pi.keys()) | set(charge_usage_by_pi.keys()) | set(event_usage_by_pi.keys())

    for pi_key in all_pi_keys:
        proposal_entry = proposal_affiliation_by_pi.get(pi_key)
        charge_entry = charge_usage_by_pi.get(pi_key)
        event_entry = event_usage_by_pi.get(pi_key)

        pi_name = (
            (proposal_entry or {}).get("pi_name")
            or (charge_entry or {}).get("pi_name")
            or (event_entry or {}).get("pi_name")
            or pi_key.title()
        )
        pi_email = (
            (proposal_entry or {}).get("pi_email")
            or (charge_entry or {}).get("pi_email")
            or (event_entry or {}).get("pi_email")
            or pi_email_by_name.get(pi_key, "")
        )
        college = (
            (proposal_entry or {}).get("college")
            or pi_college_by_name.get(pi_key)
            or get_college_for_pi(pi_name, proposals)
        )
        college_display = get_college_display_name(college)
        charge_users = set((charge_entry or {}).get("charge_users", set()))
        equipment_users = set((event_entry or {}).get("equipment_users", set()))
        lab_users = charge_users | equipment_users
        all_lab_users.update(lab_users)

        proposal_count = (proposal_entry or {}).get("proposal_count", 0)
        iids_proposal_count = (proposal_entry or {}).get("iids_proposal_count", 0)
        charge_count = (charge_entry or {}).get("charge_count", 0)
        reservation_count = (event_entry or {}).get("reservation_count", 0)
        has_usage = charge_count > 0 or reservation_count > 0

        if proposal_count > 0 and has_usage:
            mapping_status = "matched"
        elif proposal_count > 0:
            mapping_status = "proposals_only"
        else:
            mapping_status = "usage_only"

        usage_rows_by_pi[pi_key] = {
            "pi_name": pi_name,
            "pi_email": pi_email,
            "college": college,
            "college_display": college_display,
            "mapping_status": mapping_status,
            "proposal_count": proposal_count,
            "iids_proposal_count": iids_proposal_count,
            "iids_proposal_rate": round(iids_proposal_count / proposal_count * 100, 1) if proposal_count > 0 else 0,
            "awarded_cost": round((proposal_entry or {}).get("awarded_cost", 0.0), 2),
            "charge_revenue": round((charge_entry or {}).get("charge_revenue", 0.0), 2),
            "charge_count": charge_count,
            "unique_charge_users": len(charge_users),
            "unique_equipment_users": len(equipment_users),
            "unique_lab_users": len(lab_users),
            "equipment_hours": round((event_entry or {}).get("equipment_hours", 0.0), 1),
            "reservation_count": reservation_count,
            "_lab_users": lab_users,
        }

    usage_by_pi = sorted(
        usage_rows_by_pi.values(),
        key=lambda x: (
            x["iids_proposal_count"],
            x["unique_lab_users"],
            x["charge_revenue"],
            x["proposal_count"],
        ),
        reverse=True,
    )

    usage_colleges: dict[str, dict] = {}
    matched_pis_count = 0
    proposals_only_pis_count = 0
    usage_only_pis_count = 0
    affiliated_using_pis_count = 0

    for row in usage_by_pi:
        college = row["college"]
        if college not in usage_colleges:
            usage_colleges[college] = {
                "college": college,
                "college_display": row["college_display"],
                "total_pis": 0,
                "proposal_pis": 0,
                "using_pis": 0,
                "matched_pis": 0,
                "affiliated_pis": 0,
                "proposal_count": 0,
                "iids_proposal_count": 0,
                "charge_revenue": 0.0,
                "equipment_hours": 0.0,
                "_lab_users": set(),
            }

        usage_colleges[college]["total_pis"] += 1
        usage_colleges[college]["proposal_count"] += row["proposal_count"]
        usage_colleges[college]["iids_proposal_count"] += row["iids_proposal_count"]
        usage_colleges[college]["charge_revenue"] += row["charge_revenue"]
        usage_colleges[college]["equipment_hours"] += row["equipment_hours"]
        usage_colleges[college]["_lab_users"].update(row["_lab_users"])

        if row["proposal_count"] > 0:
            usage_colleges[college]["proposal_pis"] += 1
        if row["unique_lab_users"] > 0:
            usage_colleges[college]["using_pis"] += 1
        if row["mapping_status"] == "matched":
            usage_colleges[college]["matched_pis"] += 1
            matched_pis_count += 1
        elif row["mapping_status"] == "proposals_only":
            proposals_only_pis_count += 1
        else:
            usage_only_pis_count += 1

        if row["iids_proposal_count"] > 0:
            usage_colleges[college]["affiliated_pis"] += 1
            if row["unique_lab_users"] > 0:
                affiliated_using_pis_count += 1

    usage_by_college = []
    for entry in usage_colleges.values():
        proposal_count = entry["proposal_count"]
        usage_by_college.append({
            "college": entry["college"],
            "college_display": entry["college_display"],
            "total_pis": entry["total_pis"],
            "proposal_pis": entry["proposal_pis"],
            "using_pis": entry["using_pis"],
            "matched_pis": entry["matched_pis"],
            "affiliated_pis": entry["affiliated_pis"],
            "distinct_lab_users": len(entry["_lab_users"]),
            "proposal_count": proposal_count,
            "iids_proposal_count": entry["iids_proposal_count"],
            "iids_proposal_rate": round(entry["iids_proposal_count"] / proposal_count * 100, 1) if proposal_count > 0 else 0,
            "charge_revenue": round(entry["charge_revenue"], 2),
            "equipment_hours": round(entry["equipment_hours"], 1),
        })
    usage_by_college.sort(key=lambda x: (x["matched_pis"], x["iids_proposal_count"], x["distinct_lab_users"]), reverse=True)

    pi_usage_mapping = {
        "summary": {
            "total_pis": len(usage_by_pi),
            "matched_pis": matched_pis_count,
            "proposals_only_pis": proposals_only_pis_count,
            "usage_only_pis": usage_only_pis_count,
            "affiliated_pis": total_affiliated_pis,
            "affiliated_using_pis": affiliated_using_pis_count,
            "distinct_lab_users": len(all_lab_users),
        },
        "by_college": usage_by_college,
        "by_pi": [
            {key: value for key, value in row.items() if not key.startswith("_")}
            for row in usage_by_pi
        ],
    }

    # ----------------------------------------------------------------
    # (i) CRC user growth: retention/churn + type breakdown
    # ----------------------------------------------------------------
    fy_usernames: dict[int, set] = {}
    fy_types: dict[int, dict] = {}
    for fy in [2023, 2024, 2025]:
        users = _load_crc_users(fy)
        usernames = set()
        type_counts: dict[str, int] = {}
        for u in users:
            uname = u.get("username", "").strip()
            if uname:
                usernames.add(uname)
            utype = u.get("type", "").strip() or "Unknown"
            type_counts[utype] = type_counts.get(utype, 0) + 1
        fy_usernames[fy] = usernames
        fy_types[fy] = type_counts

    retention = []
    prev_users: set[str] = set()
    for fy in [2023, 2024, 2025]:
        current = fy_usernames.get(fy, set())
        returning = current & prev_users if prev_users else set()
        new = current - prev_users if prev_users else current
        departed = prev_users - current if prev_users else set()
        retention.append({
            "fiscal_year": f"FY{str(fy)[-2:]}",
            "total_users": len(current),
            "new_users": len(new),
            "returning_users": len(returning),
            "departed_users": len(departed),
        })
        prev_users = current

    by_type = []
    for fy in [2023, 2024, 2025]:
        entry = {"fiscal_year": f"FY{str(fy)[-2:]}"}
        entry.update(fy_types.get(fy, {}))
        by_type.append(entry)

    crc_growth = {
        "retention": retention,
        "by_type": by_type,
    }

    return {
        "revenue_sources": revenue_sources,
        "proposal_portfolio": proposal_portfolio,
        "checkbox_analysis": checkbox_analysis,
        "sponsor_analysis": sponsor_analysis,
        "department_insights": department_insights,
        "cross_linkage": cross_linkage,
        "equipment_enriched": equipment_enriched,
        "crc_growth": crc_growth,
        "pi_affiliation": pi_affiliation,
        "pi_usage_mapping": pi_usage_mapping,
    }
