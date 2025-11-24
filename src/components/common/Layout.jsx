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
    <div style={styles.container}>
      <div style={styles.body}>
        {/* Sidebar de navegación */}
        <Sidebar />

        {/* Área principal con header y contenido */}
        <div style={styles.mainArea}>
          {/* Header al lado del sidebar */}
          <Header />

          {/* Contenido principal - sin contenedor blanco */}
          <main style={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f8fafc'
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '205px', // Ancho del sidebar actualizado
    backgroundColor: '#F9FAFB', // Fondo gris claro
    minHeight: '100vh'
  },
  main: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
    padding: '24px' // Padding directo al contenido
  }
};

export default Layout;