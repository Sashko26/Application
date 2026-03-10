FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

# Запускаємо preview-сервер Vite і робимо його доступним ззовні
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]