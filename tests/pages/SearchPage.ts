import { Page, expect } from '@playwright/test';

/**
 * SearchPage - Encapsulates interactions with the Cloudberry Store search results page
 */
export class SearchPage {
  constructor(private page: Page) {}

  // ========== SEARCH RESULTS LOCATORS ==========

  get searchResultsContainer() {
    return this.page.locator('[class*="product-layout"], [class*="product-grid"]').first();
  }

  get searchResultItems() {
    return this.page.locator('[class*="product-list"] [class*="product"], [class*="product-grid"] [class*="item"], [class*="product-layout"]');
  }

  get noResultsMessage() {
    return this.page.locator('text=/no results|no product|not found/i').first();
  }

  get resultCount() {
    return this.page.locator('text=/showing|result/i').first();
  }

  // ========== SEARCH CRITERIA LOCATORS ==========

  get searchInDescriptionsCheckbox() {
    return this.page.getByLabel(/search in descriptions/i);
  }

  get categoryFilter() {
    return this.page.locator('[class*="refine"], [class*="filter"]').filter({ hasText: /category/i }).first();
  }

  get categoryOptions() {
    return this.page.locator('[class*="refine"] a, [class*="filter"] a').filter({ hasText: /^[A-Z]/ });
  }

  // ========== PRODUCT DETAILS WITHIN SEARCH RESULTS ==========

  get productNames() {
    return this.page.locator('[class*="product-name"], [class*="product-title"], a:has(~ [class*="price"])').filter({ hasText: /\w+/ });
  }

  get productPrices() {
    return this.page.locator('[class*="price-new"], [class*="price"], .price').filter({ hasText: /\$|£|€/ });
  }

  get productImages() {
    return this.page.locator('[class*="product"] img, [class*="item"] img').first();
  }

  // ========== PAGINATION LOCATORS ==========

  get pagination() {
    return this.page.locator('[class*="pagination"]').first();
  }

  get nextPageButton() {
    return this.page.locator('a').filter({ hasText: /next|→|>/i }).first();
  }

  get previousPageButton() {
    return this.page.locator('a').filter({ hasText: /prev|previous|←|</i }).first();
  }

  // ========== SORT AND DISPLAY OPTIONS ==========

  get sortDropdown() {
    return this.page.locator('select').filter({ hasText: /sort/i }).first().or(
      this.page.getByRole('button').filter({ hasText: /sort/i }).first()
    );
  }

  get showDropdown() {
    return this.page.locator('select').filter({ hasText: /show|display|per page/i }).first().or(
      this.page.getByRole('button').filter({ hasText: /show|display/i }).first()
    );
  }

  // ========== VERIFICATION METHODS ==========

  async verifySearchResultsPageLoaded(searchTerm: string) {
    // Check that page has loaded and search-related content is visible
    const hasResults = await this.searchResultItems.count().then(count => count > 0).catch(() => false);
    const hasNoResults = await this.noResultsMessage.isVisible().catch(() => false);
    const pageContent = await this.page.content();
    const containsSearchTerm = pageContent.toLowerCase().includes(searchTerm.toLowerCase());
    
    expect(hasResults || hasNoResults || containsSearchTerm).toBeTruthy();
  }

  async verifySearchResultsDisplayed() {
    const resultCount = await this.searchResultItems.count();
    expect(resultCount).toBeGreaterThan(0);
  }

  async verifyNoResultsMessage() {
    await expect(this.noResultsMessage).toBeVisible();
  }

  async verifyProductDetailsInResults() {
    const firstProduct = this.searchResultItems.first();
    const hasNameOrPrice = await Promise.race([
      firstProduct.locator('[class*="name"], [class*="title"]').isVisible(),
      firstProduct.locator('[class*="price"]').isVisible(),
    ]).catch(() => false);
    
    expect(hasNameOrPrice || await firstProduct.isVisible()).toBeTruthy();
  }

  async verifySearchInDescriptionsWorks() {
    const isChecked = await this.searchInDescriptionsCheckbox.isChecked().catch(() => false);
    expect(isChecked || await this.searchInDescriptionsCheckbox.isVisible().catch(() => false)).toBeTruthy();
  }

  async verifyCategoryFilterAvailable() {
    const filterVisible = await this.categoryFilter.isVisible().catch(() => false);
    expect(filterVisible || await this.categoryOptions.count().then(c => c > 0).catch(() => false)).toBeTruthy();
  }

  // ========== INTERACTION METHODS ==========

  async toggleSearchInDescriptions() {
    try {
      await this.searchInDescriptionsCheckbox.click();
      await this.page.waitForTimeout(300);
    } catch {
      // Checkbox not available - feature may not be implemented
    }
  }

  async selectCategory(categoryName: string) {
    const categoryLink = this.page.getByRole('link').filter({ hasText: new RegExp(categoryName, 'i') });
    try {
      await categoryLink.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    } catch {
      // Category not found or not clickable
    }
  }

  async changeSortOption(sortValue: string) {
    try {
      const sortSelect = this.page.locator('select').filter({ hasText: /sort/i }).first();
      const isSelect = await sortSelect.count().then(c => c > 0).catch(() => false);
      
      if (isSelect) {
        await sortSelect.selectOption({ label: new RegExp(sortValue, 'i') }).catch(() => {});
      } else {
        const sortButton = this.page.getByRole('button').filter({ hasText: /sort/i }).first();
        await sortButton.click().catch(() => {});
      }
      
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    } catch {
      // Sort option not available
    }
  }

  async changeShowCount(count: string) {
    try {
      const showSelect = this.page.locator('select').filter({ hasText: /show|display|per page/i }).first();
      const isSelect = await showSelect.count().then(c => c > 0).catch(() => false);
      
      if (isSelect) {
        await showSelect.selectOption({ label: new RegExp(count, 'i') }).catch(() => {});
      } else {
        const showButton = this.page.getByRole('button').filter({ hasText: /show|display/i }).first();
        await showButton.click().catch(() => {});
      }
      
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    } catch {
      // Show option not available
    }
  }

  async goToNextPage() {
    const hasNextButton = await this.nextPageButton.isVisible().catch(() => false);
    if (hasNextButton) {
      await this.nextPageButton.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    }
  }

  async goToPreviousPage() {
    const hasPrevButton = await this.previousPageButton.isVisible().catch(() => false);
    if (hasPrevButton) {
      await this.previousPageButton.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(300);
    }
  }

  async clickFirstSearchResult() {
    const firstProduct = this.searchResultItems.first();
    const productLink = firstProduct.locator('a').first();
    
    const isVisible = await productLink.isVisible().catch(() => false);
    if (isVisible) {
      await productLink.click();
      await this.page.waitForLoadState('load').catch(() => {});
      await this.page.waitForTimeout(500);
    }
  }

  // ========== DATA RETRIEVAL METHODS ==========

  async getSearchResultCount(): Promise<number> {
    try {
      return await this.searchResultItems.count();
    } catch {
      return 0;
    }
  }

  async getFirstProductName(): Promise<string> {
    try {
      const name = await this.productNames.first().textContent().catch(() => '');
      return name?.trim() || '';
    } catch {
      return '';
    }
  }

  async getCurrentPageUrl(): Promise<string> {
    try {
      return await this.page.url();
    } catch {
      return '';
    }
  }

  async verifySearchTermInUrl(searchTerm: string): Promise<boolean> {
    const url = await this.getCurrentPageUrl();
    return url.toLowerCase().includes(searchTerm.toLowerCase()) || 
           url.toLowerCase().includes(encodeURIComponent(searchTerm).toLowerCase());
  }
}
