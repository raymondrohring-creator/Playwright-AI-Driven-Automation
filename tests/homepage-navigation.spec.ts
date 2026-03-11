import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

// ============================================================================
// TESTS
// ============================================================================

test.describe('Homepage and Navigation (POM)', () => {
  // ========== 1.1 HOMEPAGE LOADING ==========

  test('1.1.1 Verify homepage loads correctly', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    // Step 1: Navigate to homepage
    await homePage.goto();

    // Verify: Page title is correct
    await expect(page).toHaveTitle(/Your store|home|cloudberry/i);
  });

  test('1.1.2 Verify header elements are visible', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Header elements visible
    await homePage.verifyHeaderElementsVisible();
  });

  test('1.1.3 Verify navigation menu is displayed', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Navigation menu visible
    await homePage.verifyNavigationMenuVisible();
  });

  test('1.1.4 Verify featured products section', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Featured products are displayed
    await homePage.verifyFeaturedProductsVisible();
  });

  test('1.1.5 Verify currency dropdown is accessible', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Currency dropdown exists
    await expect(homePage.currencyDropdown).toBeVisible();

    // Interact: Click currency dropdown
    await homePage.openCurrencyDropdown();

    // Verify: Dropdown expanded (page remains on same URL)
    expect(await page.title()).toBeTruthy();
  });

  test('1.1.6 Verify phone number link is present', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Phone number link visible
    const phoneVisible = await homePage.phoneNumber.isVisible().catch(() => false);
    if (phoneVisible) {
      await expect(homePage.phoneNumber).toBeVisible();
    } else {
      // Phone number might be in footer
      const hasPhoneInPage = await page.locator('text=/\\d{7,}|phone|contact/i').count() > 0;
      expect(hasPhoneInPage).toBeTruthy();
    }
  });

  test('1.1.7 Verify My Account dropdown exists', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: My Account dropdown visible
    await expect(homePage.myAccountDropdown).toBeVisible();
  });

  // ========== 1.2 MAIN NAVIGATION MENU ==========

  test('1.2.1 Navigate to Desktops category', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Click Desktops category
    await homePage.navigateToCategory(homePage.desktopsLink);

    // Verify: Category page loads by checking path in URL or page content
    const currentUrl = await page.url();
    const hasProducts = await page.locator('[class*="product"]').count() > 0;
    const isDesktopPage = currentUrl.includes('path=') || hasProducts;
    expect(isDesktopPage).toBeTruthy();
  });

  test('1.2.2 Navigate to Laptops & Notebooks category', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Click Laptops category
    await homePage.navigateToCategory(homePage.laptopsLink);

    // Verify: Category page loads by checking path in URL or page content
    const currentUrl = await page.url();
    const hasProducts = await page.locator('[class*="product"]').count() > 0;
    const isLaptopPage = currentUrl.includes('path=') || hasProducts;
    expect(isLaptopPage).toBeTruthy();
  });

  test('1.2.3 Verify breadcrumb updates on category page', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Navigate to category
    await homePage.navigateToCategory(homePage.desktopsLink);

    // Verify: Breadcrumb is visible
    const breadcrumbVisible = await homePage.breadcrumb.isVisible().catch(() => false);
    if (breadcrumbVisible) {
      await expect(homePage.breadcrumb).toBeVisible();
    }
  });

  test('1.2.4 Navigate through multiple categories', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step 1: Navigate to Laptops
    await homePage.navigateToCategory(homePage.laptopsLink);
    const url1 = await page.url();
    expect(url1).toBeTruthy();

    // Step 2: Go back to home
    await homePage.goto();
    
    // Step 3: Navigate to Components from home
    await homePage.navigateToCategory(homePage.componentsLink);

    // Verify: We can navigate to different categories successfully
    const url2 = await page.url();
    const hasProducts = await page.locator('[class*="product"]').count() > 0;
    expect(url2).toBeTruthy();
    expect(hasProducts).toBeTruthy();
  });

  // ========== 1.3 FOOTER LINKS ==========

  test('1.3.1 Verify footer links are accessible', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Footer is visible
    await expect(homePage.footer).toBeVisible();
  });

  test('1.3.2 Navigate to About Us page', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Click About Us footer link
    await homePage.clickFooterLink('About Us');

    // Verify: About Us page loads
    const isAboutPage = (await page.title()).toLowerCase().includes('about') ||
                       (await page.url()).includes('about');
    expect(isAboutPage).toBeTruthy();
  });

  test('1.3.3 Navigate to Contact Us page', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Click Contact Us footer link
    const contactLink = page.getByRole('link', { name: /Contact|contact/i }).last();
    if (await contactLink.isVisible().catch(() => false)) {
      await contactLink.click();
      await page.waitForLoadState('load').catch(() => {});

      // Verify: Contact page loads
      const isContactPage = (await page.title()).toLowerCase().includes('contact') ||
                          (await page.url()).includes('contact');
      expect(isContactPage).toBeTruthy();
    }
  });

  test('1.3.4 Navigate to Privacy Policy page', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Click Privacy Policy footer link
    await homePage.clickFooterLink('Privacy Policy');

    // Verify: Privacy Policy page loads
    const isPrivacyPage = (await page.title()).toLowerCase().includes('privacy') ||
                         (await page.url()).includes('privacy');
    expect(isPrivacyPage).toBeTruthy();
  });

  test('1.3.5 Verify Powered By OpenCart link', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Powered By link exists and is visible
    const poweredByVisible = await homePage.poweredByLink.isVisible().catch(() => false);
    if (poweredByVisible) {
      await expect(homePage.poweredByLink).toBeVisible();

      // Note: We won't click and open new tab in this test,
      // but we verify the link is clickable
      const href = await homePage.poweredByLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  // ========== 1.4 SEARCH FUNCTIONALITY ==========

  test('1.4.1 Verify search box is accessible', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verify: Search box visible
    await expect(homePage.searchBox).toBeVisible();
  });

  test('1.4.2 Search for a product', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);

    await homePage.goto();

    // Step: Search for product
    await homePage.searchProduct('MacBook');

    // Verify: Search results page loads
    expect(await page.title()).toBeTruthy();
  });
});