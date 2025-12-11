from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Платёжный сервис")

class TransactionData(BaseModel):
    amount: float

@app.post("/pay")
async def execute_transaction(payment: TransactionData):
    print(f"Обрабатываем платёж на сумму ${payment.amount}")
    return {"status": "успешно", "transaction_id": "txn_abc789"}
