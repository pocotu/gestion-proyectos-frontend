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

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Usar datos simulados por ahora (hasta que el backend esté listo)
        const data = await dashboardService.getMockDashboardData();
        
        setDashboardData({
          projects: {
            total: data.projects.total,
            active: data.projects.active,
            completed: data.projects.completed,
            myProjects: data.projects.myProjects
          },
          tasks: {
            total: data.tasks.total,
            pending: data.tasks.pending,
            inProgress: data.tasks.inProgress,
            completed: data.tasks.completed,
            myTasks: data.tasks.myTasks
          }
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [showError]);

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
  const StatCard = ({ title, value, subtitle, color = 'bg-gray-500', icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-md p-3 mr-4`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Componente para tarjetas de navegación
  const NavigationCard = ({ title, description, path, icon, color }) => (
    <Link
      to={path}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 group"
    >
      <div className="flex items-center">
        <div className={`${color} rounded-md p-3 mr-4 group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen de tus actividades
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Roles: {user?.roles?.map(role => role.nombre).join(', ') || 'Usuario'}
            </p>
            {user?.es_administrador && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                Administrador
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas Generales del Sistema */}
      <StatsOverview />

      {/* Resúmenes principales */}
      <div className="summary-grid">
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

      <style jsx>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
      `}</style>

      {/* Navegación Rápida */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getNavigationItems().map((item, index) => (
            <NavigationCard
              key={index}
              title={item.title}
              description={item.description}
              path={item.path}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* Información adicional para administradores */}
      {(user?.es_administrador || user?.roles?.some(role => role.nombre === 'admin')) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-medium text-purple-900 mb-2">
            Panel de Administrador
          </h3>
          <p className="text-purple-700 mb-4">
            Como administrador, tienes acceso completo al sistema. Puedes gestionar usuarios, 
            proyectos y configuraciones del sistema.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Gestionar Usuarios
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Ver Todos los Proyectos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;