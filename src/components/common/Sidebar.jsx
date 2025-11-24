import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileArchive,
  Users,
  Shield,
  FileText,
  BarChart3,
  Layers
} from 'lucide-react';

/**
 * Componente Sidebar - Diseño exacto de la imagen
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la navegación lateral
 * - Open/Closed: Extensible mediante configuración de navegación
 * - Dependency Inversion: Depende de abstracciones (useAuth hook)
 */
const Sidebar = () => {
  const { user } = useAuth();

  // Configuración de navegación - Organizada por secciones
  const navigationSections = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
        }
      ]
    },
    {
      title: 'GESTIÓN',
      items: [
        {
          name: 'Proyectos',
          path: '/projects',
          icon: FolderKanban,
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
        },
        {
          name: 'Tareas',
          path: '/tasks',
          icon: CheckSquare,
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
        },
        {
          name: 'Archivos',
          path: '/files',
          icon: FileArchive,
          roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
        }
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        {
          name: 'Usuarios',
          path: '/users',
          icon: Users,
          roles: ['admin']
        },
        {
          name: 'Roles',
          path: '/roles',
          icon: Shield,
          roles: ['admin']
        },
        {
          name: 'Logs',
          path: '/activity-logs',
          icon: FileText,
          roles: ['admin']
        }
      ]
    },
    {
      title: 'REPORTES',
      items: [
        {
          name: 'Estadísticas',
          path: '/reports',
          icon: BarChart3,
          roles: ['admin', 'responsable_proyecto']
        }
      ]
    }
  ];

  // Filtrar elementos de navegación según roles del usuario
  const getFilteredSections = () => {
    if (!user) return [];

    return navigationSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (user.es_administrador && item.roles.includes('admin')) {
            return true;
          }
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
    <aside style={styles.sidebar} data-testid="sidebar">
      {/* Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Layers size={24} />
        </div>
        <span style={styles.logoText}>Sistema GP</span>
      </div>

      {/* Navegación */}
      <nav style={styles.navigation}>
        {filteredSections.map((section) => (
          <div key={section.title} style={styles.section}>
            <h3 style={styles.sectionTitle}>{section.title}</h3>
            <ul style={styles.list}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} style={styles.listItem}>
                    <NavLink
                      to={item.path}
                      style={({ isActive }) => ({
                        ...styles.link,
                        ...(isActive ? styles.linkActive : {})
                      })}
                    >
                      <Icon size={18} strokeWidth={2} />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

// Estilos - Diseño exacto de la imagen
const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '205px',
    height: '100vh',
    background: '#2C3E50', // Color sólido en lugar de gradiente
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '8px'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.02em'
  },
  navigation: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B9CAC',
    padding: '0 20px',
    marginBottom: '8px'
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  listItem: {
    margin: '2px 12px'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#B8C5D0',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  linkActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  }
};

export default Sidebar;