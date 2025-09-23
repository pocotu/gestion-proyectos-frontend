import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente Sidebar - Navegación lateral moderna y profesional
 * Diseño corporativo con iconos SVG - ESTÁTICO
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
          description: 'Panel principal',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
          )
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
          description: 'Gestionar proyectos',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          name: 'Tareas',
          path: '/tasks',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Administrar tareas',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C13.3924 3 14.7133 3.35946 15.8777 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          name: 'Archivos',
          path: '/files',
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea'],
          description: 'Gestión de archivos',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
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
          description: 'Gestionar usuarios',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5866 20.2 15.3954" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.13C16.8003 3.32127 17.5037 3.78168 18.0098 4.43515C18.5159 5.08861 18.8004 5.89904 18.8004 6.735C18.8004 7.57096 18.5159 8.38139 18.0098 9.03485C17.5037 9.68832 16.8003 10.1487 16 10.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          name: 'Roles',
          path: '/roles',
          roles: ['admin'],
          description: 'Gestionar roles',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15L8 11L16 11L12 15Z" fill="currentColor" />
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          )
        },
        {
          name: 'Logs',
          path: '/activity-logs',
          roles: ['admin'],
          description: 'Registro de actividades',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Reportes',
      items: [
        {
          name: 'Estadísticas',
          path: '/reports',
          roles: ['admin', 'responsable_proyecto'],
          description: 'Métricas del sistema',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )
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
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={styles.logoText}>Sistema GP</div>
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
                    <div style={styles.linkIcon}>
                      {item.icon}
                    </div>
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


    </aside>
  );
};

// Estilos modernos - sidebar estático
const styles = {
  sidebar: {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '100vh',
    width: '280px',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#f8fafc',
    zIndex: '1000',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #334155',
    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 4px -2px rgba(0, 0, 0, 0.1)'
  },

  header: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    minHeight: '80px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'inherit'
  },

  logoIcon: {
    color: '#60a5fa',
    width: '32px',
    height: '32px'
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
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#475569 transparent'
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
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#cbd5e1',
    transition: 'all 0.2s ease',
    position: 'relative',
    fontSize: '0.875rem',
    fontWeight: '500',
    gap: '0.75rem'
  },

  linkActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    fontWeight: '600',
    borderLeft: '3px solid #60a5fa',
    marginLeft: '-3px',
    padding: '0.75rem 1rem 0.75rem 1.25rem'
  },

  linkIcon: {
    color: 'inherit',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  linkText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },


};

export default Sidebar;