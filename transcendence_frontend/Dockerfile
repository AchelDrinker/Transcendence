# Build the frontend
FROM node:latest AS frontend

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the Next.js app
RUN npm run build

CMD ["npm", "start"]


