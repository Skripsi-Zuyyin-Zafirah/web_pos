# 🚀 Planning Milestone: Fitur Utama Halaman Kasir (Priority Queue)

Dokumen ini merincikan tahapan pengembangan untuk 7 fitur utama pada Halaman Kasir yang mengimplementasikan mekanisme *Priority Queue* berbasis *Min-Heap*.

---

## 📅 Milestone 1: Infrastruktur Database & Real-time (Hari 1-2)
**Fokus:** Membangun fondasi data untuk pelacakan pegawai dan status pesanan.
- [x] **Skema Pegawai:** Pembuatan tabel `staff` untuk melacak 4 orang pegawai (Status: Idle/Busy).
- [x] **Relasi Pesanan:** Menghubungkan tabel `orders` dengan `staff` melalui field `assigned_staff_id`.
- [x] **Real-time Channel:** Konfigurasi Supabase Realtime untuk memantau perubahan status antrian dan pegawai secara instan.

## 📊 Milestone 2: Dashboard Monitoring & Statistik (Hari 3)
**Fokus:** Implementasi **Fitur 1 (Dashboard)** dan **Fitur 5 (Monitoring Proses)**.
- [x] **Staff Status Grid:** UI untuk memantau kondisi 4 pegawai secara real-time.
- [x] **Counter Ringkas:** Panel statistik jumlah antrian di *Min-Heap*, pesanan aktif, dan pesanan selesai.
- [x] **Activity Tracker:** Visualisasi pesanan mana yang sedang dikerjakan oleh pegawai tertentu.

## 🏗️ Milestone 3: Visualisasi Algoritma Min-Heap (Hari 4)
**Fokus:** Implementasi **Fitur 2 (Daftar Pesanan Masuk)**.
- [ ] **Transparansi EWP:** Menampilkan kalkulasi detail `EWP = Item x 30s` pada setiap baris antrian.
- [ ] **Logic Tie-Breaking:** Memastikan urutan antrian mematuhi aturan: Prioritas EWP terkecil, diikuti oleh waktu kedatangan (FIFO).
- [ ] **Heap UI Animation:** Memberikan indikasi visual saat ada pesanan baru yang "menyalip" ke posisi atas karena EWP lebih kecil.

## 🤖 Milestone 4: Engine Distribusi Otomatis (Hari 5)
**Fokus:** Implementasi **Fitur 3 (Distribusi Otomatis)**.
- [ ] **Trigger Extract-Min:** Pengembangan logika yang otomatis mengambil pesanan teratas saat ada pegawai berstatus *Idle*.
- [ ] **Notification System:** Notifikasi "toast" atau alert di layar kasir saat penugasan otomatis berhasil dilakukan.
- [ ] **Single Queue Multiple Server Logic:** Memastikan satu pesanan hanya diambil oleh satu pegawai yang tersedia.

## 📄 Milestone 5: Detail Pesanan & Dokumentasi Fisik (Hari 6)
**Fokus:** Implementasi **Fitur 4 (Detail Pesanan)** dan **Fitur 6 (Cetak Struk Kerja)**.
- [ ] **Verification Modal:** UI detail untuk meninjau produk, jumlah, dan total harga sebelum diproses.
- [ ] **Work Receipt Template:** Desain struk yang optimal untuk printer thermal/dot matrix yang berisi instruksi kerja pegawai.
- [ ] **Print Service:** Integrasi fitur cetak langsung dari browser.

## 💰 Milestone 6: Finalisasi & Integrasi Stok (Hari 7)
**Fokus:** Implementasi **Fitur 7 (Konfirmasi Pembayaran & Selesai)**.
- [ ] **Cash Payment Flow:** Dialog konfirmasi pembayaran tunai.
- [ ] **Auto-Stock Update:** Trigger otomatis untuk mengurangi stok di database saat transaksi selesai.
- [ ] **Staff Reset Logic:** Mengembalikan status pegawai menjadi *Idle* secara otomatis setelah klik "Selesai".

---

## 🛠️ Tech Stack yang Digunakan
- **Algorithm:** Min-Heap (SJF - Shortest Job First)
- **Database:** Supabase PostgreSQL
- **Real-time:** Supabase Presence & Broadcast
- **UI Framework:** Next.js 15 + Tailwind CSS + shadcn/ui
- **State Management:** Zustand (untuk sinkronisasi heap lokal)
