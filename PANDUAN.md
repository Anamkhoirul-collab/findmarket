# Panduan menjalankan FindMarket

Panduan ini untuk versi terbaru FindMarket: tampilan biru gelap yang lebih sederhana, halaman Markets, Bandingkan kota, Di mana menjual, heatmap di peta jalan asli, dan AI Claude (dengan Groq dan Cerebras sebagai cadangan opsional). Ikuti bagian A sampai G secara berurutan.

## A. Yang perlu disiapkan

1. **Node.js** versi 18.18 atau lebih baru dari https://nodejs.org. Cek di terminal dengan `node -v`.
2. **Visual Studio Code** dari https://code.visualstudio.com.
3. **Key Qloo** dari email panitia hackathon.
4. **Key Claude** (AI utama): dari https://console.anthropic.com. Pastikan akunmu punya saldo atau metode pembayaran, dan sebaiknya pasang batas pengeluaran di console.
5. **Key UN Comtrade** (opsional tapi sangat disarankan, gratis): untuk data impor resmi setiap negara.
   1. Daftar di https://comtradedeveloper.un.org dan masuk.
   2. Buka menu **Products**, pilih **comtrade - v1** (paket gratis), lalu klik **Subscribe**.
   3. Buka **Profile** atau **Subscriptions**, lalu salin **Primary key**.
