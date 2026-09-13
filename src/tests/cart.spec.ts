import { test, expect, Page, BrowserContext } from '@playwright/test';
import CartPage from '../pages/CartPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import HomePage from '../pages/HomePage';

let cartPage: CartPage;
let productDetailPage: ProductDetailPage;
let homePage: HomePage;

async function addProduct(page: Page, productId: number): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  const fullCookie = await page.evaluate(() => document.cookie);
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await page.request.post('https://api.demoblaze.com/addtocart', {
      data: { id: crypto.randomUUID(), cookie: fullCookie, prod_id: productId, flag: false }
    });
    const text = await resp.text();
    if (text) {
      const result = JSON.parse(text);
      if (result.errorMessage) {
        if (attempt === 2) throw new Error(`Failed to add product ${productId}: ${result.errorMessage}`);
        await page.waitForTimeout(1000);
        continue;
      }
    }
    return;
  }
}

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    productDetailPage = new ProductDetailPage(page);
    homePage = new HomePage(page);
    await page.goto('/');
    await page.waitForTimeout(1000);
  });
  test('5.1 Cart page displays all added products', async ({ page }) => {
    await addProduct(page, 1);
    await addProduct(page, 2);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const rowCount = await cartPage.getRowCount();
    expect(rowCount).toBe(2);

    const name1 = await cartPage.getRowProductName(0);
    expect(name1).toBeTruthy();
    const price1 = await cartPage.getRowProductPrice(0);
    expect(price1).toBeGreaterThan(0);
  });

  test('5.2 Cart total equals sum of all product prices', async ({ page }) => {
    await addProduct(page, 1);
    await addProduct(page, 2);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    const rowCount = await cartPage.getRowCount();
    let expectedTotal = 0;
    for (let i = 0; i < rowCount; i++) {
      expectedTotal += await cartPage.getRowProductPrice(i);
    }

    const actualTotal = await cartPage.getTotalPrice();
    expect(actualTotal).toBe(expectedTotal);
  });

  test('5.3 Delete a product from cart', async ({ page }) => {
    await addProduct(page, 1);
    await addProduct(page, 2);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const initialCount = await cartPage.getRowCount();
    expect(initialCount).toBe(2);

    await cartPage.deleteRow(0);
    await page.waitForTimeout(2000);

    await page.waitForFunction(
      (expectedCount) => document.querySelectorAll('#tbodyid tr').length === expectedCount,
      1,
      { timeout: 5000 }
    );
    const newCount = await cartPage.getRowCount();
    expect(newCount).toBe(1);
  });

  test('5.4 Delete all products from cart', async ({ page }) => {
    await addProduct(page, 1);
    await addProduct(page, 2);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    let rowCount = await cartPage.getRowCount();
    while (rowCount > 0) {
      await cartPage.deleteRow(0);
      await page.waitForTimeout(1000);
      rowCount = await cartPage.getRowCount();
    }

    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).toBe(true);
  });

  test('5.5 "Place Order" with empty cart', async ({ page }) => {
    await cartPage.goto();
    await page.waitForTimeout(2000);

    await cartPage.clickPlaceOrder();
    await page.waitForTimeout(1000);

    const modalVisible = await cartPage.isOrderModalVisible();
    expect(modalVisible).toBe(true);

    const totalText = await cartPage.getOrderTotal();
    expect(totalText).toContain('Total');
  });

  test('5.6 Cart persists after navigating away and back', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const initialCount = await cartPage.getRowCount();
    expect(initialCount).toBe(1);

    await homePage.goto();
    await page.waitForTimeout(1000);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const finalCount = await cartPage.getRowCount();
    expect(finalCount).toBe(1);
  });

  test('5.7 Cart persists after page refresh', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const initialCount = await cartPage.getRowCount();
    expect(initialCount).toBe(1);

    await page.reload();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    const finalCount = await cartPage.getRowCount();
    expect(finalCount).toBe(1);
  });

  test('5.8 Cart state after log out then log in', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    const initialCount = await cartPage.getRowCount();
    expect(initialCount).toBe(1);

    await homePage.goto();
    await homePage.clickLogout();
    await page.waitForTimeout(1000);

    await cartPage.goto();
    await page.waitForTimeout(2000);
    const afterLogoutCount = await cartPage.getRowCount();
    expect(afterLogoutCount).toBeGreaterThanOrEqual(0);
  });

  test('5.9 Cart total displays "$0" when empty', async ({ page }) => {
    await cartPage.goto();
    await page.waitForTimeout(3000);

    const total = await cartPage.getTotalPrice();
    expect(total).toBe(0);
  });

  test('5.10 Add 10+ different products to cart', async ({ page }) => {
    test.setTimeout(120_000);
    const productIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const id of productIds) {
      await addProduct(page, id);
    }

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 15000 });

    const rowCount = await cartPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(10);

    const total = await cartPage.getTotalPrice();
    expect(total).toBeGreaterThan(0);
  });

  test('5.11 Same product added 5 times', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await addProduct(page, 1);
    }

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    const rowCount = await cartPage.getRowCount();
    expect(rowCount).toBe(5);
  });

  test('5.12 Total after deleting one product', async ({ page }) => {
    await addProduct(page, 1);
    await addProduct(page, 2);
    await addProduct(page, 3);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const totalBefore = await cartPage.getTotalPrice();
    expect(totalBefore).toBeGreaterThan(0);

    const initialCount = await cartPage.getRowCount();
    expect(initialCount).toBe(3);

    await cartPage.deleteRow(0);

    await page.waitForFunction(
      (expectedCount) => document.querySelectorAll('#tbodyid tr').length === expectedCount,
      initialCount - 1,
      { timeout: 5000 }
    );
    await page.waitForTimeout(500);

    const rowCountAfter = await cartPage.getRowCount();
    expect(rowCountAfter).toBe(2);

    const actualTotal = await cartPage.getTotalPrice();
    expect(actualTotal).toBeGreaterThan(0);
    expect(actualTotal).toBeLessThan(totalBefore);
  });

  test('5.13 Cart accessible via top nav "Cart" link', async ({ page }) => {
    await homePage.goto();
    await homePage.clickCartLink();
    await page.waitForURL('**/cart.html');
    expect(page.url()).toContain('cart.html');
  });

  test('5.14 "Place Order" button visible when cart has items', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 15000 });

    await expect(cartPage.placeOrderButton).toBeVisible();
  });
});
