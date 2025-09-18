import React from 'react';
import StatusBadge from '../common/StatusBadge';
import ActionButton from '../common/ActionButton';

/**
 * TaskCard - Componente para mostrar una tarea individual
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar información de una tarea
 * - Open/Closed: Abierto para extensión (nuevos campos, acciones)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de tarjeta
 * - Interface Segregation: Props específicas para configuración de la tarjeta
 * - Dependency Inversion: No depende de implementaciones concretas
 */

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange,
  showActions = true,
  className = '' 
}) => {
  /**
   * Obtener color de prioridad
   */
  const getPriorityColor = (prioridad) => {
    const colors = {
      'baja': 'text-green-600 bg-green-100',
      'media': 'text-yellow-600 bg-yellow-100',
      'alta': 'text-orange-600 bg-orange-100',
      'critica': 'text-red-600 bg-red-100'
    };
    return colors[prioridad] || 'text-gray-600 bg-gray-100';
  };

  /**
   * Obtener color de estado
   */
  const getStatusColor = (estado) => {
    const colors = {
      'pendiente': 'bg-gray-100 text-gray-800',
      'en_progreso': 'bg-blue-100 text-blue-800',
      'en_revision': 'bg-yellow-100 text-yellow-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Verificar si la tarea está vencida
   */
  const isOverdue = () => {
    if (!task.fecha_limite || task.estado === 'completada') return false;
    return new Date(task.fecha_limite) < new Date();
  };

  /**
   * Obtener días restantes
   */
  const getDaysRemaining = () => {
    if (!task.fecha_limite || task.estado === 'completada') return null;
    const today = new Date();
    const deadline = new Date(task.fecha_limite);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="p-4">
        {/* Header con título y prioridad */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {task.titulo}
            </h3>
            {task.proyecto_titulo && (
              <p className="text-sm text-gray-500 mt-1">
                Proyecto: {task.proyecto_titulo}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.prioridad)}`}>
              {task.prioridad?.charAt(0).toUpperCase() + task.prioridad?.slice(1)}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {task.descripcion && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.descripcion}
          </p>
        )}

        {/* Estado y fechas */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge 
            status={task.estado} 
            className={getStatusColor(task.estado)}
          />
          
          {daysRemaining !== null && (
            <div className={`text-xs px-2 py-1 rounded ${
              isOverdue() 
                ? 'bg-red-100 text-red-800' 
                : daysRemaining <= 3 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {isOverdue() 
                ? `Vencida hace ${Math.abs(daysRemaining)} días`
                : daysRemaining === 0
                  ? 'Vence hoy'
                  : daysRemaining === 1
                    ? 'Vence mañana'
                    : `${daysRemaining} días restantes`
              }
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
          <div>
            <span className="font-medium">Inicio:</span>
            <br />
            {formatDate(task.fecha_inicio)}
          </div>
          <div>
            <span className="font-medium">Límite:</span>
            <br />
            {formatDate(task.fecha_limite)}
          </div>
        </div>

        {/* Asignado */}
        {task.asignado_nombre && (
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-gray-700">
                {task.asignado_nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {task.asignado_nombre}
            </span>
          </div>
        )}

        {/* Progreso */}
        {task.progreso !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso</span>
              <span>{task.progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progreso}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Acciones */}
        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
            {onView && (
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => onView(task)}
                title="Ver detalles"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </ActionButton>
            )}

            {onEdit && (
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => onEdit(task)}
                title="Editar tarea"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </ActionButton>
            )}

            {onStatusChange && task.estado !== 'completada' && (
              <ActionButton
                variant="success"
                size="sm"
                onClick={() => onStatusChange(task.id, 'completada')}
                title="Marcar como completada"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </ActionButton>
            )}

            {onDelete && (
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => onDelete(task)}
                title="Eliminar tarea"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;