import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

export class LoginPage {
  readonly page: Page;
  readonly utils:Utils; 
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly profileButton: Locator;
  readonly logoutButton: Locator;
  readonly closeNotyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.signInButton = page.getByRole("button", { name: "Sign in" });

    // Logout
    this.profileButton = page.locator("#user-account-icon");
    this.logoutButton = page.getByRole('link', { name: 'Logout' });
    this.closeNotyMessage = page.getByText('× Signed out successfully.');
  }

  async login(email: string, password: string) {
    await this.page.goto("/users/login");
    await this.page.waitForLoadState('networkidle');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    //await this.page.waitForSelector(".block_ui", { state: "hidden" });
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async loginWithClientId(email: string, password: string, clientId?: string) {
    await this.page.goto("/users/login");
    await this.page.waitForLoadState('networkidle');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForSelector(".block_ui", { state: "hidden" });
    if (clientId) {
      await this.page.goto(`/admin/signin/${clientId}`);
    }
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async logout(): Promise<string>{
    await this.profileButton.click();
    await this.logoutButton.click();
    await this.closeNotyMessage.waitFor({ state: "visible" });
    const notyMessage = await this.closeNotyMessage.textContent();
    await this.page.waitForLoadState('networkidle');
    await this.utils.loopWait(this.page,false);
    return notyMessage || "";
  }

  async logoutViaUrl(): Promise<string>{
    await this.page.goto("/users/logout");
    await this.page.waitForLoadState('networkidle');
    await this.utils.loopWait(this.page,false);
    return "Logged out successfully";
  }
}
