# Образ для веб-клиента ЦифроМаркет
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Установка зависимостей Node.js
COPY package.json .
RUN npm install

# Копирование исходников
COPY . .

# Порт веб-сервера
EXPOSE 3000

# Запуск dev-сервера Vite
CMD ["npm", "run", "dev", "--", "--host"]
