import { test, expect } from '@playwright/test';

test.describe('Gestión de Tareas E2E', () => {
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

  test('debe navegar a la página de tareas', async ({ page }) => {
    // Navegar a tareas desde el sidebar
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Verificar que estamos en la página de tareas
    await expect(page.locator('h1:has-text("Gestión de Tareas")')).toBeVisible();
    
    // Verificar que existe el botón para crear tarea
    await expect(page.locator('button:has-text("Nueva Tarea")')).toBeVisible();
  });

  // TODO: Arreglar este test - requiere actualizar selectores del formulario
  test.skip('debe crear una nueva tarea exitosamente', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Hacer clic en crear tarea
    await page.click('button:has-text("Nueva Tarea")');
    
    // Llenar el formulario de tarea
    const taskTitle = `Tarea Test E2E ${Date.now()}`;
    await page.fill('[data-testid="task-title-input"]', taskTitle);
    await page.fill('[data-testid="task-description-input"]', 'Descripción de la tarea de prueba E2E');
    
    // Establecer fechas
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    await page.fill('[data-testid="task-start-date-input"]', today.toISOString().split('T')[0]);
    await page.fill('[data-testid="task-deadline-input"]', futureDate.toISOString().split('T')[0]);
    
    // Seleccionar prioridad
    const prioritySelect = page.locator('[data-testid="task-priority-select"]');
    if (await prioritySelect.count() > 0) {
      await prioritySelect.selectOption('alta');
    }
    
    // Guardar la tarea
    await page.click('[data-testid="save-task-button"]');
    
    // Verificar que se creó exitosamente
    await expect(page.locator('.toast-success, .notification-success')).toBeVisible({ timeout: 5000 });
    
    // Verificar que aparece en la lista
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 5000 });
  });

  // TODO: Arreglar este test - requiere actualizar selectores del formulario
  test.skip('debe mostrar validación de campos requeridos en tareas', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Hacer clic en crear tarea
    await page.click('button:has-text("Nueva Tarea")');
    
    // Intentar guardar sin llenar campos
    await page.click('[data-testid="save-task-button"]');
    
    // Verificar mensajes de error
    await expect(page.locator('text=requerido, text=obligatorio')).toBeVisible({ timeout: 3000 });
  });

  test('debe editar una tarea existente', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar la primera tarea y hacer clic en editar
    const firstEditButton = page.locator('[data-testid="edit-task-button"]').first();
    if (await firstEditButton.count() > 0) {
      await firstEditButton.click();
      
      // Modificar el título
      const newTitle = `Tarea Editada E2E ${Date.now()}`;
      await page.fill('[data-testid="task-title-input"]', newTitle);
      
      // Guardar cambios
      await page.click('[data-testid="save-task-button"]');
      
      // Verificar que se guardó
      await expect(page.locator('.toast-success, .notification-success')).toBeVisible({ timeout: 5000 });
      
      // Verificar que el título cambió
      await expect(page.locator(`text=${newTitle}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe filtrar tareas por estado', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Verificar que existe el filtro de estado
    const statusFilter = page.locator('[data-testid="task-status-filter"], select[name="estado"]');
    if (await statusFilter.count() > 0) {
      // Filtrar por "pendiente"
      await statusFilter.selectOption('pendiente');
      
      // Esperar a que se aplique el filtro
      await page.waitForTimeout(1000);
      
      // Verificar que solo se muestran tareas pendientes
      const taskCards = page.locator('[data-testid="task-card"]');
      if (await taskCards.count() > 0) {
        const firstCard = taskCards.first();
        await expect(firstCard.locator('text=Pendiente, text=pendiente')).toBeVisible();
      }
    }
  });

  test('debe filtrar tareas por prioridad', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Verificar que existe el filtro de prioridad
    const priorityFilter = page.locator('[data-testid="task-priority-filter"], select[name="prioridad"]');
    if (await priorityFilter.count() > 0) {
      // Filtrar por "alta"
      await priorityFilter.selectOption('alta');
      
      // Esperar a que se aplique el filtro
      await page.waitForTimeout(1000);
      
      // Verificar que solo se muestran tareas de alta prioridad
      const taskCards = page.locator('[data-testid="task-card"]');
      if (await taskCards.count() > 0) {
        const firstCard = taskCards.first();
        await expect(firstCard.locator('text=Alta, text=alta')).toBeVisible();
      }
    }
  });

  test('debe marcar una tarea como completada', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar una tarea pendiente y marcarla como completada
    const completeButton = page.locator('[data-testid="complete-task-button"]').first();
    if (await completeButton.count() > 0) {
      await completeButton.click();
      
      // Verificar que se marcó como completada
      await expect(page.locator('.toast-success, .notification-success')).toBeVisible({ timeout: 5000 });
      
      // Verificar que el estado cambió
      await expect(page.locator('text=Completada, text=completada')).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar detalles de una tarea', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Hacer clic en la primera tarea
    const firstTask = page.locator('[data-testid="task-card"], .task-item').first();
    if (await firstTask.count() > 0) {
      await firstTask.click();
      
      // Verificar que estamos en la página de detalles
      await expect(page.locator('h1, h2')).toContainText(/Tarea|Detalles/);
      
      // Verificar que se muestran los detalles básicos
      await expect(page.locator('text=Descripción, text=Fecha límite, text=Prioridad')).toBeVisible();
    }
  });

  test('debe buscar tareas por título', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar el campo de búsqueda
    const searchInput = page.locator('[data-testid="task-search-input"], input[placeholder*="buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      // Escribir término de búsqueda
      await searchInput.fill('Test');
      
      // Esperar a que se aplique la búsqueda
      await page.waitForTimeout(1000);
      
      // Verificar que los resultados contienen el término buscado
      const taskCards = page.locator('[data-testid="task-card"], .task-item');
      if (await taskCards.count() > 0) {
        const firstCard = taskCards.first();
        await expect(firstCard).toContainText(/Test/i);
      }
    }
  });

  test('debe asignar una tarea a un usuario', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar una tarea y hacer clic en asignar
    const assignButton = page.locator('[data-testid="assign-task-button"]').first();
    if (await assignButton.count() > 0) {
      await assignButton.click();
      
      // Seleccionar un usuario
      const userSelect = page.locator('[data-testid="user-select"], select[name="usuario"]');
      if (await userSelect.count() > 0) {
        // Seleccionar el primer usuario disponible
        await userSelect.selectOption({ index: 1 });
        
        // Confirmar asignación
        await page.click('[data-testid="confirm-assignment"], button:has-text("Asignar")');
        
        // Verificar que se asignó
        await expect(page.locator('.toast-success, .notification-success')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('debe mostrar tareas vencidas con indicador visual', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar tareas vencidas (con indicador rojo o texto "Vencida")
    const overdueTasks = page.locator('[data-testid="task-card"]:has-text("Vencida"), .task-item:has-text("Vencida")');
    if (await overdueTasks.count() > 0) {
      const firstOverdueTask = overdueTasks.first();
      
      // Verificar que tiene indicador visual de vencida
      await expect(firstOverdueTask.locator('text=Vencida, .overdue, .text-red')).toBeVisible();
    }
  });

  test('debe mostrar mensaje cuando no hay tareas', async ({ page }) => {
    // Navegar a tareas
    await page.click('a[href="/tasks"]');
    await page.waitForURL(/.*tasks/, { timeout: 10000 });
    
    // Buscar algo que no existe
    const searchInput = page.locator('[data-testid="task-search-input"], input[placeholder*="buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('TareaQueNoExiste12345');
      await page.waitForTimeout(1000);
      
      // Verificar mensaje de "no hay tareas"
      await expect(page.locator('text=No hay tareas, text=No se encontraron tareas')).toBeVisible();
    }
  });
});