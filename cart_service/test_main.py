import pytest
from fastapi.testclient import TestClient
from cart_service.main import app

test_client = TestClient(app)

def test_put_product_in_basket():
    customer_id = 777
    product_data = {"product_id": 1, "quantity": 3}
    result = test_client.post(f"/cart/{customer_id}/add", json=product_data)
    assert result.status_code == 200
    response_data = result.json()
    assert "cart" in response_data
    assert len(response_data["cart"]) == 1
    assert response_data["cart"][0]["product_id"] == 1

    # Получить содержимое корзины
    basket_result = test_client.get(f"/cart/{customer_id}")
    assert basket_result.status_code == 200
    assert len(basket_result.json()) == 1
