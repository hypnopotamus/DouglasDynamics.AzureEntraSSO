import { test, expect } from '@playwright/test';

test('the front ends are running', async ({ page }) => {
  await page.goto('http://localhost:64634');
  await expect(page.getByText(/info:/)).toBeInViewport();

  await page.goto('http://localhost:64635');
  await expect(page).toHaveTitle(/dice/);
});
