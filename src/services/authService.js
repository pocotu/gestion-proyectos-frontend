import { api } from './api';

/**
 * Servicio de Autenticación
 * Implementa el patrón Service Layer para operaciones de autenticación
 * Principio de Responsabilidad Única: Solo maneja operaciones de auth
 * Principio de Inversión de Dependencias: Depende de la abstracción (api) no de implementaciones concretas
 */
class AuthService {
  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Datos del usuario registrado
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;
      
      // Guardar datos en localStorage
      this._setAuthData(user, accessToken, refreshToken);
      
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Error al registrar usuario');
    }
  }

  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, contraseña: password });
      const { user, token } = response.data.data;
      
      // Guardar datos en localStorage
      this._setAuthData(user, token, null);
      
      return { user, token };
    } catch (error) {
      throw this._handleError(error, 'Error al iniciar sesión');
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      // Intentar cerrar sesión en el servidor
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Continuar con logout local aunque falle el servidor
      console.warn('Error al cerrar sesión en servidor:', error.message);
    } finally {
      // Limpiar datos locales
      this._clearAuthData();
    }
  }

  /**
   * Verificar token actual
   * @returns {Promise<Object>} Datos del usuario
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      const { user } = response.data.data;
      
      // Actualizar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      // Token inválido, limpiar datos
      this._clearAuthData();
      throw this._handleError(error, 'Token inválido');
    }
  }

  /**
   * Refrescar token de acceso
   * @returns {Promise<Object>} Respuesta con nuevo token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { user, accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Actualizar tokens en localStorage
      this._setAuthData(user, accessToken, newRefreshToken);
      
      return response.data;
    } catch (error) {
      // Si falla el refresh, limpiar datos y redirigir al login
      this._clearAuthData();
      throw this._handleError(error, 'Error al refrescar token');
    }
  }

  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Error al cambiar contraseña');
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Error al solicitar recuperación');
    }
  }

  /**
   * Restablecer contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Error al restablecer contraseña');
    }
  }

  /**
   * Obtener usuario actual del localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Obtener refresh token actual del localStorage
   * @returns {string|null} Refresh token o null
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Obtener token actual del localStorage
   * @returns {string|null} Token o null
   */
  getCurrentToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    const token = this.getCurrentToken();
    const refreshToken = this.getRefreshToken();
    const user = this.getCurrentUser();
    return !!(token && refreshToken && user);
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si tiene el rol
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean} True si es admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.es_administrador || this.hasRole('admin');
  }

  /**
   * Verificar expiración del token y realizar auto-logout si es necesario
   * @returns {boolean} True si el token es válido, false si expiró
   */
  checkTokenExpiration() {
    const token = this.getCurrentToken();
    if (!token) {
      return false;
    }

    try {
      // Decodificar el JWT para obtener la fecha de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Si el token expira en menos de 5 minutos, intentar refrescarlo
      if (payload.exp - currentTime < 300) {
        this.refreshToken().catch(() => {
          // Si falla el refresh, hacer logout
          this.performAutoLogout();
        });
      }
      
      // Si el token ya expiró, hacer logout inmediato
      if (payload.exp <= currentTime) {
        this.performAutoLogout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      this.performAutoLogout();
      return false;
    }
  }

  /**
   * Realizar auto-logout por expiración
   * @private
   */
  async performAutoLogout() {
    try {
      // Intentar logout en el servidor
      await this.logout();
    } catch (error) {
      // Si falla, al menos limpiar datos locales
      this._clearAuthData();
    }
    
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Inicializar verificación periódica de tokens
   */
  initTokenExpirationCheck() {
    // Verificar cada 5 minutos
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.checkTokenExpiration();
      }
    }, 5 * 60 * 1000);
  }

  // Métodos privados

  /**
   * Guardar datos de autenticación en localStorage
   * @private
   */
  _setAuthData(user, accessToken, refreshToken) {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Limpiar datos de autenticación del localStorage
   * @private
   */
  _clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Manejar errores de forma consistente
   * @private
   */
  _handleError(error, defaultMessage) {
    return {
      message: error.message || defaultMessage,
      status: error.status || 500,
      errors: error.errors || null
    };
  }
}

// Exportar instancia singleton
export default new AuthService();