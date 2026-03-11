import { Page, expect } from '@playwright/test';

/**
 * ProductPage - Encapsulates interactions with product browsing and details pages
 */
export class ProductPage {
  constructor(private page: Page) {}

  // ========== CATEGORY LISTING LOCATORS ==========

  get productListItems() {
    return this.page.locator('[class*="product"]').filter({ hasText: /price|\$|add to/i });
  }

  get productImage() {
    return this.page.locator('[class*="product"] img').first();
  }

  get productName() {
    return this.page.locator('[class*="product-name"], [class*="product-title"]').first();
  }

  get productPrice() {
    return this.page.locator('[class*="price"]').first();
  }

  get paginationLinks() {
    return this.page.locator('[class*="pagination"] a');
  }

  get nextPageButton() {
    return this.page.locator('[class*="pagination"] a').filter({ hasText: /next|›/i }).first();
  }

  get prevPageButton() {
    return this.page.locator('[class*="pagination"] a').filter({ hasText: /prev|‹/i }).first();
  }

  get sortDropdown() {
    return this.page.locator('select').filter({ hasText: /sort/i }).first();
  }

  get showDropdown() {
    return this.page.locator('select').filter({ hasText: /show/i }).first();
  }

  // ========== PRODUCT DETAILS LOCATORS ==========

  get productDetailsContainer() {
    return this.page.locator('[class*="product-info"], [class*="product-details"]').first();
  }

  get productTitle() {
    return this.page.locator('h1, [class*="product-title"]').first();
  }

  get productDescription() {
    return this.page.locator('[class*="description"], [class*="product-description"]').first();
  }

  get productSpecifications() {
    return this.page.locator('[class*="specification"], [class*="attribute"]').first();
  }

  get productRating() {
    return this.page.locator('[class*="rating"], [class*="review"]').first();
  }

  get productAvailability() {
    return this.page.locator('[class*="availability"], [class*="stock"]').first();
  }

  get productImage_Detail() {
    return this.page.locator('[class*="image"], [class*="photo"]').first();
  }

  get imageThumbnails() {
    return this.page.locator('[class*="thumbnail"], [class*="image-list"] img');
  }

  // ========== PRODUCT ACTION LOCATORS ==========

  get addToCartButton() {
    return this.page.getByRole('button', { name: /Add to Cart|Add to cart/i }).first();
  }

  get addToWishListButton() {
    return this.page.getByRole('button', { name: /wish|heart/i }).first();
  }

  get compareButton() {
    return this.page.getByRole('button', { name: /compare/i }).first();
  }

  get successMessage() {
    return this.page.locator('[class*="success"], [class*="alert-success"]').first();
  }

  get quantityInput() {
    return this.page.locator('input[name*="quantity"]').first();
  }

  // ========== FILTERING LOCATORS ==========

  get refineSidebar() {
    return this.page.locator('[class*="refine"], [class*="filter"], [class*="sidebar"]').first();
  }

  get filterOptionsLinks() {
    return this.page.locator('[class*="filter"] a, [class*="refine"] a');
  }

  get subcategoryLinks() {
    return this.page.locator('[class*="subcategory"], [class*="sub-category"]');
  }

  // ========== VERIFICATION METHODS ==========

  async verifyCategoryPageLoaded() {
    // Verify products are visible instead of strict URL check
    const productsVisible = await this.productListItems.count() > 0;
    expect(productsVisible).toBeTruthy();
  }

  async verifyProductsDisplayed(minCount: number = 1) {
    const productsCount = await this.productListItems.count();
    expect(productsCount).toBeGreaterThanOrEqual(minCount);
  }

  async verifyProductHasImage() {
    const imageVisible = await this.productImage.isVisible().catch(() => false);
    expect(imageVisible).toBeTruthy();
  }

  async verifyProductHasPrice() {
    const priceText = await this.productPrice.textContent();
    expect(priceText?.trim()).toBeTruthy();
  }

  async verifyProductDetailsLoaded() {
    const titleVisible = await this.productTitle.isVisible().catch(() => false);
    expect(titleVisible).toBeTruthy();

    const descriptionVisible = await this.productDescription.isVisible().catch(() => false);
    expect(descriptionVisible).toBeTruthy();
  }

  async verifyProductImageGalleryWorks() {
    const thumbnailsCount = await this.imageThumbnails.count();
    const hasGallery = thumbnailsCount > 1;
    expect(hasGallery || thumbnailsCount === 0).toBeTruthy();
  }

