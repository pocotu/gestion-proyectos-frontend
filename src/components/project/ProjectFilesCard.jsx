import React, { useState } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * ProjectFilesCard - Displays list of project files with management capabilities
 * Follows Single Responsibility Principle: Only displays files list
 * 
 * @param {Object} props
 * @param {Array} props.files - Array of files
 * @param {number} props.projectId - Project ID
 * @param {boolean} props.canManage - Whether user can manage files
 * @param {Function} props.onUpload - Callback for uploading file
 * @param {Function} props.onDelete - Callback for deleting file
 * @param {Function} props.onDownload - Callback for downloading file
 * @returns {JSX.Element}
 */
const ProjectFilesCard = ({ 
  files = [], 
  projectId,
  canManage = false,
  onUpload,
  onDelete,
  onDownload,
  hideHeader = false
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  /**
   * Format file size to human-readable units
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    
    return `${size.toFixed(2)} ${units[i]}`;
  };

  /**
   * Format date to DD/MM/YYYY
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Get file icon based on file type
   * @param {string} fileType - File type/extension
   * @returns {JSX.Element} SVG icon
   */
  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    
    // Document types
    if (['pdf'].includes(type)) {
      return (
        <svg style={{ width: '24px', height: '24px', color: 'var(--danger-500)' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type)) {
      return (
        <svg style={{ width: '24px', height: '24px', color: 'var(--info-500)' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Spreadsheet types
    if (['xls', 'xlsx', 'csv'].includes(type)) {
      return (
        <svg style={{ width: '24px', height: '24px', color: 'var(--success-500)' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Archive types
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
      return (
        <svg style={{ width: '24px', height: '24px', color: 'var(--warning-500)' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Default file icon
    return (
      <svg style={{ width: '24px', height: '24px', color: 'var(--gray-500)' }} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  /**
   * Handle file download
   * @param {Object} file - File object
   */
  const handleDownload = (file) => {
    if (onDownload) {
      onDownload(file);
    }
  };

  /**
   * Confirm file deletion
   * @param {Object} file - File object
   */
  const confirmDelete = (file) => {
    setSelectedFile(file);
    setShowDeleteDialog(true);
  };

  /**
   * Handle file deletion
   */
  const handleDelete = async () => {
    if (onDelete && selectedFile) {
      await onDelete(selectedFile);
      setShowDeleteDialog(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className={`card project-detail-card ${hideHeader ? 'no-card-style' : ''}`}>
      {!hideHeader && (
        <div className="card-header project-detail-card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Archivos del Proyecto</h3>
          {canManage && onUpload && (
            <ActionButton
              variant="primary"
              size="sm"
              onClick={onUpload}
              title="Subir archivo"
            >
              <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="ms-1">Subir Archivo</span>
            </ActionButton>
          )}
        </div>
      )}
      <div className={`card-body project-detail-card-body ${hideHeader ? 'p-0' : ''}`}>
        {/* Upload button when header is hidden */}
        {hideHeader && canManage && onUpload && (
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-sm"
              onClick={onUpload}
              title="Subir archivo"
              style={{ 
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Subir Archivo</span>
            </button>
          </div>
        )}
        
        {files.length === 0 ? (
          <div className="text-center py-4">
            <svg 
              className="mx-auto mb-3" 
              style={{ width: '48px', height: '48px', color: 'var(--gray-400)' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-muted mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
              No hay archivos adjuntos en este proyecto
            </p>
            {canManage && onUpload && (
              <button
                onClick={onUpload}
                className="btn btn-sm mt-3"
                style={{ 
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #e0e0e0',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Subir primer archivo
              </button>
            )}
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="list-group-item px-0 py-3"
                style={{ border: 'none', borderBottom: '1px solid var(--border-color-light)' }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start flex-grow-1">
                    {/* File Icon */}
                    <div className="flex-shrink-0 me-3">
                      {getFileIcon(file.tipo)}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-grow-1">
                      <div 
                        className="mb-1" 
                        style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          fontWeight: '500', 
                          color: 'var(--text-primary)',
                          cursor: onDownload ? 'pointer' : 'default'
                        }}
                        onClick={() => handleDownload(file)}
                        role={onDownload ? 'button' : undefined}
                        tabIndex={onDownload ? 0 : undefined}
                      >
                        {file.nombre_original || file.nombre_archivo}
                      </div>
                      
                      <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        <div className="d-flex align-items-center">
                          <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{file.tipo?.toUpperCase() || 'FILE'}</span>
                        </div>
                        
                        <div className="d-flex align-items-center">
                          <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          <span>{formatFileSize(file.tamaño_bytes)}</span>
                        </div>
                        
                        {file.uploader_name && (
                          <div className="d-flex align-items-center">
                            <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{file.uploader_name}</span>
                          </div>
                        )}
                        
                        <div className="d-flex align-items-center">
                          <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-1 ms-2">
                    {onDownload && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDownload(file)}
                        title="Descargar archivo"
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #e0e0e0',
                          color: '#0dcaf0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e7f6fd';
                          e.currentTarget.style.borderColor = '#0dcaf0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    
                    {canManage && onDelete && (
                      <button
                        className="btn btn-sm"
                        onClick={() => confirmDelete(file)}
                        title="Eliminar archivo"
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #e0e0e0',
                          color: '#dc3545',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Archivo"
        message={`¿Estás seguro de que deseas eliminar el archivo "${selectedFile?.nombre_original}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ProjectFilesCard;
