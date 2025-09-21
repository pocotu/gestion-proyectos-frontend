import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';
import ProjectSummary from '../components/dashboard/ProjectSummary';
import TaskSummary from '../components/dashboard/TaskSummary';
import StatsOverview from '../components/dashboard/StatsOverview';

/**
 * DashboardPage - Página principal del dashboard
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la vista del dashboard principal
 * - Open/Closed: Abierto para extensión (nuevos widgets, estadísticas)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de página
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotification)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      myProjects: 0
    },
    tasks: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      myTasks: 0
    }
  });

  // Estados adicionales para datos específicos del usuario
  const [userTasks, setUserTasks] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar datos reales del dashboard
        const [dashboardData, tasksData, projectsData, activityData] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getUserTasks(user?.id),
          dashboardService.getUserProjects(user?.id),
          dashboardService.getRecentActivity(user?.id)
        ]);
        
        setDashboardData({
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

        setUserTasks(tasksData || []);
        setUserProjects(projectsData || []);
        setRecentActivity(activityData || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error al cargar los datos del dashboard');
        
        // Fallback a datos simulados en caso de error
        const mockData = await dashboardService.getMockDashboardData();
        setDashboardData({
          projects: {
            total: mockData.projects.total,
            active: mockData.projects.active,
            completed: mockData.projects.completed,
            myProjects: mockData.projects.myProjects
          },
          tasks: {
            total: mockData.tasks.total,
            pending: mockData.tasks.pending,
            inProgress: mockData.tasks.inProgress,
            completed: mockData.tasks.completed,
            myTasks: mockData.tasks.myTasks
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, showError]);

  // Función para determinar los elementos de navegación según el rol
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Mis Proyectos',
        description: 'Gestiona tus proyectos asignados',
        path: '/projects',
        icon: '📁',
        color: 'bg-blue-500',
        roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
      },
      {
        title: 'Mis Tareas',
        description: 'Revisa y actualiza tus tareas',
        path: '/tasks',
        icon: '✅',
        color: 'bg-green-500',
        roles: ['admin', 'responsable_proyecto', 'responsable_tarea']
      }
    ];

    // Agregar elementos específicos para administradores
    if (user?.es_administrador || user?.roles?.some(role => role.nombre === 'admin')) {
      baseItems.push({
        title: 'Gestión de Usuarios',
        description: 'Administra usuarios y permisos',
        path: '/users',
        icon: '👥',
        color: 'bg-purple-500',
        roles: ['admin']
      });
    }

    return baseItems.filter(item => 
      user?.roles?.some(role => item.roles.includes(role.nombre)) ||
      (user?.es_administrador && item.roles.includes('admin'))
    );
  };

  // Componente para tarjetas de estadísticas
  const StatCard = ({ title, value, subtitle, icon }) => (
    <div>
      <div>
        <span>{icon}</span>
        <div>
          <p>{title}</p>
          <p>{value}</p>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Componente para tarjetas de navegación
  const NavigationCard = ({ title, description, path, icon }) => (
    <Link to={path}>
      <div>
        <span>{icon}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header del Dashboard */}
      <div>
        <div>
          <div>
            <h1>¡Bienvenido, {user?.nombre}!</h1>
            <p>Aquí tienes un resumen de tus actividades</p>
          </div>
          <div>
            <p>Roles: {user?.roles?.map(role => role.nombre).join(', ') || 'Usuario'}</p>
            {user?.es_administrador && <span>Administrador</span>}
          </div>
        </div>
      </div>

      {/* Estadísticas Generales del Sistema */}
      <StatsOverview />

      {/* Resúmenes principales */}
      <div>
        <ProjectSummary 
          projectData={dashboardData.projects}
          isLoading={isLoading}
          userRole={user?.rol}
        />
        <TaskSummary 
          taskData={dashboardData.tasks}
          isLoading={isLoading}
          userRole={user?.rol}
        />
      </div>

      {/* Sección de Mis Tareas Asignadas */}
      {userTasks.length > 0 && (
        <div>
          <div>
            <h2>Mis Tareas Asignadas</h2>
            <Link to="/tasks?filter=assigned">Ver todas →</Link>
          </div>
          <div>
            {userTasks.slice(0, 6).map((task) => (
              <div key={task.id}>
                <div>
                  <h3>{task.titulo}</h3>
                  <span>{task.prioridad}</span>
                </div>
                <p>{task.descripcion}</p>
                <div>
                  <span>{task.estado.replace('_', ' ')}</span>
                  <span>
                    {task.fecha_vencimiento && new Date(task.fecha_vencimiento).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Mis Proyectos */}
      {userProjects.length > 0 && (
        <div>
          <div>
            <h2>Mis Proyectos</h2>
            <Link to="/projects?filter=assigned">Ver todos →</Link>
          </div>
          <div>
            {userProjects.slice(0, 4).map((project) => (
              <div key={project.id}>
                <div>
                  <h3>{project.nombre}</h3>
                  <span>{project.estado.replace('_', ' ')}</span>
                </div>
                <p>{project.descripcion}</p>
                <div>
                  <div>
                    <span>Progreso:</span>
                    <div>
                      <div style={{ width: `${project.progreso || 0}%` }}></div>
                    </div>
                    <span>{project.progreso || 0}%</span>
                  </div>
                  <span>
                    {project.fecha_fin && new Date(project.fecha_fin).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividad Reciente */}
      {recentActivity.length > 0 && (
        <div>
          <h2>Actividad Reciente</h2>
          <div>
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index}>
                <div>
                  {activity.tipo === 'tarea' ? '✓' : activity.tipo === 'proyecto' ? '📁' : '📝'}
                </div>
                <div>
                  <p>
                    <span>{activity.accion}</span>
                    {activity.elemento && <span> en "{activity.elemento}"</span>}
                  </p>
                  <p>{new Date(activity.fecha).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegación Rápida */}
      <div>
        <h2>Acceso Rápido</h2>
        <div>
          {getNavigationItems().map((item, index) => (
            <NavigationCard
              key={index}
              title={item.title}
              description={item.description}
              path={item.path}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      {/* Información adicional para administradores */}
      {(user?.es_administrador || user?.roles?.some(role => role.nombre === 'admin')) && (
        <div>
          <h3>Panel de Administrador</h3>
          <p>
            Como administrador, tienes acceso completo al sistema. Puedes gestionar usuarios, 
            proyectos y configuraciones del sistema.
          </p>
          <div>
            <Link to="/users">Gestionar Usuarios</Link>
            <Link to="/projects">Ver Todos los Proyectos</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;