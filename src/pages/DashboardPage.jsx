import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService.mock';

/**
 * Página principal del Dashboard
 * Principio de Responsabilidad Única: Solo maneja la vista principal del dashboard
 * Principio Abierto/Cerrado: Extensible mediante componentes modulares
 */
const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();

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
      const dashboardData = await dashboardService.getDashboardData();

      setStats({
        projects: {
          total: dashboardData.projects?.total || 0,
          active: dashboardData.projects?.active || 0,
          completed: dashboardData.projects?.completed || 0,
          myProjects: dashboardData.projects?.myProjects || 0
        },
        tasks: {
          total: dashboardData.tasks?.total || 0,
          pending: dashboardData.tasks?.pending || 0,
          inProgress: dashboardData.tasks?.inProgress || 0,
          completed: dashboardData.tasks?.completed || 0,
          myTasks: dashboardData.tasks?.myTasks || 0
        }
      });

      setRecentActivities(dashboardData.recentActivities || []);

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
      const dashboardData = await dashboardService.getDashboardData();

      setStats({
        projects: {
          total: dashboardData.projects?.total || 0,
          active: dashboardData.projects?.active || 0,
          completed: dashboardData.projects?.completed || 0,
          myProjects: dashboardData.projects?.myProjects || 0
        },
        tasks: {
          total: dashboardData.tasks?.total || 0,
          pending: dashboardData.tasks?.pending || 0,
          inProgress: dashboardData.tasks?.inProgress || 0,
          completed: dashboardData.tasks?.completed || 0,
          myTasks: dashboardData.tasks?.myTasks || 0
        }
      });

      setRecentActivities(dashboardData.recentActivities || []);
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
    <div className="container-fluid py-4" data-testid="dashboard-page">
      {/* Header */}
      <div className="row mb-4" data-testid="dashboard-header">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">Dashboard</h1>
              <p className="text-muted mb-0">
                Bienvenido, {user?.nombre || 'Usuario'}
                {user?.es_administrador && (
                  <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                    Administrador
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="btn btn-outline-primary d-flex align-items-center"
            >
              <i className={`bi ${isRefreshing ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'} me-2 ${isRefreshing ? 'spin' : ''}`}></i>
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

      {/* Estadísticas principales */}
      <div className="row mb-4" data-testid="dashboard-stats">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-folder text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Total Proyectos</h6>
                  <h4 className="card-title mb-0 fw-bold">{stats.projects.total}</h4>
                  <small className="text-primary">
                    <i className="bi bi-check-circle me-1"></i>
                    {stats.projects.completed} completados
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-play-circle text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Proyectos Activos</h6>
                  <h4 className="card-title mb-0 fw-bold">{stats.projects.active}</h4>
                  <small className="text-primary">
                    <i className="bi bi-person me-1"></i>
                    {stats.projects.myProjects} míos
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-clipboard-check text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Total Tareas</h6>
                  <h4 className="card-title mb-0 fw-bold">{stats.tasks.total}</h4>
                  <small className="text-primary">
                    <i className="bi bi-clock me-1"></i>
                    {stats.tasks.pending} pendientes
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-hourglass-split text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">En Progreso</h6>
                  <h4 className="card-title mb-0 fw-bold">{stats.tasks.inProgress}</h4>
                  <small className="text-primary">
                    <i className="bi bi-person-check me-1"></i>
                    {stats.tasks.myTasks} asignadas
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="row" data-testid="dashboard-grid">
        {/* Resumen de Proyectos */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-folder me-2"></i>
                Resumen de Proyectos
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="text-primary fw-bold">{stats.projects.total}</h5>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border-end">
                    <h5 className="text-primary fw-bold">{stats.projects.active}</h5>
                    <small className="text-muted">Activos</small>
                  </div>
                </div>
                <div className="col-4">
                  <h5 className="text-primary fw-bold">{stats.projects.completed}</h5>
                  <small className="text-muted">Completados</small>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top">
                <Link to="/projects" className="btn btn-outline-primary btn-sm w-100">
                  <i className="bi bi-eye me-2"></i>
                  Ver todos los proyectos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Tareas */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-clipboard-check me-2"></i>
                Resumen de Tareas
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="border-end">
                    <h5 className="text-primary fw-bold">{stats.tasks.total}</h5>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h5 className="text-primary fw-bold">{stats.tasks.pending}</h5>
                    <small className="text-muted">Pendientes</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h5 className="text-primary fw-bold">{stats.tasks.inProgress}</h5>
                    <small className="text-muted">En Progreso</small>
                  </div>
                </div>
                <div className="col-3">
                  <h5 className="text-primary fw-bold">{stats.tasks.completed}</h5>
                  <small className="text-muted">Completadas</small>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top">
                <Link to="/tasks" className="btn btn-outline-primary btn-sm w-100">
                  <i className="bi bi-eye me-2"></i>
                  Ver todas las tareas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="col-lg-4 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rápidas
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/projects" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-lg me-2"></i>
                  Crear Proyecto
                </Link>
                <Link to="/tasks" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-plus-lg me-2"></i>
                  Crear Tarea
                </Link>
                <Link to="/files" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-file-earmark me-2"></i>
                  Gestionar Archivos
                </Link>
                {user?.es_administrador && (
                  <>
                    <Link to="/users" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-people me-2"></i>
                      Gestionar Usuarios
                    </Link>
                    <Link to="/roles" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-shield me-2"></i>
                      Gestionar Roles
                    </Link>
                    <Link to="/activity-logs" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-activity me-2"></i>
                      Ver Logs de Actividad
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-clock-history me-2"></i>
                Actividades Recientes
              </h6>
            </div>
            <div className="card-body">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                  <p className="text-muted mb-0">No hay actividades recientes</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <i className="bi bi-activity text-primary"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{activity.descripcion}</h6>
                          <small className="text-muted">
                            {activity.usuario_nombre} • {new Date(activity.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mis Tareas Pendientes */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-person-check me-2"></i>
                Mis Tareas Pendientes
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                  <i className="bi bi-clipboard-check text-primary fs-4"></i>
                </div>
                <h4 className="text-primary fw-bold mb-2">{stats.tasks.myTasks}</h4>
                <p className="text-muted mb-3">Tareas asignadas a ti</p>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <h6 className="text-primary fw-bold">{stats.tasks.pending}</h6>
                      <small className="text-muted">Pendientes</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <h6 className="text-primary fw-bold">{stats.tasks.inProgress}</h6>
                    <small className="text-muted">En Progreso</small>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-top">
                  <Link to="/tasks" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-eye me-2"></i>
                    Ver mis tareas
                  </Link>
                </div>
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
