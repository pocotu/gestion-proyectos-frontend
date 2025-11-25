import apiClient from './api';

/**
 * ProjectService - Servicio para gestión de proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de operaciones de proyectos
 * - Open/Closed: Abierto para extensión (nuevos endpoints)
 * - Liskov Substitution: Puede ser sustituido por otros servicios de API
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de la abstracción apiClient
 */

class ProjectService {
  /**
   * Obtener todos los proyectos
   * GET /api/projects
   * @param {Object} filters - Filtros opcionales para la búsqueda
   * @returns {Promise<Object>} Lista de proyectos
   */
  async getAllProjects(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros como parámetros de consulta
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/projects?${queryString}` : '/projects';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener proyecto por ID
   * GET /api/projects/:id
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object>} Datos del proyecto
   */
  async getProjectById(id) {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nuevo proyecto
   * POST /api/projects
   * @param {Object} projectData - Datos del proyecto
   * @returns {Promise<Object>} Proyecto creado
   */
  async createProject(projectData) {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar proyecto
   * PUT /api/projects/:id
   * @param {number} id - ID del proyecto
   * @param {Object} projectData - Datos actualizados del proyecto
   * @returns {Promise<Object>} Proyecto actualizado
   */
  async updateProject(id, projectData) {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar proyecto
   * DELETE /api/projects/:id
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteProject(id) {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado del proyecto
   * PATCH /api/projects/:id/status
   * @param {number} id - ID del proyecto
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} Proyecto con estado actualizado
   */
  async changeProjectStatus(id, status) {
    try {
      const response = await apiClient.patch(`/projects/${id}/status`, { estado: status });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas del proyecto
   * GET /api/projects/:id/stats
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object>} Estadísticas del proyecto
   */
  async getProjectStats(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener estadísticas del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas del proyecto
   * GET /api/projects/:id/tasks
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object>} Lista de tareas del proyecto
   */
  async getProjectTasks(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener responsables del proyecto
   * GET /api/projects/:id/responsibles
   * @param {number} id - ID del proyecto
   * @returns {Promise<Object>} Lista de responsables del proyecto
   */
  async getProjectResponsibles(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/responsibles`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener responsables del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Asignar responsable al proyecto
   * POST /api/projects/:id/responsibles
   * @param {number} id - ID del proyecto
   * @param {number} userId - ID del usuario a asignar
   * @returns {Promise<Object>} Confirmación de asignación
   */
  async assignResponsible(id, userId) {
    try {
      const response = await apiClient.post(`/projects/${id}/responsibles`, { usuario_id: userId });
      return response.data;
    } catch (error) {
      console.error(`Error al asignar responsable al proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Remover responsable del proyecto
   * DELETE /api/projects/:id/responsibles/:userId
   * @param {number} id - ID del proyecto
   * @param {number} userId - ID del usuario a remover
   * @returns {Promise<Object>} Confirmación de remoción
   */
  async removeResponsible(id, userId) {
    try {
      const response = await apiClient.delete(`/projects/${id}/responsibles/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al remover responsable del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar proyectos
   * GET /api/projects/search
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchProjects(query, filters = {}) {
    try {
      const params = { q: query, ...filters };
      const response = await apiClient.get('/projects/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error al buscar proyectos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener proyectos por estado
   * GET /api/projects/by-status/:status
   * @param {string} status - Estado del proyecto
   * @returns {Promise<Object>} Proyectos filtrados por estado
   */
  async getProjectsByStatus(status) {
    try {
      const response = await apiClient.get(`/projects/by-status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener proyectos por estado ${status}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener mis proyectos (donde soy responsable)
   * GET /api/projects/my-projects
   * @returns {Promise<Object>} Mis proyectos
   */
  async getMyProjects() {
    try {
      const response = await apiClient.get('/projects/my-projects');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis proyectos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener proyectos donde participo
   * GET /api/projects/participating
   * @returns {Promise<Object>} Proyectos donde participo
   */
  async getParticipatingProjects() {
    try {
      const response = await apiClient.get('/projects/participating');
      return response.data;
    } catch (error) {
      console.error('Error al obtener proyectos donde participo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error de la petición
   * @returns {Error} Error procesado
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      const message = data?.message || `Error ${status}`;
      
      switch (status) {
        case 400:
          return new Error(`Datos inválidos: ${message}`);
        case 401:
          return new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        case 403:
          return new Error('No tienes permisos para realizar esta acción.');
        case 404:
          return new Error('Proyecto no encontrado.');
        case 409:
          return new Error('Conflicto: El proyecto ya existe o hay datos duplicados.');
        case 500:
          return new Error('Error interno del servidor. Intenta nuevamente.');
        default:
          return new Error(message);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error de configuración
      return new Error('Error inesperado. Intenta nuevamente.');
    }
  }
}

// Exportar instancia única (Singleton)
export default new ProjectService();