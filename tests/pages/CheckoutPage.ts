import { Page, expect } from '@playwright/test';

/**
 * CheckoutPage - Encapsulates all checkout page interactions and verifications
 */
export class CheckoutPage {
  constructor(private page: Page) {}

  // ========== LOCATORS ==========
  
  get personalDetailsGroup() {
    return this.page.getByRole('group', { name: 'Your Personal Details' });
  }

  get shippingAddressGroup() {
    return this.page.getByRole('group', { name: 'Shipping Address' });
  }

  get paymentMethodGroup() {
    return this.page.getByRole('group', { name: 'Payment Method' });
  }

  get registerAccountRadio() {
    return this.page.getByRole('radio', { name: 'Register Account' });
  }

  get guestCheckoutRadio() {
    return this.page.getByRole('radio', { name: 'Guest Checkout' });
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get confirmOrderButton() {
    return this.page.getByRole('button', { name: 'Confirm Order' });
  }

  get firstNameInput() {
    return this.page.getByRole('textbox', { name: '* First Name' });
  }

  get lastNameInput() {
    return this.page.getByRole('textbox', { name: '* Last Name' });
  }

  get emailInput() {
    return this.page.getByRole('textbox', { name: '* E-Mail' });
  }

  get addressInput() {
    return this.page.getByRole('textbox', { name: '* Address' });
  }

  get cityInput() {
    return this.page.getByRole('textbox', { name: '* City' });
  }

  get postCodeInput() {
    return this.page.getByRole('textbox', { name: '* Post Code' });
  }

  get countrySelect() {
    return this.page.getByRole('combobox', { name: '* Country' });
  }

  get regionSelect() {
    return this.page.getByRole('combobox', { name: '* Region' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: '* Password' });
  }

  // ========== VERIFICATION METHODS ==========

  async verifyCheckoutPageLoaded() {
    await expect(this.page).toHaveTitle('Checkout');
    await expect(this.personalDetailsGroup).toBeVisible();
  }

  async verifyPersonalDetailsFormVisible() {
    await expect(this.personalDetailsGroup).toBeVisible();
    await expect(this.registerAccountRadio).toBeVisible();
    await expect(this.guestCheckoutRadio).toBeVisible();
  }

  async verifyFormValidationPrevented() {
    await expect(this.page).toHaveTitle('Checkout');
    await expect(this.personalDetailsGroup).toBeVisible();
    await expect(this.continueButton).toBeEnabled();
  }

  async verifyShippingAddressFormVisible() {
    await expect(this.shippingAddressGroup).toBeVisible();
  }

  async verifyPaymentMethodAvailable() {
    await expect(this.paymentMethodGroup).toBeVisible();
  }

  async verifySuccessMessage() {
    await expect(this.page.locator('text=Success: Your guest account information has been saved!')).toBeVisible();
  }

  async verifyOrderSummary(productName: string = '1x MacBook') {
    await expect(this.page).toHaveTitle('Checkout');
    await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  }

  async verifyConfirmOrderDisabled() {
    await expect(this.confirmOrderButton).toBeDisabled();
  }

  async verifyNoFirstNameError() {
    await expect(this.page.locator('div#error-firstname')).not.toBeVisible();
  }

  async verifyRegisterAccountChecked() {
    await expect(this.registerAccountRadio).toBeChecked();
  }

  // ========== INTERACTION METHODS ==========

  async selectGuestCheckout() {
    await this.guestCheckoutRadio.click();
  }

  async selectRegisterAccount() {
    await this.registerAccountRadio.click();
  }

  async fillPersonalDetails(firstName: string, lastName: string, email: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
  }

  async fillShippingAddress(address: string, city: string, postCode: string) {
    await this.addressInput.fill(address);
    await this.cityInput.fill(city);
    await this.postCodeInput.fill(postCode);
  }

  async selectCountryAndRegion(country: string, region: string) {
    // Country must be selected before region
    await this.countrySelect.selectOption(country);
    // Wait for region dropdown to be populated
    await this.page.waitForLoadState('networkidle');
    await this.regionSelect.selectOption(region);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async acceptPrivacyPolicyIfVisible() {
    const privacyCheckbox = this.page.getByRole('checkbox').filter({ hasText: 'Privacy Policy' });
    const isVisible = await privacyCheckbox.isVisible();
    if (isVisible) {
      await privacyCheckbox.check();
    }
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async attemptContinueWithEmptyFields() {
    await this.continueButton.click();
  }
}