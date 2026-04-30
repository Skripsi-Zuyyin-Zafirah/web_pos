# MVP Plan: Sistem POS Grosir dengan Priority Queue

## Deskripsi Proyek
Membangun sistem Point of Sale (POS) khusus untuk toko Grosir yang mengimplementasikan algoritma **Priority Queue** untuk mengelola antrian pesanan secara cerdas berdasarkan prioritas tertentu (seperti tipe pelanggan, total pesanan, atau urgensi).

## Core Algorithm: Priority Queue Min-Heap (SJF)
Sistem ini mengimplementasikan konsep **Shortest Job First (SJF)** menggunakan struktur data **Min-Heap**. Prioritas sepenuhnya ditentukan oleh beban kerja pesanan, bukan status pelanggan.

### Mekanisme Prioritas:
1.  **Metrik Utama (EWP):** Nilai prioritas dihitung berdasarkan *Estimated Work Period* (EWP).
    -   **Rumus:** `EWP = Jumlah Item × 30 Detik`
2.  **Struktur Antrian:** Menggunakan **Min-Heap**. Pesanan dengan nilai EWP terkecil akan otomatis berada di posisi teratas antrian (akar) untuk diproses lebih dulu.
3.  **Tie-Breaker (FIFO):** Jika terdapat dua pesanan atau lebih dengan nilai EWP yang sama, maka pesanan yang memiliki **Timestamp** kedatangan lebih awal akan diprioritaskan.

---

## User Roles & Fitur Utama

### 1. Admin (Pemilik/Manajer)
- **Halaman Manajemen:** Produk, Kategori, dan Stok Barang.
- **Manajemen User:** Pengaturan akun Kasir dan Admin.
- **Monitoring Dashboard:** Statistik penjualan dan efisiensi waktu (EWP vs Real Time).
- **Control Antrian:** Kemampuan membatalkan atau mengubah status pesanan.

### 2. Kasir (Staff Operasional)
- **Halaman Point of Sale (POS):** Input pesanan pelanggan secara cepat.
- **Kalkulasi EWP:** Menghitung estimasi waktu pengerjaan secara otomatis.
- **Update Status:** Mengubah status antrian menjadi "Processing" atau "Done".
- **Laporan Harian:** Melihat ringkasan transaksi shift berjalan.

### 3. Pelanggan (Customer)
- **Halaman Katalog Digital:** Melihat daftar produk yang tersedia.
- **Halaman Tracking Antrian:** Melihat posisi pesanan mereka dalam antrian Min-Heap secara real-time.
- **Monitoring Status:** Melihat estimasi waktu sisa (EWP) hingga pesanan mereka siap.

---

## Teknologi Stack
- **Framework:** Next.js 15+ (App Router)
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime (untuk Update Antrian)
- **UI:** Tailwind CSS + shadcn/ui
- **State Management:** React Context / Zustand
- **Icons:** Tabler Icons
- **Table:** TanStack Table

---

## Milestone Pengembangan

## Milestone Pengembangan Detail

### Milestone 1: Foundation & Admin Management (Minggu 1)
**Fokus: Infrastruktur Dasar & Kontrol Data**
- [ ] **Infrastruktur & Auth:**
    - Setup Next.js 15, Tailwind v4, & shadcn/ui.
    - **Halaman Login & Register:** Desain UI menggunakan shadcn/ui.
    - **Integrasi Supabase Auth:** Fitur Sign In, Sign Up, dan Sign Out.
    - **Trigger Database:** Setup tabel `profiles` dan trigger Supabase untuk otomatis membuat data profil (dengan default role: Pelanggan) saat user baru register.
    - **Middleware:** Proteksi rute (Auth Guard) untuk memisahkan akses Admin, Kasir, dan Pelanggan.
- [ ] **Admin - Product Management Page:**
    - UI Tabel Produk dengan fitur search, filter, dan pagination.
    - Form Modal (Tambah/Edit) Produk + Upload Gambar (Supabase Storage).
    - Manajemen Kategori Produk untuk pengelompokan di POS.
- [ ] **Admin - User Management Page:**
    - Daftar akun staff (Kasir) dengan fitur reset password atau ganti role.

### Milestone 2: Cashier POS & Algorithm Core (Minggu 2)
**Fokus: Transaksi & Operasional Antrian**
- [ ] **Kasir - POS Interface:**
    - UI Katalog Produk (Grid View) dengan pencarian cepat.
    - Sistem Keranjang (Cart) yang mendukung penambahan/pengurangan item secara dinamis.
    - Tombol Checkout yang memicu kalkulasi otomatis `EWP = Items * 30s`.
- [ ] **Algoritma Min-Heap:**
    - Implementasi Class `MinHeap` untuk mengelola urutan pesanan secara lokal (client-side) dan database.
    - Logic Tie-breaker: Membandingkan `created_at` jika `EWP` identik.
- [ ] **Data Persistence:**
    - Simpan transaksi ke tabel `orders` dan `order_items` di Supabase.

### Milestone 3: Customer Portal & Real-time Tracking (Minggu 3)
**Fokus: User Experience Pelanggan & Monitoring**
- [ ] **Pelanggan - Digital Menu:**
    - Halaman publik (atau via login) untuk melihat produk tanpa fitur beli (Read-only Catalog).
- [ ] **Pelanggan - Queue Tracking Page:**
    - Visualisasi Antrian: List pesanan yang sedang "Waiting" dan "Processing".
    - Highlight "Pesanan Saya" (berdasarkan ID atau Akun) untuk melihat estimasi sisa waktu.
- [ ] **Admin/Kasir - Queue Monitoring Dashboard:**
    - Kanban Board atau List View yang terupdate otomatis via **Supabase Realtime**.
    - Tombol Aksi: "Start Processing" (Pindah ke akar heap) dan "Mark as Done" (Extract Min).

### Milestone 4: Analytics & Final Optimization (Minggu 4)
**Fokus: Insight & Stabilitas**
- [ ] **Admin - Analytics Page:**
    - Grafik Recharts: Total transaksi per hari, Produk terlaris.
    - Statistik Antrian: Rata-rata waktu tunggu pelanggan.
- [ ] **Quality Assurance:**
    - Uji coba skenario "SJF": Memasukkan pesanan banyak item, lalu memasukkan pesanan 1 item (harus menyalip ke atas).
    - Validasi Keamanan (RLS Policies): Pelanggan tidak bisa mengubah status antrian.
- [ ] **Polishing:** Final UI adjustments & Dokumentasi Kode.
