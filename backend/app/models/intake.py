"""SQLAlchemy ORM models for project intake."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SubmissionStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    reviewed = "reviewed"


class ChatRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class IntakeSubmission(Base):
    __tablename__ = "intake_submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus), default=SubmissionStatus.draft
    )

    # PI info
    pi_name: Mapped[str | None] = mapped_column(String(255))
    pi_email: Mapped[str | None] = mapped_column(String(255))
    department: Mapped[str | None] = mapped_column(String(255))

    # Project info
    project_title: Mapped[str | None] = mapped_column(String(500))
    project_description: Mapped[str | None] = mapped_column(Text)
    project_goals: Mapped[str | None] = mapped_column(Text)

    # Timeline and budget
    timeline_preference: Mapped[str | None] = mapped_column(Text)
    budget_estimate_cents: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    samples: Mapped[list["IntakeSample"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )
    service_selections: Mapped[list["IntakeServiceSelection"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )
    file_uploads: Mapped[list["IntakeFileUpload"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )
    chat_messages: Mapped[list["IntakeChatMessage"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan",
        order_by="IntakeChatMessage.created_at",
    )


class IntakeSample(Base):
    __tablename__ = "intake_samples"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_submissions.id", ondelete="CASCADE")
    )

    sample_type: Mapped[str | None] = mapped_column(String(255))
    organism: Mapped[str | None] = mapped_column(String(255))
    count: Mapped[int | None] = mapped_column(Integer)
    extraction_method: Mapped[str | None] = mapped_column(String(255))
    quality_metrics: Mapped[dict | None] = mapped_column(JSON)
    notes: Mapped[str | None] = mapped_column(Text)

    submission: Mapped["IntakeSubmission"] = relationship(back_populates="samples")


class IntakeServiceSelection(Base):
    __tablename__ = "intake_service_selections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_submissions.id", ondelete="CASCADE")
    )

    service_name: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)

    submission: Mapped["IntakeSubmission"] = relationship(
        back_populates="service_selections"
    )


class IntakeFileUpload(Base):
    __tablename__ = "intake_file_uploads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_submissions.id", ondelete="CASCADE")
    )

    original_filename: Mapped[str] = mapped_column(String(500))
    stored_path: Mapped[str] = mapped_column(String(1000))
    file_size: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(100))
    ai_summary: Mapped[str | None] = mapped_column(Text)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    submission: Mapped["IntakeSubmission"] = relationship(
        back_populates="file_uploads"
    )


class IntakeChatMessage(Base):
    __tablename__ = "intake_chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("intake_submissions.id", ondelete="CASCADE")
    )

    role: Mapped[ChatRole] = mapped_column(Enum(ChatRole))
    content: Mapped[str] = mapped_column(Text)
    think_content: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    submission: Mapped["IntakeSubmission"] = relationship(
        back_populates="chat_messages"
    )
