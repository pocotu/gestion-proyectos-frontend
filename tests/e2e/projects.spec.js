import { test, expect } from '@playwright/test';

// Función helper para hacer login como admin
async function loginAsAdmin(page) {
  await page.goto('http://localhost:5173/login');
  
  // Usar los selectores data-testid que están en el LoginPage
  await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
  await page.fill('[data-testid="password-input"]', 'Admin123!');
  
  // Hacer clic en el botón de login
  await page.click('[data-testid="login-button"]');
  
  // Esperar a que se redirija al dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('Proyectos E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    
    // Esperar que el dashboard esté completamente cargado (usar h1 específico)
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    
    // Navegar a proyectos usando el menú lateral
    const projectsLink = page.locator('a[href="/projects"], a:has-text("Proyectos")').first();
    await projectsLink.click();
    
    // Esperar a que la página de proyectos cargue
    await page.waitForURL('**/projects', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('debe navegar a la página de proyectos', async ({ page }) => {
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*projects/);
  });

  test('debe mostrar el botón de crear proyecto', async ({ page }) => {
    // Verificar URL
    await expect(page).toHaveURL(/.*projects/);
    
    // Buscar el botón de crear proyecto (buscar diferentes variantes)
    const createButton = page.locator('button:has-text("Crear"), button:has-text("Nuevo")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });

  test('debe poder cerrar el modal de crear proyecto', async ({ page }) => {
    // Esperar a que desaparezca cualquier toast de notificación
    await page.waitForTimeout(3000);
    
    // Buscar el botón de crear proyecto
    const newProjectButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(newProjectButton).toBeVisible({ timeout: 10000 });
    
    // Hacer clic en el botón
    await newProjectButton.click();
    
    // Esperar a que aparezca el modal
    await page.waitForSelector('[role="dialog"], .modal', { timeout: 10000 });

    // Verificar que el modal se abre
    const modal = page.locator('[role="dialog"], .modal');
    await expect(modal).toBeVisible();

    // Cerrar el modal usando el botón de cerrar (con force: true para evitar intercepciones)
    const closeButton = page.locator('button:has-text("Cancelar"), button:has-text("Cerrar")').first();
    await expect(closeButton).toBeVisible({ timeout: 5000 });
    await closeButton.click({ force: true });

    // Verificar que el modal se cierra
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});