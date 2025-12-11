import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Сервис обработки заказов")

TRANSACTION_SERVICE = "http://payment_service:8005"
ALERT_SERVICE = "http://notification_service:8006"

class PurchaseRequest(BaseModel):
    user_id: int
    items: list
    total_amount: float

@app.post("/orders")
async def process_purchase(purchase: PurchaseRequest):
    # Шаг 1: Обработка платежа
    async with httpx.AsyncClient() as http_client:
        payment_result = await http_client.post(f"{TRANSACTION_SERVICE}/pay", json={"amount": purchase.total_amount})
        
        if payment_result.status_code != 200:
            raise HTTPException(status_code=400, detail="Ошибка проведения платежа")
        
        # Шаг 2: Отправка уведомления покупателю
        await http_client.post(f"{ALERT_SERVICE}/send", json={"user_id": purchase.user_id, "message": "Ваш заказ успешно оформлен!"})

    return {"order_id": 54321, "status": "подтверждён"}