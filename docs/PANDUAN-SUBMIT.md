# Panduan pengumpulan FindMarket ke Devpost

Batas waktu: **30 Oktober 2026 pukul 23.45 EDT** (31 Oktober pukul 10.45 WIB). Sebaiknya kirim paling lambat 30 Oktober siang WIB supaya ada waktu kalau ada masalah.

Ikuti urutan ini. Centang setiap langkah yang sudah selesai.

---

## Langkah 1: Uji versi terakhir di komputer

- [ ] Ekstrak `findmarket.zip` terbaru ke folder baru, salin `.env.local` ke dalamnya.
- [ ] Pastikan `.env.local` berisi `QLOO_API_KEY`, `QLOO_BASE_URL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ANTHROPIC_FAST_MODEL`, `COMTRADE_API_KEY`, dan `MOCK_MODE=false`.
- [ ] Di terminal: `npm install`, lalu `npm run dev`, lalu buka http://localhost:3000.
- [ ] Jalankan satu analisis baru. Periksa:
  - Langkah agen muncul satu per satu saat analisis berjalan.
  - Hasil berlabel **Live**, dan kartu "Best market for your product" muncul di atas.
  - Di Detail pasar: "Import trend" dan "Supplier share" terisi (butuh key Comtrade), peta heatmap tampil, dan "Why you can trust this" menunjukkan tingkat keyakinan.
- [ ] Coba tombol **Share link**, buka tautannya di tab baru, dan pastikan laporannya tampil.

Kalau ada error, kirim screenshot terminal (bukan isi `.env.local`) ke Claude.

## Langkah 2: Unggah ke GitHub

- [ ] Buka GitHub Desktop, pilih **File > Add local repository**, pilih folder FindMarket.
- [ ] **Pastikan `.env.local` tidak ada di daftar file yang akan diunggah.**
- [ ] Isi Summary (misalnya `Final version for Qloo hackathon`), klik **Commit to main**, lalu **Publish repository** (atau **Push origin** kalau sudah pernah dipublikasikan).
- [ ] Repo harus **publik**. Kalau tadinya privat: buka repo di github.com, **Settings > General > Danger Zone > Change visibility > Public**.
- [ ] Di halaman repo, pastikan bagian About menampilkan **MIT license**.
- [ ] Salin alamat repo, misalnya `https://github.com/namamu/findmarket`.

## Langkah 3: Deploy ke Vercel

- [ ] Masuk ke https://vercel.com dengan akun GitHub, klik **Add New > Project**, pilih repo `findmarket`, klik **Import**.
- [ ] Di **Environment Variables**, isi semua variabel yang sama dengan `.env.local`.
- [ ] Klik **Deploy**, tunggu sampai selesai, lalu salin alamatnya, misalnya `https://findmarket-xxxx.vercel.app`.
- [ ] Buka alamat itu dari HP dan dari jendela penyamaran (incognito), lalu ulangi pemeriksaan di Langkah 1.

Kalau hasilnya masih berlabel Sample: periksa ejaan variabel di Vercel, lalu buka tab **Deployments** dan klik **Redeploy**.

## Langkah 4: Baca syarat panitia

- [ ] Buka repo `qloo-hackathon-kit` dan baca `docs/SUBMISSION.md`. Catat syarat yang belum terpenuhi dan tanyakan ke Claude kalau ada yang perlu diubah.

## Langkah 5: Siapkan bahan pengumpulan

- [ ] **Screenshot** 3 sampai 5 gambar dari website live, misalnya: Dashboard, langkah agen saat berjalan, halaman hasil dengan kartu kesimpulan dan peta, Detail pasar (Import trend dan Supplier share), serta "Where to sell" dengan heatmap.
- [ ] **Video demo (opsional tapi disarankan, 1 sampai 2 menit):** rekam layar dengan QuickTime (Mac: **File > New Screen Recording**). Alur yang disarankan:
  1. Buka website, tunjukkan layar sambutan (5 detik).
  2. Ketik nama produk, pilih deskripsi, jalankan analisis, dan tunjukkan langkah agen yang tampil langsung (30 detik).
  3. Tunjukkan kartu kesimpulan dan peta hasil (15 detik).
  4. Buka satu kota: Import trend, Supplier share, Where to sell, dan Why you can trust this (40 detik).
  5. Akhiri dengan Share link atau Download PDF (10 detik).
  Unggah ke YouTube (boleh "Unlisted") dan salin tautannya.

## Langkah 6: Isi formulir Devpost

- [ ] Buka https://qloo.devpost.com, klik **Enter a submission** (atau **Join hackathon** dulu kalau belum).
- [ ] Buka file `DEVPOST.md`. Salin setiap bagian ke kolom yang sesuai:
  - **Project name** dan **Tagline**
  - **About the project:** Inspiration, What it does, How we built it, How we use Qloo, Challenges, Accomplishments, What we learned, What's next
  - **Built with:** salin daftar teknologinya
  - **Try it out:** tautan Vercel dan tautan GitHub
- [ ] Ganti semua teks dalam [kurung siku] di `DEVPOST.md` dengan tautanmu sendiri sebelum menyalin.
- [ ] Unggah screenshot ke bagian gambar, dan tempel tautan video kalau ada.
- [ ] Isi kolom lain yang diminta Devpost (misalnya anggota tim dan pertanyaan tambahan dari panitia).
- [ ] Klik **Submit**. Pastikan statusnya berubah menjadi submitted, bukan hanya draft.

## Langkah 7: Setelah mengirim

- [ ] Buka halaman proyekmu di Devpost dan coba klik tautan demo dan GitHub dari sana.
- [ ] Jangan mengubah environment variable atau menghapus deploy di Vercel sampai penjurian selesai.
- [ ] Pantau saldo Claude dan kuota UN Comtrade selama masa penjurian, karena juri akan menjalankan analisis.

---

## Kalau ada masalah di menit terakhir

- **Website error saat dibuka juri:** Vercel menyimpan semua versi sebelumnya. Buka tab **Deployments**, pilih versi terakhir yang berjalan baik, klik tiga titik, lalu **Promote to Production**.
- **Kuota AI habis:** isi `GROQ_API_KEY` di Vercel sebagai cadangan, lalu Redeploy.
- **Key bocor:** buat key baru di konsol masing-masing, perbarui di Vercel, lalu Redeploy. Untuk key Qloo, email ian@qloo.com.
