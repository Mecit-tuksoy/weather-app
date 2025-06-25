# 🌤️ Hava Durumu Uygulaması - Kurulum ve Kullanım Rehberi

Bu uygulama, otomatik olarak hava durumu verilerini çeken, PostgreSQL veritabanında saklayan ve React arayüzü ile görselleştiren full-stack bir projedir. GitHub Actions ve ArgoCD ile CI/CD pipeline'ı entegre edilmiştir.

## 📋 İçindekiler

- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Uygulama Bileşenleri](#uygulama-bileşenleri)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [CI/CD ve Deployment](#cicd-ve-deployment)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Sistem Gereksinimleri

### Gerekli Yazılımlar

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v16+ - sadece geliştirme için)
- **Git**

### İsteğe Bağlı (Production için)

- **Google Cloud SDK** (GKE deployment için)
- **kubectl** (Kubernetes yönetimi için)

## 🏗️ Uygulama Bileşenleri

### Backend (Node.js + Express)

- **Port**: 3000
- **Ana Dosya**: `backend/index.js`
- **Özellikler**:
  - Her 5 dakikada otomatik hava durumu çekme
  - RESTful API endpoints
  - PostgreSQL veritabanı bağlantısı
  - CORS yapılandırması

#### API Endpoints

```
GET  /                    # Ana sayfa
GET  /health             # Sistem durumu
GET  /test              # Test endpoint
GET  /fetch-weather     # Manuel hava durumu çekme
GET  /weather-logs      # Kayıtları listele (?limit=N)
```

### Frontend (React)

- **Port**: 3001 (production), 3000 (development)
- **Ana Bileşenler**:
  - `App.js`: Ana uygulama bileşeni
  - `WeatherList.js`: Hava durumu kayıtlarını listeler
  - `api.js`: Backend ile iletişim servisi

### Database (PostgreSQL)

- **Port**: 5432
- **Database**: weatherdb
- **Tablo**: weather_logs

```sql
CREATE TABLE weather_logs (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    humidity INTEGER,
    pressure INTEGER,
    wind_speed DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Hızlı Başlangıç (docker compose)

### 1. Projeyi İndirin

```bash
git clone https://github.com/Mecit-tuksoy/weather-app.git
cd weather-app
```

### 2. Hava Durumu API Anahtarı Alın

1. [OpenWeatherMap](https://openweathermap.org/api) sitesine kayıt olun
2. API anahtarınızı alın
3. `docker-compose.yaml` dosyasında `WEATHER_API_KEY` değerini güncelleyin ve `REACT_APP_API_URL`nin `http://localhost:3000` olduğundan emin olun.

### 3. Uygulamayı Çalıştırın

```bash
# Tüm servisleri başlat
docker-compose up -d

# Servislerin durumunu kontrol et
docker-compose ps
```

### 4. Uygulamaya Erişim

- **Frontend (React)**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### 5. İlk Test

```bash
# API health check
curl http://localhost:3000/health

# Manuel hava durumu çekme
curl http://localhost:3000/fetch-weather

# Son kayıtları görüntüleme
curl http://localhost:3000/weather-logs?limit=5
```

## 🔄 CI/CD ve Deployment

### GitHub Actions Workflow

Otomatik deployment süreci `.github/workflows/ci-cd.yml` dosyasında tanımlıdır:

1. **Build**: Docker image'ları oluşturur
2. **Push**: Google Artifact Registry'ye yükler
3. **Deploy**: Kubernetes manifest'lerini günceller
4. **ArgoCD**: Otomatik deployment yapar

### GKE (Google Kubernetes Engine) Kurulumu

#### 1. GKE Cluster Oluşturun

> > Yeni bir GCP projesi oluştur.

Aşağıdaki servisleri etkinleştir:

> > Kubernetes Engine API
> > Artifact Registry API

##### Gerekli GitHub Secrets ve Variables:

> > Service Account oluştur ve **container.developer**, **artifactregistry.writer**, **iam.serviceAccountUser** rollerini ver.

1. JSON key indir → `GCP_CREDENTIALS` olarak GitHub'a ekle.

2. `GH_PAT` (GitHub Personal Access Token)'ı GitHub'a ekle.

> > Nasıl Elde Edilir:
> > GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
> > "Generate new token (classic)" tıklayın
> > Scope'lar: repo (full control of private repositories)
> > Token'ı kopyalayın ve secret olarak ekleyin

3. `DB_USER` (Veritabanı Kullanıcısı)
   weatheruser

4. `DB_PASS` (Veritabanı Şifresi)
   StrongPassword123!

