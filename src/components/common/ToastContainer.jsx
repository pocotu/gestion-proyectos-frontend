import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Toast from './Toast';

/**
 * Componente ToastContainer con estilos inline
 * Principio de Responsabilidad Única: Solo se encarga de renderizar y posicionar los toasts
 * Principio de Inversión de Dependencias: Depende de la abstracción useNotifications
 */
const ToastContainer = ({ position = 'top-right' }) => {
  const { notifications, removeNotification } = useNotifications();

  // Estilos de posicionamiento
  const getPositionStyles = (position) => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'none'
    };
    
    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '16px', left: '16px' };
      case 'top-center':
        return { 
          ...baseStyles, 
          top: '16px', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      case 'top-right':
      default:
        return { ...baseStyles, top: '16px', right: '16px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '16px', left: '16px' };
      case 'bottom-center':
        return { 
          ...baseStyles, 
          bottom: '16px', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      case 'bottom-right':
        return { ...baseStyles, bottom: '16px', right: '16px' };
    }
  };

  // No renderizar si no hay notificaciones
  if (notifications.length === 0) {
    return null;
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  return (
    <div style={getPositionStyles(position)}>
      <div style={containerStyle}>
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