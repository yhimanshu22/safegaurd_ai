from typing import List, Optional
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from models import Post, User, Metric, PostRead, engine, create_db_and_tables, get_session
from tasks import moderate_post_task
from metrics import calculate_metrics
from auth_utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import kagglehub
import os

app = FastAPI(title="SafeGuard AI Backend v2")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Kaggle Dataset Images
try:
    KAGGE_PATH = kagglehub.dataset_download("gdk4539/image-classification-to-detect-nsfw")
    app.mount("/kaggle-images", StaticFiles(directory=KAGGE_PATH), name="kaggle-images")
    print(f"✅ Serving Kaggle images from {KAGGE_PATH}")
except Exception as e:
    print(f"⚠️ Failed to mount Kaggle images: {e}")


# Auth Models
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "user"  # "user" or "moderator"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.post("/register", response_model=User)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    # Check if user exists
    existing = session.exec(
        select(User).where(User.username == user_data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.post("/login", response_model=Token)
def login(login_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(
        select(User).where(User.username == login_data.username)
    ).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }


@app.get("/users/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/posts", response_model=Post)
def create_post(
    post: Post,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a new post and dispatches a moderation task.
    Requires authentication.
    """
    post.user_id = current_user.id
    session.add(post)
    session.commit()
    session.refresh(post)

    # Async moderation task
    moderate_post_task.delay(post.id)
    return post


@app.get("/posts", response_model=List[PostRead])
def list_posts(status: Optional[str] = None, session: Session = Depends(get_session)):
    """
    Lists all posts. Join with User to get usernames.
    """
    statement = select(Post, User.username).join(User, Post.user_id == User.id).order_by(Post.created_at.desc())
    if status:
        statement = statement.where(Post.status == status)
    
    results = session.exec(statement).all()
    
    # Map (Post, username) tuple to PostRead
    posts_read = []
    for row in results:
        # SQLModel select(Post, User.username) returns a tuple (Post, username)
        post, username = row
        post_dict = post.model_dump()
        # Fallback for identity mapping if user was deleted or ID shifted
        post_dict["username"] = username or f"User {post.user_id}"
        posts_read.append(PostRead(**post_dict))
        
    return posts_read


@app.patch("/posts/{post_id}/moderate")
def update_post_manual(
    post_id: int,
    correct_label: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Manual override by moderator. Updates the status and triggers metric calculation.
    """
    if current_user.role != "moderator":
        raise HTTPException(
            status_code=403, detail="Only moderators can perform this action"
        )
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.correct_label = correct_label.upper()
    post.status = post.correct_label
    post.manual_override = True

    session.add(post)
    session.commit()

    # Re-calculate metrics
    calculate_metrics()

    return {"id": post_id, "status": post.status, "manual_override": True}


@app.get("/metrics", response_model=Optional[Metric])
def get_latest_metrics(session: Session = Depends(get_session)):
    statement = select(Metric).order_by(Metric.updated_at.desc()).limit(1)
    metric = session.exec(statement).first()
    return metric


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
