import { test, expect } from "@playwright/test";
import ProductDetailPage from "../pages/ProductDetailPage";
import HomePage from "../pages/HomePage";

let productDetailPage: ProductDetailPage;
let homePage: HomePage;

test.beforeEach(async ({ page }) => {
  productDetailPage = new ProductDetailPage(page);
  homePage = new HomePage(page);
});

test.describe("Product Detail Page", () => {
  test("4.1 Click a product card to view details", async ({ page }) => {
    await homePage.goto();
    await page.waitForSelector("#tbodyid > div", { timeout: 10000 });
    const firstProductName = await homePage.getProductName(0);

    await homePage.clickProductCard(0);
    await page.waitForURL("**/prod.html**");
    expect(page.url()).toContain("prod.html?idp_=");

    await productDetailPage.productName.waitFor({ state: "visible" });
    const detailName = await productDetailPage.getProductName();
    expect(detailName).toBe(firstProductName);
  });

  test("4.2 Product image loads in detail carousel", async () => {
    await productDetailPage.goto(1);
    await productDetailPage.productImage.waitFor({
      state: "visible",
      timeout: 15000,
    });
    const imgSrc = await productDetailPage.getProductImageSrc();
    expect(imgSrc).toBeTruthy();

    await productDetailPage.page.waitForTimeout(2000);
    const naturalWidth = await productDetailPage.productImage.evaluate(
      (el: HTMLImageElement) => el.naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("4.3 Product name, price, description displayed", async () => {
    await productDetailPage.goto(1);

    const name = await productDetailPage.getProductName();
    expect(name).toBeTruthy();

    const price = await productDetailPage.getProductPrice();
    expect(price).toBeTruthy();
    expect(price).toContain("$");

    const desc = await productDetailPage.getProductDescription();
    expect(desc).toBeTruthy();
  });

  test('4.4 Click "Add to cart"', async () => {
    await productDetailPage.goto(1);
    const message = await productDetailPage.addToCartAndAcceptDialog();
    expect(message).toBe("Product added");
  });

  test("4.5 Add same product to cart multiple times", async () => {
    await productDetailPage.goto(1);

    const message1 = await productDetailPage.addToCartAndAcceptDialog();
    expect(message1).toBe("Product added");

    const message2 = await productDetailPage.addToCartAndAcceptDialog();
    expect(message2).toBe("Product added");
  });

  test("4.6 Add multiple different products to cart", async ({ page }) => {
    await productDetailPage.goto(1);
    const message1 = await productDetailPage.addToCartAndAcceptDialog();
    expect(message1).toBe("Product added");

    await productDetailPage.goto(2);
    const message2 = await productDetailPage.addToCartAndAcceptDialog();
    expect(message2).toBe("Product added");
  });

  test("4.7 Navigate to invalid product ID", async ({ page }) => {
    await productDetailPage.gotoInvalid();
    await page.waitForTimeout(2000);

    const pageDidNotCrash = await page.evaluate(
      () => !document.querySelector(".error, .alert-danger"),
    );
    expect(pageDidNotCrash).toBe(true);
  });

  test("4.8 Navigate to product page without ID parameter", async ({
    page,
  }) => {
    await productDetailPage.gotoDirect();
    await page.waitForTimeout(2000);

    const nameVisible = await productDetailPage.productName
      .isVisible()
      .catch(() => false);
    expect(nameVisible).toBe(false);
  });

  test("4.9 Add to cart without being logged in", async () => {
    await productDetailPage.goto(1);
    const message = await productDetailPage.addToCartAndAcceptDialog();
    expect(message).toBe("Product added");
  });

  test('4.10 Rapid double-click "Add to cart"', async () => {
    await productDetailPage.goto(1);

    const dialogPromise = productDetailPage.page.waitForEvent("dialog", {
      timeout: 10_000,
    });
    await productDetailPage.addToCartButton.dblclick();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();

    expect(message).toBe("Product added");
  });

  test("4.11 Browser back after product page", async ({ page }) => {
    await homePage.goto();
    await page.waitForSelector("#tbodyid > div", { timeout: 10000 });

    await homePage.clickProductCard(0);
    await page.waitForURL("**/prod.html**");
    expect(page.url()).toContain("prod.html");

    await page.goBack();
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(
      url.endsWith("/") ||
        url.includes("index.html") ||
        url.endsWith("demoblaze.com"),
    ).toBe(true);
  });

  test('4.14 Product price format', async () => {
    await productDetailPage.goto(1);
    const price = await productDetailPage.getProductPrice();
    expect(price).toMatch(/^\$\d+/);
  });
});
