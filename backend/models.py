from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Session, create_engine, select

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    image_url: Optional[str] = None
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = "PENDING"  # PENDING, SAFE, TOXIC, FLAGGED, MISINFORMATION
    toxicity_score: float = 0.0
    misinformation_score: float = 0.0
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    moderated_at: Optional[datetime] = None
    manual_override: bool = False
    correct_label: Optional[str] = None  # For metrics (True label from moderator)

class Metric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    total_samples: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
