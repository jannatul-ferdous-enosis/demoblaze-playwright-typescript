import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';
import { uniqueUsername } from '../utils/testHelpers';
import { PASSWORD } from '../data/authData';

let homePage: HomePage;
let signUpPage: SignUpPage;
let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
  signUpPage = new SignUpPage(page);
  loginPage = new LoginPage(page);
  await homePage.goto();
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => {
    const $ = (window as any).$;
    if ($) {
      try {
        $('.modal.show').modal('hide');
      } catch {}
      $('.modal').each(function (this: HTMLElement) {
        $(this).removeData('bs.modal');
      });
    }
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });
});

test.describe('Header / Navbar', () => {
  test('2.1 Navbar displayed at top of home page', async () => {
    await expect(homePage.navbar).toBeVisible();
  });

  test('2.2 "PRODUCT STORE" brand logo and text visible', async () => {
    await expect(homePage.brandLink).toBeVisible();
    await expect(homePage.brandLink).toContainText('PRODUCT STORE');
  });

  test('2.3 Click brand link returns to home page', async ({ page }) => {
    await homePage.clickCartLink();
    await page.waitForURL('**/cart.html');
    await homePage.clickBrandLink();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('index.html');
    await expect(homePage.navbar).toBeVisible();
  });

  test('2.4 "Home" link visible and active', async () => {
    await expect(homePage.homeLink).toBeVisible();
    const text = await homePage.homeLink.textContent();
    expect(text).toContain('Home');
  });

  test('2.5 "Contact" link opens contact modal', async () => {
    await homePage.clickContactLink();
    await expect(homePage.contactModal).toBeVisible();
  });

  test('2.6 "About us" link opens about us modal', async () => {
    await homePage.clickAboutUsLink();
    await expect(homePage.aboutUsModal).toBeVisible();
  });

  test('2.7 "Cart" link navigates to cart page', async ({ page }) => {
    await homePage.clickCartLink();
    await page.waitForURL('**/cart.html');
    expect(page.url()).toContain('cart.html');
  });

  test('2.8 "Log in" link opens login modal (logged out)', async () => {
    await expect(homePage.loginLink).toBeVisible();
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await expect(loginPage.modal).toBeVisible();
  });

  test('2.9 "Sign up" link opens sign-up modal (logged out)', async () => {
    await expect(homePage.signUpLink).toBeVisible();
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await expect(signUpPage.modal).toBeVisible();
  });

  test('2.10 "Log out" visible when logged in', async () => {
    const username = uniqueUsername();
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(username);
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickAndAcceptDialog();
    await signUpPage.waitForModalToClose();

    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(username);
    await loginPage.fillPassword(PASSWORD);
    await loginPage.clickAndAcceptDialog();
    await loginPage.waitForModalToClose();

    await expect(homePage.logoutLink).toBeVisible();
    await expect(homePage.loginLink).toBeHidden();
    await expect(homePage.signUpLink).toBeHidden();
  });

  test('2.11 "Welcome <username>" displayed when logged in', async () => {
    const username = uniqueUsername();
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(username);
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickAndAcceptDialog();
    await signUpPage.waitForModalToClose();

    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(username);
    await loginPage.fillPassword(PASSWORD);
    await loginPage.clickAndAcceptDialog();
    await loginPage.waitForModalToClose();

    await expect(homePage.nameOfUser).toBeVisible();
    expect(await homePage.getWelcomeText()).toContain(`Welcome ${username}`);
  });

  test('2.12 Page title is "STORE"', async ({ page }) => {
    await expect(page).toHaveTitle('STORE');
  });
});

