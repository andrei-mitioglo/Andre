# Базовый образ для микросервисов ЦифроМаркет
FROM python:3.11-slim

# Рабочая директория приложения
WORKDIR /app

# Установка зависимостей Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Команда запуска по умолчанию
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
