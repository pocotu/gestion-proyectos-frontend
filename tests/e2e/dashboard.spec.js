import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth.helper.js';

test.describe.configure({ mode: 'serial' });

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('debe cargar el dashboard correctamente', async ({ page }) => {
    // Verificar que estamos en el dashboard
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    
    // Verificar el header del dashboard
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toContainText('Dashboard');
    
    // Verificar que existe el botón de logout
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('debe mostrar estadísticas del dashboard', async ({ page }) => {
    // Verificar que se muestra la sección de estadísticas
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
    
    // Verificar que las estadísticas tienen contenido
    await expect(page.locator('[data-testid="dashboard-stats"]:has-text("Proyectos")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"]:has-text("activos")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"]:has-text("Tareas")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"]:has-text("en progreso")')).toBeVisible();
  });

  test('debe mostrar estadísticas de proyectos', async ({ page }) => {
    // Verificar que existe la sección de estadísticas en la columna izquierda
    await expect(page.locator('[data-testid="dashboard-stats"]').locator('text=Estadísticas')).toBeVisible();
    
    // Verificar que existe la card de proyectos
    await expect(page.locator('text=Proyectos').first()).toBeVisible();
  });

  test('debe mostrar estadísticas de tareas', async ({ page }) => {
    // Verificar que existe la card de tareas
    await expect(page.locator('text=Tareas').first()).toBeVisible();
  });

  test('debe mostrar acciones rápidas', async ({ page }) => {
    // Verificar que existen los botones de acciones rápidas
    await expect(page.locator('a[href="/projects"]:has-text("Crear Proyecto")')).toBeVisible();
    await expect(page.locator('a[href="/projects"]:has-text("Ver Proyectos")')).toBeVisible();
  });

  test('debe navegar a proyectos desde el dashboard', async ({ page }) => {
    // Hacer clic en "Ver Proyectos"
    await page.click('a[href="/projects"]:has-text("Ver Proyectos")');
    
    // Esperar navegación
    await page.waitForURL(/.*projects/, { timeout: 10000 });
    
    // Verificar que estamos en la página de proyectos
    await expect(page).toHaveURL(/.*projects/);
  });

  test('debe mostrar sección de mis tareas', async ({ page }) => {
    // Verificar que existe la sección de mis tareas
    await expect(page.locator('text=Mis Tareas')).toBeVisible();
  });

  test('debe mostrar actividades recientes', async ({ page }) => {
    // Verificar que existe la sección de actividades recientes
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();
  });

  test('debe permitir refrescar datos', async ({ page }) => {
    // Verificar que existe el botón de refrescar (icono RefreshCw)
    const refreshButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(refreshButton).toBeVisible();
    
    // El botón debe estar habilitado
    await expect(refreshButton).toBeEnabled();
  });

  test('debe mostrar sección de tareas pendientes', async ({ page }) => {
    // Verificar que existe la sección de mis tareas (puede estar vacía o con tareas)
    await expect(page.locator('text=Mis Tareas')).toBeVisible();
  });

  test('debe mostrar layout de 3 columnas', async ({ page }) => {
    // Verificar que existe la sección de estadísticas (columna izquierda)
    await expect(page.locator('[data-testid="dashboard-stats"]').locator('text=Estadísticas')).toBeVisible();
    
    // Verificar que existe la sección de mis tareas (columna central)
    await expect(page.locator('text=Mis Tareas')).toBeVisible();
    
    // Verificar que existe la sección de actividad reciente (columna derecha)
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();
  });

  test('debe mostrar título del dashboard', async ({ page }) => {
    // Verificar que se muestra el título del dashboard
    const dashboardHeader = page.locator('[data-testid="dashboard-header"]');
    await expect(dashboardHeader.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    // Probar en tamaño móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verificar que el dashboard sigue visible
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    
    // Probar en tamaño tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Verificar que sigue siendo funcional
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toBeVisible();
    
    // Volver a tamaño desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Verificar que todo sigue visible
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
  });
});