# ЦифроМаркет

Современный онлайн-магазин электроники на базе микросервисной архитектуры.

## Технологии

- **Frontend:** React + Vite
- **Backend:** FastAPI (Python)
- **Архитектура:** Микросервисы с API Gateway

## Микросервисы

- `auth_service` — Сервис авторизации и регистрации
- `product_service` — Каталог товаров
- `cart_service` — Корзина покупок
- `order_service` — Обработка заказов
- `payment_service` — Платёжный сервис
- `notification_service` — Уведомления клиентов
- `gateway` — Главный API шлюз

## Запуск проекта

```bash
docker-compose up --build
```

Приложение будет доступно на http://localhost:5173
