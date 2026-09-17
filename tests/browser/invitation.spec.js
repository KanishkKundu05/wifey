import { test, expect } from '@playwright/test';

test('valid email transitions to pink and optional address saves with the same token', async ({ page }) => {
  const requests = [];
  await page.route('**/api/mutation', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { status: 'success', value: null } });
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Your email address' }).fill('not-an-email');
  await page.getByRole('textbox', { name: 'Your email address' }).press('Enter');
  await expect(page.getByRole('heading')).toHaveText('Come to my wedding?');
  expect(requests).toHaveLength(0);
  await page.getByRole('textbox', { name: 'Your email address' }).fill('guest@example.com');
  await page.getByRole('textbox', { name: 'Your email address' }).press('Enter');
  await expect(page.getByRole('heading')).toContainText('in (hopefully) ~5 years');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 220, 227)');
  await page.getByLabel('Address (optional)').fill('123 Test St\nDelhi, India');
  await page.getByRole('button', { name: 'Save address' }).click();
  await expect(page.getByRole('status').last()).toContainText('Address saved.');
  expect(requests[1].args[0].token).toBe(requests[0].args[0].token);
});

test('failed saves show an error and allow retry', async ({ page }) => {
  await page.route('**/api/mutation', (route) => route.fulfill({ json: { status: 'error', errorMessage: 'Unavailable' } }));
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Your email address' }).fill('guest@example.com');
  await page.getByRole('textbox', { name: 'Your email address' }).press('Enter');
  await expect(page.getByRole('status').first()).toContainText('Couldn’t save your email');
  await expect(page.getByRole('heading')).toHaveText('Come to my wedding?');
  await expect(page.getByRole('button', { name: 'Submit email' })).toBeEnabled();
});
