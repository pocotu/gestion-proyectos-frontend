/**
 * Servicio para manejar las operaciones relacionadas con logs de actividad
 */

import api from './api';

export const activityService = {
  /**
   * Obtener logs de actividad con filtros
   * @param {Object} filters - Filtros para los logs
   * @returns {Promise<Object>} Respuesta con los logs
   */
  async getActivityLogs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros como parámetros de consulta
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/activity/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de actividad del sistema
   * @param {number} days - Días hacia atrás para las estadísticas
   * @returns {Promise<Object>} Estadísticas del sistema
   */
  async getActivityStats(days = 30) {
    try {
      const response = await api.get(`/activity/stats?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  },

  /**
   * Obtener actividad de un usuario específico
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones adicionales (page, limit, days)
   * @returns {Promise<Object>} Actividad del usuario
   */
  async getUserActivity(userId, options = {}) {
    try {
      const { page = 1, limit = 50, days = 30 } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        days: days.toString()
      });

      const response = await api.get(`/activity/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  /**
   * Obtener actividad de una entidad específica
   * @param {string} entityType - Tipo de entidad
   * @param {number} entityId - ID de la entidad
   * @param {Object} options - Opciones adicionales (page, limit)
   * @returns {Promise<Object>} Actividad de la entidad
   */
  async getEntityActivity(entityType, entityId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get(`/activity/entity/${entityType}/${entityId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entity activity:', error);
      throw error;
    }
  },

  /**
   * Exportar logs para auditoría
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Object|string>} Datos exportados
   */
  async exportLogs(options = {}) {
    try {
      const { 
        startDate, 
        endDate, 
        userId, 
        format = 'json' 
      } = options;

      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      params.append('format', format);

      if (format === 'csv') {
        // Para CSV, necesitamos manejar la respuesta como texto
        const response = await fetch(`${api.defaults.baseURL}/activity/export?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al exportar logs');
        }

        return await response.text();
      } else {
        // Para JSON, usar la instancia de axios normal
        const response = await api.get(`/activity/export?${params.toString()}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  },

  /**
   * Obtener actividad reciente para el dashboard
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de actividades recientes
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/activity/logs?limit=${limit}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback a datos mock en caso de error
      return [
        {
          id: 1,
          usuario_nombre: 'Usuario Demo',
          usuario_email: 'demo@example.com',
          accion: 'crear',
          entidad_tipo: 'proyecto',
          entidad_id: 1,
          descripcion: 'Creó un nuevo proyecto',
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          id: 2,
          usuario_nombre: 'Usuario Demo',
          usuario_email: 'demo@example.com',
          accion: 'actualizar',
          entidad_tipo: 'tarea',
          entidad_id: 5,
          descripcion: 'Actualizó el estado de una tarea',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          ip_address: '192.168.1.1'
        }
      ];
    }
  },

  /**
   * Registrar una actividad (para uso interno del sistema)
   * @param {Object} activityData - Datos de la actividad
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async logActivity(activityData) {
    try {
      const response = await api.post('/activity/log', activityData);
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      // No lanzar error para no interrumpir el flujo principal
      return null;
    }
  },

  /**
   * Obtener tipos de entidad disponibles
   * @returns {Array} Lista de tipos de entidad
   */
  getEntityTypes() {
    return [
      { value: 'proyecto', label: 'Proyecto' },
      { value: 'tarea', label: 'Tarea' },
      { value: 'usuario', label: 'Usuario' },
      { value: 'archivo', label: 'Archivo' },
      { value: 'rol', label: 'Rol' }
    ];
  },

  /**
   * Obtener tipos de acción disponibles
   * @returns {Array} Lista de tipos de acción
   */
  getActionTypes() {
    return [
      { value: 'crear', label: 'Crear' },
      { value: 'actualizar', label: 'Actualizar' },
      { value: 'eliminar', label: 'Eliminar' },
      { value: 'ver', label: 'Ver' },
      { value: 'login', label: 'Iniciar Sesión' },
      { value: 'logout', label: 'Cerrar Sesión' },
      { value: 'cambio_estado', label: 'Cambio de Estado' },
      { value: 'asignacion', label: 'Asignación' },
      { value: 'subir_archivo', label: 'Subir Archivo' },
      { value: 'descargar_archivo', label: 'Descargar Archivo' }
    ];
  }
};

export default activityService;