import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas End-to-End
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Ejecutar pruebas en archivos en paralelo */
  fullyParallel: true,
  /* Fallar la build en CI si accidentalmente dejaste test.only en el código fuente */
  forbidOnly: !!process.env.CI,
  /* Reintentar en CI solamente */
  retries: process.env.CI ? 2 : 0,
  /* Opt out de parallel tests en CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter a usar. Ver https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Configuración compartida para todas las pruebas */
  use: {
    /* URL base a usar en acciones como `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    /* Recopilar trace cuando se reintenta una prueba fallida */
    trace: 'on-first-retry',
    /* Tomar screenshot cuando falla una prueba */
    screenshot: 'only-on-failure',
    /* Grabar video cuando falla una prueba */
    video: 'retain-on-failure',
  },
});