import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import ActionButton from '../components/common/ActionButton';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import taskService from '../services/taskService';

/**
 * TasksPage - Página principal de gestión de tareas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Gestiona la vista principal de tareas
 * - Open/Closed: Abierto para extensión (nuevas funcionalidades)
 * - Liskov Substitution: Puede ser sustituido por otras páginas de gestión
 * - Interface Segregation: Componentes específicos para cada funcionalidad
 * - Dependency Inversion: Depende de abstracciones (taskService)
 */

const TasksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados principales
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados de modales y vistas
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'
  
  // Estados de datos seleccionados
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  
  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    estado: '',
    prioridad: '',
    usuario_asignado_id: '',
    proyecto_id: '',
    fecha_inicio: '',
    fecha_limite: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
    
    // Verificar parámetros de URL
    const taskId = searchParams.get('id');
    const projectId = searchParams.get('project');
    
    if (projectId) {
      setFilters(prev => ({ ...prev, proyecto_id: projectId }));
    }
  }, [searchParams, refreshTrigger]);

  /**
   * Cargar lista de tareas
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        page: 1,
        limit: 50
      };
      
      const response = await taskService.getAllTasks(queryParams);
      
      if (response.success) {
        setTasks(response.data.tasks || []);
      } else {
        throw new Error(response.message || 'Error al cargar tareas');
      }
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar lista de tareas
   */
  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  /**
   * Manejar cambios en filtros
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    refreshTasks();
  };

  /**
   * Manejar cambio en término de búsqueda
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  /**
   * Mostrar formulario para crear tarea
   */
  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormMode('create');
    setShowForm(true);
  };

  /**
   * Mostrar formulario para editar tarea
   */
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormMode('edit');
    setShowForm(true);
  };

  /**
   * Ver detalles de la tarea (expandir información)
   */
  const handleViewTask = (task) => {
    // Por ahora solo mostramos el formulario en modo lectura
    // En el futuro se puede implementar una vista de detalle específica
    setSelectedTask(task);
    setFormMode('view');
    setShowForm(true);
  };

  /**
   * Confirmar eliminación de tarea
   */
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  /**
   * Ejecutar eliminación de tarea
   */
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      
      const response = await taskService.deleteTask(taskToDelete.id);
      
      if (response.success) {
        // Refrescar lista de tareas
        refreshTasks();
        
        console.log('Tarea eliminada exitosamente');
      } else {
        throw new Error(response.message || 'Error al eliminar tarea');
      }
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setTaskToDelete(null);
    }
  };

  /**
   * Manejar envío del formulario
   */
  const handleFormSubmit = async (taskData) => {
    try {
      setLoading(true);
      let response;

      if (formMode === 'create') {
        response = await taskService.createTask(taskData);
      } else if (formMode === 'edit') {
        response = await taskService.updateTask(selectedTask.id, taskData);
      }

      if (response.success) {
        // Refrescar lista de tareas
        refreshTasks();
        
        // Cerrar formulario
        setShowForm(false);
        setSelectedTask(null);
        
        console.log(`Tarea ${formMode === 'create' ? 'creada' : 'actualizada'} exitosamente`);
      } else {
        throw new Error(response.message || `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} tarea`);
      }
    } catch (err) {
      console.error('Error en formulario:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar estado de la tarea
   */
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      
      if (response.success) {
        // Refrescar tareas
        refreshTasks();
        
        console.log('Estado de la tarea actualizado exitosamente');
      } else {
        throw new Error(response.message || 'Error al cambiar estado de la tarea');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar modo de vista
   */
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Renderizar barra de filtros y búsqueda
  const renderFiltersBar = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Búsqueda */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por título, descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado}
            onChange={(e) => handleFiltersChange({ ...filters, estado: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="en_revision">En Revisión</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Filtro por prioridad */}
        <div>
          <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="prioridad"
            value={filters.prioridad}
            onChange={(e) => handleFiltersChange({ ...filters, prioridad: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        {/* Fecha límite desde */}
        <div>
          <label htmlFor="fecha_limite" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Límite
          </label>
          <input
            type="date"
            id="fecha_limite"
            value={filters.fecha_limite}
            onChange={(e) => handleFiltersChange({ ...filters, fecha_limite: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botón limpiar filtros */}
        <div className="flex items-end">
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilters({
                estado: '',
                prioridad: '',
                usuario_asignado_id: '',
                proyecto_id: '',
                fecha_inicio: '',
                fecha_limite: ''
              });
              setSearchTerm('');
              refreshTasks();
            }}
            className="w-full"
          >
            Limpiar
          </ActionButton>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido principal
  const renderMainContent = () => {
    if (loading && tasks.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" message="Cargando tareas..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar tareas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <ActionButton
                  variant="danger"
                  size="sm"
                  onClick={refreshTasks}
                >
                  Reintentar
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Barra de filtros */}
        {renderFiltersBar()}

        {/* Lista de tareas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TaskList
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onView={handleViewTask}
            onStatusChange={handleStatusChange}
            showActions={true}
            filters={filters}
            searchTerm={searchTerm}
            refreshTrigger={refreshTrigger}
            viewMode={viewMode}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Tareas
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra y supervisa todas las tareas ({tasks.length})
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Selector de vista */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => handleViewModeChange('table')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>

              {/* Botón crear tarea */}
              <ActionButton
                variant="primary"
                onClick={handleCreateTask}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nueva Tarea</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </div>

      {/* Modal para formulario */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === 'create' ? 'Crear Nueva Tarea' : 
          formMode === 'edit' ? 'Editar Tarea' : 
          'Detalles de la Tarea'
        }
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteTask}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar la tarea "${taskToDelete?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default TasksPage;