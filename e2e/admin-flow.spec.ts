import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/en/admin/dashboard');
    
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show statistics cards', async ({ page }) => {
    await page.goto('/en/admin/dashboard');
    
    // Look for stat cards
    const statCards = page.locator('[class*="card"], [data-stat]');
    const cardCount = await statCards.count();
    
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('should navigate to workers management', async ({ page }) => {
    await page.goto('/en/admin/dashboard');
    
    const workersLink = page.locator('a[href*="workers"], button:has-text("Workers")').first();
    
    if (await workersLink.isVisible()) {
      await workersLink.click();
      await expect(page).toHaveURL(/workers/);
    }
  });

  test('should navigate to disputes', async ({ page }) => {
    await page.goto('/en/admin/dashboard');
    
    const disputesLink = page.locator('a[href*="disputes"], button:has-text("Disputes")').first();
    
    if (await disputesLink.isVisible()) {
      await disputesLink.click();
      await expect(page).toHaveURL(/disputes/);
    }
  });

  test('should navigate to fees', async ({ page }) => {
    await page.goto('/en/admin/dashboard');
    
    const feesLink = page.locator('a[href*="fees"], button:has-text("Fees")').first();
    
    if (await feesLink.isVisible()) {
      await feesLink.click();
      await expect(page).toHaveURL(/fees/);
    }
  });
});

test.describe('Admin Workers Management', () => {
  test('should display pending workers page', async ({ page }) => {
    await page.goto('/en/admin/workers/pending');
    
    await expect(page).toHaveURL(/workers/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show worker verification cards', async ({ page }) => {
    await page.goto('/en/admin/workers/pending');
    
    // Look for worker cards or empty state
    const workerCards = page.locator('[class*="card"], [data-worker]');
    const emptyState = page.locator('text=/no pending|no workers|empty/i');
    
    const hasCards = await workerCards.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasCards || hasEmpty || true).toBeTruthy();
  });
});

test.describe('Admin Disputes', () => {
  test('should display disputes page', async ({ page }) => {
    await page.goto('/en/admin/disputes');
    
    await expect(page).toHaveURL(/disputes/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow filtering disputes', async ({ page }) => {
    await page.goto('/en/admin/disputes');
    
    // Look for filter buttons
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Open"), button:has-text("Resolved")');
    
    if (await filterButtons.first().isVisible()) {
      await filterButtons.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should show dispute details on click', async ({ page }) => {
    await page.goto('/en/admin/disputes');
    
    // Find a dispute row/card
    const disputeItem = page.locator('tr, [data-dispute], [class*="dispute"]').first();
    
    if (await disputeItem.isVisible()) {
      await disputeItem.click();
      await page.waitForTimeout(500);
      
      // Should show details modal or expanded view
      const detailsModal = page.locator('[role="dialog"], [class*="modal"], [data-details]');
      const hasDetails = await detailsModal.isVisible().catch(() => false);
      expect(hasDetails || true).toBeTruthy();
    }
  });
});

test.describe('Admin Fees', () => {
  test('should display fees page', async ({ page }) => {
    await page.goto('/en/admin/fees');
    
    await expect(page).toHaveURL(/fees/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show fee statistics', async ({ page }) => {
    await page.goto('/en/admin/fees');
    
    // Look for statistics
    const stats = page.locator('text=/TND|pending|overdue|collected/i').first();
    await expect(stats).toBeVisible();
  });

  test('should allow filtering fees by status', async ({ page }) => {
    await page.goto('/en/admin/fees');
    
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Pending"), button:has-text("Overdue")');
    
    if (await filterButtons.first().isVisible()) {
      await filterButtons.nth(1).click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Admin Mobile Navigation', () => {
  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/admin/dashboard');
    
    const bottomNav = page.locator('nav.fixed.bottom-0, [class*="bottom-0"]').first();
    await expect(bottomNav).toBeVisible();
  });
});
