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
            # Call ML Service for Text
            with httpx.Client(timeout=10.0) as client:
                text_response = client.post(ML_SERVICE_URL, json={"text": post.content})
                text_response.raise_for_status()
                text_result = text_response.json()

                # Call ML Service for Image if present
                image_result = None
                if post.image_url:
                    try:
                        # Use the image analysis endpoint (note: same base URL but different path)
                        IMAGE_ML_URL = ML_SERVICE_URL.replace("/text", "/image")
                        image_response = client.post(
                            IMAGE_ML_URL, json={"image_url": post.image_url}
                        )
                        image_response.raise_for_status()
                        image_result = image_response.json()
                    except Exception as img_exc:
                        print(f"Image analysis failed: {img_exc}")

                # Combine Results
                # Priority: TOXIC > MISINFORMATION > FLAGGED > SAFE
                text_label = text_result.get("label", "SAFE").upper()
                text_misinfo_score = text_result.get("misinformation_score", 0.0)
                img_label = (
                    image_result.get("label", "SAFE").upper()
                    if image_result
                    else "SAFE"
                )

                if text_label == "TOXIC" or img_label == "TOXIC":
                    post.status = "TOXIC"
                elif text_label == "MISINFORMATION" or text_misinfo_score > 0.7:
                    post.status = "MISINFORMATION"
                elif text_label == "FLAGGED" or img_label == "FLAGGED":
                    post.status = "FLAGGED"
                else:
                    post.status = "SAFE"

                post.toxicity_score = max(
                    text_result.get("toxicity_score", 0.0),
                    image_result.get("nsfw_score", 0.0) if image_result else 0.0,
                )
                post.misinformation_score = text_misinfo_score

                reasons = []
                if text_result.get("reason"):
                    reasons.append(f"Text: {text_result['reason']}")
                if image_result and image_result.get("reason"):
                    reasons.append(f"Image: {image_result['reason']}")
                post.reason = " | ".join(reasons)

                post.moderated_at = datetime.utcnow()

                session.add(post)
                session.commit()
                return (
                    f"Post {post_id} moderated. Text: {text_label}, Image: {img_label}"
                )

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
