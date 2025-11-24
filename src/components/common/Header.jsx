import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';

/**
 * Componente Header - Diseño exacto de la imagen
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la barra superior
 * - Open/Closed: Extensible para nuevas funcionalidades
 * - Dependency Inversion: Depende de useAuth hook
 */
const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={styles.header} data-testid="header">
      <div style={styles.container}>
        {/* Título sin logo */}
        <div style={styles.leftSection}>
          <div>
            <h1 style={styles.title}>Sistema de Gestión</h1>
            <p style={styles.subtitle}>Proyectos y Tareas</p>
          </div>
        </div>

        {/* Usuario y logout */}
        <div style={styles.rightSection} data-testid="user-menu">
          {user && (
            <>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  <span style={styles.avatarText}>
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>Administrador del Sistema</span>
                  <span style={styles.userRole}>Administrador</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                data-testid="logout-button"
                style={styles.logoutButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EF4444';
                }}
              >
                <LogOut size={16} strokeWidth={2} />
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Estilos - Diseño exacto de la imagen
const styles = {
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  container: {
    width: '100%',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    color: '#FFFFFF'
  },
  avatarText: {
    userSelect: 'none'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  userRole: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
};

export default Header;