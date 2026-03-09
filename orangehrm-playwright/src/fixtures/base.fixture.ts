/**
 * Base fixture that combines all fixtures
 * This is the main entry point for all test files
 */

import { test as base } from "@playwright/test";
import { pageFixtures, type PageFixtures } from "./page.fixtures";
import { dataFixtures, type DataFixtures } from "./data.fixtures";

type MyFixtures = PageFixtures & DataFixtures;

export const test = base.extend<MyFixtures>({
  ...pageFixtures,
  ...dataFixtures,
});

export { expect, request } from "@playwright/test";
