# 🍊 OrangeHRM — Playwright Test Automation

[![Playwright](https://img.shields.io/badge/Playwright-v1.57-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

End-to-end test automation framework for [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com/) built with **Playwright** and **TypeScript**.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Page Object Model** | Each page is encapsulated in its own class for maintainability and reuse |
| **Custom Fixtures** | Layered fixture system (`base` → `page` → `data`) for clean test setup |
| **Path Aliases** | Clean imports via `@pages/*`, `@fixtures/*`, `@data/*`, `@utils/*`, etc. |
| **Safe Action Helpers** | Wrapper utilities that handle timing & retries, reducing flakiness |
| **Environment Config** | `.env`-based configuration with validation through `dotenv` |
| **Rich Reporting** | HTML + JSON reports with screenshots, videos, and trace capture on failure |

---

## 📂 Project Structure

```text
orangehrm-playwright/
├── config/
│   └── env.ts                        # Environment variable loading & validation
├── src/
│   ├── fixtures/
│   │   ├── base.fixture.ts           # Core fixture (browser, context)
│   │   ├── page.fixtures.ts          # Page Object fixtures (LoginPage, etc.)
│   │   └── data.fixtures.ts          # Test data fixtures
│   ├── pages/
│   │   ├── loginPage.ts              # Login page object
│   │   ├── dashboardPage.ts          # Dashboard page object
│   │   ├── sidebarPage.ts            # Sidebar navigation page object
│   │   └── adminPage.ts              # Admin module page object
│   ├── test-data/                    # Static & dynamic test datasets
│   ├── types/                        # Shared TypeScript interfaces
│   └── utils/                        # Utility functions & safe action helpers
├── tests/
│   └── spec/
│       ├── account/                  # Login & authentication specs
│       ├── admin/                    # Admin module specs
│       └── navigation/              # Sidebar navigation specs
├── playwright.config.ts              # Playwright configuration
├── tsconfig.json                     # TypeScript & path alias configuration
└── package.json                      # Dependencies & npm scripts
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd orangehrm-playwright

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Set up environment variables
cp .env.example .env
```

> [!NOTE]
> The default `.env.example` points to the public OrangeHRM demo at `https://opensource-demo.orangehrmlive.com`. Update `.env` if you need a different target URL.

---

## 🧪 Running Tests

### Quick Commands

| Command | Description |
|---|---|
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run tests with a visible browser |
| `npm run test:ui` | Open Playwright UI mode for interactive exploration |
| `npm run test:debug` | Launch tests with the Playwright Inspector |
| `npm run report` | View the latest HTML report |

### Filtering by Tag

Tests support `@`-prefixed tags for selective execution:

```bash
npx playwright test --grep @smoke       # Smoke / critical-path tests
npx playwright test --grep @login       # Login-related tests only
npx playwright test --grep @negative    # Negative scenarios
```

### Filtering by File or Title

```bash
npx playwright test tests/spec/account  # Run all specs under account/
npx playwright test -g "valid login"    # Run tests matching a title
```

---

## 📊 Reporting & Debugging

| Artifact | When Captured | How to View |
|---|---|---|
| **HTML Report** | Every run | `npm run report` |
| **JSON Results** | Every run | `test-results/results.json` |
| **Screenshots** | On failure | Embedded in HTML report |
| **Trace Files** | On first retry | Upload to [trace.playwright.dev](https://trace.playwright.dev/) |

---

## 🏗️ Architecture

### Fixture Layers

The project uses a layered fixture architecture to keep tests clean and focused:

```text
base.fixture.ts          ← Browser & context setup
    └── page.fixtures.ts ← Instantiates page objects (loginPage, dashboardPage, …)
        └── data.fixtures.ts ← Provides test data to specs
```

### Path Aliases

Configured in `tsconfig.json` for cleaner imports:

| Alias | Maps To |
|---|---|
| `@fixtures/*` | `src/fixtures/*` |
| `@pages/*` | `src/pages/*` |
| `@utils/*` | `src/utils/*` |
| `@data/*` | `src/test-data/*` |
| `@shared-types/*` | `src/types/*` |
| `@config/*` | `config/*` |

---

## 📝 Coding Standards

- **Locators** — Prefer semantic locators: `getByRole()`, `getByLabel()`, `getByPlaceholder()`.
- **Actions** — Use safe action helpers from `@utils/playwright.utils` to handle waits and retries.
- **Assertions** — Use Playwright's web-first assertions (e.g. `expect(locator).toBeVisible()`).
- **DRY** — Shared logic belongs in `src/utils` or `src/fixtures`; avoid duplication across specs.

---

## 📋 Sesuai Soal Part B (Real Automation Code)

1. **Waiting berbasis kondisi**  
2. **Assertion yang jelas**  
3. **Struktur yang maintainable**

### Bagaimana project ini memenuhi ketiga poin

| Wajib menunjukkan | Implementasi di project ini |
|-------------------|-----------------------------|
| **Waiting berbasis kondisi** | Tidak ada `waitForTimeout`/sleep. Sebelum aksi: `safeFill`/`safeClick` menunggu elemen visible & enabled (`ensureActionable` di `src/utils/playwright.utils.ts`). Setelah submit login: `LoginPage.waitForLoginSuccess()` memakai `page.waitForURL(/dashboard/)` dengan timeout. |
| **Assertion yang jelas** | Assertion memvalidasi behavior: `expectDashboardUrl()` (URL berubah), `expectDashboardVisible()` (halaman ter-render), `expectInvalidCredentialsError()` / `expectRequiredFieldError()` untuk skenario negatif. |
| **Struktur yang maintainable** | Page Object Model (`src/pages/`), fixture layer (`src/fixtures/`), test data terpisah (`src/test-data/`), path alias (`@pages`, `@fixtures`, `@utils`). Spec memakai pola Arrange–Act–Assert dan `test.step` untuk readability. |

### Lokasi kode utama

- **Login flow:** `tests/spec/account/login.spec.ts` — doc block menjelaskan struktur, waiting, locator, assertion.
- **Login page:** `src/pages/loginPage.ts` — `waitForLoginSuccess()`, JSDoc strategi waiting & locator.
- **Safe actions (condition-based wait):** `src/utils/playwright.utils.ts` — `ensureActionable` + `safeClick`/`safeFill`.
