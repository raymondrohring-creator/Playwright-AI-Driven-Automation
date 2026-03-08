import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';

// ============================================================================
// TESTS
// ============================================================================

test.describe('Checkout Process (POM)', () => {
  test('5.1 Guest checkout initiation', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);

    await homePage.goto();
    await homePage.selectProduct('MacBook');
    await homePage.addToCart();
    await homePage.goToCheckout();

    // Verify: Checkout page loads with personal details form
    await checkoutPage.verifyCheckoutPageLoaded();
    await checkoutPage.verifyPersonalDetailsFormVisible();

    // Step 1: Guest checkout and form validation
    // Select Guest Checkout and attempt to continue without filling required fields
    await checkoutPage.selectGuestCheckout();
    await checkoutPage.attemptContinueWithEmptyFields();

    // Verify: Form validation prevents submission
    await checkoutPage.verifyFormValidationPrevented();
  });

  test('5.2 Complete guest checkout', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);

    await homePage.goto();
    await homePage.selectProduct('MacBook');
    await homePage.addToCart();
    await homePage.goToCheckout();

    // Step 1: Fill personal details
    await checkoutPage.selectGuestCheckout();
    await checkoutPage.fillPersonalDetails('John', 'Doe', 'john.doe@example.com');
    await checkoutPage.verifyShippingAddressFormVisible();

    // Step 2: Fill shipping address
    await checkoutPage.fillShippingAddress('123 Main Street', 'London', 'SW1A 1AA');
    await checkoutPage.selectCountryAndRegion('United Kingdom', 'Greater London');
    await checkoutPage.verifyPaymentMethodAvailable();

    // Step 3: Submit guest details
    await checkoutPage.clickContinue();
    await checkoutPage.verifySuccessMessage();

    // Verify: Order summary and confirmation
    await checkoutPage.verifyOrderSummary('1x MacBook');
    await checkoutPage.verifyConfirmOrderDisabled();
  });

  test('5.3 Registered checkout', async ({ page }) => {
    // Setup
    const homePage = new HomePage(page);
    const checkoutPage = new CheckoutPage(page);

    await homePage.goto();
    await homePage.selectProduct('MacBook');
    await homePage.addToCart();
    await homePage.goToCheckout();

    // Step 1: Select Register Account option
    await checkoutPage.selectRegisterAccount();
    await checkoutPage.verifyRegisterAccountChecked();

    // Step 2: Fill registration and personal details
    await checkoutPage.fillPersonalDetails('Jane', 'Smith', 'jane.smith@example.com');

    // Step 3: Fill shipping address
    await checkoutPage.fillShippingAddress('456 Oak Avenue', 'Manchester', 'M1 1AE');
    await checkoutPage.selectCountryAndRegion('United Kingdom', 'Greater Manchester');

    // Step 4: Fill password and privacy policy
    await checkoutPage.fillPassword('SecurePassword123!');
    await checkoutPage.acceptPrivacyPolicyIfVisible();

    // Step 5: Create account and proceed
    await checkoutPage.clickContinue();

    // Verify: Account created successfully
    await checkoutPage.verifyNoFirstNameError();
    await checkoutPage.verifyOrderSummary('1x MacBook');
  });
});