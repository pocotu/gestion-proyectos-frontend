import React from 'react';

/**
 * Componente LoadingSpinner con Bootstrap
 * Principio de Responsabilidad Única: Solo se encarga de mostrar un indicador de carga
 * Principio Abierto/Cerrado: Extensible mediante props sin modificar el código base
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Cargando...',
  fullScreen = false 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-border-sm';
      case 'large':
        return '';
      default:
        return '';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'white':
        return 'text-white';
      case 'secondary':
        return 'text-secondary';
      case 'success':
        return 'text-success';
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-primary';
    }
  };

  const spinnerContent = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div 
        className={`spinner-border ${getSizeClass()} ${getColorClass()}`}
        role="status"
        aria-label="Cargando"
        style={{ 
          width: size === 'large' ? '3rem' : size === 'small' ? '1rem' : '2rem',
          height: size === 'large' ? '3rem' : size === 'small' ? '1rem' : '2rem'
        }}
      >
        <span className="visually-hidden">Cargando...</span>
      </div>
      {text && (
        <p className={`mt-2 mb-0 ${getColorClass()}`} style={{ fontSize: '0.9rem' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
        style={{ zIndex: 9999 }}
      >
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;