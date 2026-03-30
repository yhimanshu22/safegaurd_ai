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
from models import User, Post

# Set up an in-memory test database
test_engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)

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

def test_create_user():
    response = client.post("/users", json={"username": "test_user"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_user"
    assert "id" in data

def test_list_users():
    client.post("/users", json={"username": "user1"})
    client.post("/users", json={"username": "user2"})
    
    response = client.get("/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["username"] == "user1"
    assert data[1]["username"] == "user2"

def test_create_post_with_user():
    # Create user first
    user_res = client.post("/users", json={"username": "author"})
    user_id = user_res.json()["id"]
    
    with patch("main.moderate_post_task.delay"):
        response = client.post(
            "/posts", 
            json={"content": "Hello", "user_id": user_id}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
