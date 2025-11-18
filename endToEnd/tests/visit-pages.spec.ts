import { test, expect } from '@playwright/test';
import fs from 'fs'
import path from 'path';

const readPortFiles = (): Record<string, string> =>
  fs.readdirSync("../DouglasDynamics.AzureEntraSSO.AppHost", { withFileTypes: true })
    .filter(f => f.isFile() && path.extname(f.name) === ".port")
    .reduce((ports, file) => ({ ...ports, [file.name.split('.')[0]]: fs.readFileSync(path.join(file.parentPath, file.name), { encoding: 'utf8' }) }), {});

test('the front ends are running', async ({ page }) => {
  const { frontend, dicefrontend } = readPortFiles()

  await page.goto(frontend);
  await expect(page.getByText(/info:/)).toBeInViewport();

  await page.goto(dicefrontend);
  await expect(page).toHaveTitle(/dice/);
});
