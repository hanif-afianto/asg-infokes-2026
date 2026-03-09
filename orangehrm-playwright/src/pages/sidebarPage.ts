import { expect, type Page, type Locator } from "@playwright/test";
import { safeClick } from "@utils/playwright.utils";

export class SidebarPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly searchInput: Locator;
  
  // Menu items
  readonly adminMenu: Locator;
  readonly pimMenu: Locator;
  readonly leaveMenu: Locator;
  readonly timeMenu: Locator;
  readonly recruitmentMenu: Locator;
  readonly myInfoMenu: Locator;
  readonly performanceMenu: Locator;
  readonly dashboardMenu: Locator;
  readonly directoryMenu: Locator;
  readonly maintenanceMenu: Locator;
  readonly claimMenu: Locator;
  readonly buzzMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator(".oxd-sidepanel");
    this.searchInput = page.getByPlaceholder("Search");
    
    this.adminMenu = page.getByRole("link", { name: "Admin" });
    this.pimMenu = page.getByRole("link", { name: "PIM" });
    this.leaveMenu = page.getByRole("link", { name: "Leave" });
    this.timeMenu = page.getByRole("link", { name: "Time" });
    this.recruitmentMenu = page.getByRole("link", { name: "Recruitment" });
    this.myInfoMenu = page.getByRole("link", { name: "My Info" });
    this.performanceMenu = page.getByRole("link", { name: "Performance" });
    this.dashboardMenu = page.getByRole("link", { name: "Dashboard" });
    this.directoryMenu = page.getByRole("link", { name: /directory/i });
    this.maintenanceMenu = page.getByRole("link", { name: "Maintenance" });
    this.claimMenu = page.getByRole("link", { name: "Claim" });
    this.buzzMenu = page.getByRole("link", { name: "Buzz" });
  }

  async goToAdmin() {
    await safeClick(this.adminMenu);
    await expect(this.page).toHaveURL(/\/admin/);
  }

  async goToPIM() {
    await safeClick(this.pimMenu);
    await expect(this.page).toHaveURL(/\/pim/);
  }

  async goToLeave() {
    await safeClick(this.leaveMenu);
    await expect(this.page).toHaveURL(/\/leave/);
  }

  async goToTime() {
    await safeClick(this.timeMenu);
    await expect(this.page).toHaveURL(/\/time/);
  }

  async goToRecruitment() {
    await safeClick(this.recruitmentMenu);
    await expect(this.page).toHaveURL(/\/recruitment/);
  }

  async goToMyInfo() {
    await safeClick(this.myInfoMenu);
    await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails/);
  }

  async goToPerformance() {
    await safeClick(this.performanceMenu);
    await expect(this.page).toHaveURL(/\/performance/);
  }

  async goToDashboard() {
    await safeClick(this.dashboardMenu);
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async goToDirectory() {
    await safeClick(this.directoryMenu);
    await expect(this.page).toHaveURL(/\/directory/, { timeout: 10000 });
  }

  async goToMaintenance() {
    await safeClick(this.maintenanceMenu);
    await expect(this.page).toHaveURL(/\/maintenance/);
  }

  async goToClaim() {
    await safeClick(this.claimMenu);
    await expect(this.page).toHaveURL(/\/claim/);
  }

  async goToBuzz() {
    await safeClick(this.buzzMenu);
    await expect(this.page).toHaveURL(/\/buzz/);
  }

  async searchMenu(menuName: string) {
    await this.searchInput.fill(menuName);
  }
}
