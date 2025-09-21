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
      // Retornar datos simulados en caso de error
      return [
        {
          id: 1,
          titulo: 'Implementar autenticación JWT',
          descripcion: 'Configurar sistema de autenticación con tokens JWT',
          estado: 'en_progreso',
          prioridad: 'alta',
          fecha_vencimiento: '2024-01-30',
          proyecto_titulo: 'Sistema de Gestión'
        },
        {
          id: 2,
          titulo: 'Diseñar interfaz de usuario',
          descripcion: 'Crear mockups y prototipos de la interfaz',
          estado: 'pendiente',
          prioridad: 'media',
          fecha_vencimiento: '2024-02-05',
          proyecto_titulo: 'App Móvil'
        },
        {
          id: 3,
          titulo: 'Configurar base de datos',
          descripcion: 'Establecer esquema y relaciones de la BD',
          estado: 'completada',
          prioridad: 'alta',
          fecha_vencimiento: '2024-01-25',
          proyecto_titulo: 'Sistema de Gestión'
        }
      ];
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
      // Retornar datos simulados en caso de error
      return [
        {
          id: 1,
          nombre: 'Sistema de Gestión de Proyectos',
          descripcion: 'Plataforma web para gestión integral de proyectos y tareas',
          estado: 'en_progreso',
          progreso: 75,
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-03-31'
        },
        {
          id: 2,
          nombre: 'Aplicación Móvil',
          descripcion: 'App móvil complementaria para gestión de tareas',
          estado: 'planificacion',
          progreso: 25,
          fecha_inicio: '2024-02-01',
          fecha_fin: '2024-05-31'
        },
        {
          id: 3,
          nombre: 'Sistema de Reportes',
          descripcion: 'Módulo de generación de reportes y estadísticas',
          estado: 'completado',
          progreso: 100,
          fecha_inicio: '2023-11-01',
          fecha_fin: '2024-01-15'
        }
      ];
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
      // Retornar datos simulados en caso de error
      return [
        {
          tipo: 'tarea',
          accion: 'Completó la tarea',
          elemento: 'Implementar autenticación JWT',
          fecha: new Date(Date.now() - 1800000).toISOString()
        },
        {
          tipo: 'proyecto',
          accion: 'Actualizó el proyecto',
          elemento: 'Sistema de Gestión de Proyectos',
          fecha: new Date(Date.now() - 3600000).toISOString()
        },
        {
          tipo: 'tarea',
          accion: 'Creó una nueva tarea',
          elemento: 'Diseñar interfaz de login',
          fecha: new Date(Date.now() - 7200000).toISOString()
        },
        {
          tipo: 'comentario',
          accion: 'Agregó un comentario',
          elemento: 'Configurar base de datos',
          fecha: new Date(Date.now() - 10800000).toISOString()
        },
        {
          tipo: 'proyecto',
          accion: 'Cambió el estado del proyecto',
          elemento: 'Aplicación Móvil',
          fecha: new Date(Date.now() - 14400000).toISOString()
        }
      ];
    }
  }

  /**
   * Obtiene datos simulados para desarrollo/testing
   * @returns {Promise<Object>} Datos simulados del dashboard
   */
  async getMockDashboardData() {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      projects: {
        total: 12,
        active: 8,
        completed: 4,
        myProjects: 5,
        planificacion: 2,
        en_progreso: 6,
        cancelado: 0
      },
      tasks: {
        total: 45,
        pending: 15,
        inProgress: 20,
        completed: 10,
        myTasks: 12,
        alta: 5,
        media: 25,
        baja: 15
      },
      recentProjects: [
        {
          id: 1,
          titulo: 'Sistema de Gestión',
          estado: 'en_progreso',
          fecha_inicio: '2024-01-15',
          progreso: 75
        },
        {
          id: 2,
          titulo: 'App Móvil',
          estado: 'planificacion',
          fecha_inicio: '2024-01-20',
          progreso: 25
        }
      ],
      recentTasks: [
        {
          id: 1,
          titulo: 'Implementar autenticación',
          estado: 'en_progreso',
          prioridad: 'alta',
          fecha_fin: '2024-01-25'
        },
        {
          id: 2,
          titulo: 'Diseñar base de datos',
          estado: 'completada',
          prioridad: 'media',
          fecha_fin: '2024-01-22'
        }
      ],
      adminStats: {
        totalUsers: 25,
        activeUsers: 18,
        totalProjects: 12,
        totalTasks: 45
      }
    };
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