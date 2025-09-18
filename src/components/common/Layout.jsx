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
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo en la parte superior */}
      <Header />
      
      <div className="flex">
        {/* Sidebar de navegación */}
        <Sidebar />
        
        {/* Contenido principal */}
        <main className="flex-1 p-6 ml-64 mt-16">
          <div className="max-w-7xl mx-auto">
            {/* Outlet para renderizar las páginas */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;