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
    <header>
      <div>
        <div>
          {/* Logo y título */}
          <div>
            <div>
              <span>GP</span>
            </div>
            <h1>Gestión de Proyectos</h1>
          </div>

          {/* Información del usuario y acciones */}
          <div>
            {user && (
              <>
                <div>
                  Bienvenido, <span>{user.nombre}</span>
                </div>
                <button onClick={handleLogout} data-testid="logout-button">
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