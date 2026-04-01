from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Session, create_engine, select

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = Field(default=None, index=True)
    hashed_password: str
    role: str = Field(default="user")  # "user" or "moderator"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostBase(SQLModel):
    content: str
    image_url: Optional[str] = None

class Post(PostBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = "PENDING"
    toxicity_score: float = 0.0
    misinformation_score: float = 0.0
    reason: Optional[str] = None
    manual_label: Optional[str] = None
    manual_override: bool = False
    correct_label: Optional[str] = None  # For metrics (True label from moderator)
    moderated_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(PostBase):
    pass

class PostRead(Post):
    username: Optional[str] = None

class Metric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    total_samples: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

import os
sqlite_file_name = "database.db"
sqlite_url = os.getenv("DATABASE_URL", f"sqlite:///{sqlite_file_name}")

engine = create_engine(sqlite_url, echo=False)


def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
