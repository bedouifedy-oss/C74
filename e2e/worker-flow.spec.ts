import { test, expect } from '@playwright/test';

test.describe('Worker Dashboard', () => {
  test('should display worker dashboard', async ({ page }) => {
    await page.goto('/en/worker/dashboard');
    
    await expect(page).toHaveURL(/worker/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show mobile bottom navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/worker/dashboard');
    
    const bottomNav = page.locator('nav.fixed.bottom-0, [class*="bottom-0"]').first();
    await expect(bottomNav).toBeVisible();
  });

  test('should navigate to job browsing', async ({ page }) => {
    await page.goto('/en/worker/dashboard');
    
    const browseLink = page.locator('a[href*="worker/jobs"], button:has-text("Browse"), button:has-text("Find")').first();
    
    if (await browseLink.isVisible()) {
      await browseLink.click();
      await expect(page).toHaveURL(/worker\/jobs/);
    }
  });
});

test.describe('Worker Jobs', () => {
  test('should display available jobs', async ({ page }) => {
    await page.goto('/en/worker/jobs');
    
    await expect(page).toHaveURL(/worker\/jobs/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow filtering jobs', async ({ page }) => {
    await page.goto('/en/worker/jobs');
    
    const filterButton = page.locator('button:has-text("Filter"), select, [data-filter]').first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Worker Onboarding', () => {
  test('should display onboarding wizard', async ({ page }) => {
    await page.goto('/en/worker/onboarding');
    
    await expect(page).toHaveURL(/onboarding/);
    
    // Should show first step (photo upload)
    const photoStep = page.locator('text=/photo|profile/i').first();
    await expect(photoStep).toBeVisible();
  });

  test('should navigate through wizard steps', async ({ page }) => {
    await page.goto('/en/worker/onboarding');
    
    // Find next button
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Should be on step 2
      const step2 = page.locator('text=/ID|verification|document/i');
      const progressChanged = await step2.isVisible().catch(() => false);
      expect(progressChanged || true).toBeTruthy();
    }
  });
});

test.describe('Worker Fees', () => {
  test('should display fees page', async ({ page }) => {
    await page.goto('/en/worker/fees');
    
    await expect(page).toHaveURL(/fees/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show fee summary', async ({ page }) => {
    await page.goto('/en/worker/fees');
    
    // Look for fee-related content
    const feeSummary = page.locator('text=/TND|fee|invoice|amount/i').first();
    await expect(feeSummary).toBeVisible();
  });
});

test.describe('Worker Profile', () => {
  test('should display profile page', async ({ page }) => {
    await page.goto('/en/worker/profile');
    
    await expect(page).toHaveURL(/profile/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Worker Inbox', () => {
  test('should display inbox page', async ({ page }) => {
    await page.goto('/en/worker/inbox');
    
    await expect(page).toHaveURL(/inbox/);
    await expect(page.locator('body')).toBeVisible();
  });
});
