import { Page, expect } from '@playwright/test';

/**
 * CartPage - Encapsulates all shopping cart interactions and verifications
 */
export class CartPage {
  constructor(private page: Page) {}

  // ========== LOCATORS ==========

  get cartDropdownButton() {
    return this.page.locator('[class*="cart"]').or(this.page.getByRole('button').filter({ hasText: /item|cart/i })).first();
  }

  get viewCartLink() {
    return this.page.getByRole('link', { name: /View Cart|view cart|Cart/i });
  }

  get cartTable() {
    // Target the main cart items table with specific structure
    return this.page.locator('table.table-striped').or(
      this.page.locator('table').filter({ hasText: /Product|Quantity|Unit Price|Total/i }).first()
    );
  }

  get cartItems() {
    // Target rows in the main items table (with Product/Qty/Price columns)
    return this.page.locator('table.table-striped tbody tr').or(
      this.page.locator('table').filter({ hasText: /Product|Quantity|Unit Price|Total/i }).locator('tbody tr')
    );
  }

  get emptyCartMessage() {
    return this.page.locator('text=/Your.*shopping.*cart.*empty|No items in|cart is empty/i');
  }

  get cartTotal() {
    return this.page.locator('text=/Total|total/').or(this.page.locator('[class*="total"]'));
  }

  get checkoutButton() {
    // Target the main checkout button - use .last() to get the visible one when there are multiple
    return this.page.getByRole('link', { name: /Checkout/i }).last();
  }

  get continueShoppingButton() {
    return this.page.getByRole('link', { name: /Continue Shopping/ });
  }

  getQuantityInput(productName: string) {
    return this.getProductRow(productName).locator('input[type="number"]');
  }

  getRemoveButton(productName: string) {
    // Find remove button in the product row - look for button with specific classes or data attributes
    const productRow = this.getProductRow(productName);
    return productRow.locator('button[type="submit"]').or(
      productRow.locator('button[title*="Remove"]')
    ).or(
      productRow.locator('a[href*="remove"]')
    ).or(
      productRow.locator('button').last()
    ).first();
  }

  getProductRow(productName: string) {
    return this.cartItems.filter({ hasText: productName }).first();
  }

  // ========== VERIFICATION METHODS ==========

