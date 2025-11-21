import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';

/**
 * DashboardPage - Página principal del Dashboard con diseño moderno y compacto
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la vista del dashboard
 * - Open/Closed: Extensible mediante componentes modulares
 * - Dependency Inversion: Depende de abstracciones (servicios, contextos)
 */
const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Estados del componente (Single Responsibility)
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0, myProjects: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0, myTasks: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  /**
   * Carga los datos del dashboard desde el servicio
   * Principio de Responsabilidad Única: Solo carga datos
   */
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardData();
      const dashboardData = response.data || response;

      let activities = [];
      if (user?.es_administrador) {
        try {
          const activityResponse = await dashboardService.getRecentActivity(user?.id);
          activities = activityResponse.data || activityResponse || [];
        } catch (actError) {
          if (actError.response?.status !== 403) {
            console.error('Error al cargar actividades:', actError);
          }
        }
      }

      setStats({
        projects: {
          total: dashboardData.projects?.total || 0,
          active: dashboardData.projects?.activos || dashboardData.projects?.active || 0,
          completed: dashboardData.projects?.completados || dashboardData.projects?.completed || 0,
          myProjects: dashboardData.projects?.mis_proyectos || dashboardData.projects?.myProjects || 0
        },
        tasks: {
          total: dashboardData.tasks?.total || 0,
          pending: dashboardData.tasks?.pendientes || dashboardData.tasks?.pending || 0,
          inProgress: dashboardData.tasks?.en_progreso || dashboardData.tasks?.inProgress || 0,
          completed: dashboardData.tasks?.completadas || dashboardData.tasks?.completed || 0,
          myTasks: dashboardData.tasks?.mis_tareas || dashboardData.tasks?.myTasks || 0
        }
      });

      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresca los datos del dashboard
   * Principio de Responsabilidad Única: Solo refresca datos
   */
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setError('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-shield-lock display-1 text-warning mb-3"></i>
                <h5 className="card-title">Acceso Requerido</h5>
                <p className="card-text text-muted">
                  Debes iniciar sesión para acceder al dashboard
                </p>
                <Link to="/login" className="btn btn-primary">
                  Ir a Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="dashboard-page">
      {/* Header Compacto */}
      <div style={styles.header} data-testid="dashboard-header">
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <div style={styles.subtitle}>
              <span>Bienvenido, {user?.nombre || 'Usuario'}</span>
              {user?.es_administrador && (
                <span style={styles.badge}>Admin</span>
              )}
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            style={{
              ...styles.refreshButton,
              opacity: isRefreshing ? 0.6 : 1,
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <i className={`bi bi-arrow-clockwise ${isRefreshing ? 'spin' : ''}`} style={{ marginRight: '6px' }}></i>
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorAlert}>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '8px' }}></i>
          {error}
        </div>
      )}

      {/* Grid de Estadísticas Compactas */}
      <div style={styles.statsGrid} data-testid="dashboard-stats">
        <StatCard
          icon="bi-folder"
          label="Total Proyectos"
          value={stats.projects.total}
          subtitle={`${stats.projects.completed} completados`}
          color="#3b82f6"
        />
        <StatCard
          icon="bi-play-circle"
          label="Proyectos Activos"
          value={stats.projects.active}
          subtitle={`${stats.projects.myProjects} míos`}
          color="#10b981"
        />
        <StatCard
          icon="bi-clipboard-check"
          label="Total Tareas"
          value={stats.tasks.total}
          subtitle={`${stats.tasks.pending} pendientes`}
          color="#f59e0b"
        />
        <StatCard
          icon="bi-hourglass-split"
          label="En Progreso"
          value={stats.tasks.inProgress}
          subtitle={`${stats.tasks.myTasks} asignadas`}
          color="#6b7280"
        />
      </div>

      {/* Grid Principal Responsivo */}
      <div style={styles.mainGrid} data-testid="dashboard-grid">
        {/* Resumen de Proyectos */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-folder" style={{ ...styles.cardIcon, color: '#3b82f6' }}></i>
            <h6 style={styles.cardTitle}>Resumen de Proyectos</h6>
          </div>
          <div style={styles.summaryGrid}>
            <SummaryItem label="Total" value={stats.projects.total} color="#3b82f6" />
            <SummaryItem label="Activos" value={stats.projects.active} color="#10b981" />
            <SummaryItem label="Completados" value={stats.projects.completed} color="#6b7280" />
          </div>
          <Link to="/projects" style={styles.cardButton}>
            Ver todos los proyectos
          </Link>
        </div>

        {/* Resumen de Tareas */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-clipboard-check" style={{ ...styles.cardIcon, color: '#f59e0b' }}></i>
            <h6 style={styles.cardTitle}>Resumen de Tareas</h6>
          </div>
          <div style={styles.summaryGrid}>
            <SummaryItem label="Total" value={stats.tasks.total} color="#f59e0b" />
            <SummaryItem label="Pendientes" value={stats.tasks.pending} color="#ef4444" />
            <SummaryItem label="En Progreso" value={stats.tasks.inProgress} color="#3b82f6" />
            <SummaryItem label="Completadas" value={stats.tasks.completed} color="#10b981" />
          </div>
          <Link to="/tasks" style={styles.cardButton}>
            Ver todas las tareas
          </Link>
        </div>

        {/* Acciones Rápidas */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-lightning" style={{ ...styles.cardIcon, color: '#6b7280' }}></i>
            <h6 style={styles.cardTitle}>Acciones Rápidas</h6>
          </div>
          <div style={styles.actionsGrid}>
            <ActionButton to="/projects" icon="bi-plus-lg" label="Crear Proyecto" primary />
            <ActionButton to="/tasks" icon="bi-plus-lg" label="Crear Tarea" />
            <ActionButton to="/files" icon="bi-file-earmark" label="Archivos" />
            {user?.es_administrador && (
              <>
                <ActionButton to="/users" icon="bi-people" label="Usuarios" />
                <ActionButton to="/roles" icon="bi-shield" label="Roles" />
                <ActionButton to="/activity-logs" icon="bi-activity" label="Logs" />
              </>
            )}
          </div>
        </div>

        {/* Actividades Recientes */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div style={styles.cardHeader}>
            <i className="bi bi-clock-history" style={{ ...styles.cardIcon, color: '#6b7280' }}></i>
            <h6 style={styles.cardTitle}>Actividades Recientes</h6>
          </div>
          {recentActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <i className="bi bi-inbox" style={styles.emptyIcon}></i>
              <p style={styles.emptyText}>No hay actividades recientes</p>
            </div>
          ) : (
            <div style={styles.activitiesList}>
              {recentActivities.map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
            </div>
          )}
        </div>

        {/* Mis Tareas Pendientes */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-person-check" style={{ ...styles.cardIcon, color: '#6b7280' }}></i>
            <h6 style={styles.cardTitle}>Mis Tareas Pendientes</h6>
          </div>
          <div style={styles.myTasksContent}>
            <div style={styles.myTasksIcon}>
              <i className="bi bi-clipboard-check" style={{ fontSize: '1.5rem', color: '#3b82f6' }}></i>
            </div>
            <h3 style={styles.myTasksNumber}>{stats.tasks.myTasks}</h3>
            <p style={styles.myTasksLabel}>Tareas asignadas a ti</p>
            <div style={styles.myTasksStats}>
              <div>
                <h5 style={{ ...styles.myTasksStatNumber, color: '#ef4444' }}>{stats.tasks.pending}</h5>
                <small style={styles.myTasksStatLabel}>Pendientes</small>
              </div>
              <div style={styles.myTasksDivider}></div>
              <div>
                <h5 style={{ ...styles.myTasksStatNumber, color: '#3b82f6' }}>{stats.tasks.inProgress}</h5>
                <small style={styles.myTasksStatLabel}>En Progreso</small>
              </div>
            </div>
            <Link to="/tasks" style={styles.cardButton}>
              Ver mis tareas
            </Link>
          </div>
        </div>
      </div>

      {/* CSS para animaciones */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        a {
          text-decoration: none;
        }
        
        a:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

/**
 * StatCard - Componente reutilizable para tarjetas de estadísticas
 * Principio de Responsabilidad Única: Solo muestra una estadística
 */
const StatCard = ({ icon, label, value, subtitle, color }) => (
  <div style={styles.statCard}>
    <div style={styles.statCardContent}>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <h3 style={styles.statValue}>{value}</h3>
        <small style={styles.statSubtitle}>{subtitle}</small>
      </div>
      <div style={{ ...styles.statIconContainer, backgroundColor: `${color}15` }}>
        <i className={icon} style={{ fontSize: '1.25rem', color }}></i>
      </div>
    </div>
  </div>
);

/**
 * SummaryItem - Componente para items de resumen
 * Principio de Responsabilidad Única: Solo muestra un item de resumen
 */
const SummaryItem = ({ label, value, color }) => (
  <div style={styles.summaryItem}>
    <h5 style={{ ...styles.summaryValue, color }}>{value}</h5>
    <small style={styles.summaryLabel}>{label}</small>
  </div>
);

/**
 * ActionButton - Componente para botones de acción
 * Principio de Responsabilidad Única: Solo muestra un botón de acción
 */
const ActionButton = ({ to, icon, label, primary }) => (
  <Link
    to={to}
    style={primary ? styles.actionButtonPrimary : styles.actionButton}
  >
    <i className={icon} style={{ marginRight: '6px', fontSize: '0.875rem' }}></i>
    {label}
  </Link>
);

/**
 * ActivityItem - Componente para items de actividad
 * Principio de Responsabilidad Única: Solo muestra un item de actividad
 */
const ActivityItem = ({ activity }) => (
  <div style={styles.activityItem}>
    <div style={styles.activityIcon}>
      <i className="bi bi-activity" style={{ fontSize: '0.875rem', color: '#3b82f6' }}></i>
    </div>
    <div style={styles.activityContent}>
      <p style={styles.activityText}>
        {activity.elemento || activity.descripcion}
      </p>
      <small style={styles.activityMeta}>
        {activity.usuario || activity.usuario_nombre} • {new Date(activity.fecha || activity.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </small>
    </div>
  </div>
);

// Estilos modernos y compactos (DRY - Don't Repeat Yourself)
const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '1rem'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  badge: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: '600'
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s'
  },
  statCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 0.25rem 0'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.25rem 0'
  },
  statSubtitle: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  },
  statIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '0.75rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  cardIcon: {
    marginRight: '0.5rem',
    fontSize: '1rem'
  },
  cardTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  summaryGrid: {
    display: 'flex',
    justifyContent: 'space-around',
    textAlign: 'center',
    padding: '0.75rem 0',
    flex: 1
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0'
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  cardButton: {
    padding: '0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.2s',
    marginTop: '0.75rem',
    display: 'block'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.5rem',
    flex: 1
  },
  actionButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonPrimary: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyIcon: {
    fontSize: '2rem',
    color: '#9ca3af',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  activitiesList: {
    maxHeight: '200px',
    overflowY: 'auto',
    flex: 1
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    flexShrink: 0
  },
  activityContent: {
    flex: 1,
    minWidth: 0
  },
  activityText: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 0.25rem 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  activityMeta: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  myTasksContent: {
    textAlign: 'center',
    padding: '0.75rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  myTasksIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    backgroundColor: '#dbeafe',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem'
  },
  myTasksNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#3b82f6',
    margin: '0 0 0.25rem 0'
  },
  myTasksLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 0.75rem 0'
  },
  myTasksStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    padding: '0.75rem 0',
    marginBottom: '0.75rem'
  },
  myTasksStatNumber: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0'
  },
  myTasksStatLabel: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  myTasksDivider: {
    width: '1px',
    backgroundColor: '#e5e7eb'
  }
};

export default DashboardPage;
