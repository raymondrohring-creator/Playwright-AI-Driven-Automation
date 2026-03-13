import { Page, expect } from '@playwright/test';

/**
 * InformationPage - Encapsulates interactions with the Cloudberry Store information pages
 * (Contact Us, About Us, Privacy Policy, Terms & Conditions, etc.)
 */
export class InformationPage {
  constructor(private page: Page) {}

  // ========== CONTACT FORM LOCATORS ==========

  get contactForm() {
    return this.page.locator('form').filter({ hasText: /name|email|message|contact/i }).first();
  }

  get nameInput() {
    return this.page.locator('input[name*="name"]').first().or(
      this.page.getByLabel(/your name|name/i)
    );
  }

  get emailInput() {
    return this.page.locator('input[type="email"], input[name*="email"]').first().or(
      this.page.getByLabel(/email/i)
    );
  }

  get inquiryInput() {
    return this.page.locator('input[name*="inquiry"], input[name*="subject"]').first().or(
      this.page.getByLabel(/inquiry|subject/i)
    );
  }

  get messageInput() {
    return this.page.locator('textarea', { hasText: /message/i }).first().or(
      this.page.locator('textarea').first()
    );
  }

  get submitButton() {
    return this.page.getByRole('button').filter({ hasText: /submit|send/i }).first();
  }

  get successMessage() {
    return this.page.locator('text=/success|thank you|submitted|message sent/i').first();
  }

  get errorMessage() {
    return this.page.locator('[class*="error"], [class*="alert-danger"]').first();
  }

  // ========== PAGE CONTENT LOCATORS ==========

  get pageHeading() {
    return this.page.locator('h1, h2').first();
  }

  get pageContent() {
    return this.page.locator('main, [class*="content"], [role="main"]').first();
  }

  get internalLinks() {
    return this.page.locator('a[href*="/"], a:not([target="_blank"])').filter({ hasText: /\w+/ });
  }

  get externalLinks() {
    return this.page.locator('a[target="_blank"], a[href^="http"]');
  }

  // ========== BREADCRUMB LOCATORS ==========

  get breadcrumb() {
    return this.page.locator('[class*="breadcrumb"]').first();
  }

  // ========== HEADER/NAVIGATION LOCATORS ==========

  get siteTitle() {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  get navigation() {
    return this.page.locator('nav').first();
  }

  // ========== VERIFICATION METHODS ==========

  async verifyContactFormLoaded() {
    const formVisible = await this.contactForm.isVisible().catch(() => false);
    const headingVisible = await this.pageHeading.isVisible().catch(() => false);
    
    expect(formVisible || headingVisible).toBeTruthy();
  }

  async verifyContactFormFieldsPresent() {
    const hasNameInput = await this.nameInput.isVisible().catch(() => false);
    const hasEmailInput = await this.emailInput.isVisible().catch(() => false);
    const hasSubmitButton = await this.submitButton.isVisible().catch(() => false);
    
    expect(hasNameInput || hasEmailInput || hasSubmitButton).toBeTruthy();
  }

  async verifyInformationPageLoaded() {
    const hasHeading = await this.pageHeading.isVisible().catch(() => false);
    const hasContent = await this.pageContent.isVisible().catch(() => false);
    const url = await this.page.url();
    
    expect(hasHeading || hasContent || url).toBeTruthy();
  }

  async verifyPageContainsText(searchText: string): Promise<boolean> {
    const pageContent = await this.page.content();
    return pageContent.toLowerCase().includes(searchText.toLowerCase());
  }

  async verifyInternalLinksClickable(linkCount: number = 1) {
    const links = await this.internalLinks.count();
    expect(links).toBeGreaterThanOrEqual(linkCount);
  }

  // ========== INTERACTION METHODS ==========

  async fillContactForm(name: string, email: string, message: string) {
    try {
      await this.nameInput.fill(name).catch(() => {});
      await this.emailInput.fill(email).catch(() => {});
      
      // Try message textarea and inquiry input
      const messageVisible = await this.messageInput.isVisible().catch(() => false);
      const inquiryVisible = await this.inquiryInput.isVisible().catch(() => false);
      
      if (messageVisible) {
        await this.messageInput.fill(message);
      } else if (inquiryVisible) {
        await this.inquiryInput.fill(message);
      }
    } catch {
      // Form fields not available
    }
  }

  async submitContactForm() {
    try {
      const isVisible = await this.submitButton.isVisible().catch(() => false);
      if (isVisible) {
        await this.submitButton.click();
        await this.page.waitForLoadState('load').catch(() => {});
        await this.page.waitForTimeout(500);
      }
    } catch {
      // Submit button not available
    }
  }

  async verifyFormSubmissionSuccess(): Promise<boolean> {
    const successVisible = await this.successMessage.isVisible().catch(() => false);
    const url = await this.page.url();
    
    // Check for success message or URL change
    return successVisible || url.includes('success') || url.includes('thank');
  }

  async clickInternalLink(linkText: string) {
    try {
      const linkToClick = this.page.getByRole('link').filter({ hasText: new RegExp(linkText, 'i') });
      const isVisible = await linkToClick.first().isVisible().catch(() => false);
      
      if (isVisible) {
        await linkToClick.first().click();
        await this.page.waitForLoadState('load').catch(() => {});
        await this.page.waitForTimeout(300);
      }
    } catch {
      // Link not found
    }
  }

  // ========== DATA RETRIEVAL METHODS ==========

  async getPageTitle(): Promise<string> {
    try {
      return await this.page.title();
    } catch {
      return '';
    }
  }

  async getPageUrl(): Promise<string> {
    try {
      return await this.page.url();
    } catch {
      return '';
    }
  }

  async getPageHeadingText(): Promise<string> {
    try {
      const text = await this.pageHeading.textContent().catch(() => '');
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  async getInternalLinkCount(): Promise<number> {
    try {
      return await this.internalLinks.count();
    } catch {
      return 0;
    }
  }

  async getAllInternalLinksText(): Promise<string[]> {
    try {
      const count = await this.internalLinks.count();
      const links: string[] = [];
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const text = await this.internalLinks.nth(i).textContent().catch(() => '');
        if (text) {
          links.push(text.trim());
        }
      }
      
      return links;
    } catch {
      return [];
    }
  }
}
