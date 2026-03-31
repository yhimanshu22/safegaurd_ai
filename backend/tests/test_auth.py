import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from main import app, get_session
from models import User
from auth_utils import get_password_hash

# Setup test database
sqlite_url = "sqlite:///./test.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_register_user(client):
    response = client.post(
        "/register",
        json={"username": "testuser_test", "password": "password123", "email": "test@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser_test"
    assert "id" in data

def test_login_user(client):
    # Register first
    client.post(
        "/register",
        json={"username": "loginuser", "password": "password123"},
    )
    
    # Login
    response = client.post(
        "/login",
        json={"username": "loginuser", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_incorrect_password(client):
    client.post(
        "/register",
        json={"username": "wrongpassuser", "password": "password123"},
    )
    
    response = client.post(
        "/login",
        json={"username": "wrongpassuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401

def test_get_me(client):
    client.post(
        "/register",
        json={"username": "meuser", "password": "password123"},
    )
    
    login_res = client.post(
        "/login",
        json={"username": "meuser", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "meuser"

def test_protected_posts(client):
    # Try to post without token
    response = client.post(
        "/posts",
        json={"content": "Should fail"}
    )
    assert response.status_code == 401
