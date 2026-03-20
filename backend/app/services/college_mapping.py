"""College mapping utilities for GBRC dashboard analytics.

Maps proposal department prefixes to college display names, charge department
names to college codes, and provides fallback PI-to-college assignments.

College codes follow the R analysis convention:
  CALS, COS, CNR, ENG (COE), SHAMP (COEHHS/WWAMI), IIDS, OTHER
"""

# ----------------------------------------------------------------
# Proposal DEPARTMENT prefix → college display name
# Proposal departments follow the pattern: "PREFIX DeptName-Number"
# ----------------------------------------------------------------
DEPARTMENT_PREFIX_TO_COLLEGE: dict[str, str] = {
    # Academic colleges
    "CAA": "CAA",
    "CALS": "CALS",
    "CBE": "CBE",
    "CLASS": "CLASS",
    "CNR": "CNR",
    "COE": "ENG",
    "COEHHS": "SHAMP",
    "COGS": "COGS",
    "COL": "COL",
    "COS": "COS",
    # Research centers & admin
    "RCI": "RCI",
    "EAD": "OTHER",
    "FM": "OTHER",
    "GL": "OTHER",
    "MCCL": "OTHER",
    "PRES": "OTHER",
    "PROV": "OTHER",
    "SA": "OTHER",
    "SEM": "OTHER",
    "TRIB": "OTHER",
    "UOFNI": "OTHER",
    "UOIF": "OTHER",
    "UONI": "OTHER",
    "UR": "OTHER",
    "VPAI": "OTHER",
    "WWAMI": "SHAMP",
}

# ----------------------------------------------------------------
# Charge Customer Department (full name) → college code
# From R dept_codes mapping
# ----------------------------------------------------------------
CHARGE_DEPT_TO_COLLEGE: dict[str, str] = {
    "Margaret Ritchie School of Family and Consumer Sciences": "CALS",
    "Department of Animal, Veterinary and Food Sciences": "CALS",
    "Department of Biological Sciences": "COS",
    "Department of Chemical and Biological Engineering": "ENG",
    "Department of Civil and Environmental Engineering": "ENG",
    "Department of Entomology, Plant Pathology & Nematology": "CALS",
    "Department of Fish and Wildlife Sciences": "CNR",
    "Department of Forest, Rangeland and Fire Sciences": "CNR",
    "Department of Physics": "COS",
    "Department of Plant Sciences": "CALS",
    "School of Health and Medical Professions": "SHAMP",
}

# ----------------------------------------------------------------
# RCI sub-units → college code (from R recode_deptnames_to_college)
# ----------------------------------------------------------------
RCI_OVERRIDES: dict[str, str] = {
    "Inst for Health in Human Ecosys": "CALS",
    "Aquaculture": "CNR",
    "Inst for Interdisc Data Sci": "COS",
}

# ----------------------------------------------------------------
# PI name → college code overrides (from R dept_override, ~50 entries)
# Used when a charge PI cannot be matched to a proposal department.
# ----------------------------------------------------------------
PI_COLLEGE_OVERRIDES: dict[str, str] = {
    "Adam Jones": "COS",
    "Alexander Karasev": "CALS",
    "Andreas Vasdekis": "COS",
    "Andrew Pierce": "COS",
    "Amy Skibiel": "CALS",
    "Bethaney Fehrenkamp": "SHAMP",
    "Brenda Murdoch": "CALS",
    "Brian Small": "CNR",
    "Chris Caudill": "CNR",
    "Chris Hamilton": "CALS",
    "Chris Marx": "COS",
    "Christine Parent": "COS",
    "Clifford Swanson": "ENG",
    "Craig Miller": "COS",
    "Dan New": "COS",
    "Daniel New": "COS",
    "Dave Ausband": "CNR",
    "Dave Tank": "COS",
    "Deborah Stenkamp": "COS",
    "Diana Mitchell": "COS",
    "Dojin Ryu": "CALS",
    "Eric Coats": "ENG",
    "Eva Top": "COS",
    "Evan Eskew": "IIDS",
    "Jack Sullivan": "COS",
    "Jake Bledsoe": "CALS",
    "James Moberly": "ENG",
    "James Nagler": "COS",
    "James Vanleuven": "CALS",
    "Jianli Chen": "CALS",
    "Jie Ma": "CNR",
    "Jie ma": "CNR",
    "Kamal Kumar": "ENG",
    "Ken Cain": "CNR",
    "Kimberly Andrews": "CNR",
    "Klas Udekwu": "COS",
    "Laura Lynch": "CNR",
    "Leda Kobziar": "CNR",
    "Lisette Waits": "CNR",
    "Luke Harmon": "COS",
    "Mark Coleman": "CNR",
    "Mark McGuire": "CALS",
    "Matt Falcy": "CNR",
    "Matthew Bernards": "ENG",
    "Meijun Zhu": "CALS",
    "Michael Strickland": "CALS",
    "Onesmo Balemba": "COS",
    "Paul Hohenlohe": "COS",
    "Paul Rowley": "COS",
    "Scott Grieshaber": "COS",
    "Scott Nuismer": "COS",
    "Tyler Bland": "SHAMP",
    "Vikas Kumar": "CNR",
    "Yimin Chen": "CALS",
    "Zachary Kayler": "CALS",
}

