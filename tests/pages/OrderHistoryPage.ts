import { Page, expect } from '@playwright/test';

/**
 * OrderHistoryPage - Encapsulates order history interactions and verifications
 */
export class OrderHistoryPage {
  constructor(private page: Page) {}

  // ========== LOCATORS ==========

  get orderHistoryLink() {
    return this.page.getByRole('link', { name: /order history|my orders/i });
  }

  get ordersTable() {
    return this.page.locator('table');
  }

  get ordersTableRows() {
    return this.page.locator('table tbody tr');
  }

  get noOrdersMessage() {
    return this.page.locator('text=/no orders|no results/i');
  }

  get accountSidebar() {
    return this.page.locator('[class*="sidebar"]').or(this.page.locator('nav'));
  }

  getOrderRow(orderId: string) {
    return this.ordersTableRows.filter({ hasText: orderId }).first();
  }

  getViewButton(orderId: string) {
    return this.getOrderRow(orderId).getByRole('button', { name: /view/i }).or(
      this.getOrderRow(orderId).getByRole('link', { name: /view/i })
    );
  }

  // ========== VERIFICATION METHODS ==========

  async verifyOrderHistoryPageLoaded() {
    await expect(this.page).toHaveTitle(/order|account/i);
  }

  async verifyOrdersDisplayed() {
    await expect(this.ordersTable).toBeVisible();
    await expect(this.noOrdersMessage).not.toBeVisible();
  }

  async verifyOrderInHistory(orderId: string, totalAmount?: string) {
    const orderRow = this.getOrderRow(orderId);
    await expect(orderRow).toBeVisible();
    await expect(orderRow).toContainText(orderId);

    if (totalAmount) {
      await expect(orderRow).toContainText(totalAmount);
    }
  }

  async verifyOrderStatus(orderId: string, expectedStatus: string) {
    const orderRow = this.getOrderRow(orderId);
    await expect(orderRow).toContainText(expectedStatus);
  }

  async verifyOrderCount(expectedCount: number) {
    const rows = await this.ordersTableRows.count();
    expect(rows).toBe(expectedCount);
  }

  async verifyNoOrdersMessage() {
    await expect(this.noOrdersMessage).toBeVisible();
  }

  // ========== INTERACTION METHODS ==========

  async navigateToOrderHistory() {
    // Navigate directly to the order history page
    const baseUrl = this.page.url();
    const orderHistoryUrl = new URL('index.php?route=account/order&language=en-gb', baseUrl).toString();
    await this.page.goto(orderHistoryUrl);
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async viewOrderDetails(orderId: string) {
    const viewButton = this.getViewButton(orderId);
    await viewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getOrderCount(): Promise<number> {
    const rows = await this.ordersTableRows.count();
    return rows;
  }

  async getFirstOrderId(): Promise<string | null> {
    const firstRow = await this.ordersTableRows.first();
    const text = await firstRow.textContent();
    
    // Extract order ID from text (assuming first column contains ID)
    if (text) {
      const match = text.match(/^(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  }
}
