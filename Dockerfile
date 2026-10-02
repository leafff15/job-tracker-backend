# syntax=docker/dockerfile:1

FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN --mount=type=secret,id=database_url \
    DATABASE_URL="$(cat /run/secrets/database_url)" \
    npx prisma generate

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]