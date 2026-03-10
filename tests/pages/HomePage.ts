import { Page } from '@playwright/test';

/**
 * HomePage - Encapsulates interactions with the Cloudberry Store homepage
 */
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://cloudberrystore.services/');
  }

  async selectProduct(productName: string) {
    await this.page.getByRole('link', { name: productName }).first().click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async addToCart() {
    await this.page.getByRole('button', { name: 'Add to Cart' }).click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async goToCheckout() {
    await Promise.all([
      this.page.waitForURL(/checkout\//),
      this.page.getByRole('link', { name: ' Checkout' }).click()
    ]);
  }
}