# KADRIDA CELL — Website Voucher WiFi (Versi Dashboard Admin)

## Fitur dalam paket
- Halaman pelanggan responsif, 8 paket harga, pemesanan dan cek status.
- Google Sheets sebagai database; Apps Script sebagai backend.
- Dashboard admin dengan login PIN dan sesi sementara.
- Daftar pesanan, persetujuan/penolakan manual.
- Alokasi voucher otomatis satu kali setelah admin menyetujui pembayaran.
- Input voucher massal (satu kode per baris; juga menerima koma/titik koma/spasi).
- Pengaturan nama toko, slogan, WhatsApp, URL gambar QRIS, dan instruksi pembayaran.
- Laporan omzet per bulan dan ekspor daftar pesanan ke CSV.
- **Tidak ada fitur unggah bukti pembayaran**, sesuai permintaan pemilik.

## 1. Buat database Google Sheets
1. Buka https://script.google.com dengan akun Google toko.
2. Buat proyek baru, salin isi `Code.gs` ke editor.
3. Buka **Project Settings > Script Properties**, tambahkan:
   - `ADMIN_PIN` = PIN admin yang kuat dan unik (disarankan 12+ karakter).
4. Jalankan fungsi `setup()` satu kali, lalu izinkan akses.
5. Buka **Execution log** untuk mendapatkan URL spreadsheet.
6. Pastikan tab `Paket`, `Stok_Voucer`, `Transaksi`, `Pengaturan`, dan `Log_Aktivitas` terbentuk.

## 2. Deploy Apps Script
1. Klik **Deploy > New deployment > Web app**.
2. **Execute as:** Me.
3. **Who has access:** Anyone.
4. Klik Deploy dan selesaikan otorisasi. Salin URL Web App berakhiran `/exec`.
5. Isi `config.js`: `API_URL: "URL_WEB_APP_ANDA"`.
6. Deploy ulang sebagai **New version** setiap kali mengubah Code.gs, lalu pastikan URL `/exec` di config sesuai deployment aktif.

> Catatan keamanan: GitHub Pages adalah situs publik. PIN admin tidak disimpan di file website. Login memakai PIN yang dikirim ke Apps Script dan ditukar dengan token sesi sementara 6 jam. Endpoint Apps Script publik diperlukan agar pelanggan dapat membuat pesanan; jangan menambahkan PIN atau daftar kode voucher ke file publik. Gunakan PIN kuat dan jangan membagikannya.

## 3. Masukkan stok voucher
1. Buka halaman `admin.html` setelah situs terbit.
2. Login menggunakan `ADMIN_PIN`.
3. Pilih tab **Stok Voucher**.
4. Pilih paket, tempel kode voucher (satu kode per baris), lalu klik **Simpan Stok Voucher**.
5. Kode duplikat dilewati otomatis. Input dikirim bertahap per 20 kode agar tidak melewati batas panjang URL. Kode voucher disimpan di Google Sheets, tidak di GitHub.

ID paket: P1=2 Jam Rp1.000; P2=6 Jam Rp2.000; P3=12 Jam Rp3.000; P4=1 Hari Rp5.000; P5=7 Hari Rp20.000; P6=15 Hari Rp35.000; P7=1 Bulan Rp65.000; PF=Family 1 Bulan Rp135.000.

## 4. Atur QRIS
1. Unggah gambar QRIS ke root repository GitHub, misalnya `qris-kadrida.png`.
2. Setelah GitHub Pages aktif, URL gambarnya biasanya `https://USERNAME.github.io/NAMA-REPO/qris-kadrida.png`.
3. Di dashboard admin > **Pengaturan**, isi URL gambar QRIS, nomor WhatsApp, dan instruksi pembayaran.
4. Klik simpan. QRIS akan ditampilkan kepada pelanggan setelah membuat pesanan.

## 5. Hosting di GitHub Pages
1. Buat repository baru, misalnya `kadrida-cell-wifi`.
2. Unggah `index.html`, `style.css`, `app.js`, `config.js`, `admin.html`, `admin.css`, dan `admin.js` ke root repository.
3. Buka **Settings > Pages**; pilih **Deploy from a branch**, branch `main`, folder `/root`, lalu Save.
4. Halaman pelanggan: `https://USERNAME.github.io/NAMA-REPO/`.
5. Halaman admin: `https://USERNAME.github.io/NAMA-REPO/admin.html`.

## 6. Alur operasional transaksi
1. Pelanggan pilih paket dan membuat pesanan. Sistem membuat nomor pesanan.
2. Website menampilkan nominal, QRIS (jika URL QRIS diatur), instruksi, dan tombol WhatsApp.
3. Pelanggan membayar lalu menghubungi admin dan menyebut nomor pesanan. Tidak ada upload bukti pembayaran di website.
4. Admin memeriksa transaksi langsung di aplikasi/akun QRIS atau rekening.
5. Admin membuka dashboard > Pesanan > klik **Setujui & Berikan Kode**.
6. Backend mengunci proses, memilih satu kode dengan ID paket sesuai dan status TERSEDIA, mengubah stok menjadi TERJUAL, lalu menempelkan kode pada pesanan.
7. Pelanggan memasukkan nomor pesanan di bagian **Cek status pesanan** untuk melihat kode setelah status LUNAS.

## 7. Laporan
Dashboard > **Laporan** menampilkan total transaksi lunas dan omzet per bulan. Tombol Unduh CSV mengekspor daftar pesanan yang dimuat di tab Pesanan (maksimal 500 terbaru); buka file CSV dengan Excel.

## 8. Pengujian wajib sebelum dipakai
- Gunakan kode voucher dummy, bukan kode voucher pelanggan asli.
- Buat pesanan uji, cek transaksi masuk ke Google Sheets.
- Coba cek status sebelum pembayaran disetujui (harus MENUNGGU).
- Setujui pesanan dari admin, pastikan satu kode berubah menjadi TERJUAL.
- Cek status lagi, pastikan kode tampil.
- Buat pesanan uji kedua dengan stok kosong untuk paket itu; persetujuan harus ditolak oleh sistem karena stok habis.
- Uji kode duplikat saat impor; kode duplikat harus dilewati.
- Periksa QRIS dari HP lain dan pastikan nama merchant serta rekening/QR benar sebelum dibuka untuk umum.

## Batasan yang perlu diketahui
- Pembayaran **tidak diverifikasi otomatis**. Admin harus memeriksa dana masuk secara manual sebelum menyetujui pesanan.
- Tidak ada unggah bukti pembayaran, sesuai keputusan pemilik.
- Pengaturan QRIS menerima URL gambar; file QRIS perlu diunggah sendiri ke repository GitHub atau hosting gambar yang dipercaya.
- Apps Script Web App publik dan JSONP dipakai agar kompatibel dengan GitHub Pages. Karena browser mengirim PIN saat login melalui URL request, gunakan PIN kuat, akses admin hanya dari perangkat tepercaya, dan ganti PIN jika diduga diketahui orang lain. Untuk skala besar, sebaiknya migrasi ke backend dengan autentikasi POST yang lebih kuat.
- Kode voucher yang sudah dialokasikan tidak dapat dialokasikan lagi karena statusnya TERJUAL.
