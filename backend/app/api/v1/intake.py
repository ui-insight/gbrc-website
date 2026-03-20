"""Project intake API endpoints."""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.db.engine import get_db
from app.schemas.intake import (
    SampleCreate,
    SampleResponse,
    ServiceSelectionCreate,
    ServiceSelectionResponse,
    SubmissionCreate,
    SubmissionDetailResponse,
    SubmissionResponse,
    SubmissionUpdate,
    FileUploadResponse,
)
from app.services import intake_service

router = APIRouter()

ALLOWED_MIME_TYPES = {"application/pdf"}


@router.post("/", response_model=SubmissionResponse, status_code=201)
async def create_submission(
    data: SubmissionCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new draft intake submission."""
    submission = await intake_service.create_submission(db, data)
    return submission


@router.get("/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission(
    submission_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    """Retrieve a full intake submission with all related data."""
    submission = await intake_service.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.put("/{submission_id}", response_model=SubmissionResponse)
async def update_submission(
    submission_id: uuid.UUID,
    data: SubmissionUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update submission fields (partial update for wizard step saves)."""
    submission = await intake_service.update_submission(db, submission_id, data)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.post("/{submission_id}/submit", response_model=SubmissionResponse)
async def submit_submission(
    submission_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    """Transition submission from draft to submitted."""
    submission = await intake_service.submit_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.post(
    "/{submission_id}/samples", response_model=list[SampleResponse]
)
async def replace_samples(
    submission_id: uuid.UUID,
    samples: list[SampleCreate],
    db: AsyncSession = Depends(get_db),
):
    """Replace all samples for a submission."""
    submission = await intake_service.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return await intake_service.replace_samples(db, submission_id, samples)


@router.post(
    "/{submission_id}/services",
    response_model=list[ServiceSelectionResponse],
)
async def replace_services(
    submission_id: uuid.UUID,
    services: list[ServiceSelectionCreate],
    db: AsyncSession = Depends(get_db),
):
    """Replace all service selections for a submission."""
    submission = await intake_service.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return await intake_service.replace_services(db, submission_id, services)


@router.post(
    "/{submission_id}/files", response_model=FileUploadResponse
)
async def upload_file(
    submission_id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF file for a submission."""
    submission = await intake_service.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    max_size = settings.max_upload_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb}MB",
        )

    return await intake_service.save_uploaded_file(
        db, submission_id, file.filename or "upload.pdf", content, file.content_type
    )


@router.get("/{submission_id}/files/{file_id}")
async def download_file(
    submission_id: uuid.UUID,
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Download an uploaded file."""
    file_upload = await intake_service.get_file_upload(db, file_id)
    if not file_upload or file_upload.submission_id != submission_id:
        raise HTTPException(status_code=404, detail="File not found")

    path = Path(file_upload.stored_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=str(path),
        filename=file_upload.original_filename,
        media_type=file_upload.mime_type,
    )
