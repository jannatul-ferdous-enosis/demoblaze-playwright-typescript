import { Page, Locator } from '@playwright/test';

export default class CartPage {
  readonly page: Page;

  // Cart table
  readonly cartTable: Locator;
  readonly cartRows: Locator;

  // Total
  readonly totalPrice: Locator;

  // Place Order
  readonly placeOrderButton: Locator;
  readonly orderModal: Locator;
  readonly orderTotal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Cart table
    this.cartTable = page.locator('#tbodyid');
    this.cartRows = page.locator('#tbodyid tr');

    // Total
    this.totalPrice = page.locator('#totalp');

    // Place Order
    this.placeOrderButton = page.locator('button', { hasText: 'Place Order' });
    this.orderModal = page.locator('#orderModal');
    this.orderTotal = page.locator('#totalm');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async getRowCount(): Promise<number> {
    return this.cartRows.count();
  }

  async getRowProductName(index: number): Promise<string> {
    return (await this.cartRows.nth(index).locator('td').nth(1).textContent()) ?? '';
  }

  async getRowProductPrice(index: number): Promise<number> {
    const text = (await this.cartRows.nth(index).locator('td').nth(2).textContent()) ?? '0';
    return parseInt(text, 10);
  }

  async deleteRow(index: number): Promise<void> {
    await this.cartRows.nth(index).locator('a', { hasText: 'Delete' }).click();
    await this.page.waitForTimeout(500);
  }

  async getTotalPrice(): Promise<number> {
    try {
      const text = (await this.totalPrice.textContent({ timeout: 3000 })) ?? '0';
      const num = parseInt(text, 10);
      return isNaN(num) ? 0 : num;
    } catch {
      return 0;
    }
  }

  async clickPlaceOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async isOrderModalVisible(): Promise<boolean> {
    return this.orderModal.isVisible();
  }

  async getOrderTotal(): Promise<string> {
    return (await this.orderTotal.textContent()) ?? '';
  }

  async isCartEmpty(): Promise<boolean> {
    const count = await this.getRowCount();
    return count === 0;
  }
}
