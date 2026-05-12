# Activity Diagram - Sistem POS Grosir Priority Queue

Dokumen ini berisi rancangan Activity Diagram untuk sistem POS Grosir yang menggunakan algoritma **Priority Queue (Min-Heap)** dengan metrik **Shortest Job First (SJF)**.

## 1. Alur Utama Transaksi dan Antrian

Diagram ini menjelaskan alur kerja dari input pesanan oleh Kasir hingga penyelesaian pesanan dan pelacakan oleh Pelanggan.

```mermaid
graph TB
    subgraph Pelanggan ["Pelanggan"]
        P1([Mulai]) --> P2[Lihat Katalog Produk]
        P2 --> P3[Pantau Posisi Antrian]
        P3 --> P4[Lihat Estimasi Selesai]
        P4 --> P5([Selesai])
    end

    subgraph Kasir ["Kasir (Staff)"]
        K1([Login]) --> K2[Buka POS]
        K2 --> K3[Pilih Produk & Satuan]
        K3 --> K4[Input Kuantitas]
        K4 --> K5[Checkout Pesanan]
        
        K7[Pantau List Antrian] --> K8[Pilih Pesanan Teratas]
        K8 --> K9[Update Status: Processing]
        K9 --> K10[Siapkan Barang]
        K10 --> K11[Update Status: Done]
    end

    subgraph Sistem ["Sistem (Logic & DB)"]
        S1[Konversi Satuan ke Pcs]
        S2[Hitung EWP: Qty * 30s]
        S3[Simpan ke Database]
        S4[Atur Urutan Min-Heap]
        S5[Broadcast Update Real-time]
        S6[Kirim Notifikasi Selesai]

        K5 --> S1
        S1 --> S2
        S2 --> S3
        S3 --> S4
        S4 --> S5
        S5 -.-> P3
        S5 -.-> K7
        
        K11 --> S6
        S6 -.-> P5
    end
```

## 2. Alur Manajemen Admin

Diagram ini menjelaskan aktivitas administratif yang dilakukan oleh Pemilik atau Manajer Toko.

```mermaid
graph TD
    A1([Mulai]) --> A2[Login Admin]
    A2 --> A3{Pilih Menu}
    
    A3 -->|Produk| A4[Kelola Produk & Stok]
    A3 -->|Kategori| A5[Kelola Kategori Produk]
    A3 -->|User| A6[Kelola Akun Kasir/Staff]
    A3 -->|Dashboard| A7[Pantau Statistik Penjualan]
    A3 -->|Antrian| A8[Monitoring Efisiensi EWP]
    
    A4 --> A9[Simpan Perubahan]
    A5 --> A9
    A6 --> A9
    A7 --> A10([Selesai])
    A8 --> A10
    A9 --> A10
```

## Deskripsi Aktivitas

### A. Alur Pemesanan (Kasir & Sistem)
1.  **Input Pesanan**: Kasir memilih produk dan satuan (misal: Dus, Slop, Pack).
2.  **Kalkulasi EWP**: Sistem secara otomatis mengonversi satuan ke unit terkecil (Pcs) dan menghitung *Estimated Work Period* (EWP). Rumus: `EWP = Total Pcs × 30 Detik`.
3.  **Antrian Priority**: Pesanan dimasukkan ke dalam antrian **Min-Heap**. Pesanan dengan EWP terkecil (beban kerja paling ringan) akan berada di urutan teratas. Jika EWP sama, pesanan yang masuk lebih awal (Timestamp) didahulukan.
4.  **Real-time Update**: Sistem memperbarui tampilan antrian di sisi Kasir dan Pelanggan secara instan menggunakan Supabase Realtime.

### B. Pemrosesan Antrian (Kasir)
1.  **Monitoring**: Kasir melihat daftar pesanan yang harus dikerjakan berdasarkan prioritas.
2.  **Processing**: Kasir mengubah status menjadi "Processing" saat mulai menyiapkan barang.
3.  **Completion**: Setelah barang siap, status diubah menjadi "Done". Sistem akan melakukan *Extract Min* pada heap dan memberikan notifikasi kepada pelanggan.

### C. Pelacakan Pelanggan
1.  **Queue Tracking**: Pelanggan dapat melihat posisi antrian mereka tanpa harus login (atau via akun).
2.  **Estimasi**: Pelanggan mendapatkan transparansi mengenai berapa lama lagi pesanan mereka akan diproses berdasarkan akumulasi EWP pesanan di atasnya.

### D. Manajemen (Admin)
1.  **Inventory Control**: Admin bertanggung jawab atas ketersediaan stok dan pengaturan konversi satuan.
2.  **User Management**: Mengelola hak akses untuk staff kasir.
3.  **Analytics**: Menganalisis apakah estimasi waktu (EWP) sesuai dengan realita pengerjaan di lapangan untuk optimasi layanan.
