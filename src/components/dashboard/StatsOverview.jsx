import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import dashboardService from '../../services/dashboardService';
import StatsCard from './StatsCard';
import './StatsOverview.css';

/**
 * StatsOverview - Componente para mostrar estadísticas generales del dashboard
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la visualización de estadísticas generales
 * - Open/Closed: Abierto para extensión (nuevos tipos de estadísticas)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de estadísticas
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotification)
 * - Dependency Inversion: Depende de abstracciones (hooks, servicios)
 */
const StatsOverview = () => {
  const { user } = useAuth();
  const { addNotification, showError } = useNotifications();
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0, paused: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    users: { total: 0, active: 0 },
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', 'quarter', 'year'

  useEffect(() => {
    loadStats();
  }, [user, timeFilter]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardSummary();
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      showError('Error al cargar las estadísticas del dashboard');
      
      // Usar datos simulados en caso de error
      setStats(await dashboardService.getMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  const getProjectStats = () => {
    const { projects } = stats || {};
    if (!projects) return [];
    
    const activeRate = projects.total > 0 ? Math.round((projects.active / projects.total) * 100) : 0;
    const completionRate = projects.total > 0 ? Math.round((projects.completed / projects.total) * 100) : 0;

    return [
      {
        title: 'Total Proyectos',
        value: projects.total,
        color: 'primary',
        subtitle: 'Proyectos en el sistema',
        testId: 'projects-count'
      },
      {
        title: 'Proyectos Activos',
        value: projects.active,
        color: 'success',
        subtitle: 'En desarrollo',
        percentage: activeRate
      },
      {
        title: 'Completados',
        value: projects.completed,
        color: 'info',
        subtitle: 'Finalizados',
        percentage: completionRate,
        testId: 'completed-projects'
      },
      ...(user?.es_administrador ? [] : [{
        title: 'Mis Proyectos',
        value: projects.myProjects || 0,
        color: 'warning',
        subtitle: 'Proyectos asignados'
      }])
    ];
  };

  const getTaskStats = () => {
    const { tasks } = stats || {};
    if (!tasks) return [];
    
    const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;
    const pendingRate = tasks.total > 0 ? Math.round((tasks.pending / tasks.total) * 100) : 0;

    return [
      {
        title: 'Total Tareas',
        value: tasks.total,
        color: 'primary',
        subtitle: 'Tareas en el sistema',
        testId: 'tasks-count'
      },
      {
        title: 'Pendientes',
        value: tasks.pending,
        color: 'warning',
        subtitle: 'Por iniciar',
        percentage: pendingRate,
        testId: 'pending-tasks'
      },
      {
        title: 'En Progreso',
        value: tasks.inProgress,
        color: 'info',
        subtitle: 'En desarrollo'
      },
      {
        title: 'Completadas',
        value: tasks.completed,
        color: 'success',
        subtitle: 'Finalizadas',
        percentage: completionRate
      },
      ...(user?.es_administrador ? [] : [{
        title: 'Mis Tareas',
        value: tasks.myTasks || 0,
        color: 'secondary',
        subtitle: 'Tareas asignadas'
      }])
    ];
  };

  const getUserStats = () => {
    if (!user?.es_administrador || !stats?.users) return [];

    const { users } = stats;
    const activeRate = users.total > 0 ? Math.round((users.active / users.total) * 100) : 0;

    return [
      {
        title: 'Total Usuarios',
        value: users.total,
        icon: '👥',
        color: 'primary',
        subtitle: 'Usuarios registrados'
      },
      {
        title: 'Usuarios Activos',
        value: users.active,
        icon: '🟢',
        color: 'success',
        subtitle: 'Conectados recientemente',
        percentage: activeRate
      },
      {
        title: 'Usuarios Inactivos',
        value: users.inactive,
        icon: '⚪',
        color: 'secondary',
        subtitle: 'Sin actividad reciente'
      }
    ];
  };

  return (
    <div className="stats-overview">
      <div className="stats-overview__header">
        <h2 className="stats-overview__title">Resumen General</h2>
        <div className="stats-overview__controls">
          <select 
            className="time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            data-testid="time-filter"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button 
            className="stats-overview__refresh"
            onClick={loadStats}
            disabled={loading}
            title="Actualizar estadísticas"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
          </button>
        </div>
      </div>

      {/* Estadísticas de Proyectos */}
      <div className="stats-section">
        <h3 className="stats-section__title">Proyectos</h3>
        <div className="stats-grid">
          {getProjectStats().map((stat, index) => (
            <StatsCard
              key={`project-${index}`}
              {...stat}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas de Tareas */}
      <div className="stats-section">
        <h3 className="stats-section__title">Tareas</h3>
        <div className="stats-grid">
          {getTaskStats().map((stat, index) => (
            <StatsCard
              key={`task-${index}`}
              {...stat}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas de Usuarios (solo admin) */}
      {user?.es_administrador && (
        <div className="stats-section">
          <h3 className="stats-section__title">Usuarios</h3>
          <div className="stats-grid">
            {getUserStats().map((stat, index) => (
              <StatsCard
                key={`user-${index}`}
                {...stat}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;