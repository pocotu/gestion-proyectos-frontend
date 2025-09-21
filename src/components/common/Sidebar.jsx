import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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
        },
        {
          name: 'Logs de Actividad',
          path: '/activity-logs',
          icon: '📝',
          roles: ['admin'],
          description: 'Registro de actividades del sistema'
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
    if (!user) return [];

    return navigationSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          // Si el usuario es administrador, puede ver elementos marcados como 'admin'
          if (user.es_administrador && item.roles.includes('admin')) {
            return true;
          }
          
          // Verificar si el usuario tiene alguno de los roles requeridos
          if (user.roles && Array.isArray(user.roles)) {
            return user.roles.some(userRole => item.roles.includes(userRole));
          }
          
          return false;
        })
      }))
      .filter(section => section.items.length > 0);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const filteredSections = getFilteredSections();

  return (
    <aside>
      <div>
        <div>
          {!isCollapsed && (
            <>
              <span>🚀</span>
              <span>Gestión Pro</span>
            </>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          <span>
            ◀
          </span>
        </button>
      </div>

      <nav data-testid="sidebar-nav">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h3>{section.title}</h3>
            )}
            <ul>
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    title={isCollapsed ? `${item.name} - ${item.description}` : ''}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{item.icon}</span>
                    {!isCollapsed && (
                      <div>
                        <span>{item.name}</span>
                        <span>{item.description}</span>
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
        <div>
          <div>
            <div>
              {user?.nombre?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div>
              <span>{user?.nombre || 'Usuario'}</span>
              <span>
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