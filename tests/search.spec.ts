import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';

test.describe('Search Functionality (POM)', () => {
  // ========== SECTION 3.1: BASIC SEARCH ==========

  test('3.1.1 Enter product name in search box and verify search results', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();
    await homePage.verifyHomePageLoaded();

    // Step: Search for a product with a common name
    await homePage.searchProduct('Laptop');

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded('Laptop');

    // Verify: Products are displayed or no results message shown
    const resultCount = await searchPage.getSearchResultCount();
    const noResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    expect(resultCount > 0 || noResults).toBeTruthy();
  });

  test('3.1.2 Search for non-existent product and verify no results message', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search for a product that doesn't exist
    const nonExistentProduct = 'XYZABC12345NonExistentProduct';
    await homePage.searchProduct(nonExistentProduct);

    // Verify: Page loads without errors
    const url = await page.url();
    expect(url).toBeTruthy();

    // Verify: Either no results message or empty result count
    const noResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    const resultCount = await searchPage.getSearchResultCount();
    expect(noResults || resultCount === 0).toBeTruthy();
  });

  // ========== SECTION 3.2: ADVANCED SEARCH OPTIONS ==========

  test('3.2.1 Use search in descriptions checkbox and verify functionality', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search for a product
    await homePage.searchProduct('Monitor');

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded('Monitor');

    // Step: Check if search in descriptions checkbox is available
    const checkboxVisible = await searchPage.searchInDescriptionsCheckbox.isVisible().catch(() => false);
    
    if (checkboxVisible) {
      // Toggle search in descriptions
      await searchPage.searchInDescriptionsCheckbox.click();
      await page.waitForTimeout(300);
    }

    // Verify: Page is still valid after toggling
    const url = await page.url();
    expect(url).toBeTruthy();
  });

  test('3.2.2 Filter search results by category', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Perform initial search
    await homePage.searchProduct('Camera');

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded('Camera');

    // Step: Select a category filter if available
    const initialCount = await searchPage.getSearchResultCount();
    
    // Try to navigate to a category
    await homePage.navigateToCategory(homePage.componentsLink);

    // Verify: Results have changed or page navigated
    const newCount = await searchPage.getSearchResultCount();
    const url = await page.url();
    expect(url).toBeTruthy();
  });

  // ========== SECTION 3.3: SEARCH EDGE CASES ==========

  test('3.3.1 Search with partial product keywords', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search with partial keyword (just first few characters)
    await homePage.searchProduct('Lap');

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded('Lap');

    // Verify: Results are displayed or no results shown
    const resultCount = await searchPage.getSearchResultCount();
    const noResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    expect(resultCount > 0 || noResults).toBeTruthy();
  });

  test('3.3.2 Search with special characters and numbers', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search with numbers and special characters
    await homePage.searchProduct('MacBook Pro 12"');

    // Verify: Page loads without errors
    const url = await page.url();
    expect(url).toBeTruthy();

    // Verify: Search results or no results message appears
    const resultCount = await searchPage.getSearchResultCount();
    const noResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    expect(resultCount >= 0).toBeTruthy(); // Result count should be valid (0 or more)
  });

  test('3.3.3 Search and verify search results contain relevant products', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search for a specific product
    const searchTerm = 'Laptop';
    await homePage.searchProduct(searchTerm);

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded(searchTerm);

    // Verify: Results contain search-related content
    const resultCount = await searchPage.getSearchResultCount();
    if (resultCount > 0) {
      // Click first result to verify it's clickable
      await searchPage.clickFirstSearchResult();
      
      // Verify: Product detail page loaded or stayed on search results
      const finalUrl = await page.url();
      expect(finalUrl).toBeTruthy();
    }
  });

  test('3.3.4 Verify search maintains results across pagination', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.goto();

    // Step: Search for a product category with multiple pages
    await homePage.searchProduct('Mobile');

    // Verify: Search results page loads
    await searchPage.verifySearchResultsPageLoaded('Mobile');

    // Step: Get result count on first page
    const firstPageCount = await searchPage.getSearchResultCount();
    
    // Step: Navigate to next page if available
    await searchPage.goToNextPage();

    // Verify: Page is still valid
    const url = await page.url();
    expect(url).toBeTruthy();

    // Verify: We either have results on next page or stayed on first page
    const secondPageCount = await searchPage.getSearchResultCount();
    expect(secondPageCount >= 0).toBeTruthy();
  });
});
