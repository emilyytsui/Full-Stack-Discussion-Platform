import { test, expect } from "@playwright/test";

test("visit welcome page, register, login, and create a community", async ({ page }) => {
  const uniqueValue = `test${Date.now()}`;
  const email = `playwright${uniqueValue}@example.com`;
  const displayName = `playwright${uniqueValue}`;
  const communityName = `Community ${uniqueValue}`;

  await page.goto("/");

  await expect(
    page.getByText("The most real place on the internet"),
  ).toBeVisible();

  await page.getByRole("button", { name: /register as a new user/i }).click();

  await expect(
    page.getByRole("heading", { name: /register as a new user/i }),
  ).toBeVisible();

  await page.locator("#firstName").fill("Play");
  await page.locator("#lastName").fill("Wright");
  await page.locator("#email").fill(email);
  await page.locator("#displayName").fill(displayName);
  await page.locator("#password").fill("Alpha!23456");
  await page.locator("#confirmPassword").fill("Alpha!23456");

  await page.getByRole("button", { name: /sign up/i }).click();

  await expect(
    page.getByText("The most real place on the internet"),
  ).toBeVisible();

  await page.getByRole("button", { name: /login as an existing user/i }).click();

  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Alpha!23456");

  await page.getByRole("button", { name: /^login$/i }).click();

  await expect(page.locator("#userProfileButton")).toContainText(displayName);
  await expect(page.getByText("All Posts")).toBeVisible();

  await page.locator("#createCommunityButton").click();

  await expect(
    page.getByRole("heading", { name: /create community/i }),
  ).toBeVisible();

  await page.locator("#communityName").fill(communityName);
  await page
    .locator("#communityDescription")
    .fill("This community was created by Playwright.");

  await page.getByRole("button", { name: /engender community/i }).click();

  await expect(
    page.getByRole("heading", { name: communityName, exact: true }),
  ).toBeVisible();
});
