from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Сервис каталога товаров")

class CatalogItem(BaseModel):
    name: str
    price: float

catalog_storage = [
    {"id": 1, "name": "Игровой ноутбук", "price": 999.99},
    {"id": 2, "name": "Смартфон Pro Max", "price": 849.99},
    {"id": 3, "name": "Беспроводные наушники", "price": 179.99},
]

@app.get("/products")
async def fetch_catalog():
    return catalog_storage

@app.get("/products/{item_id}")
async def fetch_single_item(item_id: int):
    for item in catalog_storage:
        if item["id"] == item_id:
            return item
    return {"error": "Товар не найден"}

@app.post("/products")
async def add_catalog_item(item: CatalogItem):
    next_id = max(p["id"] for p in catalog_storage) + 1 if catalog_storage else 1
    new_item = {"id": next_id, "name": item.name, "price": item.price}
    catalog_storage.append(new_item)
    return new_item

@app.put("/products/{item_id}")
async def modify_catalog_item(item_id: int, item: CatalogItem):
    for idx, existing in enumerate(catalog_storage):
        if existing["id"] == item_id:
            catalog_storage[idx]["name"] = item.name
            catalog_storage[idx]["price"] = item.price
            return catalog_storage[idx]
    raise HTTPException(status_code=404, detail="Товар не найден в каталоге")

@app.delete("/products/{item_id}")
async def remove_catalog_item(item_id: int):
    for idx, existing in enumerate(catalog_storage):
        if existing["id"] == item_id:
            del catalog_storage[idx]
            return {"message": "Товар удалён из каталога"}
    raise HTTPException(status_code=404, detail="Товар не найден в каталоге")
