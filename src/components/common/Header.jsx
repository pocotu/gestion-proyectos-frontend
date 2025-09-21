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
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Logo y título */}
          <div style={styles.logoSection}>
            <div style={styles.logo}>
              <span style={styles.logoText}>GP</span>
            </div>
            <h1 style={styles.title}>Gestión de Proyectos</h1>
          </div>

          {/* Información del usuario y acciones */}
          <div style={styles.userSection}>
            {user && (
              <>
                <div style={styles.welcomeText}>
                  Bienvenido, <span style={styles.userName}>{user.nombre}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  data-testid="logout-button"
                  style={styles.logoutButton}
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

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  container: {
    width: '100%',
    padding: '0 20px'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  welcomeText: {
    color: '#64748b',
    fontSize: '14px'
  },
  userName: {
    fontWeight: '600',
    color: '#1e293b'
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default Header;