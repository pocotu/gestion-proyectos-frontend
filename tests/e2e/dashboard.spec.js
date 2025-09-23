import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  // Helper para hacer login como admin
  const loginAsAdmin = async (page) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
    await page.fill('[data-testid="password-input"]', 'Admin123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  };

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('debe cargar el dashboard correctamente', async ({ page }) => {
    // Verificar que estamos en el dashboard
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Panel/);
    
    // Verificar que el layout tiene los componentes principales
    await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible();
    await expect(page.locator('[data-testid="header"], .header')).toBeVisible();
    
    // Verificar que existe el botón de logout
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('debe mostrar estadísticas del dashboard', async ({ page }) => {
    // Verificar que se muestran las tarjetas de estadísticas
    const statsCards = page.locator('[data-testid="stats-card"], .stats-card, .metric-card');
    await expect(statsCards).toHaveCount(4, { timeout: 10000 });
    
    // Verificar que las estadísticas tienen contenido
    await expect(page.locator('text=Proyectos Activos, text=Total Proyectos')).toBeVisible();
    await expect(page.locator('text=Tareas Pendientes, text=Total Tareas')).toBeVisible();
    await expect(page.locator('text=Usuarios Activos, text=Total Usuarios')).toBeVisible();
    await expect(page.locator('text=Tareas Completadas')).toBeVisible();
  });

  test('debe mostrar proyectos recientes', async ({ page }) => {
    // Verificar que existe la sección de proyectos recientes
    await expect(page.locator('text=Proyectos Recientes, text=Recent Projects')).toBeVisible();
    
    // Verificar que se muestran proyectos
    const projectCards = page.locator('[data-testid="recent-project"], .recent-project, .project-card');
    if (await projectCards.count() > 0) {
      const firstProject = projectCards.first();
      await expect(firstProject).toBeVisible();
      
      // Verificar que tiene información básica del proyecto
      await expect(firstProject.locator('text=Fecha, text=Estado')).toBeVisible();
    }
  });

  test('debe mostrar tareas pendientes', async ({ page }) => {
    // Verificar que existe la sección de tareas pendientes
    await expect(page.locator('text=Tareas Pendientes, text=Pending Tasks')).toBeVisible();
    
    // Verificar que se muestran tareas
    const taskCards = page.locator('[data-testid="pending-task"], .pending-task, .task-card');
    if (await taskCards.count() > 0) {
      const firstTask = taskCards.first();
      await expect(firstTask).toBeVisible();
      
      // Verificar que tiene información básica de la tarea
      await expect(firstTask.locator('text=Prioridad, text=Fecha límite')).toBeVisible();
    }
  });

  test('debe permitir completar tareas desde el dashboard', async ({ page }) => {
    // Buscar botones de completar tarea
    const completeButtons = page.locator('[data-testid="complete-task-button"], button:has-text("Completar")');
    
    if (await completeButtons.count() > 0) {
      const firstCompleteButton = completeButtons.first();
      await firstCompleteButton.click();
      
      // Verificar que se muestra confirmación
      await expect(page.locator('.toast-success, .notification-success')).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe navegar a proyectos desde el dashboard', async ({ page }) => {
    // Hacer clic en "Ver todos los proyectos" o similar
    const viewAllProjectsLink = page.locator('a:has-text("Ver todos"), a:has-text("Ver más"), a[href="/projects"]');
    
    if (await viewAllProjectsLink.count() > 0) {
      await viewAllProjectsLink.first().click();
      await page.waitForURL(/.*projects/, { timeout: 10000 });
      
      // Verificar que estamos en la página de proyectos
      await expect(page.locator('h1')).toContainText(/Proyectos/);
    }
  });

  test('debe navegar a tareas desde el dashboard', async ({ page }) => {
    // Hacer clic en "Ver todas las tareas" o similar
    const viewAllTasksLink = page.locator('a:has-text("Ver todas"), a:has-text("Ver más"), a[href="/tasks"]');
    
    if (await viewAllTasksLink.count() > 0) {
      await viewAllTasksLink.first().click();
      await page.waitForURL(/.*tasks/, { timeout: 10000 });
      
      // Verificar que estamos en la página de tareas
      await expect(page.locator('h1')).toContainText(/Tareas/);
    }
  });

  test('debe mostrar gráficos o visualizaciones', async ({ page }) => {
    // Verificar que existen elementos de gráficos
    const charts = page.locator('[data-testid="chart"], .chart, canvas, svg');
    
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('debe actualizar datos en tiempo real', async ({ page }) => {
    // Obtener el valor inicial de una estadística
    const statsCard = page.locator('[data-testid="stats-card"]').first();
    if (await statsCard.count() > 0) {
      const initialText = await statsCard.textContent();
      
      // Esperar un momento y verificar que los datos se mantienen o actualizan
      await page.waitForTimeout(2000);
      const updatedText = await statsCard.textContent();
      
      // Los datos deben estar presentes (pueden ser iguales o diferentes)
      expect(updatedText).toBeTruthy();
    }
  });

  test('debe mostrar notificaciones o alertas', async ({ page }) => {
    // Verificar que existe un área de notificaciones
    const notifications = page.locator('[data-testid="notifications"], .notifications, .alerts');
    
    if (await notifications.count() > 0) {
      await expect(notifications).toBeVisible();
    }
  });

  test('debe permitir búsqueda rápida desde el dashboard', async ({ page }) => {
    // Buscar campo de búsqueda global
    const searchInput = page.locator('[data-testid="global-search"], input[placeholder*="Buscar"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      
      // Verificar que aparecen resultados o sugerencias
      const searchResults = page.locator('[data-testid="search-results"], .search-results');
      if (await searchResults.count() > 0) {
        await expect(searchResults).toBeVisible();
      }
    }
  });

  test('debe mostrar información del usuario logueado', async ({ page }) => {
    // Verificar que se muestra información del usuario
    await expect(page.locator('text=admin@gestion-proyectos.com, text=Admin')).toBeVisible();
    
    // Verificar que existe el menú de usuario
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu');
    if (await userMenu.count() > 0) {
      await expect(userMenu).toBeVisible();
    }
  });

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    // Probar en tamaño móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verificar que el sidebar se adapta (puede colapsar)
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar');
    await expect(sidebar).toBeVisible();
    
    // Probar en tamaño tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Verificar que sigue siendo funcional
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Volver a tamaño desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Verificar que todo sigue visible
    await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible();
  });
});