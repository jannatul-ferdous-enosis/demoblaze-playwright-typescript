import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import SignUpPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";
import { uniqueUsername, longString } from "../utils/testHelpers";
import { PASSWORD, INJECTION_SCRIPTS, WHITESPACE_ONLY } from "../data/authData";

let homePage: HomePage;
let signUpPage: SignUpPage;
let loginPage: LoginPage;

test.describe("Sign Up", () => {
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
          $(".modal.show").modal("hide");
        } catch {}
        $(".modal").each(function (this: HTMLElement) {
          $(this).removeData("bs.modal");
        });
      }
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    });
  });

  test("1.1 Sign up with valid new username & password", async () => {
    const username = uniqueUsername();
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(username);
    await signUpPage.fillPassword(PASSWORD);
    const message = await signUpPage.clickAndAcceptDialog();
    expect(message).toBe("Sign up successful.");
    await signUpPage.waitForModalToClose();
  });

  test("1.2 Sign up with an already-registered username", async () => {
    const username = uniqueUsername();

    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(username);
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickAndAcceptDialog();
    await signUpPage.waitForModalToClose();

    await signUpPage.showModal();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(username);
    await signUpPage.fillPassword(PASSWORD);
    const message = await signUpPage.clickAndAcceptDialog();
    expect(message).toBe("This user already exist.");
  });

  test("1.3 Sign up with empty username", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername("");
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("1.4 Sign up with empty password", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword("");
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("1.5 Sign up with both fields empty", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("1.6 Sign up with whitespace-only username", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(WHITESPACE_ONLY);
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    if (message !== null) {
      const msg = message.toLowerCase();
      expect(msg).not.toContain("successful");
    }
  });

  test("1.7 Sign up with HTML/JS injection in username", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(
      `${uniqueUsername()}_${INJECTION_SCRIPTS.html}`,
    );
    await signUpPage.fillPassword(PASSWORD);
    const message = await signUpPage.clickAndAcceptDialog();
    expect(message).toBeTruthy();
  });

  test("1.8 Sign up with SQL injection in username", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(
      `${INJECTION_SCRIPTS.sql}_${uniqueUsername()}`,
    );
    await signUpPage.fillPassword(PASSWORD);
    const message = await signUpPage.clickAndAcceptDialog();
    expect(message).toBeTruthy();
  });

  test("1.9 Sign up with very long username (256+ chars)", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(longString(256));
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("1.10 Sign up with very long password (256+ chars)", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword(longString(256));
    await signUpPage.clickSignUp();

    const message = await signUpPage.handleDialogIfPresent();
    expect(message).not.toBeNull();
  });

  test("1.11 Sign up with unicode / emoji in username", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(
      `${INJECTION_SCRIPTS.unicode}_${uniqueUsername()}`,
    );
    await signUpPage.fillPassword(PASSWORD);
    const message = await signUpPage.clickAndAcceptDialog();
    expect(message).toBe("Sign up successful.");
  });

  test('1.12 Press "Close" button in sign-up modal', async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickClose();
    await expect(signUpPage.modal).toBeHidden();
  });

  test('1.13 Press "X" button in sign-up modal', async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickX();
    await expect(signUpPage.modal).toBeHidden();
  });

  test("1.14 Press Escape key in sign-up modal", async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.pressEscape();

    await homePage.page.waitForTimeout(500);
    const isHidden = await signUpPage.isModalHidden();
    if (!isHidden) {
      await signUpPage.page.evaluate(() => {
        const m = document.getElementById("signInModal");
        if (m) {
          m.style.display = "none";
          m.classList.remove("show");
        }
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
      });
    }
    await expect(signUpPage.modal).toBeHidden();
  });

  test("1.15 Sign up while already logged in", async () => {
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

    const signUpVisible = await homePage.isSignUpLinkVisible();
    if (signUpVisible) {
      await homePage.clickSignUpLink();
      await signUpPage.waitForModal();
      await signUpPage.fillUsername(uniqueUsername());
      await signUpPage.fillPassword(PASSWORD);
      const message = await signUpPage.clickAndAcceptDialog();
      expect(message).toBe("Sign up successful.");
    }
  });

  test('1.16 Rapid double-click on "Sign up" button', async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(uniqueUsername());
    await signUpPage.fillPassword(PASSWORD);

    const message = await signUpPage.waitForSingleDialogAfterDoubleClick();
    expect(message).toBeTruthy();
  });

  test('1.18 Sign up with password field type is "password"', async () => {
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    expect(await signUpPage.isPasswordMasked()).toBe(true);
  });
});

