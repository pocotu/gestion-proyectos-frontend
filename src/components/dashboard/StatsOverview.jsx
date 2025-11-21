import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
const StatsOverview = ({ stats }) => {
  const { user } = useAuth();
    const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', 'quarter', 'year'

  // Usar stats por defecto si no se pasan como prop
  const defaultStats = {
    projects: { total: 0, active: 0, completed: 0, paused: 0, myProjects: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0, myTasks: 0 },
    users: { total: 0, active: 0 },
    activities: []
  };

  const currentStats = stats || defaultStats;

  const getProjectStats = () => {
    const { projects } = currentStats || {};
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
    const { tasks } = currentStats || {};
    if (!tasks) return [];
    
    const pendingRate = tasks.total > 0 ? Math.round((tasks.pending / tasks.total) * 100) : 0;
    const progressRate = tasks.total > 0 ? Math.round((tasks.inProgress / tasks.total) * 100) : 0;
    const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

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
        percentage: pendingRate
      },
      {
        title: 'En Progreso',
        value: tasks.inProgress,
        color: 'info',
        subtitle: 'En desarrollo',
        percentage: progressRate
      },
      {
        title: 'Completadas',
        value: tasks.completed,
        color: 'success',
        subtitle: 'Finalizadas',
        percentage: completionRate,
        testId: 'completed-tasks'
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
    if (!user?.es_administrador) return [];
    
    const { users } = currentStats || {};
    if (!users) return [];

    const activeRate = users.total > 0 ? Math.round((users.active / users.total) * 100) : 0;

    return [
      {
        title: 'Total Usuarios',
        value: users.total,
        color: 'primary',
        subtitle: 'Usuarios registrados',
        testId: 'users-count'
      },
      {
        title: 'Usuarios Activos',
        value: users.active,
        color: 'success',
        subtitle: 'Conectados recientemente',
        percentage: activeRate
      }
    ];
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
      };

  const projectStats = getProjectStats();
  const taskStats = getTaskStats();
  const userStats = getUserStats();

  return (
    <div className="stats-overview" data-testid="stats-overview">
      {/* Header con filtros de tiempo */}
      <div className="stats-header">
        <h2 className="stats-title">Resumen General</h2>
        <div className="time-filters">
          {['week', 'month', 'quarter', 'year'].map(filter => (
            <button
              key={filter}
              className={`time-filter ${timeFilter === filter ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange(filter)}
              data-testid={`filter-${filter}`}
            >
              {filter === 'week' && 'Semana'}
              {filter === 'month' && 'Mes'}
              {filter === 'quarter' && 'Trimestre'}
              {filter === 'year' && 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas de Proyectos */}
      <div className="stats-section">
        <h3 className="section-title">Proyectos</h3>
        <div className="stats-grid">
          {projectStats.map((stat, index) => (
            <StatsCard
              key={`project-${index}`}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              subtitle={stat.subtitle}
              percentage={stat.percentage}
              testId={stat.testId}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas de Tareas */}
      <div className="stats-section">
        <h3 className="section-title">Tareas</h3>
        <div className="stats-grid">
          {taskStats.map((stat, index) => (
            <StatsCard
              key={`task-${index}`}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              subtitle={stat.subtitle}
              percentage={stat.percentage}
              testId={stat.testId}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas de Usuarios (solo para administradores) */}
      {user?.es_administrador && userStats.length > 0 && (
        <div className="stats-section">
          <h3 className="section-title">Usuarios</h3>
          <div className="stats-grid">
            {userStats.map((stat, index) => (
              <StatsCard
                key={`user-${index}`}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                subtitle={stat.subtitle}
                percentage={stat.percentage}
                testId={stat.testId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="stats-footer">
        <p className="stats-info">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </p>
        <p className="stats-period">
          Período: {timeFilter === 'week' && 'Última semana'}
          {timeFilter === 'month' && 'Último mes'}
          {timeFilter === 'quarter' && 'Último trimestre'}
          {timeFilter === 'year' && 'Último año'}
        </p>
      </div>
    </div>
  );
};

export default StatsOverview;