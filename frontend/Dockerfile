# Build aşaması
FROM node:18 as build
WORKDIR /app

# ENV değişkenini al
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

COPY . .

# REACT_APP_API_URL değişkeni .env olmadan da çalışır
RUN npm run build

# Serve aşaması
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

