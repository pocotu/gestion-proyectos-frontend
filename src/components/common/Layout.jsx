import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Layout principal de la aplicación
 * Implementa el patrón Composite para estructurar la UI
 * Principio de Responsabilidad Única: Solo se encarga del layout general
 */
const Layout = () => {
  return (
    <div>
      {/* Header fijo en la parte superior */}
      <Header />
      
      <div>
        {/* Sidebar de navegación */}
        <Sidebar />
        
        {/* Contenido principal */}
        <main>
          <div>
            {/* Outlet para renderizar las páginas */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;