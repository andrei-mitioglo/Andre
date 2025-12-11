import pytest
from fastapi.testclient import TestClient
from notification_service.main import app

test_client = TestClient(app)

def test_dispatch_customer_alert():
    result = test_client.post("/send", json={"user_id": 1, "message": "Привет! Ваш заказ готов."})
    assert result.status_code == 200
    assert result.json()["status"] == "доставлено"