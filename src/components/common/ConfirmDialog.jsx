import React from 'react';
import Modal from './Modal';

/**
 * ConfirmDialog - Componente de diálogo de confirmación con Bootstrap
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja confirmaciones
 * - Open/Closed: Abierto para extensión (diferentes variantes)
 * - Liskov Substitution: Puede ser sustituido por otros diálogos
 * - Interface Segregation: Props específicas para configuración
 * - Dependency Inversion: Depende de abstracciones (Modal)
 */

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'primary', // 'primary', 'danger', 'warning'
  loading = false,
  icon = null
}) => {
  /**
   * Obtener icono por defecto según el tipo
   */
  const getDefaultIcon = () => {
    const iconStyle = { width: '24px', height: '24px' };
    
    switch (type) {
      case 'danger':
        return (
          <svg style={iconStyle} className="text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg style={iconStyle} className="text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg style={iconStyle} className="text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  /**
   * Obtener clase de fondo del icono
   */
  const getIconBackgroundClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-danger-subtle';
      case 'warning':
        return 'bg-warning-subtle';
      default:
        return 'bg-primary-subtle';
    }
  };

  /**
   * Obtener clase del botón de confirmación
   */
  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      default:
        return 'btn-primary';
    }
  };

  /**
   * Manejar confirmación
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error en confirmación:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      showCloseButton={false}
    >
      <div className="d-flex align-items-start">
        {/* Icono */}
        <div className={`d-flex align-items-center justify-content-center rounded-circle me-3 ${getIconBackgroundClass()}`} 
             style={{ width: '48px', height: '48px', flexShrink: 0 }}>
          {icon || getDefaultIcon()}
        </div>
        
        {/* Contenido */}
        <div className="flex-grow-1">
          <h5 className="fw-semibold text-dark mb-2">
            {title}
          </h5>
          
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            {message}
          </p>
        </div>
      </div>
      
      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          className={`btn ${getConfirmButtonClass()}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          )}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;