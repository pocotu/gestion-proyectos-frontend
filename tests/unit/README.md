# Frontend Unit Tests

This directory contains unit tests for the frontend services and components.

## Setup

The frontend currently uses Playwright for E2E tests. To run these unit tests, you need to install and configure Vitest:

### Installation

```bash
cd gestion-proyectos-frontend
npm install --save-dev vitest @vitest/ui jsdom
```

### Configuration

Create a `vitest.config.js` file in the frontend root:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
      ],
    },
  },
});
```

### Add Test Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:unit:run": "vitest run",
    "test:unit:coverage": "vitest run --coverage"
  }
}
```

## Running Tests

Once configured, you can run the tests:

```bash
# Run tests in watch mode
npm run test:unit

# Run tests once
npm run test:unit:run

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage
npm run test:unit:coverage
```

## Test Files

- `projectService.test.js` - Tests for the project service layer, specifically the `getProjectDetails` method

## Test Coverage

The tests cover:
- ✅ API call with correct endpoint and project ID
- ✅ Authentication token inclusion (via apiClient interceptor)
- ✅ Response data handling
- ✅ 404 error handling (project not found)
- ✅ 403 error handling (access denied)
- ✅ Network error handling
- ✅ 400, 401, 500 error handling
- ✅ Unexpected error handling
- ✅ Error logging
- ✅ Complete response structure validation
- ✅ Empty data arrays handling

## Requirements Validated

These tests validate the following requirements:
- **Requirement 2.1**: API endpoint `/api/projects/:id/details`
- **Requirement 8.3**: Loading state and data fetching
- **Requirement 8.4**: Error handling and recovery
- **Requirement 12.2**: Network error handling
- **Requirement 12.3**: 404 error handling
- **Requirement 12.4**: 403 error handling

## Notes

- The tests use Vitest's mocking capabilities to mock the `apiClient`
- Authentication is handled automatically by the `apiClient` interceptor
- Error handling is delegated to the `handleError` method in the service
- All tests follow the AAA pattern (Arrange, Act, Assert)
