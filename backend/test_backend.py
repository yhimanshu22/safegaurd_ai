import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from unittest.mock import patch
import os
import sys

# Ensure the backend root is in the python path for tests
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from models import engine, Post, create_db_and_tables

# Set up an in-memory test database
test_engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)

def get_test_session():
    with Session(test_engine) as session:
        yield session

# Note: In a real app, you'd use a dependency for the session.
# Since my main.py uses 'with Session(engine) as session', I need to mock the engine.
import main as app_module

client = TestClient(app)

@pytest.fixture(name="session", autouse=True)
def session_fixture():
    SQLModel.metadata.create_all(test_engine)
    with patch("main.engine", test_engine), \
         patch("metrics.engine", test_engine), \
         patch("tasks.engine", test_engine):
        with Session(test_engine) as session:
            yield session
    SQLModel.metadata.drop_all(test_engine)

def test_create_post():
    """
    Test post creation and verify that the moderation task is triggered.
    """
    # Note: We aren't testing the actual Celery task here, only its dispatch.
    with patch("main.moderate_post_task.delay") as mock_task:
        response = client.post(
            "/posts", 
            json={"content": "Post content", "status": "PENDING"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Post content"
        assert data["status"] == "PENDING"
        assert mock_task.called

def test_list_posts():
    """
    Test listing posts from the database.
    """
    response = client.get("/posts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_manual_moderation_and_metrics():
    """
    Test manual override logic and verify metrics calculation trigger.
    """
    # Create a post first
    create_res = client.post("/posts", json={"content": "To be moderated"})
    post_id = create_res.json()["id"]

    # Manual moderate to SAFE
    response = client.patch(f"/posts/{post_id}/moderate?correct_label=SAFE")
    assert response.status_code == 200
    assert response.json()["status"] == "SAFE"

    # Verify metrics updated
    metrics_res = client.get("/metrics")
    assert metrics_res.status_code == 200
    # Metrics should be non-null if we have verified samples
    assert metrics_res.json() is not None
