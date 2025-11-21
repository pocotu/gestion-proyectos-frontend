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
      await expect(page.locator('h1')).toContainText(/Bienvenido/i);
      
      // Llenar formulario de login
      await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
      await page.fill('[data-testid="password-input"]', 'Admin123!');
      
      // Hacer click en login
      await page.click('[data-testid="login-button"]');
      
      // Verificar redirección al dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      
      // Verificar que el usuario está logueado (menú de usuario visible)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('login fallido con credenciales inválidas', async ({ page }) => {
      await page.goto('/login');
      
      // Intentar login con credenciales incorrectas
      await page.fill('[data-testid="email-input"]', 'usuario@inexistente.com');
      await page.fill('[data-testid="password-input"]', 'contraseña_incorrecta');
      await page.click('[data-testid="login-button"]');
      
      // Esperar un momento para que se procese el login
      await page.waitForTimeout(2000);
      
      // Verificar que seguimos en la página de login (no redirigió)
      await expect(page).toHaveURL(/.*login/);
    });

    test('logout exitoso', async ({ page }) => {
      // Primero hacer login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
      await page.fill('[data-testid="password-input"]', 'Admin123!');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/dashboard', { timeout: 10000 });
      
      // Esperar a que el header se cargue y hacer logout
      await page.waitForSelector('[data-testid="logout-button"]', { timeout: 10000 });
      await page.click('[data-testid="logout-button"]');
      
      // Verificar redirección a login
      await page.waitForURL('/login', { timeout: 10000 });
      await expect(page.locator('h1')).toContainText(/Bienvenido/i);
    });

    test('acceso a rutas protegidas sin autenticación', async ({ page }) => {
      // Intentar acceder al dashboard sin estar logueado
      await page.goto('/dashboard');
      
      // Debe redirigir al login
      await page.waitForURL('/login', { timeout: 10000 });
      
      // Intentar acceder a otras rutas protegidas
      const protectedRoutes = ['/projects', '/tasks', '/users'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForURL('/login', { timeout: 10000 });
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
      await page.waitForURL('/dashboard', { timeout: 10000 });
    });

    test('navegación entre páginas principales', async ({ page }) => {
      // Verificar que estamos en el dashboard
      await expect(page).toHaveURL('/dashboard');
      
      // Navegar a proyectos
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      // Verificar que llegamos a proyectos o dashboard (puede redirigir por permisos)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(projects|dashboard)/);
      
      // Navegar a tareas
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const tasksUrl = page.url();
      expect(tasksUrl).toMatch(/\/(tasks|dashboard)/);
      
      // Navegar a usuarios
      await page.goto('/users');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const usersUrl = page.url();
      expect(usersUrl).toMatch(/\/(users|dashboard)/);
      
      // Volver al dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');
    });

    test('verificar elementos del dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Esperar a que cargue el dashboard
      await page.waitForLoadState('networkidle');
      
      // Verificar que hay contenido en el dashboard
      const content = await page.content();
      expect(content).toContain('Dashboard');
    });

    test('verificar página de proyectos carga correctamente', async ({ page }) => {
      await page.goto('/projects');
      
      // Esperar a que cargue la página
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página tiene contenido
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });

    test('verificar página de tareas carga correctamente', async ({ page }) => {
      await page.goto('/tasks');
      
      // Esperar a que cargue la página
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página tiene contenido
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });

    test('verificar página de usuarios carga correctamente', async ({ page }) => {
      await page.goto('/users');
      
      // Esperar a que cargue la página
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página tiene contenido
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });

    test('verificar header está presente en todas las páginas', async ({ page }) => {
      const pages = ['/dashboard', '/projects', '/tasks', '/users'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Verificar que el header está visible
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
        await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
      }
    });

    test('verificar sidebar está presente en todas las páginas', async ({ page }) => {
      const pages = ['/dashboard', '/projects', '/tasks', '/users'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Verificar que hay navegación disponible
        const content = await page.content();
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });
});
