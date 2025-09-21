import api from './api';

/**
 * UserService - Servicio para gestión de usuarios
 * Maneja todas las operaciones CRUD de usuarios
 */
class UserService {
  /**
   * Obtener lista de usuarios con filtros
   */
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.role) {
        params.append('role', filters.role);
      }
      if (filters.estado !== '') {
        params.append('estado', filters.estado);
      }

      const response = await api.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario
   */
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario existente
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de usuario (habilitar/deshabilitar)
   */
  async updateUserStatus(id, estado) {
    try {
      const response = await api.patch(`/users/${id}/status`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  }

  /**
   * Asignar rol a usuario
   */
  async assignRole(userId, roleId) {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roleId });
      return response.data;
    } catch (error) {
      console.error('Error al asignar rol:', error);
      throw error;
    }
  }

  /**
   * Remover rol de usuario
   */
  async removeRole(userId, roleId) {
    try {
      const response = await api.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error al remover rol:', error);
      throw error;
    }
  }

  /**
   * Obtener roles disponibles
   */
  async getAvailableRoles() {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios (para administradores)
   */
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
const userService = new UserService();
export default userService;