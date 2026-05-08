# 🗺️ Planning Milestone: Pengembangan Fitur Pelanggan (Customer Portal)

Dokumen ini berisi perencanaan tahap demi tahap (milestone) untuk mengembangkan antarmuka dan fitur-fitur pelanggan pada sistem Grosir. Pengembangan dibagi menjadi 4 Milestone utama agar proses pengerjaan lebih terstruktur, dapat diuji secara bertahap, dan meminimalkan risiko.

---

## 🚩 Milestone 1: Eksplorasi Produk (Katalog & Pencarian)
**Fokus:** Membangun fondasi utama bagi pelanggan untuk melihat dan mencari produk yang tersedia.

*   **Tugas 1.1: Halaman Beranda / Katalog Produk**
    *   Pembuatan antarmuka (UI) halaman beranda.
    *   Integrasi API untuk mengambil seluruh daftar produk aktif dari database.
    *   Menampilkan informasi detail: Nama produk, satuan (pcs/karton/slop), harga satuan, dan gambar (jika ada).
    *   Pembuatan Indikator Stok Real-Time berdasarkan data stok terkini.
*   **Tugas 1.2: Pencarian & Filter Produk**
    *   Implementasi *search bar* untuk pencarian berbasis teks (nama produk).
    *   Pembuatan fitur filter berdasarkan kategori produk (Jajanan, Kebutuhan Dapur, Rokok).
    *   Optimalisasi efisiensi pencarian di sisi frontend/backend.

---

## 🚩 Milestone 2: Transaksi Inti (Keranjang & Checkout)
**Fokus:** Memungkinkan pelanggan memilih produk dan membuat pesanan yang langsung terhubung dengan sistem antrian (Priority Queue).

*   **Tugas 2.1: Keranjang Belanja (Cart)**
    *   Pembuatan UI Keranjang Belanja (menampilkan item, *quantity selector*, harga).
    *   Manajemen status keranjang (menambah, mengubah jumlah, menghapus item).
    *   Kalkulasi Harga Otomatis: Penghitungan subtotal dan total estimasi harga secara dinamis.
*   **Tugas 2.2: Checkout / Buat Pesanan Digital (Integrasi Min-Heap)**
    *   Pembuatan antarmuka Checkout dan rangkuman pesanan.
    *   Perekaman timestamp (waktu kedatangan) dan identitas pelanggan saat konfirmasi.
    *   **Logika SJF (Shortest Job First):** Menghitung Estimasi Waktu Proses (EWP) otomatis (Jumlah Item × 30 detik).
    *   Integrasi data pesanan ke struktur data Min-Heap (operasi *insert* dan *heapify-up*) di backend.

---

## 🚩 Milestone 3: Monitoring & Riwayat Pesanan
**Fokus:** Memberikan transparansi proses kepada pelanggan setelah pesanan dibuat hingga selesai.

*   **Tugas 3.1: Status Pesanan (Monitoring Antrian Real-time)**
    *   Pembuatan UI halaman status ("Menunggu", "Diproses", "Selesai").
    *   Menampilkan Estimasi Waktu Proses dan perkiraan waktu tunggu kepada pengguna.
    *   *Polling* atau implementasi WebSocket untuk pembaruan status real-time saat pegawai memproses pesanan.
*   **Tugas 3.2: Detail Pesanan (Aktif)**
    *   Pembuatan antarmuka rincian pesanan yang sedang berjalan.
    *   Menampilkan ID pesanan, rincian barang, total item, dan harga.
*   **Tugas 3.3: Riwayat Pesanan**
    *   Pembuatan halaman "Riwayat" untuk menampilkan pesanan sebelumnya (status Selesai/Batal).
    *   Integrasi API untuk mengambil data arsip pesanan berdasarkan ID pelanggan.

---

## 🚩 Milestone 4: Pembayaran & Finalisasi
**Fokus:** Menghubungkan proses digital dengan operasional fisik di kasir.

*   **Tugas 4.1: Konfirmasi Pembayaran (Instruksi Cash)**
    *   Pembuatan halaman ringkasan pembayaran setelah barang berstatus "Selesai/Siap Diambil".
    *   Penambahan instruksi visual kepada pelanggan untuk menuju kasir dan melakukan pembayaran tunai.
    *   Pembaruan status otomatis menjadi "Lunas/Selesai" (Triggered dari aksi Kasir di Dashboard Admin).
    *   Pembaruan stok final di sistem inventaris.

---

## 📈 Rencana Alur Kerja (Workflow)
1.  **Fase Desain & Mockup UI:** Merancang UI/UX untuk semua halaman (Beranda, Keranjang, Checkout, Status).
2.  **Fase Backend & API:** Menyiapkan endpoint untuk Katalog, Cart, Checkout (Min-Heap Insert), dan Status Polling.
3.  **Fase Frontend (Integrasi):** Menghubungkan UI dengan API Backend.
4.  **Fase Testing & QA:** Uji coba end-to-end, memastikan kalkulasi harga, logika *Priority Queue* (SJF) berjalan akurat, dan pembaruan stok aman (*concurrency handling*).
