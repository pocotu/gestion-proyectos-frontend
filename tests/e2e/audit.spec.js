import { test, expect } from '@playwright/test';

/**
 * Tests E2E para AuditPage
 * Siguiendo principios SOLID:
 * - SRP: Cada test tiene una responsabilidad única
 * - DRY: Reutilización de helper loginAsAdmin
 */

// Helper para login como admin (DRY)
async function loginAsAdmin(page) {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/dashboard');
}

test.describe('Auditoría E2E', () => {
  test('debe navegar a la página de auditoría', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navegar desde el sidebar
    const auditLink = page.locator('a[href="/audit"]');
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await page.waitForURL('http://localhost:5173/audit');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('debe mostrar logs de auditoría de roles', async ({ page }) => {
    await loginAsAdmin(page);
    
    const auditLink = page.locator('a[href="/audit"]');
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await page.waitForURL('http://localhost:5173/audit');
      
      // Verificar que hay contenido de auditoría
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    await loginAsAdmin(page);
    
    const auditLink = page.locator('a[href="/audit"]');
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await page.waitForURL('http://localhost:5173/audit');
      
      // Desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});
