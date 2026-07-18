import { Locator, Page } from '@playwright/test';

export class AppPageObject {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    // Accessible locator prioritizing the level 1 heading role
    this.title = page.getByRole('heading', { level: 1 });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }
}
