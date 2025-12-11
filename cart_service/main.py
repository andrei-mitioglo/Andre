from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Сервис корзины покупок")

# Хранилище корзин: {customer_id: [товары]}
shopping_baskets = {}

class BasketProduct(BaseModel):
    product_id: int
    quantity: int

@app.get("/cart/{customer_id}")
async def fetch_basket(customer_id: int):
    return shopping_baskets.get(customer_id, [])

@app.post("/cart/{customer_id}/add")
async def put_in_basket(customer_id: int, product: BasketProduct):
    if customer_id not in shopping_baskets:
        shopping_baskets[customer_id] = []
    shopping_baskets[customer_id].append(product.dict())
    return {"message": "Товар добавлен в корзину", "cart": shopping_baskets[customer_id]}
