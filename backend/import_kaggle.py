import os
import base64
import httpx
import kagglehub
from sqlmodel import Session, select
from pathlib import Path
from PIL import Image
from io import BytesIO

# Fix for database path when running from root
current_dir = Path(__file__).parent.absolute()
database_url = f"sqlite:///{current_dir}/database.db"
os.environ["DATABASE_URL"] = database_url
print(f"DEBUG: current_dir={current_dir}")
print(f"DEBUG: DATABASE_URL={database_url}")

# Now import models after environment is set
from models import Post, User, engine

# Configuration
ML_SERVICE_URL = "http://localhost:8001/analyze/image"
DATASET_NAME = "gdk4539/image-classification-to-detect-nsfw"
BACKEND_BASE_URL = "http://localhost:8000/kaggle-images"

def encode_image_to_base64(image_path: Path) -> str:
    """Encodes a local image to a base64 data URL."""
    try:
        with Image.open(image_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.thumbnail((800, 800))
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Error encoding image {image_path}: {e}")
        return None

def import_data():
    # 1. Ensure we have a user to associate posts with
    with Session(engine) as session:
        user = session.exec(select(User)).first()
        if not user:
            print("No user found in database. Create a user first via the frontend or API.")
            return

        print(f"Using user: {user.username} (ID: {user.id})")

        # 2. Download/Locate dataset
        print(f"Downloading/Locating dataset: {DATASET_NAME}...")
        try:
            path = kagglehub.dataset_download(DATASET_NAME)
            dataset_path = Path(path)
            print(f"Dataset path: {dataset_path}")
        except Exception as e:
            print(f"Failed to download dataset: {e}")
            return

        # 3. Find images
        images = list(dataset_path.glob("**/*.jpg")) + list(dataset_path.glob("**/*.png")) + list(dataset_path.glob("**/*.jpeg"))
        print(f"Found {len(images)} images. Limiting to 50...")
        images = images[:50]

        # 4. Process and Insert
        with httpx.Client(timeout=30.0) as client:
            for img_path in images:
                print(f"Processing {img_path.name}...")
                
                # Moderate via ML Service
                data_url = encode_image_to_base64(img_path)
                if not data_url:
                    continue
                
                try:
                    ml_response = client.post(ML_SERVICE_URL, json={"image_url": data_url})
                    ml_response.raise_for_status()
                    ml_result = ml_response.json()
                    
                    # Create Post
                    post = Post(
                        content=f"Kaggle Dataset Image: {img_path.name}",
                        image_url=f"{BACKEND_BASE_URL}/{img_path.name}",
                        user_id=user.id,
                        status=ml_result.get("label", "SAFE").upper(),
                        toxicity_score=ml_result.get("nsfw_score", 0.0),
                        reason=ml_result.get("reason"),
                    )
                    session.add(post)
                    print(f"  Added post: {post.status} ({post.toxicity_score})")
                except Exception as e:
                    print(f"  Error moderating/adding {img_path.name}: {e}")
        
        session.commit()
        print("Done! Kaggle data imported successfully.")

if __name__ == "__main__":
    import_data()