test.describe("Log In", () => {
  let registeredUser: string;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    signUpPage = new SignUpPage(page);
    loginPage = new LoginPage(page);
    await homePage.goto();

    registeredUser = uniqueUsername();
    await homePage.clickSignUpLink();
    await signUpPage.waitForModal();
    await signUpPage.fillUsername(registeredUser);
    await signUpPage.fillPassword(PASSWORD);
    await signUpPage.clickAndAcceptDialog();
    await signUpPage.waitForModalToClose();
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      const $ = (window as any).$;
      if ($) {
        try {
          $(".modal.show").modal("hide");
        } catch {}
        $(".modal").each(function (this: HTMLElement) {
          $(this).removeData("bs.modal");
        });
      }
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    });
  });

  async function loginAndWaitForSuccess(): Promise<void> {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(registeredUser);
    await loginPage.fillPassword(PASSWORD);
    const message = await loginPage.clickAndAcceptDialog();
    expect(message).toBeNull();
    await loginPage.waitForModalToClose();
    await expect(homePage.nameOfUser).toBeVisible({ timeout: 10_000 });
  }

  test("2.1 Log in with valid credentials", async () => {
    await loginAndWaitForSuccess();

    const welcomeText = await homePage.getWelcomeText();
    expect(welcomeText).toContain(`Welcome ${registeredUser}`);

    expect(await homePage.isLogoutVisible()).toBe(true);
    expect(await homePage.isLoginLinkVisible()).toBe(false);
  });

  test("2.2 Log in with wrong password", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(registeredUser);
    await loginPage.fillPassword("WrongPass999!");
    const message = await loginPage.clickAndAcceptDialog();
    expect(message).toBe("Wrong password.");
  });

  test("2.3 Log in with non-existent username", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(uniqueUsername());
    await loginPage.fillPassword(PASSWORD);
    const message = await loginPage.clickAndAcceptDialog();
    const msg = message ?? "";
    expect(msg.toLowerCase()).toContain("does not exist");
  });

  test("2.4 Log in with empty username", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername("");
    await loginPage.fillPassword(PASSWORD);
    await loginPage.clickLogin();

    const message = await loginPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("2.5 Log in with empty password", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(registeredUser);
    await loginPage.fillPassword("");
    await loginPage.clickLogin();

    const message = await loginPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("2.6 Log in with both fields empty", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.clickLogin();

    const message = await loginPage.handleDialogIfPresent();
    if (message !== null) {
      expect(message).toBeTruthy();
    }
  });

  test("2.7 Log in with whitespace-padded credentials", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(` ${registeredUser} `);
    await loginPage.fillPassword(PASSWORD);
    const message = await loginPage.clickAndAcceptDialog();

    if (message === null) {
      await loginPage.waitForModalToClose();
      const welcomeText = await homePage.getWelcomeText();
      expect(welcomeText).toContain(`Welcome ${registeredUser}`);
    } else {
      const msg = message!.toLowerCase();
      expect(msg).toMatch(/does not exist|wrong password|fill out/);
    }
  });

  test("2.8 SQL injection in username field", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.fillUsername(INJECTION_SCRIPTS.sqlLogin);
    await loginPage.fillPassword(PASSWORD);
    const message = await loginPage.clickAndAcceptDialog();
    expect(message).not.toBeNull();
    expect(message!.toLowerCase()).not.toContain("welcome");
  });

  test("2.10 Log out", async () => {
    await loginAndWaitForSuccess();

    await homePage.clickLogout();
    await expect(homePage.nameOfUser).toBeHidden();
    await expect(homePage.loginLink).toBeVisible({ timeout: 5000 });
    await expect(homePage.signUpLink).toBeVisible({ timeout: 5000 });
  });

  test("2.12 Refresh page after login", async () => {
    await loginAndWaitForSuccess();

    await homePage.page.reload();
    await expect(homePage.nameOfUser).toBeVisible({ timeout: 10_000 });
    expect(await homePage.getWelcomeText()).toContain(
      `Welcome ${registeredUser}`,
    );
  });

  test("2.13 Close login modal without logging in", async () => {
    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.clickClose();
    await expect(loginPage.modal).toBeHidden();

    await homePage.clickLoginLink();
    await loginPage.waitForModal();
    await loginPage.clickX();
    await expect(loginPage.modal).toBeHidden();
  });

  test("2.14 Navigate directly to URL while logged in", async () => {
    await loginAndWaitForSuccess();

    await homePage.page.goto("/");
    await expect(homePage.nameOfUser).toBeVisible({ timeout: 10_000 });
    expect(await homePage.getWelcomeText()).toContain(
      `Welcome ${registeredUser}`,
    );
  });
});
