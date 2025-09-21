import axios from 'axios';

/**
 * Configuración base de Axios
 * Implementa el patrón Singleton para la instancia de API
 * Principio de Responsabilidad Única: Solo se encarga de la configuración HTTP
 */

// URL base de la API (desde variables de entorno o fallback)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Request
 * Añade automáticamente el token JWT a las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de peticiones en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Maneja respuestas y errores de forma centralizada
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  async (error) => {
    // Manejo centralizado de errores
    const { response, request, message, config } = error;
    
    if (response) {
      // Error de respuesta del servidor
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Token expirado o inválido - intentar refresh automático
          if (!config._retry) {
            config._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                // Intentar refrescar el token
                const refreshResponse = await apiClient.post('/auth/refresh-token', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                
                // Actualizar tokens en localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
                
                // Reintentar la petición original con el nuevo token
                config.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(config);
              }
            } catch (refreshError) {
              // Para MVP: Solo loguear el error, no hacer logout automático
              // Esto evita que se cierre la sesión por problemas de conectividad
              console.warn('No se pudo refrescar el token:', refreshError.message);
              // Rechazar la petición original sin limpiar la sesión
              return Promise.reject(error);
            }
          } else {
            // Si ya se intentó el refresh y falló, solo loguear
            console.warn('Refresh token ya intentado, petición falló');
            return Promise.reject(error);
          }
          break;
          
        case 403:
          console.error('❌ Acceso denegado');
          break;
          
        case 404:
          console.error('❌ Recurso no encontrado');
          break;
          
        case 422:
          console.error('❌ Error de validación:', data.errors);
          break;
          
        case 500:
          console.error('❌ Error interno del servidor');
          break;
          
        default:
          console.error(`❌ Error ${status}:`, data.message || 'Error desconocido');
      }
      
      // Retornar error estructurado
      return Promise.reject({
        status,
        message: data.message || 'Error en la petición',
        errors: data.errors || null,
        data: data
      });
      
    } else if (request) {
      // Error de red o timeout
      console.error('❌ Error de conexión:', message);
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        errors: null,
        data: null
      });
      
    } else {
      // Error en la configuración de la petición
      console.error('❌ Error de configuración:', message);
      return Promise.reject({
        status: 0,
        message: 'Error en la configuración de la petición',
        errors: null,
        data: null
      });
    }
  }
);

/**
 * Métodos de conveniencia para diferentes tipos de peticiones
 * Implementa el patrón Facade para simplificar el uso de la API
 */
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // Upload de archivos
  upload: (url, formData, onUploadProgress = null) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Download de archivos
  download: (url, filename) => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }
};

// Exportar también la instancia de axios por si se necesita más control
export default apiClient;