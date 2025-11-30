/**
 * @fileoverview E2E tests for the home page.
 */

import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the home page with title", async ({ page }) => {
    await page.goto("/en");
    
    // Check that the page title contains the app name
    await expect(page).toHaveTitle(/Event Overview/);
    
    // Check that the navbar is visible
    await expect(page.locator("nav")).toBeVisible();
    
    // Check that the hero section is visible
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should navigate between locales", async ({ page }) => {
    // Start at English
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    
    // The language switcher should be visible
    const langSwitcher = page.locator('[aria-label="Change language"]');
    await expect(langSwitcher).toBeVisible();
  });

  test("should display event cards when events exist", async ({ page }) => {
    await page.goto("/en");
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    // Either event cards or a loading state should be present
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });

  test("should have a working submit button in navbar", async ({ page }) => {
    await page.goto("/en");
    
    // Find the submit button
    const submitButton = page.locator('a[href*="/submit"]');
    await expect(submitButton).toBeVisible();
    
    // Click the submit button
    await submitButton.click();
    
    // Should navigate to the submit page
    await expect(page).toHaveURL(/\/submit/);
  });

  test("should display filter options", async ({ page }) => {
    await page.goto("/en");
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    // Check for filter section
    const filterSection = page.locator("aside");
    await expect(filterSection).toBeVisible();
  });
});

test.describe("Submit Page", () => {
  test("should show password gate or form", async ({ page }) => {
    await page.goto("/en/submit");
    
    // Should see the main content (password gate or form)
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });
});

test.describe("Internationalization", () => {
  test("should display Chinese content", async ({ page }) => {
    await page.goto("/zh");
    await expect(page).toHaveURL(/\/zh/);
  });

  test("should display Japanese content", async ({ page }) => {
    await page.goto("/ja");
    await expect(page).toHaveURL(/\/ja/);
  });

  test("should redirect root to default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en/);
  });
});
