import React, { useEffect, useState } from 'react';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

/**
 * Componente Toast con estilos inline para evitar dependencias de CSS
 * Principio de Responsabilidad Única: Solo se encarga de mostrar una notificación individual
 * Principio Abierto/Cerrado: Extensible mediante props sin modificar el código base
 */
const Toast = ({ 
  notification, 
  onRemove,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Manejar la remoción con animación
  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Duración de la animación de salida
  };

  // Auto-remover si tiene duración
  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(handleRemove, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  // Estilos según el tipo de notificación
  const getTypeStyles = (type) => {
    const baseStyles = {
      borderLeft: '4px solid',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    };
    
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          ...baseStyles,
          backgroundColor: '#f0fdf4',
          borderLeftColor: '#4ade80',
          color: '#166534'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          ...baseStyles,
          backgroundColor: '#fef2f2',
          borderLeftColor: '#f87171',
          color: '#991b1b'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          ...baseStyles,
          backgroundColor: '#fffbeb',
          borderLeftColor: '#fbbf24',
          color: '#92400e'
        };
      case NOTIFICATION_TYPES.INFO:
      default:
        return {
          ...baseStyles,
          backgroundColor: '#eff6ff',
          borderLeftColor: '#60a5fa',
          color: '#1e40af'
        };
    }
  };

  // Iconos según el tipo con tamaño fijo
  const getIcon = (type) => {
    const iconStyle = {
      width: '20px',
      height: '20px',
      flexShrink: 0
    };

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <svg style={{...iconStyle, color: '#4ade80'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.ERROR:
        return (
          <svg style={{...iconStyle, color: '#f87171'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <svg style={{...iconStyle, color: '#fbbf24'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case NOTIFICATION_TYPES.INFO:
      default:
        return (
          <svg style={{...iconStyle, color: '#60a5fa'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Estilos del contenedor principal
  const containerStyle = {
    maxWidth: '384px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    pointerEvents: 'auto',
    transition: 'all 0.3s ease-in-out',
    marginBottom: '16px',
    transform: isRemoving 
      ? 'translateX(100%)' 
      : isVisible 
        ? 'translateX(0)' 
        : 'translateX(100%)',
    opacity: isRemoving ? 0 : isVisible ? 1 : 0,
    ...getTypeStyles(notification.type)
  };

  const contentStyle = {
    padding: '16px'
  };

  const flexContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  };

  const textContainerStyle = {
    flex: 1,
    minWidth: 0
  };

  const titleStyle = {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0'
  };

  const messageStyle = {
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.4'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease-in-out'
  };

  const closeIconStyle = {
    width: '20px',
    height: '20px'
  };

  return (
    <div
      style={containerStyle}
      role="alert"
      aria-live="polite"
    >
      <div style={contentStyle}>
        <div style={flexContainerStyle}>
          <div>
            {getIcon(notification.type)}
          </div>
          
          <div style={textContainerStyle}>
            {notification.title && (
              <p style={titleStyle}>
                {notification.title}
              </p>
            )}
            <p style={messageStyle}>
              {notification.message}
            </p>
          </div>
          
          <div>
            <button
              style={closeButtonStyle}
              onClick={handleRemove}
              aria-label="Cerrar notificación"
              onMouseEnter={(e) => e.target.style.color = '#6b7280'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              <svg style={closeIconStyle} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;