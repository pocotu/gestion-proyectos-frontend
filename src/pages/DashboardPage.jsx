import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';
import { RefreshCw, Plus, Activity, CheckCircle2 } from 'lucide-react';

/**
 * DashboardPage - Diseño exacto de la imagen sin scroll
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la vista del dashboard
 * - Open/Closed: Extensible mediante componentes modulares
 * - Dependency Inversion: Depende de abstracciones (servicios, contextos)
 */
const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Estados del componente
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getDashboardData();
      const dashboardData = response.data || response;

      let activities = [];
      let myPendingTasks = [];
      
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

      try {
        const pendingResponse = await dashboardService.getPendingTasks();
        myPendingTasks = pendingResponse.data || pendingResponse || [];
      } catch (taskError) {
        console.error('Error al cargar tareas pendientes:', taskError);
      }

      setStats({
        projects: {
          total: dashboardData.projects?.total || 0,
          active: dashboardData.projects?.activos || dashboardData.projects?.active || 0,
          completed: dashboardData.projects?.completados || dashboardData.projects?.completed || 0
        },
        tasks: {
          total: dashboardData.tasks?.total || 0,
          pending: dashboardData.tasks?.pendientes || dashboardData.tasks?.pending || 0,
          inProgress: dashboardData.tasks?.en_progreso || dashboardData.tasks?.inProgress || 0,
          completed: dashboardData.tasks?.completadas || dashboardData.tasks?.completed || 0
        }
      });

      setRecentActivities(activities.slice(0, 10));
      setPendingTasks(myPendingTasks.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await loadDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div style={styles.container} data-testid="dashboard-page">
      {/* Grid superior - 3 columnas */}
      <div style={styles.topGrid}>
        {/* Resumen de Proyectos */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resumen de Proyectos</h3>
          <div style={styles.summaryRow}>
            <SummaryNumber value={stats.projects.total} label="Total" color="#3B82F6" />
            <SummaryNumber value={stats.projects.active} label="Activos" color="#22C55E" />
            <SummaryNumber value={stats.projects.completed} label="Completados" color="#9CA3AF" />
          </div>
          <Link to="/projects" style={styles.cardButton}>
            Ver todos los proyectos
          </Link>
        </div>

        {/* Resumen de Tareas */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resumen de Tareas</h3>
          <div style={styles.summaryRow}>
            <SummaryNumber value={stats.tasks.total} label="Total" color="#EF4444" />
            <SummaryNumber value={stats.tasks.pending} label="Pendientes" color="#F59E0B" />
            <SummaryNumber value={stats.tasks.inProgress} label="En Progreso" color="#3B82F6" />
            <SummaryNumber value={stats.tasks.completed} label="Completadas" color="#22C55E" />
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
            <Link to="/tasks" style={styles.actionButton}>Crear Tarea</Link>
            <Link to="/files" style={styles.actionButton}>Archivos</Link>
            {user?.es_administrador && (
              <>
                <Link to="/users" style={styles.actionButton}>Usuarios</Link>
                <Link to="/roles" style={styles.actionButton}>Roles</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid inferior - 2 columnas */}
      <div style={styles.bottomGrid}>
        {/* Mis Tareas Pendientes con scroll interno */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Mis Tareas Pendientes</h3>
          {pendingTasks.length === 0 ? (
            <div style={styles.emptyContent}>
              <CheckCircle2 size={40} color="#3B82F6" strokeWidth={2} />
              <p style={styles.emptyText}>No tienes tareas pendientes</p>
            </div>
          ) : (
            <div style={styles.scrollContainer}>
              {pendingTasks.map((task, index) => (
                <TaskItem key={task.id || index} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Actividades Recientes con scroll interno */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Actividades Recientes</h3>
          {recentActivities.length === 0 ? (
            <div style={styles.emptyContent}>
              <Activity size={32} color="#9CA3AF" />
              <p style={styles.emptyText}>No hay actividades recientes</p>
            </div>
          ) : (
            <div style={styles.scrollContainer}>
              {recentActivities.map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
 * Componente TaskItem - Item de tarea pendiente
 */
const TaskItem = ({ task }) => {
  const getPriorityColor = (prioridad) => {
    const colors = {
      'alta': '#EF4444',
      'media': '#F59E0B',
      'baja': '#22C55E'
    };
    return colors[prioridad] || '#9CA3AF';
  };

  const getStatusColor = (estado) => {
    const colors = {
      'pendiente': '#F59E0B',
      'en_progreso': '#3B82F6',
      'completada': '#22C55E',
      'cancelada': '#EF4444'
    };
    return colors[estado] || '#9CA3AF';
  };

  return (
    <Link to="/tasks" style={styles.taskItem}>
      <div style={styles.taskContent}>
        <p style={styles.taskTitle}>{task.titulo}</p>
        <div style={styles.taskMeta}>
          <span style={{
            ...styles.taskBadge,
            backgroundColor: `${getPriorityColor(task.prioridad)}20`,
            color: getPriorityColor(task.prioridad)
          }}>
            {task.prioridad === 'alta' ? 'Alta' : task.prioridad === 'media' ? 'Media' : 'Baja'}
          </span>
          {task.fecha_fin && (
            <span style={styles.taskDate}>
              {new Date(task.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div style={{
        ...styles.taskStatusDot,
        backgroundColor: getStatusColor(task.estado)
      }} />
    </Link>
  );
};

/**
 * Componente ActivityItem - Item de actividad
 */
const ActivityItem = ({ activity }) => {
  const formatActivityDescription = (activity) => {
    const accion = activity.accion || '';
    const descripcion = activity.descripcion || '';
    const entidadTipo = activity.entidad_tipo || '';
    
    const accionesMap = {
      'crear': 'creó',
      'actualizar': 'actualizó',
      'eliminar': 'eliminó',
      'asignar': 'asignó',
      'remover': 'removió'
    };
    
    const entidadesMap = {
      'proyecto': 'un proyecto',
      'tarea': 'una tarea',
      'usuario': 'un usuario',
      'rol': 'un rol',
      'archivo': 'un archivo'
    };
    
    if (descripcion) {
      const cleanDesc = descripcion
        .replace(/\[IP:.*?\]/g, '')
        .replace(/\[Datos.*?\]/g, '')
        .replace(/\{.*?\}/g, '')
        .trim();
      
      if (cleanDesc.length > 0 && cleanDesc.length < 100) {
        return cleanDesc;
      }
    }
    
    const accionTexto = accionesMap[accion.toLowerCase()] || accion;
    const entidadTexto = entidadesMap[entidadTipo.toLowerCase()] || entidadTipo;
    
    if (accionTexto && entidadTexto) {
      return `${accionTexto.charAt(0).toUpperCase() + accionTexto.slice(1)} ${entidadTexto}`;
    }
    
    return accion ? accion.charAt(0).toUpperCase() + accion.slice(1) : 'Actividad del sistema';
  };

  const getUserName = (activity) => {
    if (activity.usuario_nombre) return activity.usuario_nombre;
    if (activity.usuario) return activity.usuario;
    return 'Sistema';
  };

  const formatDate = (activity) => {
    const date = activity.fecha || activity.created_at;
    if (!date) return '';
    
    try {
      return new Date(date).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div style={styles.activityItem}>
      <div style={styles.activityIconBox}>
        <Activity size={14} color="#3B82F6" strokeWidth={2} />
      </div>
      <div style={styles.activityContent}>
        <p style={styles.activityText}>
          {formatActivityDescription(activity)}
        </p>
        <small style={styles.activityMeta}>
          {getUserName(activity)} • {formatDate(activity)}
        </small>
      </div>
    </div>
  );
};

// Estilos - Diseño sin scroll vertical
const styles = {
  container: {
    height: 'calc(90vh - 88px)', // Altura total menos header
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflow: 'hidden',
    padding: 0
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    height: 'auto'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    height: '320px',
    minHeight: 0
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 16px 0'
  },
  summaryRow: {
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
    textDecoration: 'none',
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
    gridColumn: 'span 2',
    textDecoration: 'none'
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
    justifyContent: 'center',
    textDecoration: 'none'
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px'
  },
  emptyContent: {
    textAlign: 'center',
    padding: '40px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid #E5E7EB',
    textDecoration: 'none',
    flexShrink: 0
  },
  taskContent: {
    flex: 1,
    minWidth: 0
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 6px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  taskBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  taskDate: {
    fontSize: '12px',
    color: '#6B7280'
  },
  taskStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    marginLeft: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
    flexShrink: 0
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
  }
};

export default DashboardPage;
