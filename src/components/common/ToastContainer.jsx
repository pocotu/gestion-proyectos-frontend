import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Toast from './Toast';

/**
 * Componente ToastContainer
 * Principio de Responsabilidad Única: Solo se encarga de renderizar y posicionar los toasts
 * Principio de Inversión de Dependencias: Depende de la abstracción useNotifications
 */
const ToastContainer = ({ position = 'top-right' }) => {
  const { notifications, removeNotification } = useNotifications();

  // Estilos de posicionamiento
  const getPositionStyles = (position) => {
    const baseStyles = "fixed z-50 pointer-events-none";
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
      default:
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  // No renderizar si no hay notificaciones
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionStyles(position)}>
      <div className="flex flex-col space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            position={position}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;