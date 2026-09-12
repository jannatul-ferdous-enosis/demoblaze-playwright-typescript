import { Page, Locator } from '@playwright/test';

export default class HomePage {
  readonly page: Page;

  // Navbar
  readonly brandLink: Locator;
  readonly homeLink: Locator;
  readonly contactLink: Locator;
  readonly aboutUsLink: Locator;
  readonly cartLink: Locator;
  readonly signUpLink: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;
  readonly nameOfUser: Locator;
  readonly navbar: Locator;

  // Carousel
  readonly carousel: Locator;
  readonly carouselSlides: Locator;
  readonly carouselPrev: Locator;
  readonly carouselNext: Locator;
  readonly carouselIndicators: Locator;

  // Categories
  readonly categoriesSidebar: Locator;
  readonly categoriesHeader: Locator;
  readonly phonesFilter: Locator;
  readonly laptopsFilter: Locator;
  readonly monitorsFilter: Locator;

  // Products
  readonly productContainer: Locator;
  readonly productCards: Locator;

  // Pagination
  readonly nextButton: Locator;
  readonly previousButton: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerCopyright: Locator;

  // Contact modal
  readonly contactModal: Locator;

  // About us modal
  readonly aboutUsModal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navbar
    this.navbar = page.locator('.navbar');
    this.brandLink = page.locator('.navbar .navbar-brand');
    this.homeLink = page.locator('#navbarExample').getByRole('link', { name: 'Home' });
    this.contactLink = page.locator('#navbarExample').getByRole('link', { name: 'Contact' });
    this.aboutUsLink = page.locator('#navbarExample').getByRole('link', { name: 'About us' });
    this.cartLink = page.locator('#navbarExample').getByRole('link', { name: 'Cart' });
    this.signUpLink = page.locator('#navbarExample').getByRole('link', { name: 'Sign up' });
    this.loginLink = page.locator('#navbarExample').getByRole('link', { name: 'Log in' });
    this.logoutLink = page.locator('#navbarExample').getByRole('link', { name: 'Log out' });
    this.nameOfUser = page.locator('#nameofuser');

    // Carousel
    this.carousel = page.locator('#carouselExampleIndicators');
    this.carouselSlides = page.locator('#carouselExampleIndicators .carousel-item');
    this.carouselPrev = page.locator('#carouselExampleIndicators .carousel-control-prev');
    this.carouselNext = page.locator('#carouselExampleIndicators .carousel-control-next');
    this.carouselIndicators = page.locator('#carouselExampleIndicators .carousel-indicators li');

    // Categories
    this.categoriesSidebar = page.locator('.list-group');
    this.categoriesHeader = page.locator('.list-group-item').first();
    this.phonesFilter = page.locator('.list-group-item', { hasText: 'Phones' });
    this.laptopsFilter = page.locator('.list-group-item', { hasText: 'Laptops' });
    this.monitorsFilter = page.locator('.list-group-item', { hasText: 'Monitors' });

    // Products
    this.productContainer = page.locator('#tbodyid');
    this.productCards = page.locator('#tbodyid > div');

    // Pagination
    this.nextButton = page.locator('#next2');
    this.previousButton = page.locator('#prev2');

    // Footer
    this.footer = page.locator('footer');
    this.footerCopyright = page.locator('footer .text-center');

    // Contact modal - ID is "exampleModal"
    this.contactModal = page.locator('#exampleModal');

    // About us modal
    this.aboutUsModal = page.locator('#videoModal');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async cleanupModals(): Promise<void> {
    await this.page.evaluate(() => {
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
    await this.page.waitForTimeout(300);
  }

  async clickSignUpLink(): Promise<void> {
    await this.cleanupModals();
    await this.page.evaluate(() => {
      const $ = (window as any).$;
      if ($) {
        $('#signInModal').modal('show');
      } else {
        (document.querySelector('#signin2') as HTMLElement)?.click();
      }
    });
  }

  async clickLoginLink(): Promise<void> {
    await this.cleanupModals();
    await this.page.evaluate(() => {
      const $ = (window as any).$;
      if ($) {
        $('#logInModal').modal('show');
      } else {
        (document.querySelector('#login2') as HTMLElement)?.click();
      }
    });
  }

  async clickLogout(): Promise<void> {
    await this.cleanupModals();
    await this.page.evaluate(() => (document.querySelector('#logout2') as HTMLElement)?.click());
  }

  async getWelcomeText(): Promise<string> {
    return (await this.nameOfUser.textContent()) ?? '';
  }

  async isLoggedIn(): Promise<boolean> {
    return this.nameOfUser.isVisible();
  }

  async isLogoutVisible(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  async isLoginLinkVisible(): Promise<boolean> {
    return this.loginLink.isVisible();
  }

  async isSignUpLinkVisible(): Promise<boolean> {
    return this.signUpLink.isVisible();
  }

  async clickContactLink(): Promise<void> {
    await this.contactLink.click();
  }

  async clickAboutUsLink(): Promise<void> {
    await this.aboutUsLink.click();
  }

  async clickCartLink(): Promise<void> {
    await this.cartLink.click();
  }

  async clickBrandLink(): Promise<void> {
    await this.brandLink.click();
  }

  async clickPhonesFilter(): Promise<void> {
    await this.phonesFilter.click();
  }

  async clickLaptopsFilter(): Promise<void> {
    await this.laptopsFilter.click();
  }

  async clickMonitorsFilter(): Promise<void> {
    await this.monitorsFilter.click();
  }

  async clickCategoriesHeader(): Promise<void> {
    await this.categoriesHeader.click();
  }

  async clickCarouselPrev(): Promise<void> {
    await this.carouselPrev.click();
  }

  async clickCarouselNext(): Promise<void> {
    await this.carouselNext.click();
  }

  async clickCarouselIndicator(index: number): Promise<void> {
    await this.carouselIndicators.nth(index).click();
  }

  async clickNextPage(): Promise<void> {
    await this.nextButton.click();
  }

  async clickPreviousPage(): Promise<void> {
    await this.previousButton.click();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProductName(index: number): Promise<string> {
    return (await this.productCards.nth(index).locator('.card-title').textContent()) ?? '';
  }

  async getProductPrice(index: number): Promise<string> {
    return (await this.productCards.nth(index).locator('h5').textContent()) ?? '';
  }

  async getProductImage(index: number): Promise<string> {
    return (await this.productCards.nth(index).locator('img').getAttribute('src')) ?? '';
  }

  async clickProductCard(index: number): Promise<void> {
    await this.productCards.nth(index).locator('.card-title a').click();
  }

  async getActiveSlideIndex(): Promise<number> {
    const slides = await this.carouselSlides.all();
    for (let i = 0; i < slides.length; i++) {
      if (await slides[i].evaluate(el => el.classList.contains('active'))) {
        return i;
      }
    }
    return 0;
  }

  async isPrevDisabled(): Promise<boolean> {
    return this.previousButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.pointerEvents === 'none' || style.opacity === '0.5' || el.getAttribute('tabindex') === '-1';
    });
  }

  async isNextDisabled(): Promise<boolean> {
    return this.nextButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.pointerEvents === 'none' || style.opacity === '0.5' || el.getAttribute('tabindex') === '-1';
    });
  }
}
