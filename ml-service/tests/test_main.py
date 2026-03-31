import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
import sys

# Ensure the parent directory is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_analyze_text_safe():
    """
    Test threshold logic for a safe post (score < 0.4).
    Matches Fast Pass score for 'Hello world'.
    """
    # Note: 'Hello world' triggers the Fast Pass in main.py
    response = client.post("/analyze/text", json={"text": "Hello world"})
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "safe"
    assert data["toxicity_score"] == 0.05  # Fast Pass score

def test_analyze_text_toxic():
    """
    Test threshold logic for a toxic post (score > 0.7).
    Matches Fast Pass score for 'You are stupid'.
    """
    # Note: 'You are stupid' triggers the Fast Pass in main.py
    response = client.post("/analyze/text", json={"text": "You are stupid"})
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "toxic"
    assert data["toxicity_score"] == 0.95  # Fast Pass score

def test_analyze_text_flagged():
    """
    Test threshold logic for a flagged post (0.4 < score < 0.7).
    """
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"toxicity_score": 0.5, "label": "flagged", "reason": "Borderline content"}'
    
    with patch("main.client.chat.completions.create", return_value=mock_response):
        response = client.post("/analyze/text", json={"text": "This might be bad"})
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "flagged"
        assert data["toxicity_score"] == 0.5

@pytest.mark.asyncio
async def test_analyze_image_mock():
    """
    Test image analysis endpoint with mocked Vision model response.
    """
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"nsfw_score": 0.0, "label": "safe", "reason": "Safe image"}'
    
    with patch("main.client.chat.completions.create", return_value=mock_response):
        response = client.post("/analyze/image", json={"image_url": "https://example.com/image.jpg"})
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "safe"

def test_analyze_misinformation():
    """
    Test misinformation detection logic.
    """
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"toxicity_score": 0.1, "misinformation_score": 0.9, "label": "misinformation", "reason": "False health claim"}'
    
    with patch("main.client.chat.completions.create", return_value=mock_response):
        response = client.post("/analyze/text", json={"text": "Magic crystals cure cancer"})
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "misinformation"
        assert data["misinformation_score"] == 0.9
