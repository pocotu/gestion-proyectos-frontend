import React, { useState, useEffect } from 'react';
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
      {/* Header minimalista */}
      <div data-testid="dashboard-header" style={styles.header}>
        <h1 style={styles.mainTitle}>Dashboard</h1>
        <button 
          onClick={refreshData}
          disabled={isRefreshing}
          style={styles.refreshButton}
        >
          <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>
      
      {/* Layout principal - 3 columnas */}
      <div style={styles.mainLayout} data-testid="dashboard-stats">
        
        {/* Columna izquierda - Estadísticas en cards pequeñas */}
        <div style={styles.statsColumn}>
          <div style={styles.sectionTitle}>Estadísticas</div>
          
          {/* Proyectos */}
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Proyectos</span>
              <span style={{...styles.statValue, color: '#0066CC'}}>{stats.projects.total}</span>
            </div>
            <div style={styles.statDetails}>
              <div style={styles.statDetail}>
                <span style={styles.statDot} />
                <span style={styles.statDetailLabel}>{stats.projects.active} activos</span>
              </div>
              <div style={styles.statDetail}>
                <span style={{...styles.statDot, backgroundColor: '#34C759'}} />
                <span style={styles.statDetailLabel}>{stats.projects.completed} completados</span>
              </div>
            </div>
          </div>

          {/* Tareas */}
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Tareas</span>
              <span style={{...styles.statValue, color: '#FF3B30'}}>{stats.tasks.total}</span>
            </div>
            <div style={styles.statDetails}>
              <div style={styles.statDetail}>
                <span style={{...styles.statDot, backgroundColor: '#FF9500'}} />
                <span style={styles.statDetailLabel}>{stats.tasks.pending} pendientes</span>
              </div>
              <div style={styles.statDetail}>
                <span style={{...styles.statDot, backgroundColor: '#0066CC'}} />
                <span style={styles.statDetailLabel}>{stats.tasks.inProgress} en progreso</span>
              </div>
              <div style={styles.statDetail}>
                <span style={{...styles.statDot, backgroundColor: '#34C759'}} />
                <span style={styles.statDetailLabel}>{stats.tasks.completed} completadas</span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div style={styles.quickActions}>
            <Link to="/projects" style={styles.primaryAction}>
              <Plus size={18} strokeWidth={2} />
              Crear Proyecto
            </Link>
            <Link to="/projects" style={styles.secondaryAction}>
              Ver Proyectos
            </Link>
          </div>
        </div>

        {/* Columna central - Mis Tareas */}
        <div style={styles.mainColumn}>
          <div style={styles.columnHeader}>
            <div style={styles.sectionTitle}>Mis Tareas</div>
            {pendingTasks.length > 0 && (
              <span style={styles.countBadge}>{pendingTasks.length}</span>
            )}
          </div>
          
          {pendingTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckCircle2 size={56} color="#0066CC" strokeWidth={1.5} />
              <p style={styles.emptyTitle}>Todo al día</p>
              <p style={styles.emptyText}>No tienes tareas pendientes</p>
            </div>
          ) : (
            <div style={styles.tasksList}>
              {pendingTasks.map((task, index) => (
                <TaskItem key={task.id || index} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha - Actividad Reciente */}
        <div style={styles.sideColumn}>
          <div style={styles.sectionTitle}>Actividad Reciente</div>
          
          {recentActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <Activity size={48} color="#8E8E93" strokeWidth={1.5} />
              <p style={styles.emptyText}>Sin actividad</p>
            </div>
          ) : (
            <div style={styles.activityList}>
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
 * Componente TaskItem - Diseño limpio y compacto
 */
const TaskItem = ({ task }) => {
  const getPriorityColor = (prioridad) => {
    const colors = {
      'alta': '#FF3B30',
      'media': '#FF9500',
      'baja': '#34C759'
    };
    return colors[prioridad] || '#8E8E93';
  };

  const getPriorityLabel = (prioridad) => {
    const labels = {
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    };
    return labels[prioridad] || prioridad;
  };

  return (
    <Link to="/tasks" style={styles.taskCard}>
      <div style={{
        ...styles.priorityBar,
        backgroundColor: getPriorityColor(task.prioridad)
      }} />
      <div style={styles.taskBody}>
        <div style={styles.taskHeader}>
          <p style={styles.taskTitle}>{task.titulo}</p>
        </div>
        <div style={styles.taskFooter}>
          <span style={{
            ...styles.priorityTag,
            color: getPriorityColor(task.prioridad)
          }}>
            {getPriorityLabel(task.prioridad)}
          </span>
          {task.fecha_fin && (
            <>
              <span style={styles.taskSeparator}>•</span>
              <span style={styles.taskDueDate}>
                {new Date(task.fecha_fin).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

/**
 * Componente ActivityItem - Diseño compacto y elegante
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
      const now = new Date();
      const activityDate = new Date(date);
      const diffMs = now - activityDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins}m`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      
      return activityDate.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return '';
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div style={styles.activityCard}>
      <div style={styles.activityIcon}>
        {getInitial(getUserName(activity))}
      </div>
      <div style={styles.activityBody}>
        <p style={styles.activityDescription}>
          <strong>{getUserName(activity)}</strong> {formatActivityDescription(activity)}
        </p>
        <span style={styles.activityTime}>
          {formatDate(activity)}
        </span>
      </div>
    </div>
  );
};

// Estilos - Diseño moderno de 3 columnas
const styles = {
  container: {
    height: 'calc(90vh - 88px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflow: 'hidden',
    padding: 0
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '400'
  },
  refreshButton: {
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#6B7280'
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 320px',
    gap: '20px',
    height: '100%',
    overflow: 'hidden'
  },
  
  // Columna izquierda - Estadísticas
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.2s ease'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#0066CC',
    flexShrink: 0
  },
  statDetailLabel: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '400'
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  primaryAction: {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: 'none'
  },
  secondaryAction: {
    backgroundColor: '#F9FAFB',
    color: '#374151',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
    display: 'block',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid #E5E7EB'
  },
  adminActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  smallAction: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'center',
    display: 'block',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid #E5E7EB'
  },
  
  // Columna central - Tareas
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '20px',
    overflow: 'hidden',
    minHeight: 0,
    height: '100%'
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexShrink: 0
  },
  countBadge: {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  tasksList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '8px',
    minHeight: 0,
    maxHeight: '100%'
  },
  taskCard: {
    display: 'flex',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    overflow: 'hidden',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid #E5E7EB',
    flexShrink: 0
  },
  priorityBar: {
    width: '4px',
    flexShrink: 0
  },
  taskBody: {
    flex: 1,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0
  },
  taskHeader: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '1.3',
    flex: 1
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  priorityTag: {
    fontSize: '12px',
    fontWeight: '600'
  },
  taskSeparator: {
    fontSize: '12px',
    color: '#D1D5DB',
    fontWeight: '400'
  },
  taskDueDate: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '400'
  },
  
  // Columna derecha - Actividad
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0
  },
  activityBody: {
    flex: 1,
    minWidth: 0
  },
  activityDescription: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#374151',
    margin: '0 0 4px 0',
    lineHeight: '1.4'
  },
  activityTime: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '400'
  },
  
  // Estados vacíos
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 20px'
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2937',
    margin: 0
  },
  emptyText: {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: 0,
    textAlign: 'center'
  }
};

export default DashboardPage;
