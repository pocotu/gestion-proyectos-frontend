import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

/**
 * Componente Sidebar - Navegación lateral con menú por rol
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la navegación lateral
 * - Open/Closed: Abierto para extensión (nuevos elementos de menú)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de navegación
 * - Interface Segregation: Usa interfaces específicas (useAuth)
 * - Dependency Inversion: Depende de abstracciones (hooks)
 */
const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Configuración de elementos de navegación organizados por secciones
  const navigationSections = [
    {
      title: 'Principal',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: '📊',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Resumen general del sistema'
        }
      ]
    },
    {
      title: 'Gestión',
      items: [
        {
          name: 'Proyectos',
          path: '/projects',
          icon: '📁',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Administrar proyectos'
        },
        {
          name: 'Tareas',
          path: '/tasks',
          icon: '✅',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Gestionar tareas'
        },
        {
          name: 'Archivos',
          path: '/files',
          icon: '📎',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Gestión de archivos'
        }
      ]
    },
    {
      title: 'Administración',
      items: [
        {
          name: 'Usuarios',
          path: '/users',
          icon: '👥',
          roles: ['admin'],
          description: 'Administrar usuarios'
        },
        {
          name: 'Roles',
          path: '/roles',
          icon: '🔐',
          roles: ['admin'],
          description: 'Gestión de roles'
        },
        {
          name: 'Auditoría',
          path: '/audit',
          icon: '📋',
          roles: ['admin'],
          description: 'Logs de auditoría'
        }
      ]
    },
    {
      title: 'Reportes',
      items: [
        {
          name: 'Estadísticas',
          path: '/reports/stats',
          icon: '📈',
          roles: ['admin', 'responsable_proyecto'],
          description: 'Estadísticas del sistema'
        },
        {
          name: 'Actividad',
          path: '/reports/activity',
          icon: '📊',
          roles: ['admin'],
          description: 'Actividad del sistema'
        }
      ]
    }
  ];

  // Filtrar secciones y elementos según el rol del usuario
  const getFilteredSections = () => {
    if (!user?.roles) return [];

    return navigationSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          user.roles.some(userRole => item.roles.includes(userRole))
        )
      }))
      .filter(section => section.items.length > 0);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const filteredSections = getFilteredSections();

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          {!isCollapsed && (
            <>
              <span className="sidebar__logo-icon">🚀</span>
              <span className="sidebar__logo-text">Gestión Pro</span>
            </>
          )}
        </div>
        <button 
          className="sidebar__toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          <span className={`sidebar__toggle-icon ${isCollapsed ? 'sidebar__toggle-icon--collapsed' : ''}`}>
            ◀
          </span>
        </button>
      </div>

      <nav className="sidebar__nav">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title} className="sidebar__section">
            {!isCollapsed && (
              <h3 className="sidebar__section-title">{section.title}</h3>
            )}
            <ul className="sidebar__list">
              {section.items.map((item) => (
                <li key={item.path} className="sidebar__item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                    }
                    title={isCollapsed ? `${item.name} - ${item.description}` : ''}
                  >
                    <span className="sidebar__link-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <div className="sidebar__link-content">
                        <span className="sidebar__link-name">{item.name}</span>
                        <span className="sidebar__link-description">{item.description}</span>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__user-info">
            <div className="sidebar__user-avatar">
              {user?.nombre?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{user?.nombre || 'Usuario'}</span>
              <span className="sidebar__user-role">
                {user?.roles?.join(', ') || 'Sin rol'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;