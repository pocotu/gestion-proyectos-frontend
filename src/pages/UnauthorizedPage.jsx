import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Página de No Autorizado
 * Principio de Responsabilidad Única: Solo maneja la visualización de errores de autorización
 * Principio Abierto/Cerrado: Extensible para diferentes tipos de errores de autorización
 */
const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Obtener información del estado de navegación
  const { reason, requiredRoles, from } = location.state || {};

  // Función para volver atrás
  const goBack = () => {
    if (from) {
      navigate(from.pathname, { replace: true });
    } else {
      navigate(-1);
    }
  };

  // Función para ir al dashboard
  const goToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  // Renderizar mensaje según el tipo de error
  const renderErrorMessage = () => {
    switch (reason) {
      case 'admin_required':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Acceso Restringido
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Esta página requiere permisos de administrador.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">
                <strong>Motivo:</strong> Se requieren permisos de administrador para acceder a este recurso.
              </p>
            </div>
          </div>
        );

      case 'insufficient_roles':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Permisos Insuficientes
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              No tienes los roles necesarios para acceder a esta página.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 mb-2">
                <strong>Roles requeridos:</strong>
              </p>
              <ul className="list-disc list-inside text-red-700">
                {requiredRoles?.map((role, index) => (
                  <li key={index} className="capitalize">
                    {role.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-3">
              <svg 
                className="w-12 h-12 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>

          {/* Mensaje de error */}
          {renderErrorMessage()}

          {/* Información del usuario actual */}
          {user && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Usuario actual:</strong> {user.nombre} ({user.email})
              </p>
              {user.roles && user.roles.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Roles:</strong> {user.roles.map(role => role.nombre).join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={goToDashboard}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
            >
              Ir al Dashboard
            </button>

            <button
              onClick={goBack}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
            >
              Volver Atrás
            </button>

            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out text-center"
            >
              Ir al Inicio
            </Link>
          </div>

          {/* Información de contacto para solicitar permisos */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Si crees que deberías tener acceso a esta página, 
              contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;