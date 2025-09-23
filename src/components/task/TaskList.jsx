import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import TaskCard from './TaskCard';
import taskService from '../../services/taskService';

/**
 * TaskList - Componente para listar tareas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar la lista de tareas
 * - Open/Closed: Abierto para extensión (nuevas columnas, filtros)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de lista
 * - Interface Segregation: Props específicas para configuración de lista
 * - Dependency Inversion: Depende de abstracciones (taskService)
 */

const TaskList = ({ 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange,
  showActions = true,
  filters = {},
  searchTerm = '',
  refreshTrigger = 0,
  projectId = null,
  viewMode = 'table' // 'table' o 'cards'
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Cargar tareas
  useEffect(() => {
    loadTasks();
  }, [refreshTrigger, projectId, pagination.page]);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    applyFilters();
  }, [tasks, filters, searchTerm]);

  /**
   * Cargar tareas desde el servidor
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      if (projectId) {
        response = await taskService.getTasksByProject(projectId, params);
      } else {
        response = await taskService.getAllTasks(params);
      }

      if (response.success) {
        // El backend devuelve {success, data: {tasks, pagination}}
        const responseData = response.data || {};
        setTasks(responseData.tasks || []);
        if (responseData.pagination) {
          setPagination(prev => ({
            ...prev,
            ...responseData.pagination
          }));
        }
      } else {
        throw new Error(response.message || 'Error al cargar tareas');
      }

    } catch (error) {
      console.error('Error cargando tareas:', error);
      setError(error.message || 'Error al cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar filtros y búsqueda
   */
  const applyFilters = () => {
    let filtered = [...tasks];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.titulo?.toLowerCase().includes(term) ||
        task.descripcion?.toLowerCase().includes(term) ||
        task.estado?.toLowerCase().includes(term) ||
        task.proyecto_titulo?.toLowerCase().includes(term) ||
        task.asignado_nombre?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros adicionales
    if (filters.estado) {
      filtered = filtered.filter(task => task.estado === filters.estado);
    }

    if (filters.prioridad) {
      filtered = filtered.filter(task => task.prioridad === filters.prioridad);
    }

    if (filters.usuario_asignado_id) {
      filtered = filtered.filter(task => 
        task.usuario_asignado_id === parseInt(filters.usuario_asignado_id)
      );
    }

    if (filters.fecha_inicio) {
      filtered = filtered.filter(task => 
        task.fecha_inicio && new Date(task.fecha_inicio) >= new Date(filters.fecha_inicio)
      );
    }

    if (filters.fecha_limite) {
      filtered = filtered.filter(task => 
        task.fecha_limite && new Date(task.fecha_limite) <= new Date(filters.fecha_limite)
      );
    }

    setFilteredTasks(filtered);
  };

  /**
   * Manejar cambio de estado de tarea
   */
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (onStatusChange) {
        await onStatusChange(taskId, newStatus);
      } else {
        await taskService.updateTaskStatus(taskId, newStatus);
      }
      loadTasks(); // Recargar lista
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  /**
   * Obtener color de prioridad
   */
  const getPriorityColor = (prioridad) => {
    const colors = {
      'baja': 'text-green-600',
      'media': 'text-yellow-600',
      'alta': 'text-orange-600',
      'critica': 'text-red-600'
    };
    return colors[prioridad] || 'text-gray-600';
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Configuración de columnas para la tabla
   */
  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      render: (task) => (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {task.titulo}
          </p>
          {task.proyecto_titulo && (
            <p className="text-sm text-gray-500 truncate">
              {task.proyecto_titulo}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (task) => (
        <StatusBadge 
          status={task.estado}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            task.estado === 'completada' ? 'bg-green-100 text-green-800' :
            task.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
            task.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
            task.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}
        />
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      render: (task) => (
        <span className={`text-sm font-medium ${getPriorityColor(task.prioridad)}`}>
          {task.prioridad?.charAt(0).toUpperCase() + task.prioridad?.slice(1)}
        </span>
      )
    },
    {
      key: 'asignado_nombre',
      label: 'Asignado',
      render: (task) => (
        <div className="flex items-center">
          {task.asignado_nombre ? (
            <>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-gray-700">
                  {task.asignado_nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-900">{task.asignado_nombre}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Sin asignar</span>
          )}
        </div>
      )
    },
    {
      key: 'fecha_limite',
      label: 'Fecha Límite',
      render: (task) => {
        const isOverdue = task.fecha_limite && new Date(task.fecha_limite) < new Date() && task.estado !== 'completada';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
            {formatDate(task.fecha_limite)}
          </span>
        );
      }
    },
    {
      key: 'progreso',
      label: 'Progreso',
      render: (task) => (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{task.progreso || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${task.progreso || 0}%` }}
            ></div>
          </div>
        </div>
      )
    }
  ];

  // Agregar columna de acciones si es necesario
  if (showActions) {
    columns.push({
      key: 'actions',
      label: 'Acciones',
      render: (task) => (
        <div className="flex items-center space-x-2">
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
              data-testid="edit-task-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </ActionButton>
          )}

          {task.estado !== 'completada' && (
            <ActionButton
              variant="success"
              size="sm"
              onClick={() => handleStatusChange(task.id, 'completada')}
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
      )
    });
  }

  if (loading) {
    return <LoadingSpinner message="Cargando tareas..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar tareas</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <ActionButton
            variant="danger"
            size="sm"
            onClick={loadTasks}
          >
            Reintentar
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="tasks-list">
      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {filteredTasks.length} de {tasks.length} tareas
        </div>
        
        {searchTerm && (
          <div className="text-sm text-gray-500">
            Filtrado por: "{searchTerm}"
          </div>
        )}
      </div>

      {/* Lista de tareas */}
      {filteredTasks.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onStatusChange={handleStatusChange}
                showActions={showActions}
              />
            ))}
          </div>
        ) : (
          <DataTable
            data={filteredTasks}
            columns={columns}
            keyField="id"
            className="shadow-sm"
            rowTestId="task-row"
          />
        )
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'No se encontraron tareas que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primera tarea.'
            }
          </p>
        </div>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pagination.page === pageNum
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;