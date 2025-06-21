FROM node:18-alpine

# Çalışma dizini oluştur
WORKDIR /app

# Package.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --only=production

# Uygulama kodunu kopyala
COPY . .

# Port 3000'i aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "index.js"]