import { useMemo, useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import ProjectKanbanBoard from './ProjectKanbanBoard';

/**
 * ProjectTasksCard - Displays list of project tasks
 * Follows Single Responsibility Principle: Only displays tasks list
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of tasks
 * @param {number} props.projectId - Project ID
 * @param {boolean} props.canManage - Whether user can manage tasks
 * @param {Function} props.onCreate - Callback for creating task
 * @param {Function} props.onEdit - Callback for editing task
 * @param {Function} props.onDelete - Callback for deleting task
 * @returns {JSX.Element}
 */
const ProjectTasksCard = ({ 
  tasks = [], 
  projectId,
  canManage = false,
  onCreate,
  onEdit,
  onDelete,
  hideHeader = false
}) => {
  // Estado para cambiar entre vista Lista y Kanban
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'kanban'

  /**
   * Get status label in Spanish
   * @param {string} status - Task status
   * @returns {string} Status label
   */
  const getStatusLabel = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  /**
   * Get status variant for badge
   * @param {string} status - Task status
   * @returns {string} Badge variant
   */
  const getStatusVariant = (status) => {
    const variantMap = {
      'pendiente': 'warning',
      'en_progreso': 'info',
      'completada': 'success',
      'cancelada': 'danger'
    };
    return variantMap[status] || 'default';
  };

  /**
   * Get priority label in Spanish
   * @param {string} priority - Task priority
   * @returns {string} Priority label
   */
  const getPriorityLabel = (priority) => {
    const priorityMap = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta'
    };
    return priorityMap[priority] || priority;
  };

  /**
   * Get priority badge class
   * @param {string} priority - Task priority
   * @returns {string} Badge class
   */
  const getPriorityBadgeClass = (priority) => {
    const classMap = {
      'baja': 'badge bg-secondary',
      'media': 'badge bg-warning',
      'alta': 'badge bg-danger'
    };
    return classMap[priority] || 'badge bg-secondary';
  };

  /**
   * Format date to DD/MM/YYYY
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Check if task is overdue
   * @param {Object} task - Task object
   * @returns {boolean} True if overdue
   */
  const isOverdue = (task) => {
    if (!task.fecha_fin || task.estado === 'completada') {
      return false;
    }
    const dueDate = new Date(task.fecha_fin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  /**
   * Sort tasks by status
   * Status order: pendiente, en_progreso, completada, cancelada
   */
  const sortedTasks = useMemo(() => {
    const statusOrder = {
      'pendiente': 1,
      'en_progreso': 2,
      'completada': 3,
      'cancelada': 4
    };

    return [...tasks].sort((a, b) => {
      const orderA = statusOrder[a.estado] || 999;
      const orderB = statusOrder[b.estado] || 999;
      return orderA - orderB;
    });
  }, [tasks]);

  return (
    <div className={`card project-detail-card project-tasks-card ${hideHeader ? 'no-card-style' : ''}`}>
      {!hideHeader && (
        <div className="card-header project-detail-card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Tareas del Proyecto</h3>
          <div className="d-flex gap-2 align-items-center">
            {/* Botón Nueva Tarea primero */}
            {canManage && onCreate && (
              <button
                type="button"
                className="btn btn-sm btn-dark"
                onClick={onCreate}
                title="Crear tarea"
                style={{
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.75rem'
                }}
              >
                <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Tarea
              </button>
            )}
            {/* Toggle Vista Lista/Kanban */}
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('list')}
                style={{
                  borderRadius: '6px 0 0 6px',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.75rem'
                }}
              >
                <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Lista
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('kanban')}
                style={{
                  borderRadius: '0 6px 6px 0',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.75rem'
                }}
              >
                <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle cuando hideHeader es true (dentro de tabs) */}
      {hideHeader && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Botón Nueva Tarea primero */}
          {canManage && onCreate && (
            <button
              type="button"
              className="btn btn-sm btn-dark"
              onClick={onCreate}
              title="Crear tarea"
              style={{
                borderRadius: '6px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.75rem'
              }}
            >
              <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Tarea
            </button>
          )}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('list')}
              style={{
                borderRadius: '6px 0 0 6px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.75rem'
              }}
            >
              <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Lista
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('kanban')}
              style={{
                borderRadius: '0 6px 6px 0',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.75rem'
              }}
            >
              <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </button>
          </div>
        </div>
      )}
      
      <div className={`card-body project-detail-card-body ${hideHeader ? 'p-0' : ''}`}>
        {viewMode === 'kanban' ? (
          <ProjectKanbanBoard 
            tasks={tasks}
            projectId={projectId}
          />
        ) : (
          <>
            {sortedTasks.length === 0 ? (
          <div className="text-center py-4">
            <svg 
              className="mx-auto mb-3" 
              style={{ width: '48px', height: '48px', color: 'var(--gray-400)' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <p className="text-muted mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
              No hay tareas en este proyecto
            </p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {sortedTasks.map((task) => {
              const overdue = isOverdue(task);
              
              return (
                <div 
                  key={task.id} 
                  className={`list-group-item py-3 ${overdue ? 'border-start border-danger border-3' : ''}`}
                  style={{ 
                    border: 'none', 
                    borderBottom: '1px solid var(--border-color-light)',
                    backgroundColor: overdue ? 'var(--danger-50)' : 'transparent',
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem'
                  }}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      {/* Task Title and Badges */}
                      <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
                        <h6 className="mb-0 me-2" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {task.titulo}
                        </h6>
                        <StatusBadge 
                          status={getStatusLabel(task.estado)} 
                          variant={getStatusVariant(task.estado)}
                          size="small"
                        />
                        <span className={getPriorityBadgeClass(task.prioridad)} style={{ fontSize: 'var(--font-size-xs)' }}>
                          {getPriorityLabel(task.prioridad)}
                        </span>
                        {overdue && (
                          <span className="badge bg-danger" style={{ fontSize: 'var(--font-size-xs)' }}>
                            Vencida
                          </span>
                        )}
                      </div>

                      {/* Task Description */}
                      {task.descripcion && (
                        <p className="mb-2 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                          {task.descripcion}
                        </p>
                      )}

                      {/* Task Details */}
                      <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {/* Display multiple assigned users */}
                        {task.asignaciones && task.asignaciones.length > 0 && (
                          <div className="d-flex align-items-center">
                            <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>
                              {task.asignaciones.map(a => a.usuario_nombre).join(', ')}
                            </span>
                          </div>
                        )}
                        {/* Fallback to single assignee if no asignaciones */}
                        {(!task.asignaciones || task.asignaciones.length === 0) && task.assignee_name && (
                          <div className="d-flex align-items-center">
                            <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{task.assignee_name}</span>
                          </div>
                        )}
                        {task.fecha_fin && (
                          <div className="d-flex align-items-center">
                            <svg className="me-1" style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Vence: {formatDate(task.fecha_fin)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {canManage && (onEdit || onDelete) && (
                      <div className="d-flex gap-1 ms-2">
                        {onEdit && (
                          <button
                            type="button"
                            className="btn btn-sm btn-dark"
                            onClick={() => onEdit(task)}
                            title="Editar tarea"
                            style={{
                              borderRadius: '6px',
                              fontSize: '0.8125rem',
                              padding: '0.375rem 0.5rem'
                            }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => onDelete(task)}
                            title="Eliminar tarea"
                            style={{
                              borderRadius: '6px',
                              fontSize: '0.8125rem',
                              padding: '0.375rem 0.5rem'
                            }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksCard;