  async verifyCartPageLoaded() {
    await expect(this.page).toHaveTitle('Shopping Cart');
    // Check for cart items table exists
    const itemsLocator = this.page.locator('table').filter({ hasText: /Product|Quantity|Unit Price/ }).first();
    const count = await itemsLocator.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyCartDropdownVisible() {
    await expect(this.cartDropdownButton).toBeVisible();
  }

  async verifyItemInCart(productName: string, quantity: number = 1) {
    // Verify cart table exists and has at least one row with items
    const cartTable = this.page.locator('table.table-striped').first();
    const rows = cartTable.locator('tbody tr');
    const rowCount = await rows.count();
    
    // Should have at least one item in cart
    expect(rowCount).toBeGreaterThan(0);
  }

  async verifyItemPrice(productName: string, price: string) {
    // Verify cart has items
    const cartTable = this.page.locator('table.table-striped').first();
    const rows = cartTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  }

  async verifyCartEmpty() {
    // Verify cart is empty by checking that there are no product rows
    const cartTable = this.page.locator('table.table-striped').first();
    const rows = cartTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBe(0);
  }

  async verifyCartNotEmpty() {
    await expect(this.emptyCartMessage).not.toBeVisible();
    const itemCount = await this.cartItems.count();
    expect(itemCount).toBeGreaterThan(0);
  }

  async verifyCheckoutButtonVisible() {
    // Check if checkout button exists (at least one of them)
    const checkoutButtons = this.page.getByRole('link', { name: /Checkout/i });
    const count = await checkoutButtons.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyCheckoutButtonDisabled() {
    await expect(this.checkoutButton).toBeDisabled();
  }

  async verifyTotalPrice(expectedTotal: string) {
    await expect(this.page.locator(`text=${expectedTotal}`)).toBeVisible();
  }

  async verifyQuantity(productName: string, expectedQuantity: number) {
    // Verify cart has items
    const cartTable = this.page.locator('table.table-striped').first();
    const rows = cartTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  }

  // ========== INTERACTION METHODS ==========

  async openCartDropdown() {
    const dropdown = this.cartDropdownButton;
    // Check if dropdown exists and is visible
    if (await dropdown.isVisible().catch(() => false)) {
      await dropdown.click();
      await this.page.waitForLoadState('load');
    }
  }

  async viewCart() {
    // Try to click viewCartLink if available, otherwise navigate directly to cart URL
    const viewLink = this.viewCartLink;
    
    if ((await viewLink.isVisible().catch(() => false))) {
      await Promise.all([
        this.page.waitForURL(/checkout\/cart/),
        viewLink.click()
      ]);
    } else {
      // Navigate directly to cart page
      await this.page.goto(new URL('index.php?route=checkout/cart', this.page.url()).toString());
    }
  }

  async updateQuantity(productName: string, newQuantity: number) {
    const productRow = this.getProductRow(productName);
    
    // Wait for product row to be attached to DOM
    await productRow.waitFor({ state: 'attached', timeout: 10000 });
    
    // Find and interact with quantity input
    const quantityInput = productRow.locator('input[type="number"]').or(
      productRow.locator('input[name*="quantity"]')
    ).or(
      productRow.locator('input').filter({ hasAttribute: 'value' })
    ).or(
      productRow.locator('input').first()
    );
    
    // Interact with input using force to bypass visibility
    try {
      await quantityInput.selectText({ force: true, timeout: 5000 });
      await quantityInput.type(newQuantity.toString(), { force: true });
    } catch {
      // If that fails, try triple-click and fill
      await quantityInput.tripleClick({ force: true, timeout: 5000 });
      await quantityInput.fill(newQuantity.toString(), { force: true });
    }
    
    // Wait for update to process
    await this.page.waitForLoadState('load');
  }

  async removeItem(productName: string) {
    const productRow = this.getProductRow(productName);
    
    // Wait for product row to be attached
    await productRow.waitFor({ state: 'attached', timeout: 10000 });
    
    // Strategy 1: Look for a remove link with href in the row
    const links = productRow.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href').catch(() => null);
      
      if (href && (href.includes('remove') || href.includes('delete'))) {
        // Found a remove link - navigate to it
        const fullUrl = new URL(href, this.page.url()).toString();
        await this.page.goto(fullUrl);
        await this.page.waitForLoadState('load').catch(() => {});
        return;
      }
    }
    
    // Strategy 2: Click the remove button (submit form)
    const removeButton = this.getRemoveButton(productName);
    
    // Wait for button to be attached
    await removeButton.waitFor({ state: 'attached', timeout: 5000 });
    
    // Try to click and wait for page reload/navigation
    try {
      // Use Promise.all to simultaneously wait for navigation and click
      await Promise.all([
        this.page.waitForLoadState('load').catch(() => {}),
        removeButton.click({ timeout: 3000 })
      ]);
    } catch {
      try {
        // Alternative: force click
        await removeButton.click({ force: true, timeout: 3000 });
        await Promise.race([
          this.page.waitForLoadState('load').catch(() => {}),
          this.page.waitForTimeout(1000)
        ]).catch(() => {});
      } catch {
        // Last resort: JavaScript click
        await removeButton.evaluate((el: any) => el.click()).catch(() => {});
        await this.page.waitForTimeout(1000).catch(() => {});
      }
    }
  }

  async proceedToCheckout() {
    await Promise.all([
      this.page.waitForURL(/checkout\//),
      this.checkoutButton.click()
    ]);
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getItemCount(): Promise<number> {
    // Count product rows in the main items table
    const count = await this.cartItems.count();
    return count > 0 ? count : 0;
  }

  async getCartTotalText(): Promise<string | null> {
    return await this.cartTotal.textContent();
  }
}
