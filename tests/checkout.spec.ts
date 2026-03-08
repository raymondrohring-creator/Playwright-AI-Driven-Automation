import { test, expect } from '@playwright/test';

// spec: test-plan.md#5-checkout-process
// seed: tests/seed.spec.ts

test.describe('Checkout Process', () => {
  test('Guest checkout initiation', async ({ page }) => {
    // Setup: Navigate to homepage and add product to cart
    await page.goto('https://cloudberrystore.services/');
    await page.getByRole('link', { name: 'MacBook' }).first().click();
    
    // Wait for Add to Cart action to complete
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForLoadState('networkidle');

    // 1. Click Checkout with items in cart and wait for navigation
    await Promise.all([
      page.waitForURL(/checkout\//),
      page.getByRole('link', { name: ' Checkout' }).click()
    ]);

    // Verify: Checkout page loads with personal details form
    await expect(page).toHaveTitle('Checkout');
    await expect(page.getByRole('group', { name: 'Your Personal Details' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Register Account' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Guest Checkout' })).toBeVisible();

    // 2. Select Guest Checkout and attempt to continue without filling required fields
    await page.getByRole('radio', { name: 'Guest Checkout' }).click();
    
    // Attempt to submit the form with empty required fields
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await continueButton.click();

    // Verify: Form validation prevents submission
    // The page should still be on the checkout form title
    await expect(page).toHaveTitle('Checkout');
    
    // Verify: The form is still visible (form submission was prevented)
    await expect(page.getByRole('group', { name: 'Your Personal Details' })).toBeVisible();
    
    // Verify: Continue button is still available (page didn't navigate)
    await expect(continueButton).toBeEnabled();
  });

  test('Complete guest checkout', async ({ page }) => {
    // Setup: Navigate to homepage and add product to cart
    await page.goto('https://cloudberrystore.services/');
    await page.getByRole('link', { name: 'MacBook' }).first().click();
    
    // Wait for Add to Cart action to complete
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForLoadState('networkidle');

    // 1. Navigate to checkout and wait for navigation
    await Promise.all([
      page.waitForURL(/checkout\//),
      page.getByRole('link', { name: ' Checkout' }).click()
    ]);

    // Fill personal details and continue
    await page.getByRole('radio', { name: 'Guest Checkout' }).click();
    await page.getByRole('textbox', { name: '* First Name' }).fill('John');
    await page.getByRole('textbox', { name: '* Last Name' }).fill('Doe');
    await page.getByRole('textbox', { name: '* E-Mail' }).fill('john.doe@example.com');

    // Verify: Shipping address form appears
    await expect(page.getByRole('group', { name: 'Shipping Address' })).toBeVisible();

    // 2. Fill shipping address and continue
    await page.getByRole('textbox', { name: '* Address' }).fill('123 Main Street');
    await page.getByRole('textbox', { name: '* City' }).fill('London');
    await page.getByRole('textbox', { name: '* Post Code' }).fill('SW1A 1AA');
    
    // Select Country first (United Kingdom)
    await page.getByRole('combobox', { name: '* Country' }).selectOption('United Kingdom');
    
    // Now select Region/State after country is selected
    await page.getByRole('combobox', { name: '* Region' }).selectOption('Greater London');

    // Verify: Payment method selection available before continuing
    await expect(page.getByRole('group', { name: 'Payment Method' })).toBeVisible();

    // Click Continue to save guest account details
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify: Success message indicates guest account was saved
    await expect(page.locator('text=Success: Your guest account information has been saved!')).toBeVisible();

    // 3. Verify checkout still displays with order summary
    await expect(page).toHaveTitle('Checkout');
    await expect(page.locator('text=1x MacBook')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Order' })).toBeDisabled();
  });

  test('Registered checkout', async ({ page }) => {
    // Setup: Navigate to homepage and add product to cart
    await page.goto('https://cloudberrystore.services/');
    await page.getByRole('link', { name: 'MacBook' }).first().click();
    
    // Wait for Add to Cart action to complete
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForLoadState('networkidle');

    // Navigate to checkout and wait for navigation
    await Promise.all([
      page.waitForURL(/checkout\//),
      page.getByRole('link', { name: ' Checkout' }).click()
    ]);

    // 1. Select Register Account option
    await page.getByRole('radio', { name: 'Register Account' }).click();

    // Verify: Register Account option is now selected
    await expect(page.getByRole('radio', { name: 'Register Account' })).toBeChecked();

    // 2. Fill registration and personal details
    await page.getByRole('textbox', { name: '* First Name' }).fill('Jane');
    await page.getByRole('textbox', { name: '* Last Name' }).fill('Smith');
    await page.getByRole('textbox', { name: '* E-Mail' }).fill('jane.smith@example.com');

    // Fill shipping address
    await page.getByRole('textbox', { name: '* Address' }).fill('456 Oak Avenue');
    await page.getByRole('textbox', { name: '* City' }).fill('Manchester');
    await page.getByRole('textbox', { name: '* Post Code' }).fill('M1 1AE');
    
    // Select Country first (United Kingdom)
    await page.getByRole('combobox', { name: '* Country' }).selectOption('United Kingdom');
    
    // Now select Region/State after country is selected
    await page.getByRole('combobox', { name: '* Region' }).selectOption('Greater Manchester');

    // Fill password field (required for registration)
    await page.getByRole('textbox', { name: '* Password' }).fill('SecurePassword123!');

    // Accept privacy policy if required
    const privacyCheckbox = page.getByRole('checkbox').filter({ hasText: 'Privacy Policy' });
    const isVisible = await privacyCheckbox.isVisible();
    if (isVisible) {
      await privacyCheckbox.check();
    }

    // 3. Click Continue to create account and proceed
    await page.getByRole('button', { name: 'Continue' }).click();

    // Verify: Account created and form processed successfully (no error messages)
    await expect(page.locator('div#error-firstname')).not.toBeVisible();
    
    // Verify: Checkout form still displays (account was created)
    await expect(page).toHaveTitle('Checkout');
    
    // Verify: Order summary displayed with correct product
    await expect(page.locator('text=1x MacBook')).toBeVisible();
  });
});
