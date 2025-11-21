import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';

/**
 * Página principal del Dashboard
 * Principio de Responsabilidad Única: Solo maneja la vista principal del dashboard
 * Principio Abierto/Cerrado: Extensible mediante componentes modulares
 */
const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Escala tipográfica consistente (DRY - Don't Repeat Yourself)
  const typography = {
    pageTitle: '1.75rem',
    cardTitle: '0.875rem',
    statNumber: '1.5rem',
    body: '0.8125rem',
    small: '0.75rem',
    tiny: '0.6875rem'
  };

  // Estados del componente
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

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar datos reales del dashboard
      const response = await dashboardService.getDashboardData();
      const dashboardData = response.data || response;

      // Cargar actividades recientes
      let activities = [];
      try {
        const activityResponse = await dashboardService.getRecentActivity(user?.id);
        activities = activityResponse.data || activityResponse || [];
      } catch (actError) {
        console.warn('No se pudieron cargar las actividades:', actError);
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
      showError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Cargar datos reales del dashboard
      const response = await dashboardService.getDashboardData();
      const dashboardData = response.data || response;

      // Cargar actividades recientes
      let activities = [];
      try {
        const activityResponse = await dashboardService.getRecentActivity(user?.id);
        activities = activityResponse.data || activityResponse || [];
      } catch (actError) {
        console.warn('No se pudieron cargar las actividades:', actError);
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
      showSuccess('Datos actualizados correctamente');

    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setError('Error al actualizar los datos');
      showError('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  // Mostrar error si no hay usuario autenticado
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
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }} data-testid="dashboard-page">
      {/* Header Moderno */}
      <div className="row mb-3" data-testid="dashboard-header">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1 fw-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.5px', fontSize: typography.pageTitle }}>
                Dashboard
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: typography.body }}>
                Bienvenido, {user?.nombre || 'Usuario'}
                {user?.es_administrador && (
                  <span style={{
                    fontSize: typography.tiny,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#0d6efd15',
                    color: '#0d6efd',
                    fontWeight: '600',
                    marginLeft: '0.5rem'
                  }}>
                    Administrador
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="btn btn-dark d-flex align-items-center"
              style={{ 
                borderRadius: '8px',
                fontSize: typography.body,
                padding: '0.4rem 1rem',
                fontWeight: '500'
              }}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${isRefreshing ? 'spin' : ''}`}></i>
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas Compactas */}
      <div className="row g-2 mb-3" data-testid="dashboard-stats">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #0d6efd' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                    TOTAL PROYECTOS
                  </p>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: typography.statNumber, color: '#1a1a1a' }}>
                    {stats.projects.total}
                  </h3>
                  <small style={{ fontSize: typography.tiny, color: '#6c757d' }}>
                    {stats.projects.completed} completados
                  </small>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#0d6efd15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-folder" style={{ fontSize: '1.25rem', color: '#0d6efd' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #198754' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                    PROYECTOS ACTIVOS
                  </p>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: typography.statNumber, color: '#1a1a1a' }}>
                    {stats.projects.active}
                  </h3>
                  <small style={{ fontSize: typography.tiny, color: '#6c757d' }}>
                    {stats.projects.myProjects} míos
                  </small>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#19875415',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-play-circle" style={{ fontSize: '1.25rem', color: '#198754' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                    TOTAL TAREAS
                  </p>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: typography.statNumber, color: '#1a1a1a' }}>
                    {stats.tasks.total}
                  </h3>
                  <small style={{ fontSize: typography.tiny, color: '#6c757d' }}>
                    {stats.tasks.pending} pendientes
                  </small>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#ffc10715',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-clipboard-check" style={{ fontSize: '1.25rem', color: '#ffc107' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #6c757d' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                    EN PROGRESO
                  </p>
                  <h3 className="mb-0 fw-bold" style={{ fontSize: typography.statNumber, color: '#1a1a1a' }}>
                    {stats.tasks.inProgress}
                  </h3>
                  <small style={{ fontSize: typography.tiny, color: '#6c757d' }}>
                    {stats.tasks.myTasks} asignadas
                  </small>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#6c757d15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-hourglass-split" style={{ fontSize: '1.25rem', color: '#6c757d' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Compacto */}
      <div className="row g-2" data-testid="dashboard-grid">
        {/* Resumen de Proyectos */}
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h6 className="mb-2 fw-semibold d-flex align-items-center" style={{ fontSize: typography.cardTitle, color: '#1a1a1a' }}>
                <i className="bi bi-folder me-2" style={{ color: '#0d6efd' }}></i>
                Resumen de Proyectos
              </h6>
              <div className="d-flex justify-content-around text-center py-2">
                <div>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#0d6efd' }}>{stats.projects.total}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Total</small>
                </div>
                <div className="border-start ps-3">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#198754' }}>{stats.projects.active}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Activos</small>
                </div>
                <div className="border-start ps-3">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#6c757d' }}>{stats.projects.completed}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Completados</small>
                </div>
              </div>
              <Link to="/projects" className="btn btn-outline-secondary btn-sm w-100 mt-2" style={{ borderRadius: '6px', fontSize: typography.small }}>
                Ver todos los proyectos
              </Link>
            </div>
          </div>
        </div>

        {/* Resumen de Tareas */}
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h6 className="mb-2 fw-semibold d-flex align-items-center" style={{ fontSize: typography.cardTitle, color: '#1a1a1a' }}>
                <i className="bi bi-clipboard-check me-2" style={{ color: '#ffc107' }}></i>
                Resumen de Tareas
              </h6>
              <div className="d-flex justify-content-around text-center py-2">
                <div>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#ffc107' }}>{stats.tasks.total}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Total</small>
                </div>
                <div className="border-start ps-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#dc3545' }}>{stats.tasks.pending}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Pendientes</small>
                </div>
                <div className="border-start ps-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#0d6efd' }}>{stats.tasks.inProgress}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>En Progreso</small>
                </div>
                <div className="border-start ps-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#198754' }}>{stats.tasks.completed}</h5>
                  <small className="text-muted" style={{ fontSize: typography.tiny }}>Completadas</small>
                </div>
              </div>
              <Link to="/tasks" className="btn btn-outline-secondary btn-sm w-100 mt-2" style={{ borderRadius: '6px', fontSize: typography.small }}>
                Ver todas las tareas
              </Link>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="col-lg-4 col-md-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h6 className="mb-2 fw-semibold d-flex align-items-center" style={{ fontSize: typography.cardTitle, color: '#1a1a1a' }}>
                <i className="bi bi-lightning me-2" style={{ color: '#6c757d' }}></i>
                Acciones Rápidas
              </h6>
              <div className="d-grid gap-1">
                <Link to="/projects" className="btn btn-dark btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                  <i className="bi bi-plus-lg me-1"></i>
                  Crear Proyecto
                </Link>
                <Link to="/tasks" className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                  <i className="bi bi-plus-lg me-1"></i>
                  Crear Tarea
                </Link>
                <Link to="/files" className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                  <i className="bi bi-file-earmark me-1"></i>
                  Gestionar Archivos
                </Link>
                {user?.es_administrador && (
                  <>
                    <Link to="/users" className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                      <i className="bi bi-people me-1"></i>
                      Gestionar Usuarios
                    </Link>
                    <Link to="/roles" className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                      <i className="bi bi-shield me-1"></i>
                      Gestionar Roles
                    </Link>
                    <Link to="/activity-logs" className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '6px', fontSize: typography.small, padding: '0.4rem' }}>
                      <i className="bi bi-activity me-1"></i>
                      Ver Logs de Actividad
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="col-lg-6 col-md-12 mt-2">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h6 className="mb-2 fw-semibold d-flex align-items-center" style={{ fontSize: typography.cardTitle, color: '#1a1a1a' }}>
                <i className="bi bi-clock-history me-2" style={{ color: '#6c757d' }}></i>
                Actividades Recientes
              </h6>
              {recentActivities.length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-inbox" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <p className="text-muted mb-0 mt-2" style={{ fontSize: typography.small }}>No hay actividades recientes</p>
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id || index} className="d-flex align-items-center py-2 border-bottom">
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px',
                        backgroundColor: '#0d6efd15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }}>
                        <i className="bi bi-activity" style={{ fontSize: '0.875rem', color: '#0d6efd' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium" style={{ fontSize: typography.small, color: '#1a1a1a' }}>
                          {activity.elemento || activity.descripcion}
                        </p>
                        <small className="text-muted" style={{ fontSize: typography.tiny }}>
                          {activity.usuario || activity.usuario_nombre} • {new Date(activity.fecha || activity.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mis Tareas Pendientes */}
        <div className="col-lg-6 col-md-12 mt-2">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h6 className="mb-2 fw-semibold d-flex align-items-center" style={{ fontSize: typography.cardTitle, color: '#1a1a1a' }}>
                <i className="bi bi-person-check me-2" style={{ color: '#6c757d' }}></i>
                Mis Tareas Pendientes
              </h6>
              <div className="text-center py-2">
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px',
                  backgroundColor: '#0d6efd15',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <i className="bi bi-clipboard-check" style={{ fontSize: '1.5rem', color: '#0d6efd' }}></i>
                </div>
                <h3 className="mb-1 fw-bold" style={{ fontSize: '2rem', color: '#0d6efd' }}>{stats.tasks.myTasks}</h3>
                <p className="text-muted mb-2" style={{ fontSize: typography.small }}>Tareas asignadas a ti</p>
                <div className="d-flex justify-content-center gap-4 py-2">
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#dc3545' }}>{stats.tasks.pending}</h5>
                    <small className="text-muted" style={{ fontSize: typography.tiny }}>Pendientes</small>
                  </div>
                  <div className="border-start ps-4">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#0d6efd' }}>{stats.tasks.inProgress}</h5>
                    <small className="text-muted" style={{ fontSize: typography.tiny }}>En Progreso</small>
                  </div>
                </div>
                <Link to="/tasks" className="btn btn-outline-secondary btn-sm mt-2" style={{ borderRadius: '6px', fontSize: typography.small }}>
                  Ver mis tareas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS personalizado para animaciones */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .card {
          transition: transform 0.2s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};



export default DashboardPage;
