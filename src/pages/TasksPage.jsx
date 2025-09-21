import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskList from '../components/task/TaskList';
import TaskForm from '../components/task/TaskForm';
import ActionButton from '../components/common/ActionButton';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import taskService from '../services/taskService';
import fileService from '../services/fileService';

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
        
        // Si se creó exitosamente y hay archivos, subirlos
        if (response.success && taskData.files && taskData.files.length > 0) {
          try {
            await fileService.uploadTaskFiles(response.data.id, taskData.files);
          } catch (fileError) {
            console.error('Error al subir archivos:', fileError);
            // No fallar completamente, solo mostrar advertencia
          }
        }
      } else if (formMode === 'edit') {
        response = await taskService.updateTask(selectedTask.id, taskData);
        
        // Si se actualizó exitosamente y hay archivos nuevos, subirlos
        if (response.success && taskData.files && taskData.files.length > 0) {
          try {
            await fileService.uploadTaskFiles(selectedTask.id, taskData.files);
          } catch (fileError) {
            console.error('Error al subir archivos:', fileError);
            // No fallar completamente, solo mostrar advertencia
          }
        }
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
    <div>
      <div>
        {/* Búsqueda */}
        <div>
          <label htmlFor="search">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por título, descripción..."
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="estado">
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado}
            onChange={(e) => handleFiltersChange({ ...filters, estado: e.target.value })}
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
          <label htmlFor="prioridad">
            Prioridad
          </label>
          <select
            id="prioridad"
            value={filters.prioridad}
            onChange={(e) => handleFiltersChange({ ...filters, prioridad: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        {/* Filtro por fecha límite */}
        <div>
          <label htmlFor="fecha_limite">
            Fecha Límite
          </label>
          <input
            type="date"
            id="fecha_limite"
            value={filters.fecha_limite}
            onChange={(e) => handleFiltersChange({ ...filters, fecha_limite: e.target.value })}
          />
        </div>

        <div>
          <button
            onClick={handleClearFilters}
            type="button"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar estado de carga
  const renderLoading = () => (
    <div>
      <div>Cargando tareas...</div>
    </div>
  );

  // Renderizar estado de error
  const renderError = () => (
    <div>
      <div>
        <div>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3>
            Error al cargar las tareas
          </h3>
          <div>
            <p>{error}</p>
          </div>
          <div>
            <button
              onClick={() => window.location.reload()}
              type="button"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido principal
  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();

    return (
      <div>
        {renderFiltersBar()}
        <div>
          <TaskList
            tasks={filteredTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <div>
            <div>
              <h1>
                Gestión de Tareas
              </h1>
              <p>
                Administra y organiza todas las tareas del sistema
              </p>
            </div>

            <div>
              {/* Botones de acción */}
              <div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  type="button"
                  data-testid="create-task-button"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Tarea
                </button>

                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  type="button"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Acciones en Lote
                </button>

                <button
                  onClick={handleExport}
                  type="button"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div>
        {renderContent()}
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