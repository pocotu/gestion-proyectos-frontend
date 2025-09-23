import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente Header - Barra de navegación superior moderna
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
          {/* Logo y título modernos */}
          <div style={styles.logoSection}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>Sistema de Gestión</h1>
              <span style={styles.subtitle}>Proyectos y Tareas</span>
            </div>
          </div>

          {/* Información del usuario y acciones */}
          <div style={styles.userSection} data-testid="user-menu">
            {user && (
              <>
                <div style={styles.userInfo}>
                  <div style={styles.userAvatar}>
                    <span style={styles.userInitials}>
                      {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div style={styles.userDetails}>
                    <span style={styles.userName}>{user.nombre}</span>
                    <span style={styles.userRole}>
                      {user.es_administrador ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  data-testid="logout-button"
                  style={styles.logoutButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = styles.logoutButtonHover.backgroundColor;
                    e.target.style.transform = styles.logoutButtonHover.transform;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = styles.logoutButton.backgroundColor;
                    e.target.style.transform = 'none';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
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
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(10px)'
  },
  container: {
    width: '100%',
    padding: '0 24px'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  logoIcon: {
    color: 'white',
    width: '24px',
    height: '24px'
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    lineHeight: 1.2,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  userInitials: {
    color: 'white',
    fontWeight: '600',
    fontSize: '16px'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  userName: {
    fontWeight: '600',
    color: 'white',
    fontSize: '14px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  userRole: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  logoutButtonHover: {
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    transform: 'translateY(-1px)'
  }
};

export default Header;