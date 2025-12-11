import pytest
from fastapi.testclient import TestClient
from auth_service.main import app

test_client = TestClient(app)

def test_signup_and_authorize():
    # Регистрация нового аккаунта
    signup_result = test_client.post("/register", json={"username": "newclient", "password": "secret789"})
    assert signup_result.status_code == 200
    assert signup_result.json() == {"message": "Аккаунт успешно создан"}

    # Вход в систему
    auth_result = test_client.post("/login", json={"username": "newclient", "password": "secret789"})
    assert auth_result.status_code == 200
    response_data = auth_result.json()
    assert "token" in response_data
    assert response_data["username"] == "newclient"

def test_authorize_wrong_credentials():
    result = test_client.post("/login", json={"username": "unknown", "password": "badpass"})
    assert result.status_code == 401
