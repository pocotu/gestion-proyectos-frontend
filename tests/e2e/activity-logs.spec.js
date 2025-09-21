import { test, expect } from '@playwright/test';

/**
 * Pruebas End-to-End para Sistema de Logs de Actividad
 * Verifica el funcionamiento completo del sistema de auditoría
 */

test.describe('Sistema de Logs de Actividad', () => {
  
  test.beforeEach(async ({ page }) => {
    // Capturar logs de consola
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('ActivityLogsPage') || text.includes('AuthContext') || text.includes('User info') || text.includes('es_administrador') || text.includes('roles')) {
        console.log(`BROWSER CONSOLE: ${msg.type()}: ${text}`);
      }
    });

    // Login como admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('/dashboard');
    
    // Debug: Verificar qué se guardó en localStorage
    const userFromStorage = await page.evaluate(() => {
      return localStorage.getItem('user');
    });
    console.log('USER FROM LOCALSTORAGE:', userFromStorage);
  });

  test('debe mostrar la página de logs de actividad', async ({ page }) => {
    // Navegar a la página de logs de actividad
    await page.goto('/activity-logs');
    
    // Verificar que estamos en la página correcta
    await page.waitForURL(/.*activity-logs/, { timeout: 10000 });
    
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Verificar que no estamos en la página de unauthorized
    const unauthorizedText = page.locator('text=No tienes permisos');
    await expect(unauthorizedText).not.toBeVisible();
    
    // Verificar que no estamos en el dashboard (esto indica que la navegación falló)
    const dashboardTitle = page.locator('text=¡Bienvenido, Administrador del Sistema!');
    if (await dashboardTitle.isVisible()) {
      console.log('ERROR: El test está mostrando el dashboard en lugar de activity-logs');
      console.log('URL actual:', await page.url());
      console.log('Título de la página:', await page.title());
      
      // Intentar navegar directamente usando el menú
      const activityLogsLink = page.locator('text=Logs de Actividad');
      if (await activityLogsLink.isVisible()) {
        await activityLogsLink.click();
        await page.waitForURL(/.*activity-logs/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Verificar que estamos en la página de activity logs
    const activityLogsTitle = page.locator('h1:has-text("Logs de Actividad")');
    await expect(activityLogsTitle).toBeVisible({ timeout: 10000 });
    
    // Verificar que la tabla existe
    await expect(page.locator('[data-testid="activity-logs-table"]')).toBeVisible({ timeout: 10000 });
    
    // Verificar que los controles de filtrado existen
    const searchInput = page.locator('[data-testid="search-input"]');
    const actionFilterSelect = page.locator('[data-testid="filter-select"]');
    
    // Usar waitFor en lugar de expect para mejor debugging
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await actionFilterSelect.waitFor({ state: 'visible', timeout: 10000 });
    
    // Verificar que están visibles
    await expect(searchInput).toBeVisible();
    await expect(actionFilterSelect).toBeVisible();
  });

  test('debe cargar y mostrar logs de actividad', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar un poco más para que se carguen los datos
    await page.waitForTimeout(3000);
    
    // Verificar si hay algún mensaje de error o loading
    const errorMessage = page.locator('[data-testid="error-message"]');
    const loadingMessage = page.locator('[data-testid="loading-message"]');
    
    if (await errorMessage.isVisible()) {
      console.log('ERROR MESSAGE FOUND:', await errorMessage.textContent());
    }
    
    if (await loadingMessage.isVisible()) {
      console.log('LOADING MESSAGE FOUND:', await loadingMessage.textContent());
    }
    
    // Verificar si la tabla existe
    const table = page.locator('[data-testid="activity-logs-table"]');
    console.log('TABLE EXISTS:', await table.count());
    
    // Si no existe la tabla, verificar qué hay en la página
    if (await table.count() === 0) {
      const pageContent = await page.textContent('body');
      console.log('PAGE CONTENT:', pageContent.substring(0, 500));
    }
    
    // Esperar a que se carguen los datos
    await page.waitForSelector('[data-testid="activity-logs-table"]', { timeout: 10000 });
    
    // Verificar que hay al menos una fila de datos
    const rows = page.locator('[data-testid="activity-log-row"]');
    await expect(rows.first()).toBeVisible();
    
    // Verificar columnas principales
    await expect(page.locator('th')).toContainText(['Usuario', 'Acción', 'Recurso', 'Fecha']);
    
    // Verificar que los datos se muestran correctamente
    const firstRow = rows.first();
    await expect(firstRow.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="action-type"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="resource-type"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="timestamp"]')).toBeVisible();
  });

  test('debe filtrar logs por tipo de acción', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los datos iniciales
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Contar filas iniciales
    const initialRows = await page.locator('[data-testid="activity-log-row"]').count();
    
    // Aplicar filtro por tipo de acción
    await page.selectOption('[data-testid="filter-select"]', 'CREATE');
    
    // Esperar a que se actualice la tabla
    await page.waitForTimeout(1000);
    
    // Verificar que se aplicó el filtro
    const filteredRows = page.locator('[data-testid="activity-log-row"]');
    const filteredCount = await filteredRows.count();
    
    // Verificar que todas las filas visibles tienen el tipo de acción correcto
    for (let i = 0; i < Math.min(filteredCount, 5); i++) {
      const actionBadge = filteredRows.nth(i).locator('[data-testid="action-type"]');
      await expect(actionBadge).toContainText('CREATE');
    }
  });

  test('debe buscar logs por usuario', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los datos
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Realizar búsqueda por usuario
    await page.fill('[data-testid="search-input"]', 'admin');
    
    // Esperar a que se actualice la tabla
    await page.waitForTimeout(1000);
    
    // Verificar que los resultados contienen el término buscado
    const rows = page.locator('[data-testid="activity-log-row"]');
    const count = await rows.count();
    
    if (count > 0) {
      // Verificar que al menos una fila contiene el término buscado
      const firstRow = rows.first();
      const userName = await firstRow.locator('[data-testid="user-name"]').textContent();
      expect(userName.toLowerCase()).toContain('admin');
    }
  });

  test('debe mostrar detalles del log al hacer clic', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los datos
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Hacer clic en la primera fila
    const firstRow = page.locator('[data-testid="activity-log-row"]').first();
    await firstRow.click();
    
    // Verificar que se abre el modal o panel de detalles
    await expect(page.locator('[data-testid="log-details-modal"]')).toBeVisible();
    
    // Verificar que se muestran los detalles
    await expect(page.locator('[data-testid="log-details-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-details-action"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-details-resource"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-details-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-details-ip"]')).toBeVisible();
  });

  test('debe cerrar el modal de detalles', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar y abrir detalles
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    await page.locator('[data-testid="activity-log-row"]').first().click();
    
    // Verificar que el modal está abierto
    await expect(page.locator('[data-testid="log-details-modal"]')).toBeVisible();
    
    // Cerrar el modal
    await page.click('[data-testid="close-modal-button"]');
    
    // Verificar que el modal se cerró
    await expect(page.locator('[data-testid="log-details-modal"]')).not.toBeVisible();
  });

  test('debe paginar los resultados correctamente', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los datos
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Verificar que existe la paginación
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Obtener el contenido de la primera página
      const firstPageContent = await page.locator('[data-testid="activity-log-row"]').first().textContent();
      
      // Ir a la siguiente página
      await page.click('[data-testid="next-page-button"]');
      
      // Esperar a que se actualice el contenido
      await page.waitForTimeout(1000);
      
      // Verificar que el contenido cambió
      const secondPageContent = await page.locator('[data-testid="activity-log-row"]').first().textContent();
      expect(firstPageContent).not.toBe(secondPageContent);
      
      // Volver a la primera página
      await page.click('[data-testid="prev-page-button"]');
      
      // Verificar que volvimos al contenido original
      await page.waitForTimeout(1000);
      const backToFirstContent = await page.locator('[data-testid="activity-log-row"]').first().textContent();
      expect(backToFirstContent).toBe(firstPageContent);
    }
  });

  test('debe generar logs cuando se realizan acciones', async ({ page }) => {
    // Ir a la página de usuarios para realizar una acción
    await page.goto('/users');
    
    // Realizar una acción que genere un log (por ejemplo, crear un usuario)
    await page.click('[data-testid="create-user-button"]');
    
    // Llenar el formulario de usuario
    const timestamp = Date.now();
    await page.fill('[data-testid="user-name-input"]', `Test User ${timestamp}`);
    await page.fill('[data-testid="user-email-input"]', `test${timestamp}@example.com`);
    await page.fill('[data-testid="user-password-input"]', 'test123456');
    
    // Guardar el usuario
    await page.click('[data-testid="save-user-button"]');
    
    // Esperar confirmación
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Ir a los logs de actividad
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los logs
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Verificar que se generó un nuevo log
    const rows = page.locator('[data-testid="activity-log-row"]');
    const firstRow = rows.first();
    
    // El log más reciente debería ser la creación del usuario
    await expect(firstRow.locator('[data-testid="action-type"]')).toContainText('CREATE');
    await expect(firstRow.locator('[data-testid="resource-type"]')).toContainText('USER');
  });

  test('debe mostrar mensaje cuando no hay logs', async ({ page }) => {
    // Navegar a la página de logs
    await page.goto('/activity-logs');
    
    // Aplicar un filtro que no devuelva resultados
    await page.fill('[data-testid="search-input"]', 'usuario_inexistente_12345');
    
    // Esperar a que se actualice la tabla
    await page.waitForTimeout(1000);
    
    // Verificar que se muestra el mensaje de "no hay datos"
    await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText(/no.*encontr|sin.*result|no.*datos/i);
  });
});