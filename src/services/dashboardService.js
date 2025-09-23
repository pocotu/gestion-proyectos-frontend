import api from './api';

/**
 * DashboardService - Servicio para obtener datos del dashboard
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja operaciones relacionadas con el dashboard
 * - Open/Closed: Abierto para extensión (nuevas estadísticas, métricas)
 * - Liskov Substitution: Puede ser sustituido por otros servicios de dashboard
 * - Interface Segregation: Métodos específicos para cada tipo de dato
 * - Dependency Inversion: Depende de la abstracción 'api' no de implementación específica
 */

class DashboardService {
  /**
   * Obtiene el resumen completo del dashboard para el usuario actual
   * @returns {Promise<Object>} Datos del dashboard
   */
  async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene todos los datos del dashboard (función principal)
   * @returns {Promise<Object>} Datos completos del dashboard
   */
  async getDashboardData() {
    try {
      // Obtener datos reales del API
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de proyectos para el usuario actual
   * @returns {Promise<Object>} Estadísticas de proyectos
   */
  async getProjectStats() {
    try {
      const response = await api.get('/dashboard/projects/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de tareas para el usuario actual
   * @returns {Promise<Object>} Estadísticas de tareas
   */
  async getTaskStats() {
    try {
      const response = await api.get('/dashboard/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene los proyectos recientes del usuario
   * @param {number} limit - Número máximo de proyectos a obtener
   * @returns {Promise<Array>} Lista de proyectos recientes
   */
  async getRecentProjects(limit = 5) {
    try {
      const response = await api.get(`/dashboard/projects/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene las tareas recientes del usuario
   * @param {number} limit - Número máximo de tareas a obtener
   * @returns {Promise<Array>} Lista de tareas recientes
   */
  async getRecentTasks(limit = 5) {
    try {
      const response = await api.get(`/dashboard/tasks/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene las tareas pendientes del usuario
   * @returns {Promise<Array>} Lista de tareas pendientes
   */
  async getPendingTasks() {
    try {
      const response = await api.get('/dashboard/tasks/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene estadísticas específicas para administradores
   * @returns {Promise<Object>} Estadísticas administrativas
   */
  async getAdminStats() {
    try {
      const response = await api.get('/dashboard/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene las tareas asignadas al usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de tareas asignadas al usuario
   */
  async getUserTasks(userId) {
    try {
      if (!userId) return [];
      const response = await api.get(`/dashboard/tasks/recent?limit=10`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene los proyectos asignados al usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de proyectos del usuario
   */
  async getUserProjects(userId) {
    try {
      if (!userId) return [];
      const response = await api.get(`/dashboard/projects/recent?limit=8`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Obtiene la actividad reciente del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de actividades recientes
   */
  async getRecentActivity(userId) {
    try {
      if (!userId) return [];
      const response = await api.get(`/dashboard/admin/activity?limit=10`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Maneja errores de las peticiones HTTP
   * @param {Error} error - Error de la petición
   * @returns {Error} Error procesado
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        case 403:
          return new Error('No tienes permisos para acceder a esta información.');
        case 404:
          return new Error('Los datos solicitados no fueron encontrados.');
        case 500:
          return new Error('Error interno del servidor. Intenta nuevamente más tarde.');
        default:
          return new Error(data?.message || 'Error al obtener los datos del dashboard.');
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

// Exportar instancia singleton
const dashboardService = new DashboardService();
export default dashboardService;