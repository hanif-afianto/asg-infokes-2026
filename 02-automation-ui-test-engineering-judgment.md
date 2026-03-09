# Soal 2 – Automation UI dan Test Engineering Judgment

## Daftar isi

- [Part A – Analisa Automation Existing](#part-a--analisa-automation-existing)
  - [1. Race condition & waiting strategy yang buruk](#1-race-condition--waiting-strategy-yang-buruk)
  - [2. Locator tidak stabil](#2-locator-tidak-stabil)
  - [3. Dependency terhadap environment & shared test data](#3-dependency-terhadap-environment--shared-test-data)
- [Part B – Design Automation Test](#part-b--design-automation-test)
  - [1. Test structure (Arrange – Act – Assert)](#1-test-structure-arrange--act--assert)
  - [2. Waiting strategy (condition-based)](#2-waiting-strategy-condition-based)
  - [3. Locator strategy (sesuai OrangeHRM)](#3-locator-strategy-sesuai-orangehrm)
  - [4. Assertion](#4-assertion)
  - [Ringkasan pseudocode lengkap (Login happy path)](#ringkasan-pseudocode-lengkap-login-happy-path)
- [Part C – Failure Investigation](#part-c--failure-investigation)
  - [1. Langkah investigasi (berurutan)](#1-langkah-investigasi-berurutan)
  - [2. Data yang dikumpulkan](#2-data-yang-dikumpulkan)
  - [3. Komunikasi dengan developer](#3-komunikasi-dengan-developer)
  - [4. Decision making](#4-decision-making)
- [Ringkasan](#ringkasan)

---

## Part A – Analisa Automation Existing

Berikut **tiga penyebab utama** automation UI menjadi flaky berdasarkan pengalaman di project nyata, beserta penyebab teknis, contoh, dampak ke CI, dan mitigasi.

---

### 1. Race condition & waiting strategy yang buruk

**Penyebab teknis**

- Test mengandalkan waktu tetap (sleep) atau klik/ketik sebelum elemen atau state siap. Di local, CPU dan disk lebih cepat sehingga elemen sering sudah tampil saat aksi dijalankan; di CI (sering shared/lebih lambat) elemen belum ada → gagal.
- Tidak ada eksplisit wait untuk kondisi yang relevan (visible, enabled, text, URL, network idle).

**Contoh kasus nyata**

- Setelah klik "Login", test langsung assert "Welcome" tanpa menunggu redirect atau loading selesai. Di local selalu lolos, di CI kadang halaman belum selesai load → assertion ke elemen yang belum ada → flaky.
- Form submit: test mengisi field lalu langsung klik "Submit" padahal validasi client-side atau loading overlay belum selesai → klik tidak berefek atau double submit.

**Dampak terhadap CI pipeline**

- Fail intermiten, sulit dibedakan bug produk vs test. Tim mulai mengabaikan failure atau re-run berkali-kali, sehingga nilai automation turun dan feedback loop melambat.

**Cara mitigasi**

- Hapus sleep; gunakan **condition-based wait**: wait for element visible/enabled, wait for URL/navigation, wait for network idle atau response API tertentu.
- Set default timeout yang wajar (mis. 10–15 detik) dan pastikan wait dipakai sebelum setiap aksi/assert yang bergantung pada UI/network.

---

### 2. Locator tidak stabil

**Penyebab teknis**

- Locator bergantung pada teks UI (label, placeholder), CSS class (sering berubah saat styling/refactor), atau index (nth-child). Satu perubahan kecil di front-end bisa memecah banyak test.

**Contoh kasus nyata**

- Selector `button.primary` atau `div.form-group:nth-child(2) input`: setelah refactor class atau urutan field, test gagal padahal behavior sama.
- Selector berdasarkan teks "Submit" yang dipakai di beberapa tempat atau berubah saat i18n → salah elemen atau tidak ketemu.

**Dampak terhadap CI pipeline**

- Setiap perubahan UI/refactor memicu failure massal. Tim dev enggan ubah UI karena takut break test, atau sebaliknya test sering di-"perbaiki" hanya dengan ganti locator tanpa validasi behavior.

**Cara mitigasi**

- Prioritaskan **locator yang stabil dan semantik**: `data-testid`, role + accessible name (e.g. `role=button, name=Submit`), atau kombinasi role + name. Sepakati dengan tim dev penambahan `data-testid` untuk elemen kritis.
- Hindari ketergantungan pada class, index, atau teks yang mudah berubah. Jika terpaksa pakai teks, pastikan unik (mis. dalam scope container tertentu).

---

### 3. Dependency terhadap environment & shared test data

**Penyebab teknis**

- Test mengasumsikan state environment tertentu (data user, urutan record, timezone, flag feature) yang di local konsisten tapi di CI berbeda (parallel run, fresh DB, env lain).
- Shared data (satu user/akun dipakai banyak test) menyebabkan konflik: test A mengubah data sementara test B berjalan → hasil tidak deterministik.

**Contoh kasus nyata**

- Test login memakai user "admin" yang di local sudah ada dan kosong; di CI database di-reset atau user dipakai test lain yang mengunci/ mengubah session → login gagal atau assertion ke data yang salah.
- Test yang assert "list berisi minimal 5 item" atau "item pertama bernama X": di CI DB kosong atau diisi test paralel → flaky.

**Dampak terhadap CI pipeline**

- Failure hanya muncul di CI atau di run tertentu. Sulit direproduce local; waktu habis untuk debung environment instead of fixing real bug.

**Cara mitigasi**

- **Isolasi data per test**: setiap test (atau suite) pakai user/data unik yang dibuat di setup (API atau seed) dan dibersihkan di teardown. Hindari shared global user untuk test yang mengubah state.
- **Environment parity**: dokumentasikan dan setel variable CI (base URL, timezone, feature flags) sedekat mungkin dengan local; gunakan config per environment.
- Untuk test yang butuh data tertentu, buat data via API/backend di awal test, jangan asumsikan data sudah ada.

---

## Part B – Design Automation Test

Dipilih flow: **Login**.

Implementasi nyata ada di project **`./orangehrm-playwright`** (Playwright + TypeScript). Berikut **pseudocode** dan penjelasan yang diselaraskan dengan kode di `src/pages/loginPage.ts`, `src/pages/dashboardPage.ts`, dan `tests/spec/account/login.spec.ts`.

---

### 1. Test structure (Arrange – Act – Assert)

```
TEST: Login – happy path (kredensial valid)

ARRANGE
  - Buka halaman login (loginPage.goto() → base URL dari config/env)
  - Data kredensial dari fixture (users.admin); halaman siap via condition-based wait

ACT
  - Isi username & password (safeFill), klik Login (safeClick)
  - Tunggu navigasi selesai: waitForLoginSuccess() — condition-based, bukan sleep

ASSERT
  - expectDashboardUrl(): URL mengandung /dashboard
  - expectDashboardVisible(): heading "Dashboard" visible
```

---

### 2. Waiting strategy (condition-based)

- **Sebelum isi/klik:** `safeFill` dan `safeClick` (dari `@utils/playwright.utils`) memastikan elemen **visible** dan **enabled** (`ensureActionable`) — tidak pakai sleep.
- **Setelah klik Login:** `loginPage.waitForLoginSuccess()` = `page.waitForURL(/\/web\/index\.php\/dashboard\/?/, { timeout: 15000 })` — menunggu URL berubah ke dashboard.
- **Bukan:** `waitForTimeout` / sleep.

Contoh konsep (sesuai kode):

```
safeFill(usernameField)  → ensureActionable lalu fill (visible + enabled)
safeFill(passwordField)
safeClick(loginButton)
waitForLoginSuccess()    → waitForURL(/dashboard/)  timeout=15s
```

---

### 3. Locator strategy (sesuai OrangeHRM)

OrangeHRM demo tidak menyediakan `data-testid`, sehingga dipakai locator semantik:

- **Username / password:** `getByPlaceholder("Username")`, `getByPlaceholder("Password")` — stabil terhadap perubahan label/class.
- **Tombol login:** `getByRole("button", { name: "Login" })` — accessible name, tahan refactor teks kecil.
- **Post-login:** `getByRole("heading", { name: "Dashboard" })` — validasi halaman dashboard ter-render; user menu: `.oxd-userdropdown`.
- **Pesan error:** `getByRole("alert")` untuk invalid credentials / validasi.

**Alasan pilihan:**

- Placeholder dan role + name selaras dengan accessibility dan lebih stabil daripada class/XPath.
- Jika aplikasi nanti menambah `data-testid`, bisa diganti ke `getByTestId()` tanpa mengubah alur test.

---

### 4. Assertion

- **URL:** `expect(page).toHaveURL(/\/dashboard/)` — validasi navigasi sukses (implementasi: `dashboardPage.expectDashboardUrl()`).
- **UI post-login:** `expect(dashboardHeading).toBeVisible()` — validasi halaman ter-render (implementasi: `dashboardPage.expectDashboardVisible()`).
- **Skenario negatif:** `expect(errorMessage).toContainText("Invalid credentials")` atau assert teks "Required" / role=alert untuk validasi kosong.

Contoh konsep (sesuai kode):

```
ASSERT current URL contains "/dashboard"
ASSERT element  role=heading, name=Dashboard  is visible
(negatif) ASSERT role=alert  contains "Invalid credentials"  atau "Required"
```

---

### Ringkasan pseudocode lengkap (Login happy path)

```markdown
TEST: TC-LOGIN-001 — login_success_with_valid_credentials

ARRANGE
  1. loginPage.goto()   (navigate to /web/index.php/auth/login)
  2. Credentials dari fixture: users.admin.username, users.admin.password

ACT
  3. safeFill(getByPlaceholder("Username"), username)
  4. safeFill(getByPlaceholder("Password"), password)
  5. safeClick(getByRole("button", { name: "Login" }))
  6. waitForLoginSuccess()  → waitForURL(/\/web\/index\.php\/dashboard\/?/)  timeout=15s

ASSERT
  7. expect(page).toHaveURL(/\/dashboard/)
  8. expect(getByRole("heading", { name: "Dashboard" })).toBeVisible()
```

Data kredensial dari fixture `users` (`src/test-data/users/users.data.ts`); base URL dari config/env (`config/env.ts`).

**Lokasi kode:** `./orangehrm-playwright/tests/spec/account/login.spec.ts`, `src/pages/loginPage.ts`, `src/pages/dashboardPage.ts`, `src/utils/playwright.utils.ts`.

---

## Part C – Failure Investigation

Skenario: automation test **gagal di CI**, tetapi **selalu lulus di local**.

---

### 1. Langkah investigasi (berurutan)

1. **Ambil artifact CI**  
   Unduh log, screenshot/video (jika ada), dan jika mungkin trace/network log. Pastikan run yang dianalisis adalah run yang gagal (bukan run lain yang re-run).

2. **Reproduce failure dari artifact**  
   Dari log: identifikasi test name, step yang gagal, error message, dan screenshot saat failure. Coba reproduce di local dengan kondisi mirip: same branch, same base URL (atau stub), dan jika bisa same data state.

3. **Analisa log test**  
   Cek stack trace, timeout message, dan step terakhir yang dieksekusi. Apakah gagal di wait (element not found), di assertion (nilai tidak sesuai), atau di aksi (click/type)?

4. **Analisa screenshot / video**  
   Lihat apakah halaman tampil sesuai ekspektasi: elemen ada tapi tertutup? Redirect belum selesai? Error message tampil? Layout berbeda (viewport CI vs local)?

5. **Bandingkan environment CI vs local**  
   - Versi browser/Node, OS.  
   - Base URL, env vars (feature flags, API endpoint).  
   - Database/state: CI fresh vs local punya data.  
   - Resource: CPU/memory di CI (lambat → timeout).  
   - Parallelization: apakah test ini berjalan paralel dengan test lain yang pakai data sama?

6. **Jalankan di local dengan kondisi CI**  
   Contoh: headless, single worker, same viewport, same timeout. Jika bisa, jalankan di Docker/image yang sama dengan CI untuk memastikan environment parity.

7. **Jalankan dengan trace / debug**  
   Aktifkan trace Playwright (atau setara) dan jalankan ulang test yang gagal. Cek timeline, network, dan screenshot per step untuk melihat exact moment failure.

---

### 2. Data yang dikumpulkan

- **Test log:** full output test (termasuk step, timeout, assertion message).
- **Screenshot / video:** saat failure (dan opsi: screenshot tiap step).
- **Trace:** jika pakai Playwright/tool yang support trace (timeline, DOM, network).
- **Network log:** request/response saat step gagal (apakah request login 200? redirect? 5xx?).
- **Browser console error:** JS error di halaman yang bisa mengubah behavior.
- **Timing:** berapa lama step terakhir sebelum timeout; apakah CI secara konsisten lebih lambat.
- **Environment info:** branch, commit, job ID, worker/parallel index, base URL, env vars.

Ini dipakai untuk membedakan: salah test (wait/locator/assertion) vs bug produk vs environment/configuration.

---

### 3. Komunikasi dengan developer

- **Menyampaikan bukti bug**  
  Sertakan: langkah reproduce (dari test atau manual), screenshot/video, log relevan, environment (CI/local). Jelaskan ekspektasi vs aktual. Jika ada, tambahkan link ke run CI dan artifact.

- **Membedakan bug vs test issue**  
  - **Bug produk:** behavior salah di UI/backend (mis. button tidak redirect, error message salah). Reproduce manual dengan step yang sama; konsisten di environment yang sama.  
  - **Test issue:** locator salah, wait kurang, assertion terlalu ketat, atau test bergantung pada data/environment yang tidak terkontrol. Setelah perbaikan test (tanpa ubah aplikasi), test stabil.

  Jika ragu, sampaikan ke dev: "Saya lihat di CI terjadi X; di local Y. Bisa bantu cek apakah ini expected atau bug?" dengan bukti di atas.

- **Meminta bantuan dev**  
  Minta konfirmasi expected behavior, akses ke env/staging yang mirip CI, atau bantuan untuk reproduce di environment mereka. Untuk flaky yang diduga race/performance, minta konfirmasi apakah ada perubahan deployment/backend yang memengaruhi kecepatan response.

---

### 4. Decision making

#### Memperbaiki test

- **Locator berubah:** UI/refactor mengubah class, struktur DOM, atau teks → update locator ke yang stabil (data-testid, role+name) dan pastikan assertion masih valid.
- **Waiting kurang tepat:** elemen atau navigasi lebih lambat di CI → ganti sleep dengan condition-based wait, atau naikkan timeout dengan pertimbangan wajar (jangan sembarang besar).
- **Assertion terlalu rapuh:** mis. assert teks exact yang berubah-ubah → assert hal yang lebih stabil (URL, role, state) atau substring/pattern.
- **Test bergantung pada data/environment yang tidak terkontrol:** perbaiki dengan setup/teardown data atau isolasi environment.

Kriteria: failure disebabkan oleh cara test ditulis atau dikonfigurasi, bukan oleh bug produk.

---

#### Men-disable test

- **Bug produk belum diperbaiki:** behavior aplikasi salah dan sudah dikonfirmasi bug; dev punya ticket tapi belum fix. Disable test sementara (dengan komentar + link ticket) agar CI tidak merah terus dan tim tetap percaya pada failure lain.
- **Dependency eksternal tidak stabil:** mis. auth provider atau API pihak ketiga sering timeout/error di CI. Disable sampai ada stub/mock atau dependency stabil.
- **Flaky belum ketemu akar cause:** setelah investigasi wajar masih belum bisa stabilkan; disable sementara dengan ticket investigasi agar tidak mengganggu pipeline. Jangan dibiarkan disable tanpa batas waktu.

Kriteria: test secara konsep benar, tetapi menjalankannya saat ini merugikan (noise, block deploy, atau dependency di luar kendali).

---

#### Menghapus test

- **Test sudah tidak relevan:** fitur dihapus atau flow berubah total sehingga skenario test tidak lagi ada.
- **Coverage digantikan level lain:** mis. flow yang sama sudah tercakup oleh API test atau E2E lain yang lebih stabil dan maintainable; test ini redundant dan hanya menambah biaya maintenance.
- **Test tidak pernah stabil dan nilai rendah:** setelah beberapa iterasi perbaikan dan disable, test tetap flaky dan tidak memberi nilai deteksi bug; biaya maintain > manfaat. Hapus dan alokasikan effort ke test yang lebih bernilai.

Kriteria: test tidak lagi mencerminkan produk atau tidak lagi layak di-maintain dibanding alternatif.

---

## Ringkasan

- **Part A:** Tiga penyebab flaky yang sering terjadi: (1) race condition & waiting buruk, (2) locator tidak stabil, (3) dependency environment & shared data. Masing-masing punya dampak ke CI dan mitigasi yang spesifik.
- **Part B:** Flow Login didesain dengan Arrange–Act–Assert, condition-based wait, locator stabil (data-testid, role+name), dan assertion yang memvalidasi URL dan UI post-login.
- **Part C:** Investigasi sistematis (artifact → reproduce → log → screenshot → env → trace), pengumpulan data yang relevan, komunikasi jelas dengan dev, serta kriteria keputusan untuk perbaiki test, disable sementara, atau hapus test.

Ini mencerminkan pendekatan test engineering yang mengutamakan maintainability, reliability di CI, dan keputusan yang berbasis bukti dan biaya-manfaat.
