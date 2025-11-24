import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';
import {
  FolderOpen,
  TrendingUp,
  FileText,
  Clock,
  RefreshCw,
  Plus,
  Archive,
  Users,
  Shield,
  Activity,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

/**
 * DashboardPage - Diseño exacto de la imagen
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la vista del dashboard
 * - Open/Closed: Extensible mediante componentes modulares
 * - Dependency Inversion: Depende de abstracciones (servicios, contextos)
 */
const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Estados del componente
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0, myProjects: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0, myTasks: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  /**
   * Carga los datos del dashboard
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
   */
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <Shield size={48} color="#F59E0B" />
          <h5 style={styles.emptyTitle}>Acceso Requerido</h5>
          <p style={styles.emptyText}>Debes iniciar sesión para acceder al dashboard</p>
          <Link to="/login" style={styles.linkButton}>Ir a Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="dashboard-page">
      {/* Header del Dashboard */}
      <div style={styles.dashboardHeader}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <div style={styles.welcomeText}>
            <span>Bienvenido, {user?.nombre || 'Administrador del Sistema'}</span>
            {user?.es_administrador && (
              <span style={styles.adminBadge}>Admin</span>
            )}
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          style={{
            ...styles.refreshButton,
            opacity: isRefreshing ? 0.6 : 1
          }}
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? 'spin-animation' : ''}
          />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Cards de estadísticas principales */}
      <div style={styles.statsGrid}>
        <StatCard
          label="TOTAL PROYECTOS"
          value={stats.projects.total}
          subtitle={`${stats.projects.completed} completados`}
          Icon={FolderOpen}
          bgColor="#E3F2FD"
          iconColor="#3B82F6"
        />
        <StatCard
          label="PROYECTOS ACTIVOS"
          value={stats.projects.active}
          subtitle={`${stats.projects.myProjects} míos`}
          Icon={TrendingUp}
          bgColor="#E8F5E9"
          iconColor="#22C55E"
        />
        <StatCard
          label="TOTAL TAREAS"
          value={stats.tasks.total}
          subtitle={`${stats.tasks.pending} pendientes`}
          Icon={FileText}
          bgColor="#FFF9C4"
          iconColor="#F59E0B"
        />
        <StatCard
          label="EN PROGRESO"
          value={stats.tasks.inProgress}
          subtitle={`${stats.tasks.myTasks} asignadas`}
          Icon={Clock}
          bgColor="#F3E5F5"
          iconColor="#9C27B0"
        />
      </div>

      {/* Grid de contenido principal */}
      <div style={styles.contentGrid}>
        {/* Resumen de Proyectos */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resumen de Proyectos</h3>
          <div style={styles.summaryItems}>
            <SummaryNumber
              value={stats.projects.total}
              label="Total"
              color="#3B82F6"
            />
            <SummaryNumber
              value={stats.projects.active}
              label="Activos"
              color="#22C55E"
            />
            <SummaryNumber
              value={stats.projects.completed}
              label="Completados"
              color="#9CA3AF"
            />
          </div>
          <Link to="/projects" style={styles.cardButton}>
            Ver todos los proyectos
          </Link>
        </div>

        {/* Resumen de Tareas */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resumen de Tareas</h3>
          <div style={styles.summaryItems}>
            <SummaryNumber
              value={stats.tasks.total}
              label="Total"
              color="#EF4444"
            />
            <SummaryNumber
              value={stats.tasks.pending}
              label="Pendientes"
              color="#F59E0B"
            />
            <SummaryNumber
              value={stats.tasks.inProgress}
              label="En Progreso"
              color="#3B82F6"
            />
            <SummaryNumber
              value={stats.tasks.completed}
              label="Completadas"
              color="#22C55E"
            />
          </div>
          <Link to="/tasks" style={styles.cardButton}>
            Ver todas las tareas
          </Link>
        </div>

        {/* Acciones Rápidas */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Acciones Rápidas</h3>
          <div style={styles.actionsGrid}>
            <Link to="/projects" style={styles.actionButtonPrimary}>
              <Plus size={16} strokeWidth={2.5} />
              Crear Proyecto
            </Link>
            <Link to="/tasks" style={styles.actionButton}>
              Crear Tarea
            </Link>
            <Link to="/files" style={styles.actionButton}>
              Archivos
            </Link>
            {user?.es_administrador && (
              <>
                <Link to="/users" style={styles.actionButton}>
                  Usuarios
                </Link>
                <Link to="/roles" style={styles.actionButton}>
                  Roles
                </Link>
                <Link to="/activity-logs" style={styles.actionButton}>
                  Logs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mis Tareas Pendientes */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Mis Tareas Pendientes</h3>
          <div style={styles.myTasksContent}>
            <div style={styles.myTasksIcon}>
              <CheckCircle2 size={40} color="#3B82F6" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Actividades Recientes - Ocupa 2 columnas */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <h3 style={styles.cardTitle}>Actividades Recientes</h3>
          {recentActivities.length === 0 ? (
            <div style={styles.emptyActivities}>
              <Activity size={32} color="#9CA3AF" />
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
      </div>

      {/* CSS Animations */}
      <style>{`
        .spin-animation {
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
 * Componente StatCard - Card de estadística
 */
const StatCard = ({ label, value, subtitle, Icon, bgColor, iconColor }) => (
  <div style={styles.statCard}>
    <div style={styles.statCardContent}>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <h2 style={styles.statValue}>{value}</h2>
        <small style={styles.statSubtitle}>{subtitle}</small>
      </div>
      <div style={{ ...styles.statIconBox, backgroundColor: bgColor }}>
        <Icon size={24} color={iconColor} strokeWidth={2} />
      </div>
    </div>
  </div>
);

/**
 * Componente SummaryNumber - Número de resumen
 */
const SummaryNumber = ({ value, label, color }) => (
  <div style={styles.summaryItem}>
    <h2 style={{ ...styles.summaryValue, color }}>{value}</h2>
    <p style={styles.summaryLabel}>{label}</p>
  </div>
);

/**
 * Componente ActivityItem - Item de actividad
 */
const ActivityItem = ({ activity }) => (
  <div style={styles.activityItem}>
    <div style={styles.activityIconBox}>
      <Activity size={14} color="#3B82F6" strokeWidth={2} />
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

// Estilos - Diseño exacto de la imagen
const styles = {
  container: {
    padding: 0,
    backgroundColor: '#F9FAFB',
    minHeight: '100vh'
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    marginBottom: '4px'
  },
  welcomeText: {
    fontSize: '14px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  adminBadge: {
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    padding: '2px 10px',
    borderRadius: '4px'
  },
  refreshButton: {
    backgroundColor: '#1F2937',
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
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB'
  },
  statCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 8px 0'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  statSubtitle: {
    fontSize: '13px',
    color: '#9CA3AF',
    fontWeight: '500'
  },
  statIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 16px 0'
  },
  summaryItems: {
    display: 'flex',
    justifyContent: 'space-around',
    textAlign: 'center',
    padding: '16px 0',
    flex: 1
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500'
  },
  cardButton: {
    padding: '10px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    display: 'block',
    marginTop: '16px',
    transition: 'background-color 0.2s ease'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    flex: 1
  },
  actionButtonPrimary: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    gridColumn: 'span 2'
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  myTasksContent: {
    textAlign: 'center',
    padding: '30px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  myTasksIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    backgroundColor: '#E3F2FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activitiesList: {
    maxHeight: '240px',
    overflowY: 'auto',
    flex: 1
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6'
  },
  activityIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#E3F2FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    flexShrink: 0
  },
  activityContent: {
    flex: 1,
    minWidth: 0
  },
  activityText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  activityMeta: {
    fontSize: '12px',
    color: '#9CA3AF'
  },
  emptyActivities: {
    textAlign: 'center',
    padding: '40px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0
  },
  linkButton: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px'
  }
};

export default DashboardPage;
