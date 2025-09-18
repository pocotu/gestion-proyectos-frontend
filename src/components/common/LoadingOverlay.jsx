import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente LoadingOverlay
 * Principio de Responsabilidad Única: Solo maneja la visualización de overlays de carga
 * Principio Abierto/Cerrado: Extensible mediante props sin modificar el código base
 */
const LoadingOverlay = ({
  loading = false,
  children,
  text = 'Cargando...',
  spinnerSize = 'large',
  spinnerColor = 'primary',
  overlay = true,
  blur = false,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) => {
  // Si no está cargando, solo mostrar el contenido
  if (!loading) {
    return <div className={className}>{children}</div>;
  }

  // Clases para el overlay
  const overlayClasses = `
    absolute inset-0 flex items-center justify-center z-10
    ${overlay ? 'bg-white bg-opacity-75' : ''}
    ${overlayClassName}
  `.trim().replace(/\s+/g, ' ');

  // Clases para el contenido
  const contentClasses = `
    ${blur && loading ? 'filter blur-sm' : ''}
    ${loading ? 'pointer-events-none' : ''}
    ${contentClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`relative ${className}`}>
      {/* Contenido principal */}
      <div className={contentClasses}>
        {children}
      </div>

      {/* Overlay de carga */}
      {loading && (
        <div className={overlayClasses}>
          <LoadingSpinner
            size={spinnerSize}
            color={spinnerColor}
            text={text}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Componente de conveniencia para overlays con blur
 */
export const BlurLoadingOverlay = (props) => (
  <LoadingOverlay blur={true} {...props} />
);

/**
 * Componente de conveniencia para overlays sin fondo
 */
export const TransparentLoadingOverlay = (props) => (
  <LoadingOverlay overlay={false} {...props} />
);

/**
 * Componente de conveniencia para overlays de página completa
 */
export const FullPageLoadingOverlay = ({ loading, text, ...props }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner
        size="large"
        color="primary"
        text={text}
        {...props}
      />
    </div>
  );
};

export default LoadingOverlay;