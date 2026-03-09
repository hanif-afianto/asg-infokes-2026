/**
 * Test data fixtures
 * Provides test data as fixtures
 */

import { users } from "@data/index";

export type DataFixtures = {
  users: typeof users;
};

export const dataFixtures = {
  users: async ({}: any, use: any) => {
    await use(users);
  },
};
