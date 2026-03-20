"""Business logic for project intake submissions."""

import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config.settings import settings
from app.models.intake import (
    IntakeFileUpload,
    IntakeSample,
    IntakeServiceSelection,
    IntakeSubmission,
    SubmissionStatus,
)
from app.schemas.intake import (
    SampleCreate,
    ServiceSelectionCreate,
    SubmissionCreate,
    SubmissionUpdate,
)


async def create_submission(
    db: AsyncSession, data: SubmissionCreate
) -> IntakeSubmission:
    submission = IntakeSubmission(**data.model_dump(exclude_unset=True))
    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return submission


async def get_submission(
    db: AsyncSession, submission_id: uuid.UUID
) -> IntakeSubmission | None:
    result = await db.execute(
        select(IntakeSubmission)
        .where(IntakeSubmission.id == submission_id)
        .options(
            selectinload(IntakeSubmission.samples),
            selectinload(IntakeSubmission.service_selections),
            selectinload(IntakeSubmission.file_uploads),
            selectinload(IntakeSubmission.chat_messages),
        )
    )
    return result.scalar_one_or_none()


async def update_submission(
    db: AsyncSession, submission_id: uuid.UUID, data: SubmissionUpdate
) -> IntakeSubmission | None:
    submission = await get_submission(db, submission_id)
    if not submission:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(submission, key, value)
    await db.flush()
    await db.refresh(submission)
    return submission


async def submit_submission(
    db: AsyncSession, submission_id: uuid.UUID
) -> IntakeSubmission | None:
    submission = await get_submission(db, submission_id)
    if not submission:
        return None
    submission.status = SubmissionStatus.submitted
    await db.flush()
    await db.refresh(submission)
    return submission


async def replace_samples(
    db: AsyncSession, submission_id: uuid.UUID, samples: list[SampleCreate]
) -> list[IntakeSample]:
    # Delete existing samples
    result = await db.execute(
        select(IntakeSample).where(IntakeSample.submission_id == submission_id)
    )
    for existing in result.scalars():
        await db.delete(existing)

    # Create new samples
    new_samples = []
    for s in samples:
        sample = IntakeSample(submission_id=submission_id, **s.model_dump())
        db.add(sample)
        new_samples.append(sample)
    await db.flush()
    for sample in new_samples:
        await db.refresh(sample)
    return new_samples


async def replace_services(
    db: AsyncSession,
    submission_id: uuid.UUID,
    services: list[ServiceSelectionCreate],
) -> list[IntakeServiceSelection]:
    # Delete existing
    result = await db.execute(
        select(IntakeServiceSelection).where(
            IntakeServiceSelection.submission_id == submission_id
        )
    )
    for existing in result.scalars():
        await db.delete(existing)

    # Create new
    new_services = []
    for s in services:
        svc = IntakeServiceSelection(submission_id=submission_id, **s.model_dump())
        db.add(svc)
        new_services.append(svc)
    await db.flush()
    for svc in new_services:
        await db.refresh(svc)
    return new_services


async def save_uploaded_file(
    db: AsyncSession,
    submission_id: uuid.UUID,
    filename: str,
    content: bytes,
    mime_type: str,
) -> IntakeFileUpload:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4()}_{filename}"
    stored_path = upload_dir / stored_name
    stored_path.write_bytes(content)

    file_upload = IntakeFileUpload(
        submission_id=submission_id,
        original_filename=filename,
        stored_path=str(stored_path),
        file_size=len(content),
        mime_type=mime_type,
    )
    db.add(file_upload)
    await db.flush()
    await db.refresh(file_upload)
    return file_upload


async def get_file_upload(
    db: AsyncSession, file_id: uuid.UUID
) -> IntakeFileUpload | None:
    result = await db.execute(
        select(IntakeFileUpload).where(IntakeFileUpload.id == file_id)
    )
    return result.scalar_one_or_none()
