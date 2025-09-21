import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * FileList - Componente para mostrar archivos asociados
 * Permite ver, descargar y eliminar archivos
 */
const FileList = ({ 
  files = [], 
  onDelete, 
  canDelete = false,
  loading = false,
  className = ''
}) => {
  const { addNotification } = useNotifications();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  /**
   * Formatear tamaño de archivo
   */
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtener icono según tipo de archivo
   */
  const getFileIcon = (fileName, mimeType) => {
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
  };

  /**
   * Obtener color del badge según tipo de archivo
   */
  const getFileTypeBadge = (fileName, mimeType) => {
    const extension = fileName?.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return { text: 'PDF', color: 'bg-red-100 text-red-800' };
      case 'doc':
      case 'docx':
        return { text: 'DOC', color: 'bg-blue-100 text-blue-800' };
      case 'jpg':
      case 'jpeg':
        return { text: 'JPG', color: 'bg-green-100 text-green-800' };
      case 'png':
        return { text: 'PNG', color: 'bg-green-100 text-green-800' };
      default:
        return { text: extension?.toUpperCase() || 'FILE', color: 'bg-gray-100 text-gray-800' };
    }
  };

  /**
   * Descargar archivo
   */
  const handleDownload = async (file) => {
    try {
      // Si el archivo tiene una URL directa, usarla
      if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.nombre_original || file.nombre || 'archivo';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Si no, construir la URL del backend
      const downloadUrl = `/api/files/${file.id}/download`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.nombre_original || file.nombre || 'archivo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      addNotification('Error al descargar el archivo', 'error');
    }
  };

  /**
   * Confirmar eliminación de archivo
   */
  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  /**
   * Ejecutar eliminación
   */
  const confirmDelete = async () => {
    if (!fileToDelete || !onDelete) return;

    try {
      await onDelete(fileToDelete.id);
      addNotification('Archivo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      addNotification('Error al eliminar el archivo', 'error');
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando archivos...</p>
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos</h3>
          <p className="text-gray-600">No se han subido archivos para este elemento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Archivos ({files.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {files.map((file) => {
          const typeBadge = getFileTypeBadge(file.nombre_original || file.nombre, file.tipo_mime);
          
          return (
            <div key={file.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {getFileIcon(file.nombre_original || file.nombre, file.tipo_mime)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.nombre_original || file.nombre}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}>
                        {typeBadge.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.tamaño)}</span>
                      <span>Subido: {formatDate(file.created_at)}</span>
                      {file.subido_por && (
                        <span>Por: {file.subido_por}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Descargar archivo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar archivo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Eliminar Archivo"
        message={`¿Estás seguro de que deseas eliminar el archivo "${fileToDelete?.nombre_original || fileToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default FileList;