from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_empty_transliteration():
    response = client.post(
        "/api/v1/transliterate",
        json={"text": "", "style": "iso15919"}
    )
    assert response.status_code == 200
    assert response.json() == {"result": ""}

def test_basic_transliteration():
    # Test ISO 15919
    response = client.post(
        "/api/v1/transliterate",
        json={"text": "ਗੁਰਮੁਖੀ", "style": "iso15919"}
    )
    assert response.status_code == 200
    assert "result" in response.json()

    # Test practical
    response = client.post(
        "/api/v1/transliterate",
        json={"text": "ਗੁਰਮੁਖੀ", "style": "practical"}
    )
    assert response.status_code == 200
    assert "result" in response.json()

def test_legacy_conversion():
    response = client.post(
        "/api/v1/transliterate",
        json={"text": "<legacy font text>", "style": "legacy"}
    )
    assert response.status_code == 200
    assert "result" in response.json() 