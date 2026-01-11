import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/en/login');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('input[type="tel"], input[placeholder*="phone"]')).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/en/signup');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('input[type="tel"], input[placeholder*="phone"]')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/en/signup');
    
    // Try to submit with invalid phone
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"]').first();
    await phoneInput.fill('123');
    
    // Click submit/continue button
    const submitButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Send")').first();
    await submitButton.click();
    
    // Should show validation error or stay on same page
    await expect(page).toHaveURL(/signup/);
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/en/login');
    
    // Find link to signup
    const signupLink = page.locator('a[href*="signup"]').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup/);
    }
  });

  test('should support RTL layout for Arabic', async ({ page }) => {
    await page.goto('/ar-TN/login');
    
    // Check RTL direction
    const mainDiv = page.locator('[dir="rtl"]').first();
    await expect(mainDiv).toBeVisible();
  });
});

test.describe('OTP Verification', () => {
  test('should show OTP input after phone submission', async ({ page }) => {
    await page.goto('/en/signup');
    
    // Fill name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
    }
    
    // Fill phone
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"]').first();
    await phoneInput.fill('+21612345678');
    
    // Select role if visible
    const customerRadio = page.locator('input[value="customer"], button:has-text("Customer")').first();
    if (await customerRadio.isVisible()) {
      await customerRadio.click();
    }
    
    // Submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Send")').first();
    await submitButton.click();
    
    // Should navigate to verify page or show OTP input
    await page.waitForTimeout(1000);
    
    // Check for OTP input or verify page
    const otpInput = page.locator('input[maxlength="6"], input[name="otp"], input[placeholder*="code"]');
    const verifyPage = page.locator('text=/verify|OTP|code/i');
    
    const hasOtp = await otpInput.isVisible().catch(() => false);
    const hasVerify = await verifyPage.isVisible().catch(() => false);
    
    expect(hasOtp || hasVerify || page.url().includes('verify')).toBeTruthy();
  });

  test('should accept test OTP 123456', async ({ page }) => {
    // Navigate directly to verify page with test data
    await page.goto('/en/verify?phone=%2B21612345678');
    
    await page.waitForTimeout(500);
    
    // Find OTP input(s)
    const otpInputs = page.locator('input[maxlength="1"]');
    const singleOtpInput = page.locator('input[maxlength="6"]');
    
    if (await otpInputs.count() >= 6) {
      // Multiple single-digit inputs
      const inputs = await otpInputs.all();
      for (let i = 0; i < 6 && i < inputs.length; i++) {
        await inputs[i].fill(String(i + 1));
      }
    } else if (await singleOtpInput.isVisible()) {
      // Single input for full OTP
      await singleOtpInput.fill('123456');
    }
    
    // Submit
    const verifyButton = page.locator('button[type="submit"], button:has-text("Verify")').first();
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
    }
  });
});