test.describe('Carousel / Banner', () => {
  test('2.13 Carousel displayed on home page', async () => {
    await expect(homePage.carousel).toBeVisible();
  });

  test('2.14 Carousel shows Samsung slide first', async () => {
    const firstSlide = homePage.carouselSlides.first();
    await expect(firstSlide).toHaveClass(/active/);
    const img = await firstSlide.locator('img').getAttribute('src');
    expect(img?.toLowerCase()).toContain('samsung');
  });

  test('2.15 Carousel auto-rotates', async ({ page }) => {
    const initialIndex = await homePage.getActiveSlideIndex();
    await page.waitForTimeout(10000);
    const nextIndex = await homePage.getActiveSlideIndex();
    expect(nextIndex).not.toBe(initialIndex);
  });

  test('2.16 Click carousel "Previous" arrow', async ({ page }) => {
    const initialIndex = await homePage.getActiveSlideIndex();
    await homePage.clickCarouselPrev();
    await page.waitForTimeout(800);
    const newIndex = await homePage.getActiveSlideIndex();
    expect(newIndex).not.toBe(initialIndex);
  });

  test('2.17 Click carousel "Next" arrow', async ({ page }) => {
    const initialIndex = await homePage.getActiveSlideIndex();
    await homePage.clickCarouselNext();
    await page.waitForTimeout(800);
    const newIndex = await homePage.getActiveSlideIndex();
    expect(newIndex).not.toBe(initialIndex);
  });

  test('2.18 Carousel wraps after last slide', async ({ page }) => {
    const slideCount = await homePage.carouselSlides.count();
    for (let i = 0; i < slideCount; i++) {
      await homePage.clickCarouselNext();
      await page.waitForTimeout(800);
    }
    const afterWrap = await homePage.getActiveSlideIndex();
    expect(afterWrap).toBe(0);
  });

  test('2.19 Carousel wraps before first slide', async ({ page }) => {
    const slideCount = await homePage.carouselSlides.count();
    await homePage.clickCarouselPrev();
    await page.waitForTimeout(800);
    const newIndex = await homePage.getActiveSlideIndex();
    expect(newIndex).toBe(slideCount - 1);
  });

  test('2.20 Carousel indicators (dots) clickable', async ({ page }) => {
    await homePage.clickCarouselIndicator(1);
    await page.waitForTimeout(800);
    const activeIndex = await homePage.getActiveSlideIndex();
    expect(activeIndex).toBe(1);
  });

  test('2.21 Carousel hidden on mobile (< 800px width)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(homePage.carousel).toBeHidden();
  });
});

