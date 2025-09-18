import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente Header - Barra de navegación superior
 * Principio de Responsabilidad Única: Solo maneja la barra superior
 * Principio Abierto/Cerrado: Extensible para nuevas funcionalidades
 */
const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GP</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Gestión de Proyectos
            </h1>
          </div>

          {/* Información del usuario y acciones */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-600">
                  Bienvenido, <span className="font-medium">{user.nombre}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;