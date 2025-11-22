/**
 * Helper de autenticación para tests E2E
 * Principio DRY: Evita duplicación de código de login en tests
 */

/**
 * Realiza login como administrador
 * @param {import('@playwright/test').Page} page - Página de Playwright
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<void>}
 */
export async function loginAsAdmin(page, options = {}) {
  const {
    email = 'admin@gestion-proyectos.com',
    password = 'Admin123!',
    timeout = 30000
  } = options;

  // Navegar a la página de login
  await page.goto('http://localhost:5173/login');

  // Llenar el formulario de login usando data-testid
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);

  // Hacer click en el botón de login
  await page.click('[data-testid="login-button"]');

  // Esperar la redirección al dashboard
  await page.waitForURL(/.*dashboard/, { timeout });

  // Esperar a que el dashboard se cargue completamente
  // Primero esperar a que desaparezca el loading spinner si existe
  try {
    await page.waitForSelector('text=Cargando dashboard...', { state: 'hidden', timeout: 5000 });
  } catch {
    // Si no hay spinner, continuar
  }

  // Luego esperar a que aparezca el dashboard o cualquier contenido principal
  try {
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 10000 });
  } catch {
    // Si no encuentra el dashboard-page, esperar por el header del dashboard
    await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 5000 });
  }
}

/**
 * Realiza login con credenciales personalizadas
 * @param {import('@playwright/test').Page} page - Página de Playwright
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {number} timeout - Timeout en milisegundos
 * @returns {Promise<void>}
 */
export async function loginAsUser(page, email, password, timeout = 20000) {
  await loginAsAdmin(page, { email, password, timeout });
}

/**
 * Realiza logout
 * @param {import('@playwright/test').Page} page - Página de Playwright
 * @returns {Promise<void>}
 */
export async function logout(page) {
  const logoutButton = page.locator('[data-testid="logout-button"]');
  await logoutButton.waitFor({ timeout: 20000 });
  await logoutButton.click();

  // Verificar redirección al login
  await page.waitForURL(/.*login/, { timeout: 15000 });
}

/**
 * Verifica si el usuario está logueado
 * @param {import('@playwright/test').Page} page - Página de Playwright
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn(page) {
  try {
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
