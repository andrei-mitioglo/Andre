import pytest
from fastapi.testclient import TestClient
from product_service.main import app

test_client = TestClient(app)

def test_fetch_all_catalog_items():
    result = test_client.get("/products")
    assert result.status_code == 200
    assert isinstance(result.json(), list)

def test_add_and_remove_catalog_item():
    # Создание нового товара
    new_item = {"name": "Тестовый гаджет", "price": 999.99}
    result = test_client.post("/products", json=new_item)
    assert result.status_code == 200
    item_data = result.json()
    assert item_data["name"] == "Тестовый гаджет"
    item_id = item_data["id"]

    # Получение товара
    fetch_result = test_client.get(f"/products/{item_id}")
    assert fetch_result.status_code == 200
    assert fetch_result.json()["name"] == "Тестовый гаджет"

    # Удаление товара
    remove_result = test_client.delete(f"/products/{item_id}")
    assert remove_result.status_code == 200

    # Проверка удаления
    verify_result = test_client.get(f"/products/{item_id}")
    assert verify_result.json() == {"error": "Товар не найден"}