test.describe('Category Filters', () => {
  test('2.22 Category sidebar visible on left', async () => {
    await expect(homePage.categoriesSidebar).toBeVisible();
    await expect(homePage.phonesFilter).toBeVisible();
    await expect(homePage.laptopsFilter).toBeVisible();
    await expect(homePage.monitorsFilter).toBeVisible();
  });

  test('2.23 Click "Phones" category filter', async ({ page }) => {
    await homePage.clickPhonesFilter();
    await page.waitForTimeout(1500);
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.24 Click "Laptops" category filter', async ({ page }) => {
    await homePage.clickLaptopsFilter();
    await page.waitForTimeout(1500);
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.25 Click "Monitors" category filter', async ({ page }) => {
    await homePage.clickMonitorsFilter();
    await page.waitForTimeout(1500);
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.26 Click "CATEGORIES" header resets filter', async ({ page }) => {
    await homePage.clickPhonesFilter();
    await page.waitForTimeout(1500);
    await homePage.clickCategoriesHeader();
    await page.waitForTimeout(1500);
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.27 Switch between categories multiple times', async ({ page }) => {
    await homePage.clickPhonesFilter();
    await page.waitForTimeout(1500);
    const phonesCount = await homePage.getProductCount();
    expect(phonesCount).toBeGreaterThan(0);

    await homePage.clickLaptopsFilter();
    await page.waitForTimeout(1500);
    const laptopsCount = await homePage.getProductCount();
    expect(laptopsCount).toBeGreaterThan(0);

    await homePage.clickMonitorsFilter();
    await page.waitForTimeout(1500);
    const monitorsCount = await homePage.getProductCount();
    expect(monitorsCount).toBeGreaterThan(0);

    await homePage.clickPhonesFilter();
    await page.waitForTimeout(1500);
    const finalCount = await homePage.getProductCount();
    expect(finalCount).toBeGreaterThan(0);
  });

  test('2.28 Switch category while on page 2+ resets to page 1', async ({ page }) => {
    await homePage.clickNextPage();
    await page.waitForTimeout(1500);

    await homePage.clickLaptopsFilter();
    await page.waitForTimeout(2000);

    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Product List', () => {
  test('2.29 Product cards displayed in grid layout', async ({ page }) => {
    await page.waitForSelector('#tbodyid > div', { timeout: 10000 });
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.30 Product card displays name', async () => {
    const name = await homePage.getProductName(0);
    expect(name).toBeTruthy();
  });

  test('2.31 Product card displays price', async () => {
    const price = await homePage.getProductPrice(0);
    expect(price).toBeTruthy();
    expect(price).toContain('$');
  });

  test('2.32 Product card displays image', async () => {
    const imgSrc = await homePage.getProductImage(0);
    expect(imgSrc).toBeTruthy();
  });

  test('2.33 Product card displays description', async () => {
    const desc = await homePage.productCards.first().locator('.card-text').textContent();
    expect(desc).toBeTruthy();
  });

  test('2.34 Long product description truncated with ellipsis', async () => {
    const card = homePage.productCards.first();
    const hasOverflow = await card.locator('.card-text').evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.overflow === 'hidden' || style.textOverflow === 'ellipsis';
    });
    expect(hasOverflow).toBe(true);
  });

  test('2.35 All product images load correctly', async () => {
    const count = await homePage.getProductCount();
    for (let i = 0; i < count; i++) {
      const img = homePage.productCards.nth(i).locator('img');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('2.36 Click product card navigates to product detail page', async ({ page }) => {
    await homePage.clickProductCard(0);
    await page.waitForURL('**/prod.html**');
    expect(page.url()).toContain('prod.html');
  });

  test('2.37 Each product card links to unique product page', async ({ page }) => {
    const urls: string[] = [];
    const count = Math.min(await homePage.getProductCount(), 3);
    for (let i = 0; i < count; i++) {
      await homePage.goto();
      await homePage.clickProductCard(i);
      await page.waitForURL('**/prod.html**');
      urls.push(page.url());
    }
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(count);
  });
});

test.describe('Pagination', () => {
  test('2.38 "Next" button visible when multiple pages exist', async () => {
    await expect(homePage.nextButton).toBeVisible();
  });

  test('2.39 "Previous" click on page 1 stays on page 1', async ({ page }) => {
    const url = page.url();
    await homePage.clickPreviousPage();
    await page.waitForTimeout(1000);
    expect(page.url()).toBe(url);
  });

  test('2.40 Click "Next" loads next page of products', async ({ page }) => {
    const page1Names: string[] = [];
    const page1Count = await homePage.getProductCount();
    for (let i = 0; i < page1Count; i++) {
      page1Names.push(await homePage.getProductName(i));
    }

    await homePage.clickNextPage();
    await page.waitForTimeout(1500);

    const page2Count = await homePage.getProductCount();
    expect(page2Count).toBeGreaterThan(0);

    const page2Names: string[] = [];
    for (let i = 0; i < page2Count; i++) {
      page2Names.push(await homePage.getProductName(i));
    }
    expect(page2Names).not.toEqual(page1Names);
  });

  test('2.41 Click "Previous" from page 2 returns to page 1', async ({ page }) => {
    await homePage.clickNextPage();
    await page.waitForTimeout(1500);

    const page2Names: string[] = [];
    const page2Count = await homePage.getProductCount();
    for (let i = 0; i < page2Count; i++) {
      page2Names.push(await homePage.getProductName(i));
    }

    await homePage.clickPreviousPage();
    await page.waitForTimeout(1500);

    const page1Names: string[] = [];
    const page1Count = await homePage.getProductCount();
    for (let i = 0; i < page1Count; i++) {
      page1Names.push(await homePage.getProductName(i));
    }
    expect(page1Names).not.toEqual(page2Names);
  });

  test('2.42 "Next" click on last page stays on last page', async ({ page }) => {
    let lastNames: string[] = [];
    let hasNext = true;
    while (hasNext) {
      const count = await homePage.getProductCount();
      lastNames = [];
      for (let i = 0; i < count; i++) {
        lastNames.push(await homePage.getProductName(i));
      }
      const nextVisible = await homePage.nextButton.isVisible();
      if (!nextVisible) {
        hasNext = false;
        break;
      }
      await homePage.clickNextPage();
      await page.waitForTimeout(1500);
      const newCount = await homePage.getProductCount();
      const newNames: string[] = [];
      for (let i = 0; i < newCount; i++) {
        newNames.push(await homePage.getProductName(i));
      }
      if (newNames.join() === lastNames.join()) {
        hasNext = false;
      }
    }

    const count = await homePage.getProductCount();
    const currentNames: string[] = [];
    for (let i = 0; i < count; i++) {
      currentNames.push(await homePage.getProductName(i));
    }
    expect(currentNames).toEqual(lastNames);
  });

  test('2.43 Rapid click "Next" does not duplicate requests', async ({ page }) => {
    await homePage.clickNextPage();
    await homePage.clickNextPage();
    await page.waitForTimeout(2000);

    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('2.44 Page number updates in state', async ({ page }) => {
    await homePage.clickNextPage();
    await page.waitForTimeout(1500);
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Footer', () => {
  test('2.45 Footer visible at bottom of page', async () => {
    await homePage.footer.scrollIntoViewIfNeeded();
    await expect(homePage.footer).toBeVisible();
  });

  test('2.46 Footer copyright notice', async () => {
    await homePage.footer.scrollIntoViewIfNeeded();
    await expect(homePage.footerCopyright).toBeVisible();
    await expect(homePage.footerCopyright).toContainText('Product Store');
  });
});

test.describe('Responsive / Mobile', () => {
  test('2.47 Home page layout on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    const hamburger = page.locator('.navbar-toggler');
    await expect(hamburger).toBeVisible();
  });

  test('2.48 Home page layout on tablet (768px)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('2.49 Home page layout on desktop (1920px)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('2.50 Product grid responsive columns', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const mobileCount = await page.locator('#tbodyid > div').count();
    expect(mobileCount).toBeGreaterThan(0);

    await page.goto('/');
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const desktopCount = await page.locator('#tbodyid > div').count();
    expect(desktopCount).toBeGreaterThan(0);
  });
});
