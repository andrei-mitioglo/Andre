from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Сервис уведомлений")

class AlertPayload(BaseModel):
    user_id: int
    message: str

@app.post("/send")
async def dispatch_alert(alert: AlertPayload):
    print(f"ОТПРАВКА EMAIL ПОЛЬЗОВАТЕЛЮ {alert.user_id}: {alert.message}")
    return {"status": "доставлено"}