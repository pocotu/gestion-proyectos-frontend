import React, { useState, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * FileUpload - Componente para subir archivos
 * Soporta PDF, DOC/DOCX, JPG según los requerimientos
 */
const FileUpload = ({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxSizePerFile = 10 * 1024 * 1024, // 10MB por defecto
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg'],
  disabled = false,
  className = ''
}) => {
  const { addNotification } = useNotifications();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Tipos MIME permitidos
  const allowedMimeTypes = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg'
  };

  /**
   * Validar archivo individual
   */
  const validateFile = (file) => {
    const errors = [];

    // Validar tipo de archivo
    if (!allowedMimeTypes[file.type] && !acceptedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      errors.push(`Tipo de archivo no permitido: ${file.name}`);
    }

    // Validar tamaño
    if (file.size > maxSizePerFile) {
      const sizeMB = (maxSizePerFile / (1024 * 1024)).toFixed(1);
      errors.push(`El archivo ${file.name} excede el tamaño máximo de ${sizeMB}MB`);
    }

    return errors;
  };

  /**
   * Procesar archivos seleccionados
   */
  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const allErrors = [];

    // Validar límite de archivos
    if (selectedFiles.length + fileArray.length > maxFiles) {
      addNotification(`Solo puedes subir un máximo de ${maxFiles} archivos`, 'error');
      return;
    }

    // Validar cada archivo
    fileArray.forEach(file => {
      const errors = validateFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        allErrors.push(...errors);
      }
    });

    // Mostrar errores si los hay
    if (allErrors.length > 0) {
      allErrors.forEach(error => {
        addNotification(error, 'error');
      });
    }

    // Agregar archivos válidos
    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
      addNotification(`${validFiles.length} archivo(s) seleccionado(s)`, 'success');
    }
  };

  /**
   * Manejar selección de archivos desde input
   */
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  /**
   * Manejar drag and drop
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  /**
   * Remover archivo seleccionado
   */
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  /**
   * Abrir selector de archivos
   */
  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Formatear tamaño de archivo
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Obtener icono según tipo de archivo
   */
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de drag and drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
            </p>
            <p className="text-sm text-gray-600">
              o <span className="text-blue-600 underline">haz clic para seleccionar</span>
            </p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Tipos permitidos: {acceptedTypes.join(', ')}</p>
            <p>Tamaño máximo por archivo: {formatFileSize(maxSizePerFile)}</p>
            <p>Máximo {maxFiles} archivos</p>
          </div>
        </div>
      </div>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Archivos seleccionados ({selectedFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-lg">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                  title="Remover archivo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Información importante:</p>
        <ul className="space-y-1">
          <li>• Los archivos se subirán cuando guardes el formulario</li>
          <li>• Asegúrate de que los archivos no contengan información sensible</li>
          <li>• Los archivos quedarán asociados permanentemente al proyecto/tarea</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;