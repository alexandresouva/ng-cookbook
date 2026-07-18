import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('App Landing Page', () => {
  test('should display the main application heading', async ({ appPage }) => {
    await appPage.navigate();
    await expect(appPage.title).toBeVisible();
    await expect(appPage.title).toHaveText('ng-cookbook');
  });
});
