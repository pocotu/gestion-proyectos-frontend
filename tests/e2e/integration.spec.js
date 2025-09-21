import { test, expect } from '@playwright/test';

/**
 * Pruebas End-to-End de Integración Completa
 * Verifica flujos completos que involucran múltiples componentes del sistema
 */

test.describe('Flujos de Integración Completa', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login antes de cada prueba
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@gestion-proyectos.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a estar logueado
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('flujo completo: crear proyecto, asignar tareas y verificar logs', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `Proyecto Test ${timestamp}`;
    const taskName = `Tarea Test ${timestamp}`;
    
    // 1. Crear un nuevo proyecto
    await page.goto('/projects');
    await page.click('[data-testid="create-project-button"]');
    
    // Llenar formulario de proyecto
    await page.fill('[data-testid="project-name-input"]', projectName);
    await page.fill('[data-testid="project-description-input"]', 'Descripción del proyecto de prueba');
    await page.selectOption('[data-testid="project-status-select"]', 'ACTIVE');
    
    // Guardar proyecto
    await page.click('[data-testid="save-project-button"]');
    
    // Verificar que se creó exitosamente
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 2. Crear una tarea en el proyecto
    await page.goto('/tasks');
    await page.click('[data-testid="create-task-button"]');
    
    // Llenar formulario de tarea
    await page.fill('[data-testid="task-title-input"]', taskName);
    await page.fill('[data-testid="task-description-input"]', 'Descripción de la tarea de prueba');
    await page.selectOption('[data-testid="task-project-select"]', projectName);
    await page.selectOption('[data-testid="task-priority-select"]', 'HIGH');
    
    // Guardar tarea
    await page.click('[data-testid="save-task-button"]');
    
    // Verificar que se creó exitosamente
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 3. Verificar que se generaron logs de actividad
    await page.goto('/activity-logs');
    
    // Esperar a que se carguen los logs
    await page.waitForSelector('[data-testid="activity-logs-table"]');
    
    // Verificar que hay logs de creación de proyecto y tarea
    const rows = page.locator('[data-testid="activity-log-row"]');
    
    // Buscar log de creación de proyecto
    await page.fill('[data-testid="search-input"]', projectName);
    await page.waitForTimeout(1000);
    
    const projectLogExists = await rows.first().locator('[data-testid="resource-type"]').textContent();
    expect(projectLogExists).toContain('PROJECT');
    
    // Limpiar búsqueda y buscar log de tarea
    await page.fill('[data-testid="search-input"]', '');
    await page.fill('[data-testid="search-input"]', taskName);
    await page.waitForTimeout(1000);
    
    const taskLogExists = await rows.first().locator('[data-testid="resource-type"]').textContent();
    expect(taskLogExists).toContain('TASK');
  });

  test('flujo completo: gestión de usuarios y permisos', async ({ page }) => {
    const timestamp = Date.now();
    const userName = `Usuario Test ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;
    
    // 1. Crear un nuevo usuario
    await page.goto('/users');
    await page.click('[data-testid="create-user-button"]');
    
    // Llenar formulario de usuario
    await page.fill('[data-testid="user-name-input"]', userName);
    await page.fill('[data-testid="user-email-input"]', userEmail);
    await page.fill('[data-testid="user-password-input"]', 'test123456');
    await page.selectOption('[data-testid="user-role-select"]', 'USER');
    
    // Guardar usuario
    await page.click('[data-testid="save-user-button"]');
    
    // Verificar que se creó exitosamente
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 2. Verificar que el usuario aparece en la lista
    await page.goto('/users');
    
    // Buscar el usuario creado
    await page.fill('[data-testid="search-users-input"]', userName);
    await page.waitForTimeout(1000);
    
    // Verificar que aparece en los resultados
    const userRow = page.locator('[data-testid="user-row"]').first();
    await expect(userRow.locator('[data-testid="user-name"]')).toContainText(userName);
    await expect(userRow.locator('[data-testid="user-email"]')).toContainText(userEmail);
    
    // 3. Editar el usuario
    await userRow.locator('[data-testid="edit-user-button"]').click();
    
    // Cambiar el rol
    await page.selectOption('[data-testid="user-role-select"]', 'ADMIN');
    
    // Guardar cambios
    await page.click('[data-testid="save-user-button"]');
    
    // Verificar que se actualizó
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 4. Verificar logs de actividad
    await page.goto('/activity-logs');
    
    // Buscar logs relacionados con el usuario
    await page.fill('[data-testid="search-input"]', userName);
    await page.waitForTimeout(1000);
    
    // Verificar que hay logs de creación y actualización
    const logs = page.locator('[data-testid="activity-log-row"]');
    const logCount = await logs.count();
    expect(logCount).toBeGreaterThan(0);
  });

  test('flujo completo: dashboard con datos en tiempo real', async ({ page }) => {
    // 1. Ir al dashboard
    await page.goto('/dashboard');
    
    // Verificar elementos principales del dashboard
    await expect(page.locator('[data-testid="projects-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="tasks-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-count"]')).toBeVisible();
    
    // Obtener conteos iniciales
    const initialProjectsCount = await page.locator('[data-testid="projects-count"]').textContent();
    const initialTasksCount = await page.locator('[data-testid="tasks-count"]').textContent();
    
    // 2. Crear un nuevo proyecto desde el dashboard
    await page.click('[data-testid="quick-create-project"]');
    
    const timestamp = Date.now();
    await page.fill('[data-testid="project-name-input"]', `Dashboard Project ${timestamp}`);
    await page.fill('[data-testid="project-description-input"]', 'Proyecto creado desde dashboard');
    await page.click('[data-testid="save-project-button"]');
    
    // 3. Volver al dashboard y verificar que se actualizaron los conteos
    await page.goto('/dashboard');
    
    // Esperar a que se actualicen los datos
    await page.waitForTimeout(2000);
    
    // Verificar que el contador de proyectos aumentó
    const newProjectsCount = await page.locator('[data-testid="projects-count"]').textContent();
    expect(parseInt(newProjectsCount)).toBeGreaterThan(parseInt(initialProjectsCount));
    
    // 4. Verificar gráficos y estadísticas
    await expect(page.locator('[data-testid="projects-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="tasks-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible();
  });

  test('flujo completo: búsqueda y filtrado global', async ({ page }) => {
    const searchTerm = 'test';
    
    // 1. Realizar búsqueda en proyectos
    await page.goto('/projects');
    await page.fill('[data-testid="search-projects-input"]', searchTerm);
    await page.waitForTimeout(1000);
    
    // Verificar resultados de búsqueda
    const projectRows = page.locator('[data-testid="project-row"]');
    const projectCount = await projectRows.count();
    
    if (projectCount > 0) {
      // Verificar que los resultados contienen el término buscado
      const firstProject = await projectRows.first().locator('[data-testid="project-name"]').textContent();
      expect(firstProject.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
    
    // 2. Realizar búsqueda en tareas
    await page.goto('/tasks');
    await page.fill('[data-testid="search-tasks-input"]', searchTerm);
    await page.waitForTimeout(1000);
    
    // Verificar resultados de búsqueda en tareas
    const taskRows = page.locator('[data-testid="task-row"]');
    const taskCount = await taskRows.count();
    
    if (taskCount > 0) {
      const firstTask = await taskRows.first().locator('[data-testid="task-title"]').textContent();
      expect(firstTask.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
    
    // 3. Aplicar filtros combinados
    await page.selectOption('[data-testid="task-status-filter"]', 'PENDING');
    await page.selectOption('[data-testid="task-priority-filter"]', 'HIGH');
    await page.waitForTimeout(1000);
    
    // Verificar que se aplicaron los filtros
    const filteredTasks = page.locator('[data-testid="task-row"]');
    const filteredCount = await filteredTasks.count();
    
    // Verificar que las tareas mostradas cumplen con los filtros
    for (let i = 0; i < Math.min(filteredCount, 3); i++) {
      const task = filteredTasks.nth(i);
      await expect(task.locator('[data-testid="task-status"]')).toContainText('PENDING');
      await expect(task.locator('[data-testid="task-priority"]')).toContainText('HIGH');
    }
  });

  test('flujo completo: manejo de errores y recuperación', async ({ page }) => {
    // 1. Simular error de red (desconectar backend temporalmente)
    // Intentar crear un proyecto cuando el backend no responde
    await page.goto('/projects');
    
    // Interceptar requests y simular error
    await page.route('**/api/projects', route => {
      route.abort('failed');
    });
    
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Proyecto con Error');
    await page.click('[data-testid="save-project-button"]');
    
    // Verificar que se muestra mensaje de error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/error|fallo|problema/i);
    
    // 2. Restaurar conexión y reintentar
    await page.unroute('**/api/projects');
    
    // Reintentar la operación
    await page.click('[data-testid="retry-button"]');
    
    // Verificar que ahora funciona
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 3. Verificar que los datos se sincronizaron correctamente
    await page.goto('/projects');
    await expect(page.locator('[data-testid="project-row"]').first()).toBeVisible();
  });

  test('flujo completo: navegación y estado de la aplicación', async ({ page }) => {
    // 1. Navegar por diferentes secciones y verificar que el estado se mantiene
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/proyecto/i);
    
    await page.goto('/tasks');
    await expect(page.locator('h1')).toContainText(/tarea/i);
    
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText(/usuario/i);
    
    await page.goto('/activity-logs');
    await expect(page.locator('h1')).toContainText(/log.*actividad|actividad.*log/i);
    
    // 2. Verificar navegación con breadcrumbs
    await page.goto('/projects');
    await page.click('[data-testid="project-row"]').first();
    
    // Verificar breadcrumbs
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(['Proyectos', 'Detalle']);
    
    // Navegar usando breadcrumbs
    await page.click('[data-testid="breadcrumb-projects"]');
    await expect(page).toHaveURL(/.*projects/);
    
    // 3. Verificar que el menú lateral mantiene el estado activo
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="nav-dashboard"]')).toHaveClass(/active|selected/);
    
    await page.goto('/projects');
    await expect(page.locator('[data-testid="nav-projects"]')).toHaveClass(/active|selected/);
  });
});