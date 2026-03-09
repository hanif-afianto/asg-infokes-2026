import { test, expect } from "@fixtures/base.fixture";

test.describe("Sidebar Navigation Tests", () => {
  test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
    await loginPage.goto();
    await loginPage.login(users.admin.username, users.admin.password);
    await loginPage.waitForLoginSuccess();
    await dashboardPage.expectDashboardVisible();
  });

  test("TC-NAV-001: Verify user can navigate to Admin page",
    { tag: ["@TC-NAV-001", "@smoke", "@navigation", "@admin"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to Admin page", async () => {
        await sidebarPage.goToAdmin();
      });

      await test.step("Verify Admin page heading", async () => {
        await expect(sidebarPage.page.getByRole("heading", { name: "Admin" })).toBeVisible();
      });
    }
  );

  test("TC-NAV-002: Verify user can navigate to PIM page",
    { tag: ["@TC-NAV-002", "@smoke", "@navigation", "@pim"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to PIM page", async () => {
        await sidebarPage.goToPIM();
      });

      await test.step("Verify PIM page heading", async () => {
        await expect(sidebarPage.page.getByRole("heading", { name: "PIM" })).toBeVisible();
      });
    }
  );

  test("TC-NAV-003: Verify user can navigate to Leave page",
    { tag: ["@TC-NAV-003", "@smoke", "@navigation", "@leave"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to Leave page", async () => {
        await sidebarPage.goToLeave();
      });

      await test.step("Verify Leave page is displayed", async () => {
        await expect(sidebarPage.page).toHaveURL(/\/leave/);
      });
    }
  );

  test("TC-NAV-004: Verify user can navigate to My Info page",
    { tag: ["@TC-NAV-004", "@smoke", "@navigation", "@myinfo"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to My Info page", async () => {
        await sidebarPage.goToMyInfo();
      });

      await test.step("Verify My Info page is displayed", async () => {
        await expect(sidebarPage.page).toHaveURL(/\/pim\/viewPersonalDetails/);
      });
    }
  );

  test("TC-NAV-005: Verify user can navigate to Directory page",
    { tag: ["@TC-NAV-005", "@smoke", "@navigation", "@directory"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to Directory page", async () => {
        await sidebarPage.goToDirectory();
      });

      await test.step("Verify Directory page heading", async () => {
        await expect(sidebarPage.page.getByRole("heading", { name: "Directory" }).first()).toBeVisible();
      });
    }
  );

  test("TC-NAV-006: Verify user can navigate to Buzz page",
    { tag: ["@TC-NAV-006", "@smoke", "@navigation", "@buzz"] },
    async ({ sidebarPage }) => {
      await test.step("Navigate to Buzz page", async () => {
        await sidebarPage.goToBuzz();
      });

      await test.step("Verify Buzz page is displayed", async () => {
        await expect(sidebarPage.page).toHaveURL(/\/buzz/);
      });
    }
  );

  test("TC-NAV-007: Verify user can search menu items",
    { tag: ["@TC-NAV-007", "@smoke", "@navigation", "@search"] },
    async ({ sidebarPage }) => {
      await test.step("Search for Admin menu", async () => {
        await sidebarPage.searchMenu("Admin");
      });

      await test.step("Verify Admin menu is visible in search results", async () => {
        await expect(sidebarPage.adminMenu).toBeVisible();
      });
    }
  );
});
