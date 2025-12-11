import pytest
from fastapi.testclient import TestClient
from payment_service.main import app

test_client = TestClient(app)

def test_execute_payment():
    result = test_client.post("/pay", json={"amount": 4999.99})
    assert result.status_code == 200
    assert result.json()["status"] == "успешно"