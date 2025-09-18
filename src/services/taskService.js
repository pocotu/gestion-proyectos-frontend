import apiClient from './api';

/**
 * TaskService - Servicio para gestión de tareas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de operaciones de tareas
 * - Open/Closed: Abierto para extensión (nuevos endpoints)
 * - Liskov Substitution: Puede ser sustituido por otros servicios de API
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de la abstracción apiClient
 */

class TaskService {
  /**
   * Obtener todas las tareas
   * GET /api/tasks
   * @param {Object} params - Parámetros de consulta (page, limit, filters)
   * @returns {Promise<Object>} Lista de tareas con paginación
   */
  async getAllTasks(params = {}) {
    try {
      const response = await apiClient.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tarea por ID
   * GET /api/tasks/:id
   * @param {number} id - ID de la tarea
   * @returns {Promise<Object>} Datos de la tarea
   */
  async getTaskById(id) {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tarea ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nueva tarea
   * POST /api/tasks
   * @param {Object} taskData - Datos de la tarea
   * @returns {Promise<Object>} Tarea creada
   */
  async createTask(taskData) {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar tarea
   * PUT /api/tasks/:id
   * @param {number} id - ID de la tarea
   * @param {Object} taskData - Datos actualizados de la tarea
   * @returns {Promise<Object>} Tarea actualizada
   */
  async updateTask(id, taskData) {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar tarea ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar tarea
   * DELETE /api/tasks/:id
   * @param {number} id - ID de la tarea
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteTask(id) {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar tarea ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado de la tarea
   * PATCH /api/tasks/:id/status
   * @param {number} id - ID de la tarea
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} Tarea con estado actualizado
   */
  async updateTaskStatus(id, status) {
    try {
      const response = await apiClient.patch(`/tasks/${id}/status`, { estado: status });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado de tarea ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas por proyecto
   * GET /api/tasks/by-project/:projectId
   * @param {number} projectId - ID del proyecto
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tareas del proyecto
   */
  async getTasksByProject(projectId, params = {}) {
    try {
      const response = await apiClient.get(`/tasks/by-project/${projectId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas del proyecto ${projectId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas por estado
   * GET /api/tasks/by-status/:status
   * @param {string} status - Estado de las tareas
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tareas por estado
   */
  async getTasksByStatus(status, params = {}) {
    try {
      const response = await apiClient.get(`/tasks/by-status/${status}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas por estado ${status}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas por prioridad
   * GET /api/tasks/by-priority/:priority
   * @param {string} priority - Prioridad de las tareas
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tareas por prioridad
   */
  async getTasksByPriority(priority, params = {}) {
    try {
      const response = await apiClient.get(`/tasks/by-priority/${priority}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas por prioridad ${priority}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar tareas
   * GET /api/tasks/search
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchTasks(query, filters = {}) {
    try {
      const params = { q: query, ...filters };
      const response = await apiClient.get('/tasks/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error al buscar tareas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de tareas
   * GET /api/tasks/stats/overview
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de tareas
   */
  async getTaskStats(filters = {}) {
    try {
      const response = await apiClient.get('/tasks/stats/overview', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de tareas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Asignar usuario a tarea
   * POST /api/tasks/:id/assign
   * @param {number} taskId - ID de la tarea
   * @param {number} userId - ID del usuario a asignar
   * @returns {Promise<Object>} Confirmación de asignación
   */
  async assignTask(taskId, userId) {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/assign`, { usuario_id: userId });
      return response.data;
    } catch (error) {
      console.error(`Error al asignar tarea ${taskId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Desasignar usuario de tarea
   * DELETE /api/tasks/:id/assign/:userId
   * @param {number} taskId - ID de la tarea
   * @param {number} userId - ID del usuario a desasignar
   * @returns {Promise<Object>} Confirmación de desasignación
   */
  async unassignTask(taskId, userId) {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/assign/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al desasignar tarea ${taskId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas próximas a vencer
   * GET /api/tasks/upcoming
   * @param {number} days - Días de anticipación (default: 7)
   * @returns {Promise<Object>} Lista de tareas próximas a vencer
   */
  async getUpcomingTasks(days = 7) {
    try {
      const response = await apiClient.get('/tasks/upcoming', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error al obtener tareas próximas a vencer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo de errores centralizado
   * @param {Error} error - Error capturado
   * @returns {Error} Error procesado
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'Error del servidor';
      
      switch (status) {
        case 400:
          return new Error(`Datos inválidos: ${message}`);
        case 401:
          return new Error('No autorizado. Inicia sesión nuevamente.');
        case 403:
          return new Error('No tienes permisos para realizar esta acción.');
        case 404:
          return new Error('Tarea no encontrada.');
        case 409:
          return new Error(`Conflicto: ${message}`);
        case 422:
          return new Error(`Error de validación: ${message}`);
        case 500:
          return new Error('Error interno del servidor. Intenta más tarde.');
        default:
          return new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error de configuración
      return new Error(`Error: ${error.message}`);
    }
  }
}

// Exportar instancia única del servicio (Singleton)
export default new TaskService();