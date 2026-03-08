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
    await this.page.waitForLoadState('networkidle');
  }

  async addToCart() {
    await this.page.getByRole('button', { name: 'Add to Cart' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToCheckout() {
    await Promise.all([
      this.page.waitForURL(/checkout\//),
      this.page.getByRole('link', { name: ' Checkout' }).click()
    ]);
  }
}