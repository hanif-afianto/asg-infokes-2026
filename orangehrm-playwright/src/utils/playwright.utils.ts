import { expect, type Locator } from "@playwright/test";

/**
 * Safe action helpers that reduce flakiness by:
 * - Scrolling element into view
 * - Using web-first assertions (auto-retry) before acting
 * - Ensuring element is actionable before performing the action
 */

export type ActionOptions = {
  timeout?: number;
};

/**
 * Clicks a locator after ensuring it is visible, enabled, and in view.
 */
export async function safeClick(locator: Locator, options?: ActionOptions): Promise<void> {
  await ensureActionable(locator, options);
  await locator.click({ timeout: options?.timeout });
}

/**
 * Fills a form field after ensuring it is visible and editable.
 */
export async function safeFill(locator: Locator, value: string, options?: ActionOptions): Promise<void> {
  await ensureActionable(locator, options);
  await locator.fill(value, { timeout: options?.timeout });
}

/**
 * Checks a checkbox after ensuring it is visible and enabled.
 */
export async function safeCheck(locator: Locator, options?: ActionOptions): Promise<void> {
  await ensureActionable(locator, options);
  await locator.check({ timeout: options?.timeout });
}

/**
 * Unchecks a checkbox after ensuring it is visible and enabled.
 */
export async function safeUncheck(locator: Locator, options?: ActionOptions): Promise<void> {
  await ensureActionable(locator, options);
  await locator.uncheck({ timeout: options?.timeout });
}

/**
 * Ensures a locator is ready for interaction: in view, visible, and enabled.
 */
export async function ensureActionable(locator: Locator, options?: ActionOptions) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: options?.timeout });
  } catch {
    // Best-effort: if scroll fails, continue with visibility/enabled checks
  }
  await expect(locator).toBeVisible(options);
  await expect(locator).toBeEnabled(options);
}
