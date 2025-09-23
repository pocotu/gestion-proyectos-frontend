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
  });

  test('debe navegar a la página de proyectos', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navegar a proyectos usando el enlace específico del sidebar
    await page.click('nav a[href="/projects"]:has-text("Proyectos")');
    await page.waitForURL('**/projects', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verificar que estamos en la página correcta
    await expect(page.locator('h1:has-text("Proyectos")')).toBeVisible({ timeout: 15000 });
  });

  test('debe mostrar el botón de crear proyecto', async ({ page }) => {
    await loginAsAdmin(page);
    
    console.log('Verificando que estamos en el dashboard...');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Buscar el enlace de Proyectos en el sidebar
    const projectsLink = page.locator('nav a[href="/projects"]');
    console.log('Verificando que el enlace de Proyectos está visible...');
    await expect(projectsLink).toBeVisible({ timeout: 10000 });
    
    // Hacer clic en el enlace de Proyectos
    await projectsLink.click();
    
    console.log('Verificando navegación a proyectos...');
    await page.waitForURL('**/projects', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de proyectos
    await expect(page.locator('h1:has-text("Proyectos")')).toBeVisible({ timeout: 10000 });
    
    // Verificar que el botón "Nuevo Proyecto" está visible
    const newProjectButton = page.locator('button:has-text("Nuevo Proyecto")');
    await expect(newProjectButton).toBeVisible({ timeout: 10000 });
    
    // Hacer clic en el botón "Nuevo Proyecto" y esperar a que aparezca el modal
    await newProjectButton.click();
    
    // Esperar a que aparezca cualquier modal o diálogo
    await page.waitForSelector('[role="dialog"], .modal, [data-testid*="modal"]', { timeout: 10000 });
    
    // Verificar que el modal se abre - buscar diferentes posibles textos
    const modalVisible = await Promise.race([
      page.locator('text=Crear Nuevo Proyecto').isVisible(),
      page.locator('text=Nuevo Proyecto').isVisible(),
      page.locator('h2:has-text("Crear")').isVisible(),
      page.locator('[role="dialog"]').isVisible()
    ]);
    
    expect(modalVisible).toBe(true);
    
    // Verificar elementos del formulario si el modal está abierto
    await expect(page.locator('input[placeholder*="nombre"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea[placeholder*="Describe"]')).toBeVisible({ timeout: 5000 });
    
    // Verificar botones del modal
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Crear")')).toBeVisible({ timeout: 5000 });
  });

  test('debe poder cerrar el modal de crear proyecto', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navegar a proyectos usando el enlace específico del sidebar
    await page.click('nav a[href="/projects"]:has-text("Proyectos")');
    await page.waitForURL('**/projects', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Hacer clic en el botón "Nuevo Proyecto"
    const newProjectButton = page.locator('button:has-text("Nuevo Proyecto")');
    await expect(newProjectButton).toBeVisible({ timeout: 15000 });
    await newProjectButton.click();
    await page.waitForTimeout(3000);

    // Verificar que el modal se abre
    const modal = page.locator('[role="dialog"], .modal, .modal-overlay');
    await expect(modal).toBeVisible({ timeout: 15000 });

    // Cerrar el modal usando el botón de cerrar
    const closeButton = page.locator('button:has-text("Cancelar")');
    await expect(closeButton).toBeVisible({ timeout: 15000 });
    await closeButton.click();
    await page.waitForTimeout(3000);

    // Verificar que el modal se cierra
    await expect(modal).not.toBeVisible({ timeout: 15000 });
  });
});