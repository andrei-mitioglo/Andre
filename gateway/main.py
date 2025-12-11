import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Главный API шлюз")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Адреса микросервисов (через Docker Compose)
AUTH_ENDPOINT = "http://auth_service:8001"
CATALOG_ENDPOINT = "http://product_service:8002"
BASKET_ENDPOINT = "http://cart_service:8003"
PURCHASE_ENDPOINT = "http://order_service:8004"

async def forward_request(target_url: str, http_method: str, payload: dict = None, extra_headers: dict = None):
    async with httpx.AsyncClient() as http_client:
        try:
            result = await http_client.request(http_method, target_url, json=payload, headers=extra_headers)
            return result.json(), result.status_code
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Сервис временно недоступен")

@app.get("/")
async def welcome():
    return {"message": "Добро пожаловать в API ЦифроМаркет"}

# --- Маршруты авторизации ---
@app.post("/auth/login")
async def user_login(request: Request):
    body = await request.json()
    response, code = await forward_request(f"{AUTH_ENDPOINT}/login", "POST", body)
    return JSONResponse(content=response, status_code=code)

@app.post("/auth/register")
async def user_signup(request: Request):
    body = await request.json()
    response, code = await forward_request(f"{AUTH_ENDPOINT}/register", "POST", body)
    return JSONResponse(content=response, status_code=code)

# --- Маршруты каталога ---
@app.get("/products")
async def fetch_all_products():
    response, code = await forward_request(f"{CATALOG_ENDPOINT}/products", "GET")
    return JSONResponse(content=response, status_code=code)

@app.post("/admin/products")
async def add_product(request: Request):
    body = await request.json()
    response, code = await forward_request(f"{CATALOG_ENDPOINT}/products", "POST", body)
    return JSONResponse(content=response, status_code=code)

@app.put("/admin/products/{item_id}")
async def edit_product(item_id: int, request: Request):
    body = await request.json()
    response, code = await forward_request(f"{CATALOG_ENDPOINT}/products/{item_id}", "PUT", body)
    return JSONResponse(content=response, status_code=code)

@app.delete("/admin/products/{item_id}")
async def remove_product(item_id: int):
    response, code = await forward_request(f"{CATALOG_ENDPOINT}/products/{item_id}", "DELETE")
    return JSONResponse(content=response, status_code=code)

# --- Маршруты корзины ---
@app.get("/cart/{customer_id}")
async def fetch_customer_basket(customer_id: int):
    response, code = await forward_request(f"{BASKET_ENDPOINT}/cart/{customer_id}", "GET")
    return JSONResponse(content=response, status_code=code)

@app.post("/cart/{customer_id}/add")
async def put_item_in_basket(customer_id: int, request: Request):
    body = await request.json()
    response, code = await forward_request(f"{BASKET_ENDPOINT}/cart/{customer_id}/add", "POST", body)
    return JSONResponse(content=response, status_code=code)

# --- Маршруты заказов ---
@app.post("/orders")
async def make_purchase(request: Request):
    body = await request.json()
    response, code = await forward_request(f"{PURCHASE_ENDPOINT}/orders", "POST", body)
    return JSONResponse(content=response, status_code=code)

# --- Маршруты управления пользователями (админ) ---
@app.get("/admin/users")
async def fetch_all_users():
    response, code = await forward_request(f"{AUTH_ENDPOINT}/users", "GET")
    return JSONResponse(content=response, status_code=code)

@app.get("/admin/users/{user_id}")
async def fetch_user(user_id: int):
    response, code = await forward_request(f"{AUTH_ENDPOINT}/users/{user_id}", "GET")
    return JSONResponse(content=response, status_code=code)

@app.put("/admin/users/{user_id}/role")
async def change_user_role(user_id: int, request: Request):
    body = await request.json()
    response, code = await forward_request(f"{AUTH_ENDPOINT}/users/{user_id}/role", "PUT", body)
    return JSONResponse(content=response, status_code=code)

@app.delete("/admin/users/{user_id}")
async def remove_user(user_id: int):
    response, code = await forward_request(f"{AUTH_ENDPOINT}/users/{user_id}", "DELETE")
    return JSONResponse(content=response, status_code=code)