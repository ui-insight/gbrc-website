"""Content endpoint - site content for dynamic sections."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/team")
async def get_team():
    """Return team member information."""
    return {
        "members": [
            {
                "name": "TBD",
                "title": "Core Director",
                "email": "",
                "phone": "",
                "bio": "",
            },
        ]
    }


@router.get("/announcements")
async def get_announcements():
    """Return current announcements."""
    return {"announcements": []}


@router.get("/publications")
async def get_publications():
    """Return publication acknowledgment info."""
    return {
        "citation": (
            "Data collection and analyses performed by the University of Idaho "
            "IIDS Genomics and Bioinformatics Resource Core Facility, RRID:SCR_026416"
        ),
        "publications": [],
    }
