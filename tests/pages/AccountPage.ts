import { Page, expect } from '@playwright/test';

/**
 * AccountPage - Encapsulates user registration, login, and account interactions
 */
export class AccountPage {
  constructor(private page: Page) {}

  // ========== REGISTRATION LOCATORS ==========

  get registerLink() {
    return this.page.getByRole('link', { name: /Register/i });
  }

  get firstNameInput() {
    return this.page.getByLabel(/first name/i);
  }

  get lastNameInput() {
    return this.page.getByLabel(/last name/i);
  }

  get emailInput() {
    return this.page.getByLabel(/e-mail/i);
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i).first();
  }

  get confirmPasswordInput() {
    // Try multiple selectors for password confirmation field
    return this.page.locator('input[type="password"]').nth(1).or(
      this.page.getByLabel(/confirm/i, { exact: false })
    ).or(
      this.page.locator('input[name*="confirm"]')
    ).or(
      this.page.locator('input[placeholder*="confirm"]', { exact: false })
    );
  }

  get agreeCheckbox() {
    return this.page.getByRole('checkbox');
  }

  get continueButton() {
    return this.page.getByRole('button', { name: /continue/i });
  }

  // ========== LOGIN LOCATORS ==========

  get loginLink() {
    return this.page.getByRole('link', { name: /Login/i });
  }

  get loginEmailInput() {
    return this.page.getByLabel(/e-mail/i);
  }

  get loginPasswordInput() {
    return this.page.getByLabel(/password/i).first();
  }

  get loginButton() {
    return this.page.getByRole('button', { name: /login/i });
  }

  get forgotPasswordLink() {
    return this.page.getByRole('link', { name: /forgot your password/i });
  }

  // ========== SUCCESS/ERROR MESSAGES ==========

  get successMessage() {
    return this.page.locator('[class*="success"]');
  }

  get errorMessage() {
    return this.page.locator('[class*="error"], [class*="danger"], [class*="alert"], [role="alert"]').first();
  }

  get accountHeading() {
    return this.page.getByRole('heading', { name: /my account/i });
  }

  get logoutLink() {
    return this.page.getByRole('link', { name: /logout/i });
  }

  // ========== VERIFICATION METHODS ==========

  async verifyRegistrationPageLoaded() {
    await expect(this.page).toHaveTitle(/register/i);
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    // Verify at least the main inputs are present
    const inputs = await this.page.locator('input[type="text"], input[type="email"], input[type="password"]').count();
    expect(inputs).toBeGreaterThan(3);
  }

  async verifyLoginPageLoaded() {
    await expect(this.page).toHaveTitle(/login/i);
    await expect(this.loginEmailInput).toBeVisible();
    await expect(this.loginPasswordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyRegistrationSuccess() {
    // After successful registration, we might see:
    // 1. A success alert message
    // 2. A redirect to account page
    // 3. A success message on the page
    
    // Try multiple ways to verify success
    const successAlert = this.page.locator('.alert.alert-success, div[class*="alert-success"], div[role="alert"][class*="success"]').first();
    const accountTitle = this.page.locator('h1, h2, h3').filter({ hasText: /account|profile|dashboard/i }).first();
    
    // Check if either success message or account page is visible
    const hasSuccessAlert = await successAlert.isVisible().catch(() => false);
    const hasAccountTitle = await accountTitle.isVisible().catch(() => false);
    const isAccountPage = (await this.page.title()).toLowerCase().includes('account') ||
                         (await this.page.url()).includes('/account/');
    
    const isSuccessful = hasSuccessAlert || hasAccountTitle || isAccountPage;
    expect(isSuccessful).toBeTruthy();
  }

  async verifyLoginSuccess() {
    await expect(this.accountHeading).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
  }

  async verifyRegistrationError(errorText?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (errorText) {
      await expect(this.page).toContainText(errorText);
    }
  }

  async verifyLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyLoginFormRejected() {
    // Form is still visible after submission attempt (browser validation)
    await expect(this.loginEmailInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyRegistrationFormRejected() {
    // Form is still visible after submission attempt (browser validation)
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.continueButton).toBeVisible();
  }

  async verifyLoggedOut() {
    await expect(this.page).toHaveTitle(/account/i);
    const logoutLinkVisible = await this.logoutLink.isVisible().catch(() => false);
    expect(logoutLinkVisible).toBeFalsy();
  }

  // ========== INTERACTION METHODS ==========

  async navigateToRegister() {
    // Navigate directly to the register page
    const baseUrl = this.page.url();
    const registerUrl = new URL('index.php?route=account/register&language=en-gb', baseUrl).toString();
    await this.page.goto(registerUrl);
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async fillRegistrationForm(firstName: string, lastName: string, email: string, password: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    // Try to fill confirm password if it exists
    const confirmPasswordInputs = await this.page.locator('input[type="password"]').count();
    if (confirmPasswordInputs > 1) {
      await this.page.locator('input[type="password"]').nth(1).fill(password);
    }
  }

  async acceptTerms() {
    const checkboxes = await this.agreeCheckbox.all();
    if (checkboxes.length > 0) {
      await checkboxes[0].check();
    }
  }

  async submitRegistration() {
    await this.continueButton.click();
    // Don't wait for networkidle - just wait for DOM to settle
    await this.page.waitForLoadState('load').catch(() => {});
    // Give the page a moment to process the response
    await this.page.waitForTimeout(500);
  }

  async navigateToLogin() {
    // Navigate directly to the login page
    const baseUrl = this.page.url();
    const loginUrl = new URL('index.php?route=account/login&language=en-gb', baseUrl).toString();
    await this.page.goto(loginUrl);
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async fillLoginForm(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
  }

  async submitLogin() {
    await this.loginButton.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async logout() {
    await this.logoutLink.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async attemptRegistrationWithoutAgreeingTerms(firstName: string, lastName: string, email: string, password: string) {
    await this.fillRegistrationForm(firstName, lastName, email, password);
    // Don't accept terms - just try to submit
    await this.continueButton.click();
    await this.page.waitForTimeout(500);
  }

  async attemptRegistrationWithMissingFields() {
    // Try to submit without filling required fields
    await this.continueButton.click();
    await this.page.waitForTimeout(500);
  }

  async attemptLoginWithWrongCredentials(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(500);
  }
}
