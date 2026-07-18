import { test as base } from '@playwright/test';

import { AppPageObject } from '../page-objects/app.po';

type E2EFixtures = {
  appPage: AppPageObject;
};

export const test = base.extend<E2EFixtures>({
  appPage: async ({ page }, use) => {
    const appPage = new AppPageObject(page);
    await use(appPage);
  },
});

export { expect } from '@playwright/test';
