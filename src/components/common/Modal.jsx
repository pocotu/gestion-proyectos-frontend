import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal - Componente modal reutilizable con Bootstrap
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la lógica de modal
 * - Open/Closed: Abierto para extensión (diferentes tamaños, estilos)
 * - Liskov Substitution: Puede ser sustituido por otros modales
 * - Interface Segregation: Props específicas para configuración
 * - Dependency Inversion: No depende de implementaciones específicas
 */

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Obtener clases de tamaño del modal
   */
  const getSizeClass = () => {
    const sizes = {
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl'
    };
    return sizes[size] || '';
  };

  /**
   * Manejar click en overlay
   */
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      onClick={handleOverlayClick}
    >
      <div className={`modal-dialog modal-dialog-centered ${getSizeClass()}`}>
        <div className={`modal-content border-0 shadow ${className}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="modal-header border-bottom">
              {title && (
                <h5 className="modal-title fw-semibold text-dark">
                  {title}
                </h5>
              )}
              
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Cerrar"
                />
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar en portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default Modal;