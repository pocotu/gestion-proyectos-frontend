import { test, expect } from '@playwright/test';

/**
 * Pruebas End-to-End de Integración Completa
 * Verifica flujos completos que involucran múltiples componentes del sistema
 */

test.describe('Tests de Integración E2E', () => {
  // Tests específicos de autenticación
  test.describe('Autenticación', () => {
    test('login exitoso con credenciales válidas', async ({ page }) => {
      await page.goto('/login');
      
      // Verificar que estamos en la página de login
      await expect(page.locator('h1')).toContainText(/login|iniciar.*sesión/i);
      
      // Llenar formulario de login
      await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
      await page.fill('[data-testid="password-input"]', 'Admin123!');
      
      // Hacer click en login
      await page.click('[data-testid="login-button"]');
      
      // Verificar redirección al dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Verificar que el usuario está logueado (menú de usuario visible)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('login fallido con credenciales inválidas', async ({ page }) => {
      await page.goto('/login');
      
      // Intentar login con credenciales incorrectas
      await page.fill('[data-testid="email-input"]', 'usuario@inexistente.com');
      await page.fill('[data-testid="password-input"]', 'contraseña_incorrecta');
      await page.click('[data-testid="login-button"]');
      
      // Verificar que se muestra mensaje de error (usando el sistema de Toast)
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page.locator('[role="alert"]')).toContainText(/credenciales.*incorrectas|usuario.*contraseña.*incorrectos|credenciales.*inválidas/i);
      
      // Verificar que seguimos en la página de login
      await expect(page).toHaveURL(/.*login/);
    });

    test('registro de nuevo usuario', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      const newUserEmail = `newuser${timestamp}@example.com`;
      
      // Llenar formulario de registro
      await page.fill('[data-testid="name-input"]', `Usuario Nuevo ${timestamp}`);
      await page.fill('[data-testid="email-input"]', newUserEmail);
      await page.fill('[data-testid="password-input"]', 'nuevacontraseña123');
      await page.fill('[data-testid="confirm-password-input"]', 'nuevacontraseña123');
      
      // Enviar formulario
      await page.click('[data-testid="register-button"]');
      
      // Verificar mensaje de éxito o redirección
      const successMessage = page.locator('[data-testid="success-message"]');
      const loginRedirect = page.waitForURL('/login');
      
      // Esperar cualquiera de los dos resultados
      await Promise.race([
        expect(successMessage).toBeVisible(),
        loginRedirect
      ]);
    });

    test('logout exitoso', async ({ page }) => {
      // Primero hacer login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
      await page.fill('[data-testid="password-input"]', 'Admin123!');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard');
      
      // Esperar a que el header se cargue y hacer logout
      await page.waitForSelector('[data-testid="logout-button"]', { timeout: 10000 });
      await page.click('[data-testid="logout-button"]');
      
      // Verificar redirección a login
      await page.waitForURL('/login');
      await expect(page.locator('h1')).toContainText(/login|iniciar.*sesión/i);
      
      // Verificar que no podemos acceder a páginas protegidas
      await page.goto('/dashboard');
      await page.waitForURL('/login');
    });

    test('acceso a rutas protegidas sin autenticación', async ({ page }) => {
      // Intentar acceder al dashboard sin estar logueado
      await page.goto('/dashboard');
      
      // Debe redirigir al login
      await page.waitForURL('/login');
      
      // Intentar acceder a otras rutas protegidas
      const protectedRoutes = ['/projects', '/tasks', '/users', '/activity-logs'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForURL('/login');
      }
    });
  });

  // Tests de flujos integrados (requieren autenticación)
  test.describe('Flujos Integrados', () => {
    test.beforeEach(async ({ page }) => {
      // Login como admin antes de cada test
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
      await page.fill('[data-testid="password-input"]', 'Admin123!');
      await page.click('[data-testid="login-button"]');
      
      // Esperar a estar logueado
      await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    });

    // Tests específicos de gestión de proyectos
    test.describe('Gestión de Proyectos', () => {
      test('crear nuevo proyecto exitosamente', async ({ page }) => {
        await page.goto('/projects');
        
        const timestamp = Date.now();
        const projectName = `Proyecto Test ${timestamp}`;
        
        // Hacer click en crear proyecto
        await page.click('[data-testid="create-project-button"]');
        
        // Llenar formulario
        await page.fill('[data-testid="project-name-input"]', projectName);
        await page.fill('[data-testid="project-description-input"]', 'Descripción del proyecto de prueba');
        await page.selectOption('[data-testid="project-status-select"]', 'ACTIVE');
        
        // Guardar proyecto
        await page.click('[data-testid="save-project-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que aparece en la lista
        await page.goto('/projects');
        await expect(page.locator(`[data-testid="project-name"]:has-text("${projectName}")`)).toBeVisible();
      });

      test('editar proyecto existente', async ({ page }) => {
        await page.goto('/projects');
        
        // Seleccionar el primer proyecto de la lista
        const firstProject = page.locator('[data-testid="project-row"]').first();
        await firstProject.locator('[data-testid="edit-project-button"]').click();
        
        const timestamp = Date.now();
        const newProjectName = `Proyecto Editado ${timestamp}`;
        
        // Editar campos
        await page.fill('[data-testid="project-name-input"]', newProjectName);
        await page.fill('[data-testid="project-description-input"]', 'Descripción actualizada');
        
        // Guardar cambios
        await page.click('[data-testid="save-project-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que se actualizó en la lista
        await page.goto('/projects');
        await expect(page.locator(`[data-testid="project-name"]:has-text("${newProjectName}")`)).toBeVisible();
      });

      test('eliminar proyecto', async ({ page }) => {
        await page.goto('/projects');
        
        // Crear un proyecto para eliminar
        await page.click('[data-testid="create-project-button"]');
        const timestamp = Date.now();
        const projectToDelete = `Proyecto a Eliminar ${timestamp}`;
        
        await page.fill('[data-testid="project-name-input"]', projectToDelete);
        await page.fill('[data-testid="project-description-input"]', 'Proyecto temporal para eliminar');
        await page.click('[data-testid="save-project-button"]');
        
        // Volver a la lista
        await page.goto('/projects');
        
        // Buscar y eliminar el proyecto
        const projectRow = page.locator(`[data-testid="project-row"]:has([data-testid="project-name"]:has-text("${projectToDelete}"))`);
        await projectRow.locator('[data-testid="delete-project-button"]').click();
        
        // Confirmar eliminación
        await page.click('[data-testid="confirm-delete-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que ya no aparece en la lista
        await expect(page.locator(`[data-testid="project-name"]:has-text("${projectToDelete}")`)).not.toBeVisible();
      });

      test('listar y filtrar proyectos', async ({ page }) => {
        await page.goto('/projects');
        
        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Verificar que no hay errores de consola
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        
        // Verificar que se muestran proyectos o al menos el mensaje de "no hay proyectos"
        const hasProjects = await page.locator('[data-testid="project-row"]').count() > 0;
        const hasEmptyMessage = await page.locator('text=No hay proyectos').isVisible();
        
        if (!hasProjects && !hasEmptyMessage) {
          console.log('Console logs:', logs);
          throw new Error('No se encontraron proyectos ni mensaje de "no hay proyectos"');
        }
        
        if (hasProjects) {
          // Verificar que se muestran proyectos
          const projectRows = page.locator('[data-testid="project-row"]');
          await expect(projectRows.first()).toBeVisible({ timeout: 10000 });
          
          // Probar filtro por estado
          await page.selectOption('[data-testid="project-status-filter"]', 'ACTIVE');
          await page.waitForTimeout(1000);
          
          // Verificar que solo se muestran proyectos activos
          const activeProjects = page.locator('[data-testid="project-row"]');
          const count = await activeProjects.count();
          for (let i = 0; i < count; i++) {
            const status = await activeProjects.nth(i).locator('[data-testid="project-status"]').textContent();
            expect(status).toContain('ACTIVE');
          }
          
          // Probar búsqueda por nombre
          await page.fill('[data-testid="search-projects-input"]', 'Test');
          await page.waitForTimeout(1000);
          
          // Verificar resultados de búsqueda
          const searchResults = page.locator('[data-testid="project-row"]');
          const searchCount = await searchResults.count();
          
          if (searchCount > 0) {
            const firstResult = await searchResults.first().locator('[data-testid="project-name"]').textContent();
            expect(firstResult.toLowerCase()).toContain('test');
          }
        } else {
          console.log('No hay proyectos para probar filtros, pero la página carga correctamente');
        }
      });

      test('ver detalles de proyecto', async ({ page }) => {
        await page.goto('/projects');
        
        // Hacer click en el primer proyecto
        const firstProject = page.locator('[data-testid="project-row"]').first();
        const projectName = await firstProject.locator('[data-testid="project-name"]').textContent();
        
        await firstProject.locator('[data-testid="view-project-button"]').click();
        
        // Verificar que estamos en la página de detalles
        await expect(page.locator('h1')).toContainText(projectName);
        
        // Verificar elementos de la página de detalles
        await expect(page.locator('[data-testid="project-description"]')).toBeVisible();
        await expect(page.locator('[data-testid="project-status"]')).toBeVisible();
        await expect(page.locator('[data-testid="project-tasks-list"]')).toBeVisible();
        
        // Verificar breadcrumbs
        await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(['Proyectos', projectName]);
      });
    });

    // Tests específicos de gestión de tareas
    test.describe('Gestión de Tareas', () => {
      test('crear nueva tarea exitosamente', async ({ page }) => {
        await page.goto('/tasks');
        
        const timestamp = Date.now();
        const taskTitle = `Tarea Test ${timestamp}`;
        
        // Hacer click en crear tarea
        await page.click('[data-testid="create-task-button"]');
        
        // Llenar formulario
        await page.fill('[data-testid="task-title-input"]', taskTitle);
        await page.fill('[data-testid="task-description-input"]', 'Descripción de la tarea de prueba');
        await page.selectOption('[data-testid="task-priority-select"]', 'HIGH');
        await page.selectOption('[data-testid="task-status-select"]', 'PENDING');
        
        // Seleccionar proyecto si existe
        const projectSelect = page.locator('[data-testid="task-project-select"]');
        if (await projectSelect.isVisible()) {
          await projectSelect.selectOption({ index: 1 }); // Seleccionar el primer proyecto disponible
        }
        
        // Guardar tarea
        await page.click('[data-testid="save-task-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que aparece en la lista
        await page.goto('/tasks');
        await expect(page.locator(`[data-testid="task-title"]:has-text("${taskTitle}")`)).toBeVisible();
      });

      test('editar tarea existente', async ({ page }) => {
        await page.goto('/tasks');
        
        // Seleccionar la primera tarea de la lista
        const firstTask = page.locator('[data-testid="task-row"]').first();
        await firstTask.locator('[data-testid="edit-task-button"]').click();
        
        const timestamp = Date.now();
        const newTaskTitle = `Tarea Editada ${timestamp}`;
        
        // Editar campos
        await page.fill('[data-testid="task-title-input"]', newTaskTitle);
        await page.fill('[data-testid="task-description-input"]', 'Descripción actualizada');
        await page.selectOption('[data-testid="task-priority-select"]', 'MEDIUM');
        
        // Guardar cambios
        await page.click('[data-testid="save-task-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que se actualizó en la lista
        await page.goto('/tasks');
        await expect(page.locator(`[data-testid="task-title"]:has-text("${newTaskTitle}")`)).toBeVisible();
      });

      test('asignar tarea a usuario', async ({ page }) => {
        await page.goto('/tasks');
        
        // Seleccionar una tarea
        const firstTask = page.locator('[data-testid="task-row"]').first();
        await firstTask.locator('[data-testid="assign-task-button"]').click();
        
        // Seleccionar usuario para asignar
        const userSelect = page.locator('[data-testid="assign-user-select"]');
        if (await userSelect.isVisible()) {
          await userSelect.selectOption({ index: 1 }); // Seleccionar el primer usuario disponible
        }
        
        // Confirmar asignación
        await page.click('[data-testid="confirm-assign-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que la tarea muestra el usuario asignado
        await page.goto('/tasks');
        const taskRow = page.locator('[data-testid="task-row"]').first();
        await expect(taskRow.locator('[data-testid="assigned-user"]')).not.toBeEmpty();
      });

      test('completar tarea', async ({ page }) => {
        await page.goto('/tasks');
        
        // Buscar una tarea pendiente
        const pendingTask = page.locator('[data-testid="task-row"]:has([data-testid="task-status"]:has-text("PENDING"))').first();
        
        if (await pendingTask.isVisible()) {
          // Marcar como completada
          await pendingTask.locator('[data-testid="complete-task-button"]').click();
          
          // Confirmar completar
          await page.click('[data-testid="confirm-complete-button"]');
          
          // Verificar mensaje de éxito
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
          
          // Verificar que el estado cambió
          await page.goto('/tasks');
          const completedTask = page.locator('[data-testid="task-row"]').first();
          await expect(completedTask.locator('[data-testid="task-status"]')).toContainText('COMPLETED');
        }
      });

      test('eliminar tarea', async ({ page }) => {
        await page.goto('/tasks');
        
        // Crear una tarea para eliminar
        await page.click('[data-testid="create-task-button"]');
        const timestamp = Date.now();
        const taskToDelete = `Tarea a Eliminar ${timestamp}`;
        
        await page.fill('[data-testid="task-title-input"]', taskToDelete);
        await page.fill('[data-testid="task-description-input"]', 'Tarea temporal para eliminar');
        await page.selectOption('[data-testid="task-priority-select"]', 'LOW');
        await page.click('[data-testid="save-task-button"]');
        
        // Volver a la lista
        await page.goto('/tasks');
        
        // Buscar y eliminar la tarea
        const taskRow = page.locator(`[data-testid="task-row"]:has([data-testid="task-title"]:has-text("${taskToDelete}"))`);
        await taskRow.locator('[data-testid="delete-task-button"]').click();
        
        // Confirmar eliminación
        await page.click('[data-testid="confirm-delete-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que ya no aparece en la lista
        await expect(page.locator(`[data-testid="task-title"]:has-text("${taskToDelete}")`)).not.toBeVisible();
      });

      test('filtrar tareas por estado y prioridad', async ({ page }) => {
        await page.goto('/tasks');
        
        // Verificar que se muestran tareas
        const taskRows = page.locator('[data-testid="task-row"]');
        await expect(taskRows.first()).toBeVisible();
        
        // Probar filtro por estado
        await page.selectOption('[data-testid="task-status-filter"]', 'PENDING');
        await page.waitForTimeout(1000);
        
        // Verificar que solo se muestran tareas pendientes
        const pendingTasks = page.locator('[data-testid="task-row"]');
        const count = await pendingTasks.count();
        
        for (let i = 0; i < count; i++) {
          const status = await pendingTasks.nth(i).locator('[data-testid="task-status"]').textContent();
          expect(status).toContain('PENDING');
        }
        
        // Probar filtro por prioridad
        await page.selectOption('[data-testid="task-priority-filter"]', 'HIGH');
        await page.waitForTimeout(1000);
        
        // Verificar que solo se muestran tareas de alta prioridad
        const highPriorityTasks = page.locator('[data-testid="task-row"]');
        const priorityCount = await highPriorityTasks.count();
        
        for (let i = 0; i < priorityCount; i++) {
          const priority = await highPriorityTasks.nth(i).locator('[data-testid="task-priority"]').textContent();
          expect(priority).toContain('HIGH');
        }
        
        // Probar búsqueda por título
        await page.fill('[data-testid="search-tasks-input"]', 'Test');
        await page.waitForTimeout(1000);
        
        // Verificar resultados de búsqueda
        const searchResults = page.locator('[data-testid="task-row"]');
        const searchCount = await searchResults.count();
        
        if (searchCount > 0) {
          const firstResult = await searchResults.first().locator('[data-testid="task-title"]').textContent();
          expect(firstResult.toLowerCase()).toContain('test');
        }
      });

      test('ver detalles de tarea', async ({ page }) => {
        await page.goto('/tasks');
        
        // Hacer click en la primera tarea
        const firstTask = page.locator('[data-testid="task-row"]').first();
        const taskTitle = await firstTask.locator('[data-testid="task-title"]').textContent();
        
        await firstTask.locator('[data-testid="view-task-button"]').click();
        
        // Verificar que estamos en la página de detalles
        await expect(page.locator('h1')).toContainText(taskTitle);
        
        // Verificar elementos de la página de detalles
        await expect(page.locator('[data-testid="task-description"]')).toBeVisible();
        await expect(page.locator('[data-testid="task-status"]')).toBeVisible();
        await expect(page.locator('[data-testid="task-priority"]')).toBeVisible();
        await expect(page.locator('[data-testid="task-project"]')).toBeVisible();
        
        // Verificar breadcrumbs
        await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(['Tareas', taskTitle]);
      });
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

    // Tests específicos de gestión de usuarios y roles
     test.describe('Gestión de Usuarios y Roles', () => {
      test('crear nuevo usuario exitosamente', async ({ page }) => {
        await page.goto('/users');
        
        const timestamp = Date.now();
        const userName = `Usuario Test ${timestamp}`;
        const userEmail = `test${timestamp}@example.com`;
        
        // Hacer click en crear usuario
        await page.click('[data-testid="create-user-button"]');
        
        // Llenar formulario - usando los data-testid correctos del FormInput
        await page.fill('[data-testid="input-nombre"]', userName);
        await page.fill('[data-testid="input-email"]', userEmail);
        await page.fill('[data-testid="input-contraseña"]', 'test123456');
        await page.fill('[data-testid="input-confirmarContraseña"]', 'test123456');
        
        // Guardar usuario
        await page.click('[data-testid="save-user-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que aparece en la lista
        await page.goto('/users');
        await expect(page.locator(`[data-testid="user-name"]:has-text("${userName}")`)).toBeVisible();
      });

      test('editar usuario existente', async ({ page }) => {
        await page.goto('/users');
        
        // Seleccionar el primer usuario de la lista (que no sea admin)
        const userRows = page.locator('[data-testid="user-row"]');
        const count = await userRows.count();
        
        let targetUser = null;
        for (let i = 0; i < count; i++) {
          const userRow = userRows.nth(i);
          const userRole = await userRow.locator('[data-testid="user-role"]').textContent();
          if (!userRole.includes('ADMIN')) {
            targetUser = userRow;
            break;
          }
        }
        
        if (targetUser) {
          await targetUser.locator('[data-testid="edit-user-button"]').click();
          
          const timestamp = Date.now();
          const newUserName = `Usuario Editado ${timestamp}`;
          
          // Editar campos - usando el data-testid correcto del FormInput
          await page.fill('[data-testid="input-nombre"]', newUserName);
          
          // Guardar cambios
          await page.click('[data-testid="save-user-button"]');
          
          // Verificar mensaje de éxito
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
          
          // Verificar que se actualizó en la lista
          await page.goto('/users');
          await expect(page.locator(`[data-testid="user-name"]:has-text("${newUserName}")`)).toBeVisible();
        }
      });

      test('cambiar rol de usuario', async ({ page }) => {
        await page.goto('/users');
        
        // Buscar un usuario con rol USER
        const userRows = page.locator('[data-testid="user-row"]');
        const count = await userRows.count();
        
        let targetUser = null;
        for (let i = 0; i < count; i++) {
          const userRow = userRows.nth(i);
          const userRole = await userRow.locator('[data-testid="user-role"]').textContent();
          if (userRole.includes('USER') && !userRole.includes('ADMIN')) {
            targetUser = userRow;
            break;
          }
        }
        
        if (targetUser) {
          await targetUser.locator('[data-testid="edit-user-button"]').click();
          
          // Cambiar el rol a ADMIN
          await page.selectOption('[data-testid="user-role-select"]', 'ADMIN');
          
          // Guardar cambios
          await page.click('[data-testid="save-user-button"]');
          
          // Verificar mensaje de éxito
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
          
          // Verificar que el rol cambió
          await page.goto('/users');
          const updatedUserRow = page.locator('[data-testid="user-row"]').first();
          await expect(updatedUserRow.locator('[data-testid="user-role"]')).toContainText('ADMIN');
        }
      });

      test('eliminar usuario', async ({ page }) => {
        await page.goto('/users');
        
        // Crear un usuario para eliminar
        await page.click('[data-testid="create-user-button"]');
        const timestamp = Date.now();
        const userToDelete = `Usuario a Eliminar ${timestamp}`;
        const emailToDelete = `delete${timestamp}@example.com`;
        
        await page.fill('[data-testid="input-nombre"]', userToDelete);
        await page.fill('[data-testid="input-email"]', emailToDelete);
        await page.fill('[data-testid="input-contraseña"]', 'temp123456');
        await page.fill('[data-testid="input-confirmarContraseña"]', 'temp123456');
        await page.click('[data-testid="save-user-button"]');
        
        // Volver a la lista
        await page.goto('/users');
        
        // Buscar y eliminar el usuario
        const userRow = page.locator(`[data-testid="user-row"]:has([data-testid="user-name"]:has-text("${userToDelete}"))`);
        await userRow.locator('[data-testid="delete-user-button"]').click();
        
        // Confirmar eliminación
        await page.click('[data-testid="confirm-delete-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Verificar que ya no aparece en la lista
        await expect(page.locator(`[data-testid="user-name"]:has-text("${userToDelete}")`)).not.toBeVisible();
      });

      test('filtrar usuarios por rol', async ({ page }) => {
        await page.goto('/users');
        
        // Verificar que se muestran usuarios
        const userRows = page.locator('[data-testid="user-row"]');
        await expect(userRows.first()).toBeVisible();
        
        // Probar filtro por rol ADMIN
        await page.selectOption('[data-testid="user-role-filter"]', 'ADMIN');
        await page.waitForTimeout(1000);
        
        // Verificar que solo se muestran usuarios admin
        const adminUsers = page.locator('[data-testid="user-row"]');
        const count = await adminUsers.count();
        
        for (let i = 0; i < count; i++) {
          const role = await adminUsers.nth(i).locator('[data-testid="user-role"]').textContent();
          expect(role).toContain('ADMIN');
        }
        
        // Probar filtro por rol USER
        await page.selectOption('[data-testid="user-role-filter"]', 'USER');
        await page.waitForTimeout(1000);
        
        // Verificar que solo se muestran usuarios normales
        const normalUsers = page.locator('[data-testid="user-row"]');
        const userCount = await normalUsers.count();
        
        for (let i = 0; i < userCount; i++) {
          const role = await normalUsers.nth(i).locator('[data-testid="user-role"]').textContent();
          expect(role).toContain('USER');
        }
        
        // Probar búsqueda por nombre
        await page.fill('[data-testid="search-users-input"]', 'admin');
        await page.waitForTimeout(1000);
        
        // Verificar resultados de búsqueda
        const searchResults = page.locator('[data-testid="user-row"]');
        const searchCount = await searchResults.count();
        
        if (searchCount > 0) {
          const firstResult = await searchResults.first().locator('[data-testid="user-name"]').textContent();
          expect(firstResult.toLowerCase()).toContain('admin');
        }
      });

      test('ver perfil de usuario', async ({ page }) => {
        await page.goto('/users');
        
        // Hacer click en el primer usuario
        const firstUser = page.locator('[data-testid="user-row"]').first();
        const userName = await firstUser.locator('[data-testid="user-name"]').textContent();
        
        await firstUser.locator('[data-testid="view-user-button"]').click();
        
        // Verificar que estamos en la página de perfil
        await expect(page.locator('h1')).toContainText(userName);
        
        // Verificar elementos del perfil
        await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-role"]')).toBeVisible();
        await expect(page.locator('[data-testid="user-created-date"]')).toBeVisible();
        
        // Verificar breadcrumbs
        await expect(page.locator('[data-testid="breadcrumb"]')).toContainText(['Usuarios', userName]);
      });

      test('validar permisos por rol', async ({ page }) => {
        // Este test verifica que los diferentes roles tengan acceso apropiado
        await page.goto('/users');
        
        // Verificar que como admin podemos ver todos los usuarios
        const userRows = page.locator('[data-testid="user-row"]');
        await expect(userRows).toBeVisible();
        
        // Verificar que tenemos botones de administración
        await expect(page.locator('[data-testid="create-user-button"]')).toBeVisible();
        
        const firstUser = userRows.first();
        await expect(firstUser.locator('[data-testid="edit-user-button"]')).toBeVisible();
        await expect(firstUser.locator('[data-testid="delete-user-button"]')).toBeVisible();
      });
    });

  test('flujo completo: gestión de usuarios y permisos', async ({ page }) => {
    const timestamp = Date.now();
    const userName = `Usuario Test ${timestamp}`;
    const userEmail = `test${timestamp}@example.com`;
    
    // 1. Crear un nuevo usuario
    await page.goto('/users');
    await page.click('[data-testid="create-user-button"]');
    
    // Llenar formulario de usuario - usando los data-testid correctos del FormInput
    await page.fill('[data-testid="input-nombre"]', userName);
    await page.fill('[data-testid="input-email"]', userEmail);
    await page.fill('[data-testid="input-contraseña"]', 'test123456');
    await page.fill('[data-testid="input-confirmarContraseña"]', 'test123456');
    
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

    // Tests específicos de dashboard y estadísticas
     test.describe('Dashboard y Estadísticas', () => {
      test('verificar elementos principales del dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verificar widgets de estadísticas
        await expect(page.locator('[data-testid="projects-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="tasks-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="users-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="completed-tasks-count"]')).toBeVisible();
        
        // Verificar que los números son válidos
        const projectsCount = await page.locator('[data-testid="projects-count"]').textContent();
        const tasksCount = await page.locator('[data-testid="tasks-count"]').textContent();
        const usersCount = await page.locator('[data-testid="users-count"]').textContent();
        
        expect(parseInt(projectsCount)).toBeGreaterThanOrEqual(0);
        expect(parseInt(tasksCount)).toBeGreaterThanOrEqual(0);
        expect(parseInt(usersCount)).toBeGreaterThanOrEqual(0);
        
        // Verificar gráficos
        await expect(page.locator('[data-testid="projects-chart"]')).toBeVisible();
        await expect(page.locator('[data-testid="tasks-chart"]')).toBeVisible();
        await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
      });

      test('verificar actividades recientes', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verificar sección de actividades recientes
        await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible();
        await expect(page.locator('[data-testid="recent-activities-title"]')).toContainText('Actividades Recientes');
        
        // Verificar que hay al menos una actividad o mensaje de vacío
        const activities = page.locator('[data-testid="activity-item"]');
        const activitiesCount = await activities.count();
        
        if (activitiesCount > 0) {
          // Verificar elementos de la primera actividad
          const firstActivity = activities.first();
          await expect(firstActivity.locator('[data-testid="activity-type"]')).toBeVisible();
          await expect(firstActivity.locator('[data-testid="activity-description"]')).toBeVisible();
          await expect(firstActivity.locator('[data-testid="activity-date"]')).toBeVisible();
        } else {
          await expect(page.locator('[data-testid="no-activities-message"]')).toBeVisible();
        }
      });

      test('verificar proyectos recientes', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verificar sección de proyectos recientes
        await expect(page.locator('[data-testid="recent-projects"]')).toBeVisible();
        await expect(page.locator('[data-testid="recent-projects-title"]')).toContainText('Proyectos Recientes');
        
        const projects = page.locator('[data-testid="recent-project-item"]');
        const projectsCount = await projects.count();
        
        if (projectsCount > 0) {
          // Verificar elementos del primer proyecto
          const firstProject = projects.first();
          await expect(firstProject.locator('[data-testid="project-name"]')).toBeVisible();
          await expect(firstProject.locator('[data-testid="project-progress"]')).toBeVisible();
          await expect(firstProject.locator('[data-testid="project-tasks-count"]')).toBeVisible();
          
          // Hacer click para ir al proyecto
          await firstProject.click();
          
          // Verificar que navegamos al proyecto
          await expect(page.url()).toContain('/projects/');
        } else {
          await expect(page.locator('[data-testid="no-projects-message"]')).toBeVisible();
        }
      });

      test('verificar tareas pendientes', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verificar sección de tareas pendientes
        await expect(page.locator('[data-testid="pending-tasks"]')).toBeVisible();
        await expect(page.locator('[data-testid="pending-tasks-title"]')).toContainText('Tareas Pendientes');
        
        const tasks = page.locator('[data-testid="pending-task-item"]');
        const tasksCount = await tasks.count();
        
        if (tasksCount > 0) {
          // Verificar elementos de la primera tarea
          const firstTask = tasks.first();
          await expect(firstTask.locator('[data-testid="task-name"]')).toBeVisible();
          await expect(firstTask.locator('[data-testid="task-project"]')).toBeVisible();
          await expect(firstTask.locator('[data-testid="task-priority"]')).toBeVisible();
          await expect(firstTask.locator('[data-testid="task-due-date"]')).toBeVisible();
          
          // Marcar tarea como completada
          await firstTask.locator('[data-testid="complete-task-button"]').click();
          
          // Verificar mensaje de éxito
          await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        } else {
          await expect(page.locator('[data-testid="no-pending-tasks-message"]')).toBeVisible();
        }
      });

      test('verificar filtros de tiempo en estadísticas', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Probar filtro de última semana
        await page.selectOption('[data-testid="time-filter"]', 'week');
        await page.waitForTimeout(1000);
        
        // Verificar que los gráficos se actualizaron
        await expect(page.locator('[data-testid="projects-chart"]')).toBeVisible();
        await expect(page.locator('[data-testid="tasks-chart"]')).toBeVisible();
        
        // Probar filtro de último mes
        await page.selectOption('[data-testid="time-filter"]', 'month');
        await page.waitForTimeout(1000);
        
        // Verificar que los datos cambiaron
        await expect(page.locator('[data-testid="projects-chart"]')).toBeVisible();
        
        // Probar filtro de último año
        await page.selectOption('[data-testid="time-filter"]', 'year');
        await page.waitForTimeout(1000);
        
        await expect(page.locator('[data-testid="projects-chart"]')).toBeVisible();
      });

      test('verificar exportación de reportes', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verificar botón de exportar
        await expect(page.locator('[data-testid="export-report-button"]')).toBeVisible();
        
        // Hacer click en exportar
        await page.click('[data-testid="export-report-button"]');
        
        // Verificar modal de exportación
        await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="export-format-select"]')).toBeVisible();
        
        // Seleccionar formato PDF
        await page.selectOption('[data-testid="export-format-select"]', 'pdf');
        
        // Seleccionar rango de fechas
        await page.fill('[data-testid="export-start-date"]', '2024-01-01');
        await page.fill('[data-testid="export-end-date"]', '2024-12-31');
        
        // Confirmar exportación
        await page.click('[data-testid="confirm-export-button"]');
        
        // Verificar mensaje de éxito
        await expect(page.locator('[data-testid="export-success-message"]')).toBeVisible();
      });

      test('verificar actualización en tiempo real', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Obtener conteos iniciales
        const initialProjectsCount = await page.locator('[data-testid="projects-count"]').textContent();
        const initialTasksCount = await page.locator('[data-testid="tasks-count"]').textContent();
        
        // Crear un nuevo proyecto en otra pestaña (simulando otro usuario)
        const newPage = await page.context().newPage();
        await newPage.goto('/projects');
        
        // Login en la nueva pestaña
        await newPage.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
        await newPage.fill('[data-testid="password-input"]', 'Admin123!');
        await newPage.click('[data-testid="login-button"]');
        
        // Crear proyecto
        await newPage.click('[data-testid="create-project-button"]');
        const timestamp = Date.now();
        await newPage.fill('[data-testid="project-name-input"]', `Proyecto Tiempo Real ${timestamp}`);
        await newPage.fill('[data-testid="project-description-input"]', 'Test de actualización en tiempo real');
        await newPage.click('[data-testid="save-project-button"]');
        
        // Volver a la pestaña original y verificar actualización
        await page.bringToFront();
        await page.waitForTimeout(3000); // Esperar actualización automática
        
        // Verificar que los conteos se actualizaron
        const newProjectsCount = await page.locator('[data-testid="projects-count"]').textContent();
        expect(parseInt(newProjectsCount)).toBeGreaterThan(parseInt(initialProjectsCount));
        
        await newPage.close();
      });

      test('verificar responsividad del dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Probar vista desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
        
        // Probar vista tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
        
        // Verificar que los elementos se reorganizan
        await expect(page.locator('[data-testid="projects-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="tasks-count"]')).toBeVisible();
        
        // Probar vista móvil
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
        
        // Verificar que el menú móvil funciona
        await page.click('[data-testid="mobile-menu-button"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      });
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
    
    // Verificar que se muestra mensaje de error (usando el sistema de Toast)
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(/error|fallo|problema/i);
    
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
});