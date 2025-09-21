import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente Sidebar - Navegación lateral profesional
 * Diseño corporativo sin iconos decorativos - ESTÁTICO
 */
const Sidebar = () => {
  const { user } = useAuth();

  // Configuración de elementos de navegación organizados por secciones
  const navigationSections = [
    {
      title: 'Principal',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Panel principal'
        }
      ]
    },
    {
      title: 'Gestión',
      items: [
        {
          name: 'Proyectos',
          path: '/projects',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Gestionar proyectos'
        },
        {
          name: 'Tareas',
          path: '/tasks',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Administrar tareas'
        },
        {
          name: 'Archivos',
          path: '/files',
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
          roles: ['admin'],
          description: 'Gestionar usuarios'
        },
        {
          name: 'Roles',
          path: '/roles',
          roles: ['admin'],
          description: 'Configurar roles'
        },
        {
          name: 'Auditoría',
          path: '/audit',
          roles: ['admin'],
          description: 'Logs del sistema'
        },
        {
          name: 'Actividad',
          path: '/activity-logs',
          roles: ['admin'],
          description: 'Registro de actividades'
        }
      ]
    },
    {
      title: 'Reportes',
      items: [
        {
          name: 'Estadísticas',
          path: '/reports/stats',
          roles: ['admin', 'responsable_proyecto'],
          description: 'Métricas del sistema'
        },
        {
          name: 'Actividad',
          path: '/reports/activity',
          roles: ['admin'],
          description: 'Reportes de actividad'
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

  const filteredSections = getFilteredSections();

  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoText}>Sistema de Gestión</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.navigation}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title} style={styles.section}>
            <h3 style={styles.sectionTitle}>
              {section.title}
            </h3>
            <ul style={styles.list}>
              {section.items.map((item) => (
                <li key={item.path} style={styles.listItem}>
                  <NavLink
                    to={item.path}
                    style={({ isActive }) => ({
                      ...styles.link,
                      ...(isActive ? styles.linkActive : {})
                    })}
                  >
                    <span style={styles.linkText}>
                      {item.name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <span style={styles.userName}>
              {user?.nombre || 'Usuario'}
            </span>
            <span style={styles.userRole}>
              {user?.es_administrador ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Estilos simplificados - sidebar estático
const styles = {
  sidebar: {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '100vh',
    width: '280px',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    zIndex: '1000',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #334155',
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
  },

  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    minHeight: '80px'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'inherit'
  },

  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },

  navigation: {
    flex: '1',
    padding: '1rem 0',
    overflowY: 'auto'
  },

  section: {
    marginBottom: '1.5rem'
  },

  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
    margin: '0 0 0.75rem 1.5rem',
    padding: '0'
  },

  list: {
    listStyle: 'none',
    margin: '0',
    padding: '0'
  },

  listItem: {
    margin: '0.25rem 0.75rem'
  },

  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#cbd5e1',
    transition: 'all 0.2s ease',
    position: 'relative',
    fontSize: '0.875rem',
    fontWeight: '500'
  },

  linkActive: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    fontWeight: '600'
  },

  linkText: {
    marginLeft: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  footer: {
    padding: '1.5rem',
    borderTop: '1px solid #334155',
    marginTop: 'auto'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#334155',
    borderRadius: '6px',
    fontSize: '0.875rem'
  },

  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },

  userName: {
    fontWeight: '600',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  userRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default Sidebar;