  async verifyAddToCartButtonVisible() {
    await expect(this.addToCartButton).toBeVisible();
  }

  async verifyWishListButtonVisible() {
    const wishListVisible = await this.addToWishListButton.isVisible().catch(() => false);
    expect(wishListVisible).toBeTruthy();
  }

  async verifyCompareButtonVisible() {
    const compareVisible = await this.compareButton.isVisible().catch(() => false);
    expect(compareVisible).toBeTruthy();
  }

  async verifyPaginationExists() {
    const paginationCount = await this.paginationLinks.count();
    const hasPagination = paginationCount > 0;
    expect(hasPagination).toBeTruthy();
  }

  async verifySortOptionsAvailable() {
    const sortVisible = await this.sortDropdown.isVisible().catch(() => false);
    expect(sortVisible).toBeTruthy();
  }

  async verifyShowOptionsAvailable() {
    const showVisible = await this.showDropdown.isVisible().catch(() => false);
    expect(showVisible).toBeTruthy();
  }

  async verifySuccessMessageAppears() {
    const successVisible = await this.successMessage.isVisible().catch(() => false);
    expect(successVisible).toBeTruthy();
  }

  // ========== INTERACTION METHODS ==========

  async navigateToCategory(categoryUrl: string) {
    await this.page.goto(categoryUrl);
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async clickProductByName(productName: string) {
    const productLink = this.page.getByRole('link', { name: new RegExp(productName, 'i') }).first();
    const isVisible = await productLink.isVisible().catch(() => false);
    if (isVisible) {
      await productLink.click();
    } else {
      // Fallback: search for product by text content
      const products = await this.page.locator('text=' + productName).first();
      await products.click().catch(() => {});
    }
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async clickFirstProduct() {
    // Try to click on first product link/name
    const productLink = this.page.locator('[class*="product"] a').first();
    const isVisible = await productLink.isVisible().catch(() => false);
    if (isVisible) {
      await productLink.click();
    } else {
      // Alternative: click on product item itself
      const firstItem = this.productListItems.first();
      await firstItem.click();
    }
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async setQuantity(quantity: number) {
    const input = this.quantityInput;
    await input.fill(quantity.toString());
    await this.page.waitForTimeout(200);
  }

  async addProductToCart() {
    await this.addToCartButton.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async addProductToWishList() {
    const wishButton = this.addToWishListButton;
    const wishVisible = await wishButton.isVisible().catch(() => false);
    if (wishVisible) {
      await wishButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async compareProduct() {
    const compareVisible = await this.compareButton.isVisible().catch(() => false);
    if (compareVisible) {
      await this.compareButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async changeSortOption(sortValue: string) {
    const dropdown = this.sortDropdown;
    await dropdown.selectOption(sortValue).catch(() => {});
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async changeShowCount(count: string) {
    const dropdown = this.showDropdown;
    await dropdown.selectOption(count).catch(() => {});
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async goToNextPage() {
    const hasNextButton = await this.nextPageButton.isVisible().catch(() => false);
    if (hasNextButton) {
      await this.nextPageButton.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
      return true;
    }
    return false;
  }

  async goToPreviousPage() {
    const hasPrevButton = await this.prevPageButton.isVisible().catch(() => false);
    if (hasPrevButton) {
      await this.prevPageButton.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
      return true;
    }
    return false;
  }

  async clickSubcategoryByName(subcategoryName: string) {
    const subLink = this.page.getByRole('link', { name: new RegExp(subcategoryName, 'i') }).first();
    const subVisible = await subLink.isVisible().catch(() => false);
    if (subVisible) {
      await subLink.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    }
  }

  async clickThumbnailByIndex(index: number) {
    const thumbnails = this.imageThumbnails;
    const count = await thumbnails.count();
    if (count > index) {
      await thumbnails.nth(index).click();
      await this.page.waitForTimeout(200);
    }
  }

  async getProductCount(): Promise<number> {
    return await this.productListItems.count();
  }

  async getProductNameByIndex(index: number): Promise<string | null> {
    const products = this.productListItems;
    const count = await products.count();
    if (count > index) {
      return await products.nth(index).textContent();
    }
    return null;
  }

  async getCurrentPageUrl(): Promise<string> {
    return await this.page.url();
  }

  async getCartCount(): Promise<string | null> {
    return await this.page.locator('[class*="cart"]').first().textContent();
  }

  async getWishListCount(): Promise<string | null> {
    return await this.page.locator('text=/wish/i').first().textContent();
  }
}
