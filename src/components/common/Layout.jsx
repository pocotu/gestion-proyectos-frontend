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
          
          {/* Contenido principal */}
          <main style={styles.main}>
            <div style={styles.content}>
              {/* Outlet para renderizar las páginas */}
              <Outlet />
            </div>
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
    marginLeft: '280px', // Ancho del sidebar estático
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  main: {
    flex: 1,
    overflow: 'auto',
    position: 'relative'
  },
  content: {
    padding: '2rem',
    minHeight: '100%',
    backgroundColor: '#ffffff',
    margin: '1rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
};

export default Layout;