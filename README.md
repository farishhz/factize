# Factize AI

Factize AI adalah platform asisten berbasis kecerdasan buatan (AI) yang dirancang khusus untuk memverifikasi fakta, menganalisis rumor, serta mendeteksi keaslian informasi dan citra (gambar). Aplikasi ini dirancang dengan antarmuka modern premium serta arsitektur backend cepat berbasis FastAPI untuk menyaring hoaks secara akurat menggunakan Retrieval-Augmented Generation (RAG).

## Fitur Utama

1. Verifikasi Klaim Berbasis RAG: Sistem melakukan pencarian internet dinamis menggunakan mesin pencarian DuckDuckGo untuk memperkuat keaslian data pendukung secara real-time.
2. Penilai Kueri Cerdas (Guardrails): Sistem memotong proses pencarian web jika kueri pengguna terdeteksi di luar topik cek fakta (seperti resep masakan, pemrograman, atau matematika umum) guna menghemat kuota API serta menjaga fokus asisten AI.
3. Deteksi Manipulasi Gambar (Hybrid ELA): Mengintegrasikan pemindai Error Level Analysis (ELA) lokal dengan model klasifikasi citra deep learning Hugging Face untuk mendeteksi rekayasa digital pada gambar.
4. Lampiran Fleksibel: Mendukung unggah berkas berbasis Drag-and-Drop serta fitur Tempel Gambar (Ctrl+V) langsung dari clipboard ke kolom input chat.
5. Manajemen Kredensial Mandiri yang Aman: Pengguna dapat menghubungkan Kunci API Gemini dan Token Hugging Face pribadi. Kredensial disimpan secara lokal di peramban pengguna (localStorage) dan dikirim secara stateless via HTTPS tanpa disimpan di database backend.
6. Sidebar Interaktif & Pencarian Riwayat: Navigasi sidebar collapsible mirip Google Gemini yang mendukung pencarian kata kunci riwayat serta pembuatan sesi obrolan baru.

## Arsitektur Teknologi

- **Frontend:** React.js, Vite, Lucide Icons, dan Motion (Framer Motion) untuk animasi mikro premium.
- **Backend:** FastAPI (Python), Uvicorn, Google GenAI SDK, PyMuPDF (ekstraksi PDF), dan Tesseract-OCR (Optical Character Recognition).

## Prasyarat Sistem

Sebelum melakukan instalasi, pastikan sistem Anda telah terpasang perangkat lunak berikut:
- Node.js (versi 18 ke atas) dan npm
- Python (versi 3.10 ke atas)
- Tesseract-OCR (diperlukan untuk ekstraksi teks dari gambar)
  - Windows: Unduh installer Tesseract dari dokumentasi resmi dan tambahkan jalur instalasi ke Environment Variables PATH.
  - Linux/Ubuntu: Jalankan perintah `sudo apt-get install tesseract-ocr tesseract-ocr-ind`
  - macOS: Jalankan perintah `brew install tesseract`

## Cara Instalasi dan Konfigurasi

### 1. Kloning Repositori

Buka terminal Anda dan jalankan perintah berikut untuk mengkloning repositori proyek ke direktori lokal:

```bash
git clone https://github.com/username/factize-ai.git
cd factize-ai
```

### 2. Setup dan Konfigurasi Backend

Arahkan terminal ke dalam direktori backend:

```bash
cd backend
```

Buat virtual environment Python baru untuk isolasi dependensi:

```bash
python -m venv venv
```

Aktifkan virtual environment tersebut:
- Windows (PowerShell):
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- Windows (CMD):
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- Linux / macOS:
  ```bash
  source venv/bin/activate
  ```

Instal seluruh dependensi pustaka Python yang dideklarasikan:

```bash
pip install -r requirements.txt
```

Konfigurasikan variabel lingkungan dengan menyalin berkas contoh:

```bash
cp .env.example .env
```

Buka berkas `.env` dan lengkapi konfigurasi berikut dengan kunci API Anda:

```env
GEMINI_API_KEY=kunci_api_gemini_anda
HF_TOKEN=token_hugging_face_anda (opsional, jika kosong sistem akan meminta kunci dari browser pengguna)
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe (sesuaikan dengan path instalasi Tesseract di komputer Anda)
```

Jalankan server backend FastAPI menggunakan Uvicorn:

```bash
uvicorn app.main:app --reload
```
Server backend akan aktif pada alamat `http://localhost:8000`.

### 3. Setup dan Konfigurasi Frontend

Buka jendela terminal baru, lalu arahkan ke direktori frontend:

```bash
cd frontend
```

Instal seluruh paket dependensi Node.js:

```bash
npm install
```

Salin berkas konfigurasi variabel lingkungan:

```bash
cp .env.example .env.local
```

Buka berkas `.env.local` dan tentukan alamat endpoint API backend:

```env
VITE_API_URL=http://localhost:8000
```

Jalankan server pengembangan frontend Vite:

```bash
npm run dev
```
Aplikasi frontend akan aktif dan dapat diakses melalui peramban pada alamat `http://localhost:5173`.

## Panduan Penggunaan Aplikasi

1. Buka peramban dan navigasikan ke alamat `http://localhost:5173`.
2. Gunakan kolom obrolan untuk menuliskan klaim berita atau isu yang ingin diverifikasi.
3. Anda dapat menyeret (drag) berkas gambar/PDF ke dalam halaman, atau menekan Ctrl+V untuk menempelkan tangkapan layar langsung dari clipboard Anda.
4. Klik tombol Pengaturan (Settings) di bagian pojok kiri bawah untuk memasukkan Kunci API Gemini atau Token Hugging Face pribadi, atau menghapus riwayat obrolan secara permanen.
5. Gunakan fitur Pencarian Riwayat pada sidebar untuk memfilter sesi obrolan berdasarkan kata kunci riwayat terdahulu.

## Kontribusi dan Lisensi

Aplikasi ini dikembangkan untuk tujuan penyaringan informasi dan cek fakta. Segala bentuk kontribusi pengembangan dipersilakan dengan membuat Pull Request atau melaporkan Issue pada repositori ini.