5. `DB_NAME` (Veritabanı Adı)
   weatherdb

6. `WEATHER_API_KEY` (OpenWeatherMap API Key - Zorunlu)
   abcd1234567890abcd1234567890abcd

> > Nasıl Elde Edilir:
> > [OpenWeatherMap](https://openweathermap.org/api) sitesine kayıt olun
> > API anahtarınızı alın

7. `GCP_PROJECT_ID`
   weather-app-gke-548695
   Google Cloud project ID'nizi girin.

8. `GKE_CLUSTER_NAME`
   weather-cluster
   Kubernetes cluster adınız.

9. `GKE_REGION`
   us-central1
   GKE cluster'ınızın bulunduğu bölge.

10. `VITE_NEWS_API_URL`
    http://backend-service
    Frontend'in backend'e erişimi için internal service URL'i.

```bash
# scripts/gke-setup.sh dosyasını çalıştırın
chmod +x scripts/gke-setup.sh
./scripts/gke-setup.sh
```

#### 2. ArgoCD Kurun

```bash
# scripts/argocd-install.sh dosyasını çalıştırın
chmod +x scripts/argocd-install.sh
./scripts/argocd-install.sh
```

#### 3. Kubernetes Manifest'lerini Deploy Edin

```bash
# PostgreSQL
kubectl apply -f manifests/postgresql-statefulset.yaml
kubectl apply -f manifests/postgresql-service.yaml
kubectl apply -f manifests/postgresql-nodeport.yaml

# Backend
kubectl apply -f manifests/deployment-backend.yaml
kubectl apply -f manifests/service-backend.yaml

# Frontend
kubectl apply -f manifests/deployment-frontend.yaml
kubectl apply -f manifests/service-frontend.yaml
```

## 🔍 Monitoring ve Logs

### Docker Logs

```bash
# Tüm servislerin loglarını görüntüle
docker-compose logs -f

# Sadece backend logs
docker-compose logs -f weather-api

# Sadece frontend logs
docker-compose logs -f weather-frontend
```

### Database İçeriğini Kontrol Etme

```bash
# PostgreSQL container'ına bağlan
docker exec -it weather-postgres psql -U postgres -d weatherdb

# Tabloları listele
\dt

# Son kayıtları görüntüle
SELECT * FROM weather_logs ORDER BY created_at DESC LIMIT 10;
```

### Health Checks

```bash
# Backend health check
curl http://localhost:3000/health

# Database bağlantısı test
curl http://localhost:3000/test

# Son kayıtları al
curl http://localhost:3000/weather-logs?limit=5
```

## 🛠️ Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### 1. Database Bağlantı Hatası

```bash
# PostgreSQL container'ının çalıştığını kontrol et
docker-compose ps postgres

# Database loglarını kontrol et
docker-compose logs postgres

# Bağlantıyı test et
docker exec -it weather-postgres pg_isready -U postgres
```

#### 2. CORS Hatası

Frontend'de API çağrıları başarısız oluyorsa:

- `backend/index.js` dosyasındaki CORS ayarlarını kontrol edin
- Environment variables doğru ayarlandığından emin olun

#### 3. Weather API Hatası

```bash
# API anahtarının doğru olduğunu kontrol et
curl "https://api.openweathermap.org/data/2.5/weather?q=Ankara&appid=YOUR_API_KEY"

# Backend environment variables kontrol
docker-compose exec weather-api env | grep WEATHER_API_KEY
```

#### 4. Port Çakışması

```bash
# Kullanımda olan portları kontrol et
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :5432

# Docker container'larını yeniden başlat
docker-compose down
docker-compose up -d
```

### Debug Mode

Development için debug modunu etkinleştirin:

```bash
# Backend debug
DEBUG=* npm start

# Frontend debug
REACT_APP_DEBUG=true npm start
```

### Container'ları Yeniden Oluşturma

```bash
# Tüm container'ları durdur ve sil
docker-compose down

# Volume'ları da sil (dikkat: veriler silinir)
docker-compose down -v

# Container'ları yeniden oluştur
docker-compose up --build -d
```

## 📞 Destek ve Geliştirme

### Geliştirici Notları

- Backend her 5 dakikada bir Ankara'nın hava durumunu çeker
- Veriler PostgreSQL'de saklanır
- Frontend React hooks kullanarak verileri görüntüler
- CI/CD pipeline main branch'e push edildiğinde tetiklenir

Bu rehber ile weather-app uygulamanızı başarıyla kurup çalıştırabilirsiniz!
