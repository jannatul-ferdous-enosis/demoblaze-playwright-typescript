import { Page, Locator } from '@playwright/test';

export default class OrderPage {
  readonly page: Page;

  // Modal
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly purchaseButton: Locator;

  // Fields
  readonly nameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly cardInput: Locator;
  readonly monthInput: Locator;
  readonly yearInput: Locator;

  // Total display
  readonly totalLabel: Locator;

  // SweetAlert confirmation
  readonly sweetAlert: Locator;
  readonly sweetAlertTitle: Locator;
  readonly sweetAlertText: Locator;
  readonly sweetAlertConfirm: Locator;

  constructor(page: Page) {
    this.page = page;

    // Order modal
    this.modal = page.locator('#orderModal');
    this.closeButton = page.locator('#orderModal .btn-secondary');
    this.purchaseButton = page.locator('#orderModal .btn-primary');

    // Form fields
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.cardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');

    // Total
    this.totalLabel = page.locator('#totalm');

    // SweetAlert (bootstrap-sweetalert)
    this.sweetAlert = page.locator('.sweet-alert');
    this.sweetAlertTitle = page.locator('.sweet-alert h2');
    this.sweetAlertText = page.locator('.sweet-alert p');
    this.sweetAlertConfirm = page.locator('.sweet-alert .confirm');
  }

  async openModal(): Promise<void> {
    const placeOrderBtn = this.page.locator('button', { hasText: 'Place Order' });
    await placeOrderBtn.click();
    await this.modal.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  async isModalVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }

  async getTotalText(): Promise<string> {
    return (await this.totalLabel.textContent()) ?? '';
  }

  async getModalTotal(): Promise<number> {
    const text = await this.getTotalText();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillCountry(country: string): Promise<void> {
    await this.countryInput.fill(country);
  }

  async fillCity(city: string): Promise<void> {
    await this.cityInput.fill(city);
  }

  async fillCard(card: string): Promise<void> {
    await this.cardInput.fill(card);
  }

  async fillMonth(month: string): Promise<void> {
    await this.monthInput.fill(month);
  }

  async fillYear(year: string): Promise<void> {
    await this.yearInput.fill(year);
  }

  async fillAllFields(data: {
    name: string;
    country: string;
    city: string;
    card: string;
    month: string;
    year: string;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.fillCountry(data.country);
    await this.fillCity(data.city);
    await this.fillCard(data.card);
    await this.fillMonth(data.month);
    await this.fillYear(data.year);
  }

  async clickPurchase(): Promise<void> {
    await this.purchaseButton.click();
  }

  async clickPurchaseAsync(): Promise<void> {
    await this.page.evaluate(() => {
      setTimeout(() => {
        (document.querySelector('#orderModal .btn-primary') as HTMLButtonElement)?.click();
      }, 0);
    });
  }

  async clickClose(): Promise<void> {
    await this.closeButton.click();
  }

  async isSweetAlertVisible(): Promise<boolean> {
    return this.sweetAlert.isVisible();
  }

  async getSweetAlertTitle(): Promise<string> {
    return (await this.sweetAlertTitle.textContent()) ?? '';
  }

  async getSweetAlertText(): Promise<string> {
    return (await this.sweetAlertText.textContent()) ?? '';
  }

  async clickSweetAlertConfirm(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).$('.sweet-alert .confirm').click();
    });
  }

  async getFieldValue(field: 'name' | 'country' | 'city' | 'card' | 'month' | 'year'): Promise<string> {
    const input = this[field + 'Input' as keyof Pick<OrderPage, 'nameInput' | 'countryInput' | 'cityInput' | 'cardInput' | 'monthInput' | 'yearInput'>];
    return (await input.inputValue()) ?? '';
  }
}
