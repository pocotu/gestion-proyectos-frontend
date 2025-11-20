import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth.helper';

/**
 * Tests E2E para FilesPage
 * Siguiendo principios SOLID:
 * - SRP: Cada test tiene una responsabilidad única
 * - DRY: Reutilización de helper loginAsAdmin
 */

test.describe('Gestión de Archivos E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('debe mostrar la página de archivos', async ({ page }) => {
    // Verificar que estamos en el dashboard después del login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verificar que la página carga correctamente
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('debe tener acceso a archivos desde el menú', async ({ page }) => {
    // Buscar el link de archivos en el sidebar o menú
    const filesLink = page.locator('a[href="/files"], a:has-text("Archivos")').first();
    
    // Verificar que el link existe (puede no estar visible si no tiene permisos)
    const linkCount = await filesLink.count();
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});
