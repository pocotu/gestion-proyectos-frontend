import api from './api';

/**
 * FileService - Servicio para manejar operaciones de archivos
 * Maneja la subida, descarga y gestión de archivos para proyectos y tareas
 */
class FileService {
  /**
   * Subir archivos para un proyecto
   */
  async uploadProjectFiles(projectId, files) {
    try {
      const formData = new FormData();
      
      // Agregar cada archivo al FormData
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      formData.append('proyecto_id', projectId);
      formData.append('tipo_entidad', 'proyecto');

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al subir archivos del proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error al subir archivos');
    }
  }

  /**
   * Subir archivos para una tarea
   */
  async uploadTaskFiles(taskId, files) {
    try {
      const formData = new FormData();
      
      // Agregar cada archivo al FormData
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      formData.append('tarea_id', taskId);
      formData.append('tipo_entidad', 'tarea');

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al subir archivos de la tarea:', error);
      throw new Error(error.response?.data?.message || 'Error al subir archivos');
    }
  }

  /**
   * Obtener archivos de un proyecto
   */
  async getProjectFiles(projectId) {
    try {
      const response = await api.get(`/files/proyecto/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos del proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener archivos');
    }
  }

  /**
   * Obtener archivos de una tarea
   */
  async getTaskFiles(taskId) {
    try {
      const response = await api.get(`/files/tarea/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos de la tarea:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener archivos');
    }
  }

  /**
   * Descargar un archivo
   */
  async downloadFile(fileId) {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'archivo';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar archivo');
    }
  }

  /**
   * Eliminar un archivo
   */
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar archivo');
    }
  }

  /**
   * Obtener información de un archivo
   */
  async getFileInfo(fileId) {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener información del archivo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener información del archivo');
    }
  }

  /**
   * Validar archivo antes de subir
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB por defecto
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg']
    } = options;

    const errors = [];

    // Validar tamaño
    if (file.size > maxSize) {
      errors.push(`El archivo "${file.name}" excede el tamaño máximo permitido (${this.formatFileSize(maxSize)})`);
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`El tipo de archivo "${file.type}" no está permitido para "${file.name}"`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtener icono según tipo de archivo
   */
  getFileIcon(fileName, mimeType) {
    if (mimeType) {
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
      if (mimeType.includes('image')) return '🖼️';
    }
    
    const extension = fileName?.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  }

  /**
   * Obtener estadísticas de archivos
   */
  async getFileStats() {
    try {
      const response = await api.get('/files/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de archivos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
}

// Exportar instancia única
export const fileService = new FileService();
export default fileService;