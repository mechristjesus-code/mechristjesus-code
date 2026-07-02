from sqlalchemy import Column, String, Text, UUID, ForeignKey, DateTime, JSON
import uuid
from datetime import datetime, timezone
from packages.shared.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(JSON, default={}) # Stores script, titles, etc.
    status = Column(String, default="draft") # draft, completed, archived
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
