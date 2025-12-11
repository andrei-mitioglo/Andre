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

## CI/CD

Проект использует GitHub Actions для автоматического тестирования и сборки:

### Workflows

- **Microservices Tests** (`.github/workflows/test.yml`) - Полное тестирование всех микросервисов
- **Run Unit Tests** (`.github/workflows/tests.yml`) - Unit тесты в Docker контейнерах
- **Build and Run Docker** (`.github/workflows/build.yml`) - Сборка и проверка Docker образов
- **CI/CD Pipeline** (`.github/workflows/ci.yml`) - Полный CI/CD pipeline

Все тесты запускаются автоматически при push и pull request в ветки `main` и `master`.

## Тестирование

Для запуска тестов локально:

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск всех тестов
pytest

# Запуск тестов конкретного сервиса
pytest auth_service/test_main.py -v
pytest product_service/test_main.py -v
pytest cart_service/test_main.py -v
pytest order_service/test_main.py -v
pytest payment_service/test_main.py -v
pytest notification_service/test_main.py -v
```
