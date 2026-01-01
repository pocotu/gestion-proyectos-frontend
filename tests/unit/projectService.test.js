/**
 * Unit Tests - ProjectService (Frontend)
 * Tests for getProjectDetails service method
 * Subtask 7.3: Write unit tests for service
 * 
 * NOTE: These tests require Jest or Vitest to be configured in the frontend.
 * To run these tests, add a testing framework to package.json:
 * - npm install --save-dev vitest @vitest/ui
 * - Add script: "test:unit": "vitest"
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import projectService from '../../src/services/projectService';
import apiClient from '../../src/services/api';

// Mock the API client
vi.mock('../../src/services/api');

describe('ProjectService Unit Tests - getProjectDetails', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('API Call (Subtask 7.1)', () => {
    test('should make GET request to correct endpoint with project ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            project: { id: 1, titulo: 'Test Project' },
            responsibles: [],
            tasks: [],
            files: [],
            activityLogs: [],
            statistics: {}
          }
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      await projectService.getProjectDetails(1);

      expect(apiClient.get).toHaveBeenCalledWith('/projects/1/details');
    });

    test('should include authentication token in headers automatically', async () => {
      // The apiClient interceptor automatically adds the token from localStorage
      // This test verifies the service calls apiClient which has the interceptor
      const mockResponse = {
        data: {
          success: true,
          data: {
            project: { id: 1, titulo: 'Test Project' },
            responsibles: [],
            tasks: [],
            files: [],
            activityLogs: [],
            statistics: {}
          }
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      await projectService.getProjectDetails(1);

      // Verify apiClient.get was called (which has the auth interceptor)
      expect(apiClient.get).toHaveBeenCalled();
    });

    test('should return response data on success', async () => {
      const mockData = {
        success: true,
        data: {
          project: { id: 1, titulo: 'Test Project' },
          responsibles: [{ usuario_id: 2, nombre: 'User 2' }],
          tasks: [{ id: 1, titulo: 'Task 1' }],
          files: [{ id: 1, nombre_archivo: 'file.pdf' }],
          activityLogs: [{ id: 1, accion: 'created' }],
          statistics: { totalTasks: 1 }
        }
      };

      apiClient.get.mockResolvedValue({ data: mockData });

      const result = await projectService.getProjectDetails(1);

      expect(result).toEqual(mockData);
    });

    test('should call getProjectDetails with numeric project ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            project: { id: 123, titulo: 'Test Project' },
            responsibles: [],
            tasks: [],
            files: [],
            activityLogs: [],
            statistics: {}
          }
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      await projectService.getProjectDetails(123);

      expect(apiClient.get).toHaveBeenCalledWith('/projects/123/details');
    });
  });

  describe('Error Handling (Subtask 7.2)', () => {
    test('should handle 404 response (project not found)', async () => {
      const error404 = {
        response: {
          status: 404,
          data: { message: 'Proyecto no encontrado' }
        }
      };

      apiClient.get.mockRejectedValue(error404);

      await expect(projectService.getProjectDetails(999)).rejects.toThrow(
        'Proyecto no encontrado.'
      );
    });

    test('should handle 403 response (access denied)', async () => {
      const error403 = {
        response: {
          status: 403,
          data: { message: 'No tiene permisos' }
        }
      };

      apiClient.get.mockRejectedValue(error403);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'No tienes permisos para esta acción.'
      );
    });

    test('should handle network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      apiClient.get.mockRejectedValue(networkError);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'Error de conexión. Verifica tu internet.'
      );
    });

    test('should handle 500 server errors', async () => {
      const error500 = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      apiClient.get.mockRejectedValue(error500);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'Error interno del servidor.'
      );
    });

    test('should handle 400 bad request errors', async () => {
      const error400 = {
        response: {
          status: 400,
          data: { message: 'ID inválido' }
        }
      };

      apiClient.get.mockRejectedValue(error400);

      await expect(projectService.getProjectDetails('invalid')).rejects.toThrow(
        'Datos inválidos'
      );
    });

    test('should handle 401 unauthorized errors', async () => {
      const error401 = {
        response: {
          status: 401,
          data: { message: 'Token inválido' }
        }
      };

      apiClient.get.mockRejectedValue(error401);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'No autorizado. Inicia sesión nuevamente.'
      );
    });

    test('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Something went wrong');

      apiClient.get.mockRejectedValue(unexpectedError);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'Error inesperado.'
      );
    });

    test('should log errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      const error404 = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      apiClient.get.mockRejectedValue(error404);

      try {
        await projectService.getProjectDetails(999);
      } catch (error) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al obtener detalles del proyecto 999:',
        error404
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Response Structure', () => {
    test('should return complete project details structure', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            project: {
              id: 1,
              titulo: 'Test Project',
              descripcion: 'Test Description',
              fecha_inicio: '2024-01-01',
              fecha_fin: '2024-12-31',
              estado: 'en_progreso',
              creado_por: 1,
              creator_name: 'Test User',
              creator_email: 'test@example.com'
            },
            responsibles: [
              {
                usuario_id: 2,
                nombre: 'Responsible User',
                email: 'responsible@example.com',
                rol_responsabilidad: 'responsable_principal'
              }
            ],
            tasks: [
              {
                id: 1,
                titulo: 'Task 1',
                estado: 'pendiente',
                prioridad: 'alta',
                usuario_asignado_id: 2,
                assignee_name: 'Assigned User'
              }
            ],
            files: [
              {
                id: 1,
                nombre_archivo: 'document.pdf',
                tamaño_bytes: 1024,
                subido_por: 1,
                uploader_name: 'Test User'
              }
            ],
            activityLogs: [
              {
                id: 1,
                accion: 'created',
                usuario_id: 1,
                user_name: 'Test User',
                created_at: '2024-01-01T00:00:00Z'
              }
            ],
            statistics: {
              totalTasks: 1,
              tasksByStatus: {
                pendiente: 1,
                en_progreso: 0,
                completada: 0,
                cancelada: 0
              },
              tasksByPriority: {
                baja: 0,
                media: 0,
                alta: 1
              },
              totalFiles: 1,
              totalResponsibles: 1
            }
          }
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await projectService.getProjectDetails(1);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('project');
      expect(result.data).toHaveProperty('responsibles');
      expect(result.data).toHaveProperty('tasks');
      expect(result.data).toHaveProperty('files');
      expect(result.data).toHaveProperty('activityLogs');
      expect(result.data).toHaveProperty('statistics');
    });

    test('should handle empty arrays for sections with no data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            project: { id: 1, titulo: 'Test Project' },
            responsibles: [],
            tasks: [],
            files: [],
            activityLogs: [],
            statistics: {
              totalTasks: 0,
              tasksByStatus: { pendiente: 0, en_progreso: 0, completada: 0, cancelada: 0 },
              tasksByPriority: { baja: 0, media: 0, alta: 0 },
              totalFiles: 0,
              totalResponsibles: 0
            }
          }
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await projectService.getProjectDetails(1);

      expect(result.data.responsibles).toEqual([]);
      expect(result.data.tasks).toEqual([]);
      expect(result.data.files).toEqual([]);
      expect(result.data.activityLogs).toEqual([]);
    });
  });

  describe('Integration with handleError', () => {
    test('should use handleError method for error processing', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      apiClient.get.mockRejectedValue(error);

      // The service should throw an error processed by handleError
      await expect(projectService.getProjectDetails(1)).rejects.toThrow(Error);
    });

    test('should preserve error message from handleError', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      apiClient.get.mockRejectedValue(error);

      await expect(projectService.getProjectDetails(1)).rejects.toThrow(
        'No tienes permisos para esta acción.'
      );
    });
  });
});
