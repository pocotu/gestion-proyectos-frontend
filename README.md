# Frontend - Sistema de Gestión de Proyectos

Frontend con React + Vite + Bootstrap para el Sistema de Gestión de Proyectos.

## Instalacion Local

```bash
npm install
cp .env.example .env
# Editar .env con URL del backend
npm run dev
```

## Estructura del Proyecto

```
src/
  components/      # Componentes reutilizables
  context/         # Context API para estado global
  pages/           # Paginas principales
  services/        # Servicios para API calls
  styles/          # Estilos globales
  utils/           # Utilidades
```

## Tests

### Resumen de Tests Frontend (E2E con Playwright)

```
[OK] Auth: 8/8
[OK] Users: 8/8
[OK] Dashboard: 13/13
[OK] Projects: 3/3
[OK] Tasks: 12/12
[OK] Roles: 8/8
[OK] Files: 3/3
[OK] Activity Logs: 3/3
[OK] Audit: 3/3
[OK] Integration: 11/11

Total Frontend: 72 tests pasados sin errores
```

### Ejecutar Tests E2E

```bash
npx playwright test                              # Todos los tests
npx playwright test tests/e2e/auth.spec.js      # Test especifico
npx playwright test --workers=6                  # Con mas workers
npx playwright show-report                       # Ver reporte HTML
npx playwright test --debug                      # Modo debug
```

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build produccion
npm run preview    # Preview build
npm test           # Tests E2E
```

## Tecnologias

- React 18
- Vite
- Bootstrap 5
- Playwright (E2E)
- Context API

---

**Stack**: React + Vite + Bootstrap + Playwright
