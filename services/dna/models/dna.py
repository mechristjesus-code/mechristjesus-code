from sqlalchemy import Column, String, JSON, UUID, ForeignKey, DateTime
import uuid
from datetime import datetime, timezone
from packages.shared.database import Base

class CreatorDNA(Base):
    __tablename__ = "creator_dna"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String, nullable=False)
    writing_preferences = Column(JSON, default={})
    brand_settings = Column(JSON, default={})
    prompt_templates = Column(JSON, default={})
    workflow_preferences = Column(JSON, default={})
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
