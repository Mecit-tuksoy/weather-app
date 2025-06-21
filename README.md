# 🌤️ Zamanlanmış Hava Durumu API Çekici ve Raporlayıcı Uygulama

Bu proje, belirli aralıklarla (örn: 5 dakikada bir) hava durumu verilerini bir API üzerinden çekip PostgreSQL veritabanına kaydeden bir servis ile, geçmiş verileri görselleştiren React tabanlı bir kullanıcı arayüzünden oluşur. CI/CD süreçleri GitHub Actions ve ArgoCD kullanılarak otomatik deployment yapılır.

---

## 🎯 Projenin Amacı

- Periyodik olarak hava durumu verilerini güncel tutmak
- Toplanan verileri saklamak ve analiz edilebilir hale getirmek
- Modern frontend ile kullanıcıya geçmiş hava durumu verilerini sunmak
- CI/CD pipeline’ı ile kod değişikliklerinin otomatik olarak GKE ortamına deploy edilmesini sağlamak

---

## 🧰 Kullanılan Teknolojiler

| Katman       | Teknoloji                      |
| ------------ | ------------------------------ |
| Backend      | Node.js (Express)              |
| Frontend     | React.js                       |
| Veritabanı   | PostgreSQL                     |
| Container    | Docker                         |
| Orkestrasyon | Kubernetes                     |
| CI/CD        | GitHub Actions + Argo CD       |
| Bulut        | Google Kubernetes Engine (GKE) |

---

## ⚙️ Proje Yapısı
