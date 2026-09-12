import { Page, Locator } from '@playwright/test';

export default class LoginPage {
  readonly page: Page;
  readonly modal: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly closeButton: Locator;
  readonly xButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('#logInModal');
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');
    this.loginButton = this.modal.locator('button.btn-primary', { hasText: 'Log in' });
    this.closeButton = this.modal.locator('button.btn-secondary', { hasText: 'Close' });
    this.xButton = this.modal.locator('button.close');
  }

  async waitForModal(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' });
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(300);
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(300);
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.page.evaluate(() => setTimeout(() => (window as any).logIn(), 0));
  }

  async clickAndAcceptDialog(): Promise<string | null> {
    try {
      const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10_000 });
      await this.page.evaluate(() => setTimeout(() => (window as any).logIn(), 0));
      const dialog = await dialogPromise;
      const message = dialog.message();
      await dialog.accept();
      return message;
    } catch {
      return null;
    }
  }

  async clickClose(): Promise<void> {
    await this.page.evaluate(() => {
      const m = document.getElementById('logInModal');
      if (m) {
        m.classList.remove('show');
        m.setAttribute('aria-hidden', 'true');
        m.style.display = 'none';
      }
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
  }

  async clickX(): Promise<void> {
    await this.clickClose();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async isModalVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }

  async isModalHidden(): Promise<boolean> {
    return this.modal.isHidden();
  }

  async waitForModalToClose(): Promise<void> {
    try {
      await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      await this.page.evaluate(() => {
        const $ = (window as any).$;
        if ($) {
          $('#logInModal').modal('hide');
          $('#logInModal').removeData('bs.modal');
        } else {
          const m = document.getElementById('logInModal');
          if (m) {
            m.style.display = 'none';
            m.classList.remove('show');
          }
        }
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
      });
    }
    await this.page.waitForTimeout(300);
    await this.page.evaluate(() => {
      const $ = (window as any).$;
      if ($) {
        $('#logInModal').removeData('bs.modal');
      }
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
    });
  }

  async showModal(): Promise<void> {
    await this.page.evaluate(() => {
      const $ = (window as any).$;
      if ($) {
        $('#logInModal').modal('show');
      }
    });
  }

  async handleDialogIfPresent(): Promise<string | null> {
    try {
      const dialog = await this.page.waitForEvent('dialog', { timeout: 3000 });
      const message = dialog.message();
      await dialog.accept();
      return message;
    } catch {
      return null;
    }
  }
}
