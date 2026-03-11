import { Page, expect } from '@playwright/test';

/**
 * HomePage - Encapsulates interactions with the Cloudberry Store homepage
 */
export class HomePage {
  constructor(private page: Page) {}

  // ========== HEADER LOCATORS ==========

  get logo() {
    return this.page.getByRole('link', { name: /Your Store/i });
  }

  get searchBox() {
    return this.page.getByRole('textbox', { name: /search/i });
  }

  get searchButton() {
    return this.page.locator('button').filter({ hasText: '' }).first();
  }

  get cartButton() {
    return this.page.getByRole('button').filter({ hasText: /item|cart|\$/i }).first();
  }

  get currencyDropdown() {
    return this.page.getByRole('link').filter({ hasText: /\$|Currency/i }).first();
  }

  get phoneNumber() {
    return this.page.getByRole('link').filter({ hasText: /\d{9,}/ }).first();
  }

  get myAccountDropdown() {
    return this.page.getByRole('link', { name: /My Account/i }).first();
  }

  // ========== NAVIGATION LOCATORS ==========

  get navigationMenu() {
    return this.page.locator('nav').first();
  }

  get desktopsLink() {
    return this.page.getByRole('link', { name: /Desktops/i }).first();
  }

  get laptopsLink() {
    return this.page.getByRole('link', { name: /Laptops/i }).first();
  }

  get componentsLink() {
    return this.page.getByRole('link', { name: /Components/i }).first();
  }

  get tabletsLink() {
    return this.page.getByRole('link', { name: /Tablets/i }).first();
  }

  get softwareLink() {
    return this.page.getByRole('link', { name: /Software/i }).first();
  }

  // ========== FEATURED PRODUCTS LOCATORS ==========

  get featuredProductsSection() {
    return this.page.locator('[class*="featured"], [id*="featured"], div:has(> :is(h2, h3):text("Featured"))').first();
  }

  get productItems() {
    return this.page.locator('[class*="product"]').filter({ hasText: /price|\$|add to/i });
  }

  // ========== BREADCRUMB LOCATORS ==========

  get breadcrumb() {
    return this.page.locator('[class*="breadcrumb"]').first();
  }

  // ========== FOOTER LOCATORS ==========

  get footer() {
    return this.page.locator('footer').first();
  }

  getFooterLink(linkName: string) {
    return this.page.getByRole('link', { name: new RegExp(linkName, 'i') });
  }

  get poweredByLink() {
    return this.page.getByRole('link', { name: /OpenCart/i });
  }

  // ========== VERIFICATION METHODS ==========

  async verifyHomePageLoaded() {
    await expect(this.page).toHaveTitle(/Your store/i);
    await expect(this.logo).toBeVisible();
    await expect(this.searchBox).toBeVisible();
    await expect(this.cartButton).toBeVisible();
  }

  async verifyHeaderElementsVisible() {
    await expect(this.logo).toBeVisible();
    await expect(this.searchBox).toBeVisible();
    await expect(this.cartButton).toBeVisible();
    await expect(this.currencyDropdown).toBeVisible();
  }

  async verifyNavigationMenuVisible() {
    const navMenu = this.navigationMenu;
    await expect(navMenu).toBeVisible();
  }

  async verifyFeaturedProductsVisible() {
    const productsCount = await this.productItems.count();
    expect(productsCount).toBeGreaterThanOrEqual(4);
  }

  async verifyCategoryPageLoaded(categoryName: string) {
    await expect(this.page).toHaveTitle(new RegExp(categoryName, 'i'));
    await expect(this.breadcrumb).toBeVisible();
  }

  async verifyBreadcrumbContent(categoryName: string) {
    const breadcrumbText = await this.breadcrumb.textContent();
    expect(breadcrumbText?.toLowerCase()).toContain(categoryName.toLowerCase());
  }

  // ========== INTERACTION METHODS ==========

  async goto() {
    await this.page.goto('https://cloudberrystore.services/');
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
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

  async openCurrencyDropdown() {
    await this.currencyDropdown.click();
    await this.page.waitForTimeout(300);
  }

  async clickMyAccountDropdown() {
    await this.myAccountDropdown.click();
    await this.page.waitForTimeout(300);
  }

  async navigateToCategory(categoryLink: Page.Locator) {
    await categoryLink.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async clickFooterLink(linkName: string) {
    const link = this.getFooterLink(linkName);
    await link.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async clickPoweredByLink() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.poweredByLink.click()
    ]);
    return newPage;
  }

  async searchProduct(productName: string) {
    await this.searchBox.fill(productName);
    await this.searchButton.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(300);
  }
}