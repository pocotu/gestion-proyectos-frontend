import apiClient from './api';

/**
 * ProjectService - Servicio para gestión de proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility
 * - Open/Closed
 * - Liskov Substitution
 * - Interface Segregation
 * - Dependency Inversion
 */
class ProjectService {

  async getAllProjects(filters = {}) {
    try {
      const params = new URLSearchParams();

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

  async getProjectById(id) {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async createProject(projectData) {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      throw this.handleError(error);
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async deleteProject(id) {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async changeProjectStatus(id, status) {
    try {
      const response = await apiClient.patch(
        `/projects/${id}/status`,
        { estado: status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async getProjectStats(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener estadísticas del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async getProjectTasks(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async getProjectResponsibles(id) {
    try {
      const response = await apiClient.get(`/projects/${id}/responsibles`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener responsables del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async assignResponsible(id, userId) {
    try {
      const response = await apiClient.post(
        `/projects/${id}/responsibles`,
        { usuario_id: userId }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al asignar responsable al proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async removeResponsible(id, userId) {
    try {
      const response = await apiClient.delete(
        `/projects/${id}/responsibles/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error al remover responsable del proyecto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async searchProjects(query, filters = {}) {
    try {
      const response = await apiClient.get('/projects/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar proyectos:', error);
      throw this.handleError(error);
    }
  }

  async getProjectsByStatus(status) {
    try {
      const response = await apiClient.get(`/projects/by-status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener proyectos por estado ${status}:`, error);
      throw this.handleError(error);
    }
  }

  async getMyProjects() {
    try {
      const response = await apiClient.get('/projects/my-projects');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis proyectos:', error);
      throw this.handleError(error);
    }
  }

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
   * Get complete project details including all related data
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Complete project details with responsibles, tasks, files, and activity logs
   * @throws {Error} If project not found, access denied, or network error
   */
  async getProjectDetails(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/details`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles del proyecto ${projectId}:`, error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || `Error ${status}`;

      switch (status) {
        case 400:
          return new Error(`Datos inválidos: ${message}`);
        case 401:
          return new Error('No autorizado. Inicia sesión nuevamente.');
        case 403:
          return new Error('No tienes permisos para esta acción.');
        case 404:
          return new Error('Proyecto no encontrado.');
        case 409:
          return new Error('Conflicto de datos.');
        case 500:
          return new Error('Error interno del servidor.');
        default:
          return new Error(message);
      }
    }

    if (error.request) {
      return new Error('Error de conexión. Verifica tu internet.');
    }

    return new Error('Error inesperado.');
  }
}

export default new ProjectService();
