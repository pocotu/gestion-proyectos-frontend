import React from 'react';

/**
 * Componente StatusBadge - Badge reutilizable para mostrar estados
 * Principio de Responsabilidad Única: Solo maneja la presentación de estados
 * Principio Abierto/Cerrado: Extensible para diferentes tipos de estados
 */
const StatusBadge = ({
  status,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-primary-100 text-primary-800'
  };

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  // Mapeo automático de estados comunes
  const statusVariantMap = {
    'activo': 'success',
    'inactivo': 'danger',
    'pendiente': 'warning',
    'completado': 'success',
    'en_progreso': 'info',
    'cancelado': 'danger',
    'pausado': 'warning',
    'nuevo': 'primary'
  };

  const finalVariant = statusVariantMap[status?.toLowerCase()] || variant;

  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[finalVariant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses} {...props}>
      {status}
    </span>
  );
};

export default StatusBadge;