/**
 * Page Object Model fixtures
 * Provides all page objects as test fixtures
 */

import { LoginPage } from "@pages/loginPage";
import { DashboardPage } from "@pages/dashboardPage";
import { SidebarPage } from "@pages/sidebarPage";

export type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  sidebarPage: SidebarPage;
};

export const pageFixtures = {
  loginPage: async ({ page }: any, use: any) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }: any, use: any) => {
    await use(new DashboardPage(page));
  },

  sidebarPage: async ({ page }: any, use: any) => {
    await use(new SidebarPage(page));
  },
};
