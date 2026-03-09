import { expect, type Page, type Locator } from "@playwright/test";
import { safeClick } from "@utils/playwright.utils";

/**
 * Dashboard Page Object — Assertion yang jelas untuk post-login.
 * - expectDashboardUrl: validasi navigasi sukses (URL berubah).
 * - expectDashboardVisible: validasi halaman ter-render (bukan redirect kosong).
 */
export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;
  readonly sidebarMenu: Locator;
  readonly quickLaunchSection: Locator;
  readonly timeAtWorkWidget: Locator;
  readonly myActionsWidget: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.getByRole("heading", { name: "Dashboard" });
    this.userDropdown = page.locator(".oxd-userdropdown");
    this.logoutLink = page.getByRole("menuitem", { name: "Logout" });
    this.sidebarMenu = page.locator(".oxd-sidepanel");
    this.quickLaunchSection = page.locator(".orangehrm-quick-launch");
    this.timeAtWorkWidget = page.locator(".orangehrm-attendance-card");
    this.myActionsWidget = page.locator(".orangehrm-todo-list");
  }

  async expectDashboardVisible() {
    await expect(this.dashboardHeading).toBeVisible();
  }

  async expectDashboardUrl() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async logout() {
    await safeClick(this.userDropdown);
    await expect(this.logoutLink).toBeVisible({ timeout: 5000 });
    await safeClick(this.logoutLink);
  }

  async getUserDisplayName(): Promise<string> {
    const nameElement = this.userDropdown.locator(".oxd-userdropdown-name");
    return await nameElement.textContent() ?? "";
  }

  async expectUserDisplayName(name: string) {
    const nameElement = this.userDropdown.locator(".oxd-userdropdown-name");
    await expect(nameElement).toContainText(name);
  }
}
