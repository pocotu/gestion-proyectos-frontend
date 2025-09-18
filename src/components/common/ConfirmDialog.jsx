import React from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';

/**
 * ConfirmDialog - Componente de diálogo de confirmación
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja confirmaciones
 * - Open/Closed: Abierto para extensión (diferentes variantes)
 * - Liskov Substitution: Puede ser sustituido por otros diálogos
 * - Interface Segregation: Props específicas para configuración
 * - Dependency Inversion: Depende de abstracciones (Modal, ActionButton)
 */

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary', // 'primary', 'danger', 'warning'
  loading = false,
  icon = null
}) => {
  /**
   * Obtener icono por defecto según la variante
   */
  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  /**
   * Obtener color de fondo del icono
   */
  const getIconBackgroundColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-blue-100';
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
    >
      <div className="sm:flex sm:items-start">
        {/* Icono */}
        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${getIconBackgroundColor()} sm:mx-0 sm:h-10 sm:w-10`}>
          {icon || getDefaultIcon()}
        </div>
        
        {/* Contenido */}
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      {/* Botones */}
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
        <ActionButton
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </ActionButton>
        
        <ActionButton
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {cancelText}
        </ActionButton>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;