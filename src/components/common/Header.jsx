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
        {/* Título sin icono */}
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
                <LogOut size={15} strokeWidth={2.5} />
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
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  container: {
    width: '100%',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.01em'
  },
  subtitle: {
    fontSize: '12.5px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500',
    marginTop: '1px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    color: '#FFFFFF',
    flexShrink: 0
  },
  avatarText: {
    userSelect: 'none'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  userName: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#111827',
    lineHeight: 1.3
  },
  userRole: {
    fontSize: '11.5px',
    color: '#6B7280',
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    padding: '9px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};

export default Header;