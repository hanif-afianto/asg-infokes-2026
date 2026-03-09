import { expect, type Page, type Locator } from "@playwright/test";
import { safeClick, safeFill } from "@utils/playwright.utils";

/**
 * Login Page Object — Sesuai Soal Part B (Real Automation Code)
 *
 * Waiting strategy: condition-based (bukan sleep).
 * - Sebelum aksi: safeFill/safeClick memastikan elemen visible & enabled (ensureActionable).
 * - Setelah submit: gunakan waitForLoginSuccess() untuk menunggu navigasi ke dashboard.
 *
 * Locator strategy: stabil dan semantik.
 * - getByPlaceholder untuk input (OrangeHRM tidak menyediakan data-testid).
 * - getByRole("button", { name }) untuk tombol — accessible name, tahan refactor.
 * - getByRole("alert") untuk pesan error — semantik.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByPlaceholder("Username");
    this.passwordField = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
    this.forgotPasswordLink = page.getByText("Forgot your password?");
    this.loginTitle = page.getByRole("heading", { name: "Login" });
  }

  async goto() {
    await this.page.goto("/web/index.php/auth/login");
  }

  /**
   * Isi form dan klik Login. Tidak memakai sleep; waiting sebelum aksi
   * ditangani oleh safeFill/safeClick (visible + enabled).
   */
  async login(username: string, password: string) {
    await safeFill(this.usernameField, username);
    await safeFill(this.passwordField, password);
    await safeClick(this.loginButton);
  }

  /**
   * Waiting berbasis kondisi setelah klik Login (hanya untuk alur sukses).
   * Menunggu URL berubah ke dashboard — bukan waitForTimeout.
   * Timeout 15s sesuai ekspektasi response aplikasi.
   */
  async waitForLoginSuccess(options?: { timeout?: number }) {
    const timeout = options?.timeout ?? 15_000;
    await this.page.waitForURL(/\/web\/index\.php\/dashboard\/?/, { timeout });
  }

  async expectLoginPageVisible() {
    await expect(this.loginTitle).toBeVisible();
  }

  async expectInvalidCredentialsError() {
    await expect(this.errorMessage).toContainText("Invalid credentials");
  }

  async expectRequiredFieldError() {
    // OrangeHRM: validasi "Required" atau pesan di role=alert; tetap di halaman login
    await expect(this.page).toHaveURL(/\/auth\/login/);
    const hasValidation =
      this.page.getByText(/required/i).first().or(this.page.getByRole("alert"));
    await expect(hasValidation).toBeVisible({ timeout: 10000 });
  }
}
