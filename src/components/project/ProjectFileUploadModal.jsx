import React, { useState } from 'react';
import Modal from '../common/Modal';

/**
 * ProjectFileUploadModal - Modal for uploading files to a project
 * Adapted from FilesPage implementation
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onUpload - Callback when files are uploaded
 * @param {number} props.projectId - Project ID
 * @param {boolean} props.uploading - Whether upload is in progress
 * @returns {JSX.Element}
 */
const ProjectFileUploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  projectId,
  uploading = false 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [descripcion, setDescripcion] = useState('');

  /**
   * Format file size to human-readable units
   */
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      return;
    }

    await onUpload(selectedFiles, descripcion);
    
    // Reset form
    setSelectedFiles([]);
    setDescripcion('');
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setDescripcion('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Subir Archivos al Proyecto"
      size="md"
      closeOnOverlayClick={!uploading}
      closeOnEscape={!uploading}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-medium">
            Archivos *
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
            onChange={handleFileChange}
            className="form-control"
            disabled={uploading}
            required
          />
          <div className="form-text">
            Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, ZIP, RAR. Máximo 10MB por archivo.
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="form-control"
            placeholder="Descripción opcional del archivo"
            disabled={uploading}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">Archivos seleccionados:</h6>
            <ul className="list-group list-group-flush">
              {selectedFiles.map((file, index) => (
                <li 
                  key={index} 
                  className="list-group-item d-flex justify-content-between align-items-center px-0 py-2"
                  style={{ borderBottom: '1px solid var(--border-color-light)' }}
                >
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{file.name}</span>
                  <small className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {formatFileSize(file.size)}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-outline-secondary"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Subiendo...
              </>
            ) : (
              'Subir Archivos'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFileUploadModal;
