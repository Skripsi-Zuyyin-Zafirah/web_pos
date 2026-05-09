# 📋 Planning: Penyelesaian Fitur Role Customer (Pelanggan)

Dokumen ini berisi rencana kerja untuk melengkapi dan menyelesaikan fitur-fitur pada halaman Customer agar terhubung dengan database Supabase dan tidak lagi menggunakan data statis (mockup).

---

## 🎯 Tujuan
Mengubah halaman Dashboard Customer (`app/customer/page.tsx`) yang saat ini masih menggunakan data statis menjadi dinamis, serta melengkapi fitur pelacakan antrean dan riwayat pesanan.

---

## 📅 Rencana Kerja (Milestones)

### Milestone 1: Data Dinamis & Integrasi Supabase (Hari 1)
**Fokus:** Mengganti data mockup di dashboard dengan data riil.
- [x] **Fetch Profile User:** Mengambil nama pengguna yang sedang login dari tabel `profiles` atau Supabase Auth untuk ditampilkan di greeting ("Selamat datang, [Nama]").
- [x] **Kalkulasi Statistik Riil:**
  - **Pesanan Aktif:** Mengambil jumlah pesanan milik user dengan status `waiting` atau `processing`.
  - **Total Belanja:** Mengambil jumlah seluruh pesanan yang pernah dibuat oleh user tersebut.
  - **Estimasi Tunggu:** Menampilkan `ewp` dari pesanan aktif user (atau menghitung posisi antrean).
  - **Poin Loyalitas:** ⚠️ *Catatan: Tabel `profiles` saat ini belum memiliki kolom poin. Perlu diputuskan apakah akan menambahkan kolom `points` di tabel `profiles` atau menyembunyikan fitur ini.*
- [x] **Riwayat Pesanan Riil:** Mengambil data dari tabel `orders` yang difilter berdasarkan `user_id` yang sedang login dan diurutkan dari yang terbaru.

### Milestone 2: Real-time Queue Tracking (Hari 1-2)
**Fokus:** Visualisasi posisi antrean secara langsung.
- [x] **Supabase Realtime Subscription:** Mengaktifkan subscription pada tabel `orders` (tanpa filter user_id agar bisa hitung posisi antrean).
- [x] **Update Progress Otomatis:** Ketika kasir mengubah status pesanan menjadi `processing` atau `done`, UI di dashboard customer akan otomatis memperbarui progress bar dan status tanpa perlu reload halaman.
- [x] **Penentuan Nomor Antrean:** Menghitung posisi pesanan user di dalam antrean (berapa banyak pesanan dengan prioritas lebih tinggi/EWP lebih kecil yang berstatus `waiting` atau `processing`).

### Milestone 3: Detail Pesanan (Hari 2)
**Fokus:** Memberikan transparansi rincian belanja kepada customer.
- [x] **Modal Detail Riwayat:** Membuat komponen modal yang muncul ketika tombol "Detail" di tabel riwayat diklik.
- [x] **Fetch Order Items:** Mengambil data dari `order_items` yang berelasi dengan `order_id` tersebut, lengkap dengan nama produk dan harganya.

---

## 💡 Opsi Pengembangan Lanjutan (Opsional)
Fitur ini bisa ditambahkan jika ingin membuat halaman customer lebih interaktif:

1. **Self-Ordering (Pemesanan Mandiri):**
   - Mengubah halaman `app/customer/shop/page.tsx` dari yang saat ini hanya "Read-only Catalog" menjadi bisa menambah item ke keranjang dan melakukan checkout sendiri.

---

## ⚠️ Temuan Keamanan (Penting)
Saat melakukan inspeksi database, ditemukan bahwa tabel `public.staff` memiliki **Row Level Security (RLS) yang dinonaktifkan**. Hal ini memungkinkan siapa saja yang memiliki anon key untuk membaca atau memodifikasi data staf. Disarankan untuk mengaktifkan RLS pada tabel tersebut.
