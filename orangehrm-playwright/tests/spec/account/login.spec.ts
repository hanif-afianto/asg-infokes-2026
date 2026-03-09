/**
 * Login Spec — Sesuai Soal Part B (Real Automation Code)
 *
 * Struktur: Arrange → Act → Assert
 * - Arrange: goto login page (beforeEach), data dari fixture (users).
 * - Act: login(username, password); waiting setelah submit via waitForLoginSuccess().
 * - Assert: URL berubah ke dashboard, elemen dashboard visible, tidak ada error.
 *
 * Waiting strategy: condition-based (tanpa sleep).
 * - Sebelum isi/klik: safeFill/safeClick menunggu elemen visible & enabled.
 * - Setelah klik Login: waitForLoginSuccess() = waitForURL(/dashboard/) hingga timeout.
 *
 * Locator: role + placeholder (OrangeHRM tidak pakai data-testid); lihat LoginPage.
 *
 * Assertion: memvalidasi behavior — URL, dashboard visible, pesan error untuk negatif.
 */
import { test } from "@fixtures/base.fixture";

test.describe("Login Tests", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("TC-LOGIN-001: Verify admin user can login with valid credentials",
    { tag: ["@TC-LOGIN-001", "@smoke", "@login", "@positive"] },
    async ({ loginPage, dashboardPage, users }) => {
      // Arrange: halaman login sudah dibuka di beforeEach; credentials dari fixture
      await test.step("Login with admin credentials", async () => {
        await loginPage.login(users.admin.username, users.admin.password);
        // Waiting berbasis kondisi: tunggu navigasi ke dashboard (bukan sleep)
        await loginPage.waitForLoginSuccess();
      });

      // Assert: URL berubah dan halaman dashboard ter-render
      await test.step("Verify dashboard is displayed", async () => {
        await dashboardPage.expectDashboardUrl();
        await dashboardPage.expectDashboardVisible();
      });
    }
  );

  test("TC-LOGIN-002: Verify user can logout successfully",
    { tag: ["@TC-LOGIN-002", "@smoke", "@login", "@logout"] },
    async ({ loginPage, dashboardPage, users }) => {
      await test.step("Login with admin credentials", async () => {
        await loginPage.login(users.admin.username, users.admin.password);
        await loginPage.waitForLoginSuccess();
        await dashboardPage.expectDashboardVisible();
      });

      await test.step("Logout from the application", async () => {
        await dashboardPage.logout();
      });

      await test.step("Verify login page is displayed", async () => {
        await loginPage.expectLoginPageVisible();
      });
    }
  );

  test("TC-LOGIN-003: Verify user cannot login with invalid credentials",
    { tag: ["@TC-LOGIN-003", "@negative", "@login"] },
    async ({ loginPage, users }) => {
      await test.step("Login with invalid credentials", async () => {
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
      });

      await test.step("Verify error message is displayed", async () => {
        await loginPage.expectInvalidCredentialsError();
      });
    }
  );

  test("TC-LOGIN-004: Verify user cannot login with empty credentials",
    { tag: ["@TC-LOGIN-004", "@negative", "@login", "@validation"] },
    async ({ loginPage, users }) => {
      await test.step("Click login without entering credentials", async () => {
        await loginPage.login(users.emptyCredentials.username, users.emptyCredentials.password);
      });

      await test.step("Verify required field error is displayed", async () => {
        await loginPage.expectRequiredFieldError();
      });
    }
  );

  test("TC-LOGIN-005: Verify user cannot login with valid username and invalid password",
    { tag: ["@TC-LOGIN-005", "@negative", "@login"] },
    async ({ loginPage, users }) => {
      await test.step("Login with valid username and invalid password", async () => {
        await loginPage.login(users.admin.username, "wrongpassword");
      });

      await test.step("Verify error message is displayed", async () => {
        await loginPage.expectInvalidCredentialsError();
      });
    }
  );
});
