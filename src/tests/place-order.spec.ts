import { test, expect, Page } from '@playwright/test';
import CartPage from '../pages/CartPage';
import OrderPage from '../pages/OrderPage';

let cartPage: CartPage;
let orderPage: OrderPage;

const VALID_ORDER = {
  name: 'Test User',
  country: 'United States',
  city: 'New York',
  card: '4111111111111111',
  month: '12',
  year: '2028',
};

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

test.describe('Place Order / Checkout', () => {
  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    orderPage = new OrderPage(page);
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('6.1 Place order with all valid fields', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();
    expect(await orderPage.isModalVisible()).toBe(true);

    await orderPage.fillAllFields(VALID_ORDER);
    await orderPage.clickPurchase();

    const alertVisible = await orderPage.isSweetAlertVisible();
    expect(alertVisible).toBe(true);

    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.2 Order confirmation popup shows all required fields', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();
    await orderPage.fillAllFields(VALID_ORDER);
    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });

    const text = await orderPage.getSweetAlertText();
    expect(text).toContain('Id:');
    expect(text).toContain('Amount:');
    expect(text).toContain('Card Number:');
    expect(text).toContain('Name:');
    expect(text).toContain('Date:');
  });

  test('6.3 Click "OK" on confirmation popup', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();
    await orderPage.fillAllFields(VALID_ORDER);
    await page.evaluate(() => (window as any).purchaseOrder());

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 10000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');

    const confirmBtn = page.locator('.sweet-alert .confirm');
    await expect(confirmBtn).toBeVisible();

    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const alertGone = await orderPage.isSweetAlertVisible();
    expect(alertGone).toBe(false);
  });

  test('6.4 Place order with empty Name', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillCountry(VALID_ORDER.country);
    await orderPage.fillCity(VALID_ORDER.city);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    await orderPage.clickPurchaseAsync();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Please fill out Name and Creditcard.');
    await dialog.accept();
  });

  test('6.5 Place order with empty Country', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.6 Place order with empty City', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCountry(VALID_ORDER.country);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.7 Place order with empty Credit Card', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCountry(VALID_ORDER.country);
    await orderPage.fillCity(VALID_ORDER.city);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    await orderPage.clickPurchaseAsync();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Please fill out Name and Creditcard.');
    await dialog.accept();
  });

  test('6.8 Place order with empty Month', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCountry(VALID_ORDER.country);
    await orderPage.fillCity(VALID_ORDER.city);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.9 Place order with empty Year', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCountry(VALID_ORDER.country);
    await orderPage.fillCity(VALID_ORDER.city);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.10 Place order with all fields empty', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    await orderPage.clickPurchaseAsync();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Please fill out Name and Creditcard.');
    await dialog.accept();
  });

  test('6.11 Credit card field with alphabetic characters', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard('abcdefgh');
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.12 Credit card with special characters', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard('!@#$%^&*()');
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.13 Month value > 12', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth('13');
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.14 Month value = 0', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth('0');
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.15 Year value in the past', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear('2020');

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.16 Year value far in the future (9999)', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    await orderPage.fillName(VALID_ORDER.name);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear('9999');

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });

  test('6.17 Total displayed in modal matches cart total', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    const cartTotal = await cartPage.getTotalPrice();
    expect(cartTotal).toBeGreaterThan(0);

    await orderPage.openModal();
    const modalTotal = await orderPage.getModalTotal();
    expect(modalTotal).toBe(cartTotal);
  });

  test('6.18 Close modal without purchasing', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();
    expect(await orderPage.isModalVisible()).toBe(true);

    await orderPage.clickClose();
    await page.waitForTimeout(500);

    expect(await orderPage.isModalVisible()).toBe(false);

    const rowCount = await cartPage.getRowCount();
    expect(rowCount).toBe(1);
  });

  test('6.19 Purchase with very long Name (500+ chars)', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    const longName = 'A'.repeat(500);
    await orderPage.fillName(longName);
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');

    const text = await orderPage.getSweetAlertText();
    expect(text).toContain('Name:');
  });

  test('6.20 XSS in Name field (<script>alert(1)</script>)', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();

    let alertFired = false;
    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'alert' && dialog.message() === '1') {
        alertFired = true;
      }
      await dialog.accept();
    });

    await orderPage.fillName('<script>alert(1)</script>');
    await orderPage.fillCard(VALID_ORDER.card);
    await orderPage.fillMonth(VALID_ORDER.month);
    await orderPage.fillYear(VALID_ORDER.year);

    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });

    expect(alertFired).toBe(false);
  });

  test('6.21 Order confirmation amount format', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    const cartTotal = await cartPage.getTotalPrice();

    await orderPage.openModal();
    await orderPage.fillAllFields(VALID_ORDER);
    await orderPage.clickPurchase();

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const text = await orderPage.getSweetAlertText();
    expect(text).toContain(`Amount: ${cartTotal} USD`);
  });

  test('6.22 Duplicate purchase submission (double-click)', async ({ page }) => {
    await addProduct(page, 1);

    await cartPage.goto();
    await page.waitForSelector('#tbodyid tr', { timeout: 10000 });

    await orderPage.openModal();
    await orderPage.fillAllFields(VALID_ORDER);

    await Promise.all([
      orderPage.clickPurchase(),
      orderPage.clickPurchase(),
    ]);

    await orderPage.sweetAlert.waitFor({ state: 'visible', timeout: 5000 });
    const title = await orderPage.getSweetAlertTitle();
    expect(title).toContain('Thank you for your purchase!');
  });
});
