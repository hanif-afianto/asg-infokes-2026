# Soal 1 – Fundamental QA dan Quality Judgment

## Daftar Isi

- [1. Testing Scope Decision](#1-testing-scope-decision)
- [2. Prioritas Testing (1 Hari Testing)](#2-prioritas-testing-1-hari-testing)
- [3. Handling Conflict dengan Developer](#3-handling-conflict-dengan-developer)
- [4. Quality Risk Awareness](#4-quality-risk-awareness)

---

## 1. Testing Scope Decision

### Test secara mendalam

- **Login dan Logout**
  - **Alasan:** Fitur **gateway**—user tidak bisa mengakses aplikasi jika gagal. Dampak ke user langsung (tidak bisa pakai produk). Risiko keamanan tinggi (brute force, session fixation, token leakage). Kritikalitas bisnis maksimal. Regression sering muncul di auth saat env tidak sinkron.
  - **Fokus testing:** Happy path login/logout, salah password, account locked, session timeout, logout dari banyak device/tab, error handling (network/500).

- **Reset Password**
  - **Alasan:** Sangat **sensitif terhadap keamanan**. Jika terjadi bug, akun pengguna bisa diambil alih atau data bisa bocor. Dampaknya besar bagi pengguna dan juga reputasi sistem. Selain itu, fitur ini bergantung pada email dan sistem backend, sehingga perubahan pada bagian tersebut bisa menyebabkan fitur Reset Password yang sebelumnya normal menjadi bermasalah
  - **Fokus testing:** Alur lengkap (request → link → set password → login), token expiry/invalid, rate limiting, tidak bisa pakai password lama, validasi strength.

### Test secara minimal

- **Edit Profile**
  - **Alasan:** User tetap bisa pakai aplikasi tanpa edit profile. Dampak failure lebih terbatas (Pengguna mungkin merasa terganggu atau frustrasi, tetapi masih bisa mengakses atau menggunakan layanan utama). PM sudah bilang “fitur utama berjalan, bug kecil bisa menyusul”, edit profile lebih ke convenience.
  - **Fokus minimal:** Happy path (ubah nama/email/avatar sekali), validasi wajib (required fields), sanitasi input dasar. Tidak perlu eksplorasi edge case atau kombinasi field ekstrem.

### Ringkasan alasan

| Faktor              | Login/Logout | Reset Password | Edit Profile   |
|---------------------|-------------|----------------|----------------|
| Dampak ke user      | Blokir akses| Keamanan akun  | Gangguan saja  |
| Risiko keamanan     | Tinggi      | Sangat tinggi  | Sedang         |
| Kritikalitas bisnis | Paling tinggi | Tinggi      | Menengah       |
| Risiko regression  | Tinggi      | Tinggi        | Sedang         |
| Ketergantungan     | Dasar semua fitur | Sering terpisah (email, token) | Bergantung login |

---

# 2. Prioritas Testing (1 Hari Testing)

Dengan waktu **1 hari testing**, pengujian dilakukan dari fitur yang **paling berisiko dan paling penting bagi pengguna**.

## Urutan Testing (pertama → terakhir)

### 1. Login (alur path + critical failure)
- Coba login dengan data yang benar, lalu logout.  
- Coba login dengan password salah atau akun terkunci (jika ada fitur itu).  
- **Alasan:** Login adalah pintu masuk aplikasi. Jika login tidak berfungsi, pengguna tidak bisa menggunakan fitur lain.

### 2. Reset Password (full flow)
- Minta reset password.  
- Buka link reset dari email (atau simulasi).  
- Buat password baru lalu login dengan password tersebut.  
- **Alasan:** Fitur ini berkaitan dengan keamanan akun. Jika ada bug, akun pengguna bisa diambil alih.

### 3. Logout (edge & multi-tab)
- Logout dari satu tab, lalu cek apakah tab lain juga ikut logout.  
- Setelah logout, coba akses halaman yang seharusnya hanya bisa dibuka saat login.  
- **Alasan:** Masalah session sering muncul jika environment tidak sinkron. Jika logout tidak bekerja dengan benar, bisa berdampak pada keamanan.

### 4. Edit Profile (hanya happy path)
- Login → buka halaman profile → ubah satu data (misalnya nama atau email) → simpan.  
- Refresh halaman dan pastikan data benar-benar tersimpan.  
- **Alasan:** Fitur ini bukan fitur utama. Cukup memastikan fungsi dasarnya berjalan.

## Prinsip yang Digunakan

- **Critical user journey dulu::** pengguna harus bisa **login dan logout** dengan benar.  
- **Risk-based:** fitur login dan reset password lebih berisiko dibanding edit profile.  
- **Dependency:** login harus berhasil sebelum menguji fitur lain seperti reset password atau edit profile.


---

## 3. Handling Conflict dengan Developer

**Skenario:** Developer mengatakan bahwa suatu behavior adalah **expected**, tetapi menurut saya behavior tersebut **berdampak buruk bagi pengguna atau kualitas produk**.

### Langkah yang Dilakukan (Bertahap dan Kolaboratif)

#### 1. Validasi Concern

- **Pastikan bug bisa direproduksi dengan jelas**  
  Catat langkah-langkah (steps), environment, data yang digunakan, serta perbedaan antara expected dan actual result. Sertakan screenshot atau video jika perlu. Pastikan juga ini bukan kesalahan memahami requirement atau masalah environment.

- **Jelaskan dampak ke user**  
  Identifikasi siapa yang terdampak (misalnya: pengguna baru, pengguna lama, atau edge case), seberapa sering terjadi, dan konsekuensinya (misalnya: kebingungan user, error, atau risiko keamanan).

- **Cek spesifikasi**  
  Periksa PRD, acceptance criteria, atau ticket. Pastikan apakah behavior tersebut memang dirancang seperti itu (**by design**) atau belum pernah dijelaskan sebelumnya. Jika tidak ada di spesifikasi, maka ini menjadi bahan diskusi bersama.


#### 2. Diskusi dengan Developer

- **Gunakan pendekatan kolaboratif**  
  Sampaikan dengan cara netral, misalnya:  
  *“Saya menemukan behavior X, yang berdampak ke user Y. Berdasarkan requirement Z, apakah kita bisa menyamakan persepsi?”*

- **Tanyakan alasan atau tujuan desain**  
  Bisa jadi behavior tersebut memang sengaja dibuat karena alasan teknis atau bisnis (misalnya trade-off atau kebutuhan MVP). Jika memang demikian, sebaiknya alasan tersebut didokumentasikan.

- **Tawarkan alternatif solusi**  
  Jika memungkinkan, ajukan opsi seperti perbaikan kecil, fallback behavior, atau pesan error yang lebih jelas. Tujuannya menunjukkan bahwa fokusnya adalah solusi, bukan sekadar menyebutkan bug.

#### 3. Kapan Melibatkan Product Manager

- **Eskalasi ke PM jika:**
  - Dampaknya jelas terhadap user (UX buruk, kebingungan, atau risiko keamanan).
  - Developer tetap menganggap behavior tersebut expected tanpa alasan bisnis atau teknis yang jelas.

- **Libatkan PM jika perlu keputusan trade-off**  
  Misalnya: memperbaiki bug membutuhkan tambahan waktu 2 hari, sementara rilis sudah dijadwalkan. Dalam situasi ini, PM biasanya menentukan prioritas dan tingkat risiko yang bisa diterima.


#### 4. Menentukan Keputusan

- **Eskalasi sebagai risiko besar**  
  Jika dampaknya signifikan bagi user atau keamanan dan belum ada mitigasi yang disepakati. Risiko ini didokumentasikan di release note atau risk log, lalu diminta keputusan apakah rilis tetap dilakukan atau ditunda.

- **Menerima sebagai risiko sementara**  
  Jika PM atau tech lead memutuskan untuk tetap merilis dan memperbaikinya di sprint berikutnya. Kasus ini dicatat sebagai known issue dan dibuatkan ticket untuk tindak lanjut.

- **Memblokir rilis**  
  Dilakukan hanya jika masalahnya sangat kritis, seperti:
  - celah keamanan (auth bypass, data leak)
  - kehilangan data
  - fitur utama tidak bisa digunakan

  Untuk kasus seperti UX yang kurang baik tetapi masih bisa digunakan, biasanya keputusan akhir tetap didiskusikan dengan PM.

**Prinsip utama:**  
Pendekatan dilakukan secara kolaboratif. QA menyampaikan bukti dan dampak terhadap pengguna, developer fokus pada implementasi teknis, dan keputusan bisnis atau prioritas rilis biasanya ditentukan oleh Product Manager.

---

## 4. Quality Risk Awareness

### Risiko 1: Regression di Login / Session (environment dev–staging tidak sinkron)

- **Dampak ke user/bisnis:**  
  Pengguna bisa gagal login atau tiba-tiba ter-logout. Hal ini bisa menyebabkan pengguna berhenti memakai aplikasi, meningkatnya tiket support, dan menurunnya reputasi produk.

- **Mengapa signifikan:**  
  Tanpa automation testing dan dengan environment yang sering tidak sinkron, bug pada sistem login atau session bisa saja tidak terdeteksi di staging. Dalam produk B2C, satu bug pada fitur login bisa berdampak pada banyak pengguna sekaligus.

- **Keputusan:** **Eskalasi.**  
  Risiko ini perlu diangkat sebelum rilis. Misalnya dengan menyampaikan bahwa ada kemungkinan regression pada login atau session karena tidak adanya automation dan perbedaan environment.  
  Rekomendasi minimal adalah melakukan **smoke test manual sebelum rilis** dan menyiapkan **rencana rollback** jika terjadi masalah setelah rilis.  
  Jika tim tetap memutuskan untuk rilis, maka keputusan tersebut harus disetujui secara jelas oleh Product Manager sebagai **risk acceptance**.

### Risiko 2: Bug di Reset Password (flow atau keamanan)

- **Dampak ke user/bisnis:**  
  Jika token reset tidak memiliki masa berlaku, link bisa digunakan lebih dari sekali, atau reset dilakukan tanpa verifikasi yang benar, maka ada risiko **account takeover**. Dampaknya bisa berupa hilangnya kepercayaan pengguna, meningkatnya komplain, bahkan potensi masalah hukum jika terjadi kebocoran data.

- **Mengapa signifikan:**  
  Fitur reset password sering menjadi target serangan karena berkaitan langsung dengan keamanan akun. Satu bug di bagian ini bisa berdampak pada banyak pengguna sekaligus.

- **Keputusan:** **Eskalasi.**  
  Risiko ini perlu dianggap sebagai **high risk**, terutama jika pengujian hanya dilakukan secara manual tanpa automation.  
  Sebelum rilis, disarankan untuk menjalankan **pengujian penuh pada alur reset password** dan mendokumentasikan keterbatasan yang diketahui (known limitations).  
  Jika ditemukan masalah kritis, sebaiknya rilis **ditunda sampai diperbaiki** atau sampai ada mitigasi yang disepakati oleh tim.

---