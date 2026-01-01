import { useMemo, useState } from 'react';
import taskService from '../../services/taskService';
import '../../styles/kanban.css';

// Drag and Drop imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * ProjectKanbanBoard - Kanban board with drag & drop for project tasks
 * Displays tasks organized by status columns with drag and drop functionality
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of tasks
 * @param {number} props.projectId - Project ID
 * @returns {JSX.Element}
 */
const ProjectKanbanBoard = ({ tasks = [], projectId }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  // Update local tasks when props change
  useMemo(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Configure sensors for drag (requires 8px of movement for better UX)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  /**
   * Group tasks by status
   */
  const tasksByStatus = useMemo(() => {
    const groups = {
      pendiente: [],
      en_progreso: [],
      completada: [],
      cancelada: []
    };

    localTasks.forEach(task => {
      if (groups[task.estado]) {
        groups[task.estado].push(task);
      }
    });

    return groups;
  }, [localTasks]);

  /**
   * Kanban columns configuration
   */
  const columns = [
    {
      id: 'pendiente',
      title: 'Pendiente',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      tasks: tasksByStatus.pendiente
    },
    {
      id: 'en_progreso',
      title: 'En Progreso',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      tasks: tasksByStatus.en_progreso
    },
    {
      id: 'completada',
      title: 'Completada',
      color: '#10b981',
      bgColor: '#d1fae5',
      tasks: tasksByStatus.completada
    },
    {
      id: 'cancelada',
      title: 'Cancelada',
      color: '#ef4444',
      bgColor: '#fee2e2',
      tasks: tasksByStatus.cancelada
    }
  ];

  /**
   * Get priority badge class
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
   * Get priority label
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
   * Format date to DD/MM/YYYY
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
   * Handler for drag start
   */
  const handleDragStart = (event) => {
    const { active } = event;
    const task = localTasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  /**
   * Handler for drag end
   * Updates task status when dropped in new column
   */
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    let newStatus = over.id;

    // Resolve status: if dropped over a task, get its status
    const validStatuses = ['pendiente', 'en_progreso', 'completada', 'cancelada'];

    if (!validStatuses.includes(newStatus)) {
      // over.id is a task ID, need to find its status
      const overTask = localTasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.estado;
      } else {
        setActiveTask(null);
        return;
      }
    }

    // If dropped in same column, do nothing
    const task = localTasks.find(t => t.id === taskId);
    if (!task || task.estado === newStatus) {
      setActiveTask(null);
      return;
    }

    // Update task status
    await updateTaskStatus(taskId, newStatus);
    setActiveTask(null);
  };

  /**
   * Update task status in backend
   */
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Optimistic update for better UX
      setLocalTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, estado: newStatus } : task
        )
      );

      // Update in backend
      await taskService.updateTask(taskId, { estado: newStatus });

    } catch (error) {
      console.error('Error al actualizar estado de tarea:', error);
      // Revert change if fails
      setLocalTasks(tasks);
    }
  };

  /**
   * Draggable Task Card Component
   */
  const DraggableTaskCard = ({ task, column }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    const overdue = isOverdue(task);

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`kanban-card ${overdue ? 'kanban-card-overdue' : ''}`}
      >
        {/* Task Title */}
        <h6 className="kanban-card-title">
          {task.titulo}
        </h6>

        {/* Task Description */}
        {task.descripcion && (
          <p className="kanban-card-description">
            {task.descripcion}
          </p>
        )}

        {/* Task Badges */}
        <div className="kanban-card-badges">
          <span className={getPriorityBadgeClass(task.prioridad)}>
            {getPriorityLabel(task.prioridad)}
          </span>
          {overdue && (
            <span className="badge bg-danger">
              Vencida
            </span>
          )}
        </div>

        {/* Task Footer */}
        <div className="kanban-card-footer">
          {task.assignee_name && (
            <div className="kanban-card-assignee">
              <div 
                className="kanban-assignee-avatar"
                title={task.assignee_name}
              >
                {task.assignee_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          {task.fecha_fin && (
            <div className="kanban-card-date">
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(task.fecha_fin)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Droppable Column Component
   * Makes empty columns also valid drop zones
   */
  const DroppableColumn = ({ column, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    return (
      <div
        ref={setNodeRef}
        className="kanban-column-content"
        style={{
          backgroundColor: isOver ? `${column.color}10` : 'transparent',
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        <div className="kanban-columns">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              {/* Column Header */}
              <div 
                className="kanban-column-header"
                style={{ 
                  backgroundColor: column.bgColor,
                  borderLeft: `4px solid ${column.color}`
                }}
              >
                <h4 className="kanban-column-title" style={{ color: column.color }}>
                  {column.title}
                </h4>
                <span className="kanban-column-count">{column.tasks.length}</span>
              </div>

              {/* Column Content - Droppable zone */}
              <SortableContext
                id={column.id}
                items={column.tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn column={column}>
                  {column.tasks.length === 0 ? (
                    <div className="kanban-empty-state">
                      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                        No hay tareas
                      </p>
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        column={column}
                      />
                    ))
                  )}
                </DroppableColumn>
              </SortableContext>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for dragging task */}
      <DragOverlay>
        {activeTask ? (
          <div
            className="kanban-card"
            style={{
              cursor: 'grabbing',
              opacity: 0.9,
            }}
          >
            <h6 className="kanban-card-title">
              {activeTask.titulo}
            </h6>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectKanbanBoard;
