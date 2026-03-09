# asg-infokes-2026

Repository untuk tugas QA / Test Engineering. Fokus utama: **fundamental QA** dan **automation UI / test engineering judgment**.

---

## 📂 Deliverables utama

### 1. Fundamental QA & Quality Judgment

**[01-fundamental-qa-quality-judgment.md](./01-fundamental-qa-quality-judgment.md)**

Jawaban naratif untuk soal fundamental QA: testing scope, prioritas testing, handling conflict dengan developer, quality risk awareness.

---

### 2. Automation UI & Test Engineering Judgment

**[02-automation-ui-test-engineering-judgment.md](./02-automation-ui-test-engineering-judgment.md)**

Jawaban untuk soal automation UI dan test engineering: analisa penyebab flaky test (Part A), design automation test (Part B), failure investigation (Part C).

**Real automation code (bagian dari Part B)** ada di project:

| Path | Deskripsi |
|------|-----------|
| **`orangehrm-playwright/`** | Project Playwright + TypeScript untuk [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com/): login, navigasi sidebar, admin add user. Implementasi waiting berbasis kondisi, assertion jelas, struktur maintainable. |

- **Test IDs:** TC-LOGIN-001–005, TC-NAV-001–007, TC-ADMIN-001.
- **Menjalankan test:** `cd orangehrm-playwright && npm install && npx playwright install && npm test`
- **Dokumentasi project:** [orangehrm-playwright/README.md](./orangehrm-playwright/README.md)

---

## 📋 Ringkasan

- **01** → fundamental QA (dokumen).
- **02** → automation UI & test engineering judgment (dokumen + kode di `orangehrm-playwright/`).
