import { Page, Locator } from '@playwright/test';

export default class ProductDetailPage {
  readonly page: Page;

  // Product info
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productImage: Locator;

  // Add to cart
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Product info
    this.productName = page.locator('h2.name');
    this.productPrice = page.locator('h3.price-container');
    this.productDescription = page.locator('.description p');
    this.productImage = page.locator('#imgp .item.active img');

    // Add to cart
    this.addToCartButton = page.locator('a.btn.btn-success', { hasText: 'Add to cart' });
  }

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/prod.html?idp_=${productId}`);
  }

  async gotoDirect(): Promise<void> {
    await this.page.goto('/prod.html');
  }

  async gotoInvalid(): Promise<void> {
    await this.page.goto('/prod.html?idp_=9999');
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) ?? '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) ?? '';
  }

  async getProductDescription(): Promise<string> {
    return (await this.productDescription.textContent()) ?? '';
  }

  async getProductImageSrc(): Promise<string> {
    return (await this.productImage.getAttribute('src')) ?? '';
  }

  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async addToCartAndAcceptDialog(): Promise<string | null> {
    try {
      const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10_000 });
      await this.addToCartButton.click();
      const dialog = await dialogPromise;
      const message = dialog.message();
      await dialog.accept();
      return message;
    } catch {
      return null;
    }
  }
}
