"""Pydantic schemas for project intake."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# --- Samples ---


class SampleCreate(BaseModel):
    sample_type: str | None = None
    organism: str | None = None
    count: int | None = None
    extraction_method: str | None = None
    quality_metrics: dict | None = None
    notes: str | None = None


class SampleResponse(SampleCreate):
    id: UUID

    model_config = {"from_attributes": True}


# --- Service Selections ---


class ServiceSelectionCreate(BaseModel):
    service_name: str
    notes: str | None = None


class ServiceSelectionResponse(ServiceSelectionCreate):
    id: UUID

    model_config = {"from_attributes": True}


# --- File Uploads ---


class FileUploadResponse(BaseModel):
    id: UUID
    original_filename: str
    file_size: int
    mime_type: str
    ai_summary: str | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# --- Chat Messages ---


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Submissions ---


class SubmissionCreate(BaseModel):
    pi_name: str | None = None
    pi_email: str | None = None
    department: str | None = None
    project_title: str | None = None
    project_description: str | None = None
    project_goals: str | None = None
    timeline_preference: str | None = None
    budget_estimate_cents: int | None = None


class SubmissionUpdate(BaseModel):
    pi_name: str | None = None
    pi_email: str | None = None
    department: str | None = None
    project_title: str | None = None
    project_description: str | None = None
    project_goals: str | None = None
    timeline_preference: str | None = None
    budget_estimate_cents: int | None = None


class SubmissionResponse(BaseModel):
    id: UUID
    status: str
    pi_name: str | None = None
    pi_email: str | None = None
    department: str | None = None
    project_title: str | None = None
    project_description: str | None = None
    project_goals: str | None = None
    timeline_preference: str | None = None
    budget_estimate_cents: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SubmissionDetailResponse(SubmissionResponse):
    samples: list[SampleResponse] = []
    service_selections: list[ServiceSelectionResponse] = []
    file_uploads: list[FileUploadResponse] = []
    chat_messages: list[ChatMessageResponse] = []


# --- Wizard State (composite for frontend) ---


class IntakeWizardState(BaseModel):
    """Full wizard state for the frontend to consume."""

    submission: SubmissionResponse
    samples: list[SampleResponse] = []
    services: list[ServiceSelectionResponse] = []
    files: list[FileUploadResponse] = []
