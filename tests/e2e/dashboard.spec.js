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
    
    // Verificar que las estadísticas tienen contenido usando selectores más específicos
    await expect(page.locator('[data-testid="dashboard-stats"] h6:has-text("Total Proyectos")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"] h6:has-text("Proyectos Activos")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"] h6:has-text("Total Tareas")')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats"] h6:has-text("En Progreso")')).toBeVisible();
  });

  test('debe mostrar resumen de proyectos', async ({ page }) => {
    // Verificar que existe la sección de resumen de proyectos
    const projectSummary = page.locator('.card:has-text("Resumen de Proyectos")');
    await expect(projectSummary).toBeVisible();
    
    // Verificar que se muestran las estadísticas de proyectos dentro de esa card
    await expect(projectSummary.locator('small:has-text("Total")')).toBeVisible();
    await expect(projectSummary.locator('small:has-text("Activos")')).toBeVisible();
    await expect(projectSummary.locator('small:has-text("Completados")')).toBeVisible();
    
    // Verificar que existe el botón para ver todos los proyectos
    await expect(projectSummary.locator('a[href="/projects"]:has-text("Ver todos los proyectos")')).toBeVisible();
  });

  test('debe mostrar resumen de tareas', async ({ page }) => {
    // Verificar que existe la sección de resumen de tareas
    const taskSummary = page.locator('.card:has-text("Resumen de Tareas")');
    await expect(taskSummary).toBeVisible();
    
    // Verificar que se muestran las estadísticas de tareas dentro de esa card
    await expect(taskSummary.locator('small:has-text("Pendientes")')).toBeVisible();
    await expect(taskSummary.locator('small:has-text("En Progreso")')).toBeVisible();
    await expect(taskSummary.locator('small:has-text("Completadas")')).toBeVisible();
    
    // Verificar que existe el botón para ver todas las tareas
    await expect(taskSummary.locator('a[href="/tasks"]:has-text("Ver todas las tareas")')).toBeVisible();
  });

  test('debe mostrar acciones rápidas', async ({ page }) => {
    // Verificar que existe la sección de acciones rápidas
    await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
    
    // Verificar que existen los botones de acciones rápidas
    await expect(page.locator('a[href="/projects"]:has-text("Crear Proyecto")')).toBeVisible();
    await expect(page.locator('a[href="/tasks"]:has-text("Crear Tarea")')).toBeVisible();
    await expect(page.locator('a[href="/files"]:has-text("Gestionar Archivos")')).toBeVisible();
  });

  test('debe navegar a proyectos desde el dashboard', async ({ page }) => {
    // Hacer clic en "Ver todos los proyectos"
    await page.click('a[href="/projects"]:has-text("Ver todos los proyectos")');
    
    // Esperar navegación
    await page.waitForURL(/.*projects/, { timeout: 10000 });
    
    // Verificar que estamos en la página de proyectos
    await expect(page).toHaveURL(/.*projects/);
  });

  test('debe navegar a tareas desde el dashboard', async ({ page }) => {
    // Hacer clic en "Ver todas las tareas"
    await page.click('a[href="/tasks"]:has-text("Ver todas las tareas")');
    
    // Esperar navegación
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Verificar que estamos en la página de tareas
    await expect(page).toHaveURL(/.*tasks/);
  });

  test('debe mostrar actividades recientes', async ({ page }) => {
    // Verificar que existe la sección de actividades recientes usando un selector más específico
    await expect(page.locator('.card-header:has-text("Actividades Recientes")')).toBeVisible();
    
    // La sección debe estar visible aunque no haya actividades
    const activityCard = page.locator('.card:has(.card-header:has-text("Actividades Recientes"))');
    await expect(activityCard).toBeVisible();
  });

  test('debe permitir actualizar datos', async ({ page }) => {
    // Verificar que existe el botón de actualizar
    const refreshButton = page.locator('button:has-text("Actualizar")');
    await expect(refreshButton).toBeVisible();
    
    // El botón debe estar habilitado
    await expect(refreshButton).toBeEnabled();
    
    // Verificar que el botón contiene el texto "Actualizar"
    await expect(refreshButton).toContainText('Actualizar');
  });

  test('debe mostrar mis tareas pendientes', async ({ page }) => {
    // Verificar que existe la sección de mis tareas pendientes
    await expect(page.locator('text=Mis Tareas Pendientes')).toBeVisible();
    
    // Verificar que se muestra información de tareas asignadas
    await expect(page.locator('text=Tareas asignadas a ti')).toBeVisible();
    
    // Verificar que existe el botón para ver mis tareas
    await expect(page.locator('a[href="/tasks"]:has-text("Ver mis tareas")')).toBeVisible();
  });

  test('debe mostrar grid del dashboard', async ({ page }) => {
    // Verificar que existe el grid principal del dashboard
    await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
    
    // Verificar que contiene las secciones principales
    await expect(page.locator('text=Resumen de Proyectos')).toBeVisible();
    await expect(page.locator('text=Resumen de Tareas')).toBeVisible();
    await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
  });

  test('debe mostrar información del usuario logueado', async ({ page }) => {
    // Verificar que se muestra el mensaje de bienvenida en el header del dashboard
    const dashboardHeader = page.locator('[data-testid="dashboard-header"]');
    await expect(dashboardHeader.locator('p:has-text("Bienvenido")')).toBeVisible();
    
    // Verificar que se muestra el badge de administrador
    await expect(dashboardHeader.locator('.badge:has-text("Administrador")')).toBeVisible();
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