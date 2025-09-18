import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente ProtectedRoute
 * Principio de Responsabilidad Única: Solo se encarga de proteger rutas por autenticación y roles
 * Principio Abierto/Cerrado: Extensible mediante props sin modificar el código base
 * Principio de Inversión de Dependencias: Depende de la abstracción useAuth
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requiredRoles = [],
  requireAdmin = false,
  fallbackPath = '/login',
  unauthorizedPath = '/unauthorized'
}) => {
  const { isAuthenticated, isLoading, user, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="large" 
          text="Verificando permisos..." 
        />
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Si requiere ser admin y no lo es
  if (requireAdmin && !isAdmin()) {
    return (
      <Navigate 
        to={unauthorizedPath} 
        state={{ from: location, reason: 'admin_required' }} 
        replace 
      />
    );
  }

  // Si requiere roles específicos
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to={unauthorizedPath} 
          state={{ 
            from: location, 
            reason: 'insufficient_roles',
            requiredRoles 
          }} 
          replace 
        />
      );
    }
  }

  // Si pasa todas las validaciones, renderizar el componente hijo
  return children;
};

/**
 * Componente de conveniencia para rutas que requieren admin
 */
export const AdminRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute 
      requireAdmin={true} 
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente de conveniencia para rutas públicas (no requieren autenticación)
 */
export const PublicRoute = ({ children, redirectIfAuthenticated = false, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="large" 
          text="Cargando..." 
        />
      </div>
    );
  }

  // Si está autenticado y debe redirigir
  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para rutas que requieren roles específicos
 */
export const RoleBasedRoute = ({ children, roles, ...props }) => {
  return (
    <ProtectedRoute 
      requiredRoles={Array.isArray(roles) ? roles : [roles]} 
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;