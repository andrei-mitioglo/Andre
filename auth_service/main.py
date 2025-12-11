from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Сервис авторизации")

# Хранилище пользователей в памяти
accounts_storage = {
    "admin": {"username": "admin", "password": "admin123", "role": "admin", "id": 1},
    "client": {"username": "client", "password": "secret123", "role": "user", "id": 2},
    "manager": {"username": "manager", "password": "manager456", "role": "moderator", "id": 3}
}

class AuthCredentials(BaseModel):
    username: str
    password: str

class SignUpData(BaseModel):
    username: str
    password: str

class UpdateUserRole(BaseModel):
    role: str

class UpdateUserData(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

@app.post("/register")
async def sign_up(data: SignUpData):
    if data.username in accounts_storage:
        raise HTTPException(status_code=400, detail="Такой логин уже занят")
    
    next_id = max(u["id"] for u in accounts_storage.values()) + 1 if accounts_storage else 1
    accounts_storage[data.username] = {
        "username": data.username,
        "password": data.password,
        "role": "user",
        "id": next_id
    }
    return {"message": "Аккаунт успешно создан"}

@app.post("/login")
async def authorize(credentials: AuthCredentials):
    account = accounts_storage.get(credentials.username)
    if account and account["password"] == credentials.password:
        return {
            "token": f"secure-token-{account['id']}", 
            "user_id": account['id'],
            "role": account['role'],
            "username": account['username']
        }
    raise HTTPException(status_code=401, detail="Неверные данные для входа")

# --- API для управления пользователями (админ) ---

@app.get("/users")
async def get_all_users():
    """Получить список всех пользователей"""
    users_list = []
    for username, data in accounts_storage.items():
        users_list.append({
            "id": data["id"],
            "username": data["username"],
            "role": data["role"]
        })
    return users_list

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    """Получить данные пользователя по ID"""
    for username, data in accounts_storage.items():
        if data["id"] == user_id:
            return {
                "id": data["id"],
                "username": data["username"],
                "role": data["role"]
            }
    raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.put("/users/{user_id}/role")
async def update_user_role(user_id: int, role_data: UpdateUserRole):
    """Изменить роль пользователя"""
    valid_roles = ["user", "moderator", "admin"]
    if role_data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Недопустимая роль. Доступные: {valid_roles}")
    
    for username, data in accounts_storage.items():
        if data["id"] == user_id:
            accounts_storage[username]["role"] = role_data.role
            return {"message": "Роль успешно обновлена", "user": {
                "id": data["id"],
                "username": data["username"],
                "role": role_data.role
            }}
    raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Удалить пользователя"""
    for username, data in list(accounts_storage.items()):
        if data["id"] == user_id:
            if data["role"] == "admin":
                # Проверяем, не последний ли это админ
                admin_count = sum(1 for u in accounts_storage.values() if u["role"] == "admin")
                if admin_count <= 1:
                    raise HTTPException(status_code=400, detail="Нельзя удалить последнего администратора")
            del accounts_storage[username]
            return {"message": "Пользователь удалён"}
    raise HTTPException(status_code=404, detail="Пользователь не найден")
