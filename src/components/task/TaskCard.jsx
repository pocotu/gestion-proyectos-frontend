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
    <div className={`bg-white rounded border border-gray-200 hover:shadow-sm transition-shadow duration-200 ${className}`}>
      <div className="p-2">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 truncate flex-1">
            {task.titulo}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(task.prioridad)} ml-2`}>
            {task.prioridad?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Estado y progreso en una línea */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(task.estado)}`}>
            {task.estado?.replace('_', ' ')}
          </span>
          
          {task.progreso !== undefined && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">{task.progreso}%</span>
              <div className="w-8 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full"
                  style={{ width: `${task.progreso}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Fechas compactas */}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>📅 {formatDate(task.fecha_limite)}</span>
          {daysRemaining !== null && (
            <span className={
              isOverdue() 
                ? 'text-red-600' 
                : daysRemaining <= 3 
                  ? 'text-yellow-600'
                  : 'text-gray-500'
            }>
              {isOverdue() 
                ? `⚠️ ${Math.abs(daysRemaining)}d`
                : daysRemaining === 0
                  ? '⏰ Hoy'
                  : `${daysRemaining}d`
              }
            </span>
          )}
        </div>

        {/* Asignado compacto */}
        {task.asignado_nombre && (
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center mr-1">
              <span className="text-xs font-medium text-gray-700">
                {task.asignado_nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="truncate">{task.asignado_nombre}</span>
          </div>
        )}

        {/* Acciones compactas */}
        {showActions && (
          <div className="flex items-center justify-end space-x-1 pt-1 border-t border-gray-100">
            {onView && (
              <button
                onClick={() => onView(task)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Ver detalles"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {onStatusChange && task.estado !== 'completada' && (
              <button
                onClick={() => onStatusChange(task.id, 'completada')}
                className="p-1 text-green-400 hover:text-green-600 transition-colors"
                title="Completar"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(task)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;