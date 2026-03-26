import os
import httpx
from celery import Celery
from sqlmodel import Session, select
from models import Post, engine
from datetime import datetime

# Initialize Celery
# Note: In a real docker environment, this would be 'redis://redis:6379/0'
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
celery_app = Celery("tasks", broker=CELERY_BROKER_URL)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001/analyze/text")

@celery_app.task(bind=True, max_retries=3, default_retry_delay=5)
def moderate_post_task(self, post_id: int):
    """
    Asynchronously moderates a post by calling the ML service.
    Includes retry logic for reliability.
    """
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return f"Post {post_id} not found"

        try:
            # Call ML Service
            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    ML_SERVICE_URL,
                    json={"text": post.content}
                )
                response.raise_for_status()
                result = response.json()

                # Update Post status in DB
                post.status = result.get("label", "FLAGGED").upper()
                post.toxicity_score = result.get("toxicity_score", 0.0)
                post.reason = result.get("reason", "No reason provided")
                post.moderated_at = datetime.utcnow()
                
                session.add(post)
                session.commit()
                return f"Post {post_id} moderated: {post.status}"

        except (httpx.RequestError, httpx.HTTPStatusError) as exc:
            # Retry on network issues or ML service errors
            print(f"Error calling ML service: {exc}. Retrying...")
            raise self.retry(exc=exc)
        except Exception as e:
            print(f"Unexpected error: {e}")
            post.status = "ERROR"
            session.add(post)
            session.commit()
            return str(e)
