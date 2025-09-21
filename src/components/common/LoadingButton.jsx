import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente LoadingButton
 * Principio de Responsabilidad Única: Solo maneja la visualización de botones con estado de carga
 * Principio Abierto/Cerrado: Extensible mediante props sin modificar el código base
 * Principio de Sustitución de Liskov: Puede reemplazar cualquier botón estándar
 */
const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className = '',
  loadingText = 'Cargando...',
  spinnerSize = 'small',
  spinnerColor = 'white',
  onClick,
  ...props
}) => {
  // Clases base del botón
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

  // Variantes de estilo
  const variantClasses = {
    primary: 'bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  };

  // Tamaños
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  // Combinar clases
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.medium}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Determinar si el botón está deshabilitado
  const isDisabled = disabled || loading;

  // Manejar click
  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      data-testid={props['data-testid'] || `loading-button-${variant}`}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size={spinnerSize}
          color={spinnerColor}
          text=""
        />
      )}
      
      <span className={loading ? 'ml-2' : ''}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

/**
 * Componentes de conveniencia para diferentes variantes
 */
export const PrimaryLoadingButton = (props) => (
  <LoadingButton variant="primary" {...props} />
);

export const SecondaryLoadingButton = (props) => (
  <LoadingButton variant="secondary" {...props} />
);

export const SuccessLoadingButton = (props) => (
  <LoadingButton variant="success" {...props} />
);

export const DangerLoadingButton = (props) => (
  <LoadingButton variant="danger" {...props} />
);

export const OutlineLoadingButton = (props) => (
  <LoadingButton variant="outline" spinnerColor="primary" {...props} />
);

export const GhostLoadingButton = (props) => (
  <LoadingButton variant="ghost" spinnerColor="primary" {...props} />
);

export default LoadingButton;