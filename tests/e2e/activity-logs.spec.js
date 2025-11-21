import { test, expect } from '@playwright/test';

/**
 * Tests E2E para ActivityLogsPage
 * Siguiendo principios SOLID:
 * - SRP: Cada test tiene una responsabilidad única
 * - DRY: Reutilización de helper loginAsAdmin
 */

// Helper para login como admin (DRY)
async function loginAsAdmin(page) {
  await page.goto('http://localhost:5173/login');
  await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
  await page.fill('[data-testid="password-input"]', 'Admin123!');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('http://localhost:5173/dashboard', { timeout: 10000 });
}

test.describe('Activity Logs E2E', () => {
  test('debe navegar a la página de logs de actividad', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navegar desde el sidebar
    const activityLink = page.locator('a[href="/activity-logs"]');
    if (await activityLink.isVisible()) {
      await activityLink.click();
      await page.waitForURL('http://localhost:5173/activity-logs');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('debe mostrar filtros de búsqueda', async ({ page }) => {
    await loginAsAdmin(page);
    
    const activityLink = page.locator('a[href="/activity-logs"]');
    if (await activityLink.isVisible()) {
      await activityLink.click();
      await page.waitForURL('http://localhost:5173/activity-logs');
      
      // Verificar que hay elementos de filtro
      const filters = page.locator('input, select').first();
      await expect(filters).toBeVisible();
    }
  });

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    await loginAsAdmin(page);
    
    const activityLink = page.locator('a[href="/activity-logs"]');
    if (await activityLink.isVisible()) {
      await activityLink.click();
      await page.waitForURL('http://localhost:5173/activity-logs');
      
      // Desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});
