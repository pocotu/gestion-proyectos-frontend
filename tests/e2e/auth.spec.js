import { test, expect } from '@playwright/test';

test.describe('Sistema de Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('http://localhost:5173/login');
  });

  test('debe mostrar la página de login correctamente', async ({ page }) => {
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*login/);
    
    // Verificar elementos de la página
    await expect(page.locator('h2')).toContainText('Iniciar Sesión');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="contraseña"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debe realizar login exitoso con credenciales válidas', async ({ page }) => {
    // Llenar el formulario de login
    await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    
    // Hacer click en el botón de login
    await page.click('[data-testid="login-button"]');
    
    // Esperar la redirección al dashboard con timeout más largo
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    
    // Verificar que el usuario está logueado (buscar elementos del dashboard)
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    
    // Esperar a que el h1 se cargue y verificar el texto
    await page.waitForSelector('h1', { timeout: 5000 });
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toContainText('¡Bienvenido');
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Llenar el formulario con credenciales incorrectas
    await page.fill('[data-testid="email-input"]', 'wrong@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    
    // Hacer click en el botón de login
    await page.click('[data-testid="login-button"]');
    
    // Verificar que permanece en la página de login
    await expect(page).toHaveURL(/.*login/);
    
    // Verificar mensaje de error (aparece como toast con role="alert")
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('debe navegar a la página de registro', async ({ page }) => {
    // Hacer click en el enlace de registro
    await page.click('text=¿No tienes cuenta? Regístrate');
    
    // Verificar redirección a la página de registro
    await expect(page).toHaveURL(/.*register/);
    
    // Verificar elementos de la página de registro
    await expect(page.locator('h2')).toContainText('Crear Cuenta');
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="contraseña"]')).toBeVisible();
  });

  test('debe realizar registro exitoso', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('http://localhost:5173/register');
    
    // Llenar el formulario de registro
    const timestamp = Date.now();
    await page.fill('input[name="nombre"]', `Usuario Test ${timestamp}`);
    await page.fill('input[name="email"]', `test${timestamp}@test.com`);
    await page.fill('input[name="contraseña"]', 'password123');
    await page.fill('input[name="confirmarContraseña"]', 'password123');
    
    // Hacer click en el botón de registro
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard o login
    await expect(page).toHaveURL(/.*(?:dashboard|login)/);
  });

  test('debe realizar logout correctamente', async ({ page }) => {
    // Primero hacer login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Esperar a que se complete el login y esté en el dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toContainText('¡Bienvenido');
    
    // Esperar a que el header se cargue completamente
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Buscar el botón de logout usando el data-testid
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await expect(logoutButton).toBeVisible();
    
    // Hacer logout
    await logoutButton.click();
    
    // Verificar que se redirige a la página de login
    await page.waitForURL(/.*login/, { timeout: 10000 });
  });

  test('debe proteger rutas privadas', async ({ page }) => {
    // Intentar acceder directamente al dashboard sin estar logueado
    await page.goto('http://localhost:5173/dashboard');
    
    // Debe redirigir al login
    await expect(page).toHaveURL(/.*login/);
  });

  test('debe mantener la sesión después de recargar la página', async ({ page }) => {
    // Hacer login
    await page.fill('[data-testid="email-input"]', 'admin@gestion-proyectos.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar que estamos en el dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toContainText('¡Bienvenido');
    
    // Recargar la página
    await page.reload();
    
    // Verificar que seguimos en el dashboard (sesión persistente)
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-header"] h1')).toContainText('¡Bienvenido');
  });
});