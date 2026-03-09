import { Page, expect } from '@playwright/test';

/**
 * WishListPage - Encapsulates wish list interactions and verifications
 */
export class WishListPage {
  constructor(private page: Page) {}

  // ========== LOCATORS ==========

  get wishListLink() {
    // Use .last() to get the main visible link when multiple match
    return this.page.getByRole('link', { name: /wish list/i }).last();
  }

  get wishListTable() {
    return this.page.locator('table');
  }

  get wishListItems() {
    return this.page.locator('table tbody tr');
  }

  get emptyWishListMessage() {
    return this.page.locator('text=/wish list is empty|nothing in wish list/i');
  }

  get addToCartButtons() {
    return this.page.getByRole('button', { name: /add to cart/i });
  }

  getRemoveButton(productName: string) {
    return this.wishListItems.filter({ hasText: productName }).locator('button[title*="Remove"]').first();
  }

  getProductRow(productName: string) {
    return this.wishListItems.filter({ hasText: productName }).first();
  }

  // ========== VERIFICATION METHODS ==========

  async verifyWishListPageLoaded() {
    await expect(this.page).toHaveTitle(/wish list/i);
  }

  async verifyWishListEmpty() {
    await expect(this.emptyWishListMessage).toBeVisible();
  }

  async verifyWishListNotEmpty() {
    await expect(this.emptyWishListMessage).not.toBeVisible();
  }

  async verifyItemInWishList(productName: string, price?: string) {
    const productRow = this.getProductRow(productName);
    await expect(productRow).toBeVisible();
    await expect(productRow).toContainText(productName);
    
    if (price) {
      await expect(productRow).toContainText(price);
    }
  }

  async verifyAddToCartButtonVisible(productName: string) {
    const productRow = this.getProductRow(productName);
    const addButton = productRow.getByRole('button', { name: /add to cart/i });
    await expect(addButton).toBeVisible();
  }

  async verifyWishListItemCount(expectedCount: number) {
    const items = await this.wishListItems.count();
    expect(items).toBe(expectedCount);
  }

  // ========== INTERACTION METHODS ==========

  async navigateToWishList() {
    // Navigate directly to the wish list page
    const baseUrl = this.page.url();
    const wishListUrl = new URL('index.php?route=account/wishlist&language=en-gb', baseUrl).toString();
    await this.page.goto(wishListUrl);
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async removeItem(productName: string) {
    const removeButton = this.getRemoveButton(productName);
    await removeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async addItemToCartFromWishList(productName: string) {
    const productRow = this.getProductRow(productName);
    const addButton = productRow.getByRole('button', { name: /add to cart/i });
    await addButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getItemCount(): Promise<number> {
    const items = await this.wishListItems.count();
    return items;
  }
}
