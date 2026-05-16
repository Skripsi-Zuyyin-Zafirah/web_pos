# Analisa & Rencana Redesign Web POS

Berdasarkan eksplorasi antarmuka pengguna pada berbagai resolusi (desktop, tablet, dan mobile), berikut adalah temuan analisa desain web dan rencana perbaikannya untuk meningkatkan pengalaman pengguna (UX) dan antarmuka (UI).

## 1. Analisa Desain Saat Ini

### A. Layout & Grid
- **Desktop:** Penggunaan sidebar navigasi untuk fitur utama (Shop, Dashboard) sudah baik dan efisien. Landing page menggunakan layout hero yang terpusat dengan bersih.
- **Mobile/Tablet:** Aplikasi bertransisi menggunakan *bottom navigation bar* (navigasi bawah) yang ergonomis untuk layar sentuh. Namun, elemen di *top bar* (tombol menu, notifikasi) terlalu mepet ke ujung layar, kekurangan *horizontal padding* yang memadai.

### B. Responsivitas (Responsiveness)
- **Header Mobile:** Header pada landing page terlihat terlalu padat. Logo dan dua tombol utama (Masuk/Daftar) dipaksa masuk dalam satu baris, sehingga terlihat sumpek dan sulit diinteraksi.
- **Tipografi:** Teks *heading* utama pada hero section (misal: "Sistem Kasir Pintar...") terlalu besar untuk layar mobile dan tidak mengecil (scale down) secara proporsional.
- **Overlap Komponen:** Terdapat elemen *floating* yang menumpuk (overlap) dengan navigasi bawah di tampilan mobile.

### C. Konsistensi UI (UI Consistency)
- **Bentuk Tombol (Border Radius):** Terdapat inkonsistensi penggunaan sudut membulat. Beberapa komponen (seperti input atau tombol sekunder) menggunakan `rounded-lg`, sementara aksi utama (Daftar/Masuk) menggunakan `rounded-full`.
- **Hierarki Tombol:** Tombol "Masuk" pada header hanya berupa teks link biasa, sedangkan di halaman login ia merupakan tombol penuh berwarna *teal* yang mencolok.
- **Warna Identitas (Brand Color):** Penggunaan warna utama *teal* (`#2FA4AF`) sudah cukup konsisten pada tombol utama, state navigasi aktif, dan gradien hero, namun perlu dijaga konsistensinya di komponen lain.

### D. Visual Bugs & Spacing
- **Landing Page:** Jarak vertikal (spacing) antara judul hero dan tombol aksi ("Lihat Menu" & "Pantau Antrean") terlalu sempit di layar mobile.
- **Dead Link:** Tombol "Pantau Antrean" di landing page tampak seperti *placeholder* tanpa aksi atau link yang berfungsi.
- **Breadcrumb:** Navigasi *breadcrumb* (misal: "Pelanggan > Belanja") kekurangan *padding* atas, membuatnya terasa terlalu menempel dengan *top bar*.

---

## 2. Rencana Perbaikan (Action Plan)

### Tahap 1: Perbaikan Layout & Responsivitas
- [x] **Redesign Header Mobile:** Implementasikan *hamburger menu* atau sembunyikan tombol aksi ke dalam menu dropdown pada layar mobile untuk mencegah penumpukan di header landing page.
- [x] **Penyesuaian Padding Top Bar:** Tambahkan `px-4` atau `px-6` pada elemen *top bar* saat diakses melalui perangkat mobile agar tidak terlalu mepet ke tepi layar.
- [x] **Skalabilitas Tipografi:** Gunakan kelas Tailwind yang responsif (seperti `text-3xl md:text-5xl`) pada teks *heading* hero agar terlihat proporsional di semua ukuran layar.
- [x] **Jarak (Spacing) pada Hero:** Perlebar *margin* atau *gap* antara judul utama dengan grup tombol aksi di bawahnya untuk memberikan "ruang napas" pada desain.

### Tahap 2: Standardisasi & Konsistensi UI
- [x] **Sistem Border Radius:** Tentukan standar *border-radius* (misal: seragam menggunakan `rounded-xl` atau `rounded-full` untuk semua tombol utama) dan terapkan di seluruh komponen.
- [x] **Gaya Tombol Header:** Ubah desain tombol "Masuk" di header landing page menjadi tombol bergaya *ghost* (tanpa *background*) atau *outlined* (bergaris luar) yang seragam dengan sistem *button* di aplikasi.
- [x] **Perbaikan Jarak Breadcrumb:** Tambahkan margin/padding atas (misal `mt-4` atau `pt-4`) pada komponen breadcrumb.

### Tahap 3: Penyempurnaan (Polish) & UX
- [x] **Perbaikan Tombol Mati:** Hubungkan tombol "Pantau Antrean" ke halaman yang relevan, atau sembunyikan sementara jika fiturnya belum tersedia.
- [x] **Pencegahan Overlap:** Tambahkan *padding-bottom* ekstra pada *wrapper* halaman utama jika *bottom navigation* aktif di mobile, untuk memastikan konten terbawah (atau *floating action button*) tidak tertutup oleh navigasi.
- [x] **Empty State:** Tambahkan ilustrasi *empty state* yang menarik jika data pada Dasbor atau Riwayat masih kosong.
