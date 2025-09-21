import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MobileMenu.css';

/**
 * MobileMenu - Componente de menú móvil para navegación en dispositivos pequeños
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la navegación móvil
 * - Open/Closed: Abierto para extensión (nuevos elementos de menú)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de navegación
 * - Interface Segregation: Usa interfaces específicas (useAuth, useLocation)
 * - Dependency Inversion: Depende de abstracciones (hooks)
 */
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Proyectos', icon: '📁' },
    { path: '/tasks', label: 'Tareas', icon: '✅' },
    ...(user?.es_administrador ? [
      { path: '/users', label: 'Usuarios', icon: '👥' },
      { path: '/reports', label: 'Reportes', icon: '📈' }
    ] : []),
    { path: '/profile', label: 'Perfil', icon: '👤' }
  ];

  return (
    <>
      {/* Botón del menú hamburguesa */}
      <button 
        className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Abrir menú de navegación"
        data-testid="mobile-menu-toggle"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMenu}
          data-testid="mobile-menu-overlay"
        />
      )}

      {/* Menú lateral */}
      <nav className={`mobile-menu ${isOpen ? 'open' : ''}`} data-testid="mobile-menu">
        <div className="mobile-menu__header">
          <div className="mobile-menu__user">
            <div className="user-avatar">
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nombre || 'Usuario'}</span>
              <span className="user-role">
                {user?.es_administrador ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          <button 
            className="mobile-menu__close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu__content">
          <ul className="mobile-menu__list">
            {menuItems.map((item) => (
              <li key={item.path} className="mobile-menu__item">
                <Link
                  to={item.path}
                  className={`mobile-menu__link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-menu__footer">
            <button 
              className="mobile-menu__logout"
              onClick={handleLogout}
            >
              <span className="menu-icon">🚪</span>
              <span className="menu-label">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileMenu;