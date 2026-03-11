# Використовуємо легку версію Node.js
FROM node:20-alpine

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо весь код та білдимо проєкт
COPY . .
RUN npm run build

# Відкриваємо порт 3000
EXPOSE 3000

# Команда для запуску
CMD ["npm", "run", "start:prod"]