import pytest
import respx
from httpx import Response
from fastapi.testclient import TestClient
from order_service.main import app

test_client = TestClient(app)

@respx.mock
def test_successful_purchase():
    # Мок платёжного сервиса
    respx.post("http://payment_service:8005/pay").mock(return_value=Response(200, json={"status": "успешно"}))
    
    # Мок сервиса уведомлений
    respx.post("http://notification_service:8006/send").mock(return_value=Response(200, json={"status": "доставлено"}))

    purchase_data = {
        "user_id": 1,
        "items": [{"product_id": 1, "quantity": 1}],
        "total_amount": 5000.0
    }
    
    result = test_client.post("/orders", json=purchase_data)
    assert result.status_code == 200
    assert result.json()["status"] == "подтверждён"

@respx.mock
def test_purchase_payment_failed():
    # Мок неудачного платежа
    respx.post("http://payment_service:8005/pay").mock(return_value=Response(400, json={"detail": "Ошибка проведения платежа"}))

    purchase_data = {
        "user_id": 1,
        "items": [{"product_id": 1, "quantity": 1}],
        "total_amount": 5000.0
    }
    
    result = test_client.post("/orders", json=purchase_data)
    assert result.status_code == 400
    assert result.json()["detail"] == "Ошибка проведения платежа"