6. **Opsional, sebagai cadangan:** key Groq (https://console.groq.com/keys) dan key Cerebras (https://cloud.cerebras.ai). Kalau dikosongkan, aplikasi hanya memakai Claude.

Simpan semua key di catatan pribadi. Jangan pernah mengirimkannya di chat, email, atau screenshot.

## B. Pasang versi baru

Kalau kamu sudah punya folder FindMarket versi lama, jangan menimpa file satu per satu. Ganti seluruh foldernya supaya tidak ada file yang terlewat.

1. Kalau aplikasi lama masih berjalan, klik terminal di VS Code lalu tekan **Control + C**.
2. Ekstrak `findmarket.zip` ke lokasi baru, misalnya `Documents/findmarket-baru`.
3. Kalau sudah punya file `.env.local` dari versi lama, salin ke folder baru. File ini tersembunyi; di Finder tekan **Command + Shift + .** (titik) untuk menampilkannya.
4. Di VS Code, pilih **File > Open Folder** dan buka folder baru. Kalau muncul "Restricted Mode", klik lalu pilih **Trust**.
5. Buka terminal: di bilah menu paling atas layar, pilih **Terminal > New Terminal** (atau tekan Control + `).
6. Jalankan:
   ```
   npm install
   ```
   Langkah ini wajib, karena versi baru memakai paket peta baru (`leaflet` dan `leaflet.heat`).

## C. Isi file `.env.local`

1. Kalau belum ada `.env.local`, buat dari contohnya:
   ```
   cp .env.example .env.local
   ```
2. Buka `.env.local` di VS Code. Pastikan setiap pengaturan hanya ditulis **satu kali**, tanpa spasi di sekitar tanda `=`:
   ```
   QLOO_API_KEY=key-qloo-kamu
   QLOO_BASE_URL=https://hackathon.api.qloo.com

   ANTHROPIC_API_KEY=key-claude-kamu
   ANTHROPIC_MODEL=claude-haiku-5-5
   ANTHROPIC_FAST_MODEL=claude-haiku-5-5

   COMTRADE_API_KEY=key-comtrade-kamu

   GROQ_API_KEY=
   CEREBRAS_API_KEY=
   GEMINI_API_KEY=
   MOCK_MODE=false
   ```
   Untuk kualitas laporan yang lebih tinggi, ganti `ANTHROPIC_MODEL` menjadi `claude-sonnet-5-5` (sedikit lebih lambat dan lebih mahal). Key Groq, Cerebras, dan Gemini boleh dikosongkan, atau diisi kalau ingin cadangan.
3. Simpan dengan **Command + S**. Pastikan titik putih di tab nama file sudah hilang.

## D. Jalankan dan coba

1. Di terminal, jalankan:
   ```
   npm run dev
   ```
2. Tunggu sampai muncul `Local: http://localhost:3000`, dan pastikan ada baris `- Environments: .env.local`. Kalau baris itu tidak muncul, nama atau letak `.env.local` masih salah (harus sejajar dengan `package.json`).
3. Buka http://localhost:3000 di Chrome.

Setiap kali mengubah `.env.local`: simpan, tekan Control + C di terminal, lalu jalankan `npm run dev` lagi.

## E. Daftar uji (lakukan berurutan)

Hasil yang benar selalu berlabel **Live**, bukan **Sample**.

1. **Markets:** buka menu Markets. Tabel kota harus terisi selera teratas dan merek tren dari Qloo. Kota yang tidak mengembalikan data akan disembunyikan otomatis.
2. **Profil kota:** klik salah satu kota, misalnya Kyoto. Periksa:
   - Ringkasan, ide produk, dan kartu "Apa yang mereka suka" serta "Siapa yang paling tertarik".
   - Kartu "Di mana audiens berada": heatmap harus tampil di atas **peta jalan asli** dengan nama kota di sekitarnya dan garis batas wilayah.
   - Bagian lipat paling bawah: setiap langkah agen sebaiknya bercentang hijau. Langkah tren merek boleh gagal; artinya API hackathon tidak mendukung parameter itu, dan halaman tetap berjalan.
3. **Analisis baru:** di Dashboard, klik contoh "Batik scarves" di Mulai cepat, lalu tekan **Cari pasar**. Pilih salah satu deskripsi, lanjutkan, lalu jalankan. Tombol akan menampilkan indikator progres selama agen bekerja.
4. **Hasil analisis:** laporan harus berlabel Live, dengan peta dan daftar kota di kanan. Buka tab Jejak agen: langkah AI harus tertulis misalnya "Claude · claude-haiku-5-5".
5. **Detail pasar:** klik salah satu kartu kota. Periksa "Di mana menjual" dan heatmap-nya.
6. **Bandingkan kota:** dari Markets, klik **Bandingkan**, lalu tambahkan dua kota.
7. **Unduh PDF dan Salin ringkasan:** di halaman hasil analisis, coba kedua tombol.

## F. Kalau ada error

Pesan merah di aplikasi menyebut langkah yang gagal, dan detail lengkapnya ada di terminal VS Code. Kirimkan screenshot **terminal saja** (bukan isi `.env.local`) untuk diperbaiki.

| Pesan di terminal | Artinya | Yang dilakukan |
| --- | --- | --- |
| Masih berlabel Sample | Server dalam mode simulasi | Pastikan `MOCK_MODE=false`, key Qloo terisi, dan minimal satu key AI terisi. Simpan, lalu jalankan ulang server. |
| `Claude ... returned 401` | Key Claude salah | Salin ulang key dari console.anthropic.com. |
| `Claude ... returned 400` dengan "credit balance" | Saldo Claude habis | Tambah saldo di console. Kalau key Groq diisi, aplikasi otomatis pindah ke Groq. |
| `Claude ... returned 404` atau "model" | Nama model salah | Cek nama model di dokumentasi Claude, lalu perbaiki `ANTHROPIC_MODEL`. |
| `Claude ... returned 529` | Claude sedang sibuk | Aplikasi otomatis mencoba lagi. Kalau tetap gagal, coba beberapa menit lagi. |
| `Groq ... returned 401` | Key Groq salah | Buat key baru di console.groq.com. |
| `Groq ... returned 404` "model ... does not exist" | Nama model Groq sudah tidak tersedia | Lihat daftar model di https://console.groq.com/docs/models, lalu perbaiki `GROQ_MODEL` dan kosongkan atau perbaiki `GROQ_FAST_MODEL`. |
| `Groq ... returned 429` dengan "per day" | Kuota harian Groq habis | Tidak perlu apa-apa; aplikasi otomatis pindah ke Cerebras. |
| `Cerebras ... returned 404` atau "model" | Nama model Cerebras salah | Salin nama model dari konsol Cerebras ke `CEREBRAS_MODEL`. |
| `Qloo /v2/... returned 401` atau `403` | Key Qloo atau alamat salah | Cek `QLOO_API_KEY` dan `QLOO_BASE_URL`. |
| `Qloo /v2/... returned 400` | Parameter Qloo perlu disesuaikan | Kirim baris error lengkapnya untuk diperbaiki. |
| `UN Comtrade ... 401` atau `403` | Key Comtrade salah atau belum berlangganan paket gratis | Pastikan sudah Subscribe ke "comtrade - v1" dan salin Primary key. |
| `Official import data ... Skipped` | `COMTRADE_API_KEY` belum diisi | Isi key-nya, simpan, jalankan ulang server, lalu buat analisis baru. |
| `Boundaries error` | Layanan garis batas sedang sibuk | Peta tetap tampil tanpa garis batas. Coba lagi nanti. |
| Peta abu-abu tanpa jalan | Gambar peta gagal dimuat | Cek koneksi internet. Aplikasi otomatis memakai peta sederhana. |

## G. Unggah ke GitHub dan deploy ke Vercel

### GitHub (pakai GitHub Desktop)

1. Instal GitHub Desktop dari https://desktop.github.com dan masuk dengan akun GitHub.
2. Pilih **File > Add local repository**, pilih folder FindMarket. Kalau diminta, klik "create a repository" dan beri nama `findmarket`.
3. **Periksa daftar file. Pastikan `.env.local` TIDAK ada.** File ini sudah diabaikan oleh `.gitignore`, tapi tetap cek.
4. Isi "Summary" dengan `First version`, klik **Commit to main**, lalu **Publish repository**. **Hilangkan centang "Keep this code private"**, karena hackathon mewajibkan repo publik.
5. Di halaman repo, bagian About harus menampilkan "MIT license".

### Vercel

1. Masuk ke https://vercel.com dengan akun GitHub, klik **Add New > Project**, pilih repo `findmarket`, lalu **Import**.
2. Di **Environment Variables**, tambahkan satu per satu: `QLOO_API_KEY`, `QLOO_BASE_URL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ANTHROPIC_FAST_MODEL`, `COMTRADE_API_KEY`, serta key cadangan (`GROQ_API_KEY`, `CEREBRAS_API_KEY`, `CEREBRAS_MODEL`) kalau dipakai.
3. Klik **Deploy**. Setelah selesai, kamu mendapat alamat seperti `findmarket-xxxx.vercel.app`. Ulangi daftar uji di bagian E di alamat ini.

Setiap perubahan berikutnya cukup di-commit dan di-push lewat GitHub Desktop; Vercel otomatis memperbarui website dalam sekitar satu menit.

## Batas waktu

Pengumpulan di Devpost: **30 Oktober 2026 pukul 23.45 EDT** (31 Oktober pukul 10.45 WIB). Siapkan link demo Vercel, link repo GitHub, dan deskripsi proyek. Baca juga `docs/SUBMISSION.md` di repo `qloo-hackathon-kit`.

## Kalau key bocor

- Qloo: email ian@qloo.com untuk meminta key baru.
- Claude, Groq, Cerebras, atau Gemini: hapus key lama di konsol masing-masing, buat yang baru, lalu perbarui di `.env.local` dan di Vercel.
