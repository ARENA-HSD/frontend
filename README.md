# Arena Frontend

## 🧱 Kullanılan Teknolojiler
- **Vite**
- **React**
- **TypeScript**
- **TailwindCSS**
- **Docker / Docker Compose**

---

## ⚙️ Ortam Değişkenleri

Proje root dizininde `.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3000
PORT=5173
.env dosyası git’e eklenmez.
Örnek değerler için .env.example dosyasına bakabilirsiniz.

▶️ Docker ile Çalıştırma (Development)
Geliştirme ortamını ayağa kaldırmak için:

docker compose up --build
Uygulama ayağa kalktıktan sonra:

Frontend: http://localhost:5173
