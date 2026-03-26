from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from datetime import datetime
from .models import Post, Metric, engine, create_db_and_tables
from .tasks import moderate_post_task
from .metrics import calculate_metrics

app = FastAPI(title="Moderation System Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/posts", response_model=Post)
def create_post(post: Post):
    """
    Creates a new post and dispatches a moderation task.
    """
    with Session(engine) as session:
        session.add(post)
        session.commit()
        session.refresh(post)
        
        # Async moderation task
        moderate_post_task.delay(post.id)
        return post

@app.get("/posts", response_model=List[Post])
def list_posts(status: Optional[str] = None):
    with Session(engine) as session:
        statement = select(Post)
        if status:
            statement = statement.where(Post.status == status)
        posts = session.exec(statement).all()
        return posts

@app.patch("/posts/{post_id}/moderate")
def update_post_manual(post_id: int, correct_label: str):
    """
    Manual override by moderator. Updates the status and triggers metric calculation.
    """
    with Session(engine) as session:
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
def get_latest_metrics():
    with Session(engine) as session:
        statement = select(Metric).order_by(Metric.updated_at.desc()).limit(1)
        metric = session.exec(statement).first()
        return metric

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