# ----------------------------------------------------------------
# College code → display label (for frontend)
# ----------------------------------------------------------------
COLLEGE_DISPLAY_NAMES: dict[str, str] = {
    "CALS": "CALS — Agricultural & Life Sciences",
    "COS": "COS — Science",
    "CNR": "CNR — Natural Resources",
    "ENG": "ENG — Engineering",
    "SHAMP": "SHAMP — Health & Medical Professions",
    "CLASS": "CLASS — Letters, Arts & Social Sciences",
    "CBE": "CBE — Business & Economics",
    "CAA": "CAA — Art & Architecture",
    "COGS": "COGS — Graduate Studies",
    "COL": "COL — Law",
    "RCI": "RCI — Research Centers & Institutes",
    "IIDS": "IIDS",
    "OTHER": "Other",
}


def get_college_from_department(department: str) -> str:
    """Extract college code from a proposal DEPARTMENT string.

    Examples:
        'COS Biological Sciences-834' -> 'COS'
        'CALS Animal, Vet & Food Sciences-848' -> 'CALS'
        'RCI Inst for Interdisc Data Sci-xxx' -> 'COS' (via RCI override)
    """
    if not department:
        return "Unknown"
    department = department.strip()

    # Check prefix mapping
    prefix = department.split(" ")[0] if " " in department else department
    college = DEPARTMENT_PREFIX_TO_COLLEGE.get(prefix)

    # Handle RCI sub-units that map to specific colleges
    if college == "RCI":
        dept_rest = department[len(prefix):].strip()
        for rci_key, rci_college in RCI_OVERRIDES.items():
            if rci_key.lower() in dept_rest.lower():
                return rci_college
        return "RCI"

    return college if college else "OTHER"


def get_college_from_charge_dept(charge_department: str) -> str:
    """Map a charge Customer Department (full name) to a college code.

    Uses exact match against known department names, then falls back
    to keyword heuristics.
    """
    if not charge_department:
        return "Unknown"
    dept = charge_department.strip()

    # Exact match
    if dept in CHARGE_DEPT_TO_COLLEGE:
        return CHARGE_DEPT_TO_COLLEGE[dept]

    # Keyword heuristics (from R recode_deptnames_to_college regex logic)
    dl = dept.lower()
    if "biological" in dl or "biology" in dl or "physics" in dl or "chemistry" in dl or "math" in dl:
        return "COS"
    if "animal" in dl or "plant" in dl or "entomology" in dl or "food" in dl or "soil" in dl:
        return "CALS"
    if "fish" in dl or "wildlife" in dl or "forest" in dl or "rangeland" in dl or "natural" in dl:
        return "CNR"
    if "engineering" in dl or "computer science" in dl:
        return "ENG"
    if "health" in dl or "medical" in dl or "wwami" in dl:
        return "SHAMP"

    return "OTHER"


def get_college_for_pi(pi_name: str, proposals: list[dict]) -> str:
    """Determine college code for a PI.

    Strategy:
    1. Check PI_COLLEGE_OVERRIDES first (manual assignments take priority)
    2. Look up PI in proposals → extract college from DEPARTMENT prefix
    3. Return 'Unknown' if neither matches
    """
    pi_lower = pi_name.strip().lower()

    # Manual overrides take priority (exact match, then case-insensitive)
    if pi_name in PI_COLLEGE_OVERRIDES:
        return PI_COLLEGE_OVERRIDES[pi_name]
    for override_name, override_college in PI_COLLEGE_OVERRIDES.items():
        if override_name.lower() == pi_lower:
            return override_college

    # Try proposal department
    for p in proposals:
        if p.get("PI", "").strip().lower() == pi_lower:
            dept = p.get("DEPARTMENT", "").strip()
            college = get_college_from_department(dept)
            if college not in ("Unknown", "Other", "OTHER"):
                return college

    return "Unknown"


def get_college_display_name(code: str) -> str:
    """Get the display label for a college code."""
    return COLLEGE_DISPLAY_NAMES.get(code, code)
