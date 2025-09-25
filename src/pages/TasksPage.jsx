import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import taskService from '../services/taskService.mock';
import projectService from '../services/projectService.mock';
import '../styles/projects.css';

const TasksPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // Estados principales
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados de formularios - Adaptado a la estructura de BD
  const [formMode, setFormMode] = useState('create');
  const [taskForm, setTaskForm] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
    prioridad: 'media',
    proyecto_id: '',
    usuario_asignado_id: ''
  });

  // Estados de selección
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    prioridad: '',
    proyecto_id: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  // Cargar tareas
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      console.log('Response from tasks API:', response);

      // Manejar diferentes estructuras de respuesta
      const tasksData = response.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setError('Error al cargar las tareas');
      addNotification('Error al cargar las tareas', 'error');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos para el selector
  const loadProjects = async () => {
    try {
      const response = await projectService.getAllProjects();
      const projectsData = response.projects || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  // Manejar creación/edición de tarea
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        await taskService.createTask(taskForm);
        addNotification('Tarea creada exitosamente', 'success');
      } else {
        await taskService.updateTask(selectedTask.id, taskForm);
        addNotification('Tarea actualizada exitosamente', 'success');
      }

      setShowTaskForm(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      addNotification(
        formMode === 'create' ? 'Error al crear la tarea' : 'Error al actualizar la tarea',
        'error'
      );
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setTaskForm({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'pendiente',
      prioridad: 'media',
      proyecto_id: '',
      usuario_asignado_id: ''
    });
    setSelectedTask(null);
  };

  // Abrir formulario de creación
  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setShowTaskForm(true);
  };

  // Abrir formulario de edición
  const openEditForm = (task) => {
    setSelectedTask(task);
    setTaskForm({
      titulo: task.titulo || '',
      descripcion: task.descripcion || '',
      fecha_inicio: task.fecha_inicio ? task.fecha_inicio.split('T')[0] : '',
      fecha_fin: task.fecha_fin ? task.fecha_fin.split('T')[0] : '',
      estado: task.estado || 'pendiente',
      prioridad: task.prioridad || 'media',
      proyecto_id: task.proyecto_id || '',
      usuario_asignado_id: task.usuario_asignado_id || ''
    });
    setFormMode('edit');
    setShowTaskForm(true);
  };

  // Confirmar eliminación
  const confirmDelete = (task) => {
    setSelectedTask(task);
    setShowConfirmDialog(true);
  };

  // Eliminar tarea
  const handleDelete = async () => {
    try {
      await taskService.deleteTask(selectedTask.id);
      addNotification('Tarea eliminada exitosamente', 'success');
      setShowConfirmDialog(false);
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      addNotification('Error al eliminar la tarea', 'error');
    }
  };

  // Navegar a detalles de la tarea
  const navigateToTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  // Filtrar tareas
  const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
    const matchesSearch = task.titulo?.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.descripcion?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesEstado = !filters.estado || task.estado === filters.estado;
    const matchesPrioridad = !filters.prioridad || task.prioridad === filters.prioridad;
    const matchesProyecto = !filters.proyecto_id || task.proyecto_id === parseInt(filters.proyecto_id);

    return matchesSearch && matchesEstado && matchesPrioridad && matchesProyecto;
  });

  // Obtener clase de badge para el estado
  const getStatusBadgeClass = (estado) => {
    const classes = {
      pendiente: 'bg-warning text-dark',
      en_progreso: 'bg-primary text-white',
      completada: 'bg-success text-white',
      cancelada: 'bg-danger text-white'
    };
    return classes[estado] || 'bg-secondary text-white';
  };

  // Obtener clase de badge para la prioridad
  const getPriorityBadgeClass = (prioridad) => {
    const classes = {
      baja: 'bg-success text-white',
      media: 'bg-warning text-dark',
      alta: 'bg-danger text-white'
    };
    return classes[prioridad] || 'bg-warning text-dark';
  };

  // Formatear estado para mostrar
  const formatStatus = (estado) => {
    const formats = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return formats[estado] || 'Sin estado';
  };

  // Obtener nombre del proyecto
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.titulo : 'Sin proyecto';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">Gestión de Tareas</h1>
              <p className="text-muted mb-0">Administra y supervisa todas las tareas del sistema</p>
            </div>
            <button
              onClick={openCreateForm}
              className="btn btn-primary d-flex align-items-center"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva Tarea
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-funnel me-2"></i>
                Filtros
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar tareas..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-2 col-md-6">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="col-lg-2 col-md-6">
                  <select
                    value={filters.prioridad}
                    onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Todas las prioridades</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <select
                    value={filters.proyecto_id}
                    onChange={(e) => setFilters({ ...filters, proyecto_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Todos los proyectos</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-md-6">
                  <button
                    onClick={() => setFilters({ search: '', estado: '', prioridad: '', proyecto_id: '' })}
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="projects-content">
        {filteredTasks.length === 0 && !error ? (
          <div className="empty-state text-center py-5">
            <div className="empty-state-icon mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-3 p-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            <h3 className="h4 mb-3 text-dark">Sin tareas aún</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
              Crea tu primera tarea para comenzar a organizar tu trabajo y hacer seguimiento del progreso.
            </p>
            <button
              onClick={openCreateForm}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Crear primera tarea
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="col-lg-4 col-md-6">
                <div
                  className="card h-100 border-0 shadow-sm project-card"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => navigateToTask(task.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                  }}
                >
                  <div className="card-body p-4">
                    {/* Header con acciones */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 text-dark fw-semibold" style={{ fontSize: '1.1rem' }}>
                        {task.titulo}
                      </h5>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-light text-muted border-0 p-1"
                          type="button"
                          data-bs-toggle="dropdown"
                          onClick={(e) => e.stopPropagation()}
                          style={{ opacity: 0.7 }}
                          onMouseEnter={(e) => e.target.style.opacity = 1}
                          onMouseLeave={(e) => e.target.style.opacity = 0.7}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(task);
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Editar
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2 text-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(task);
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              Eliminar
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="card-text text-muted mb-3" style={{
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {task.descripcion || 'Sin descripción'}
                    </p>

                    {/* Estado y prioridad */}
                    <div className="d-flex gap-2 mb-3">
                      <span className={`badge ${getStatusBadgeClass(task.estado)} px-2 py-1`} style={{ fontSize: '0.75rem' }}>
                        {formatStatus(task.estado)}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(task.prioridad)} px-2 py-1`} style={{ fontSize: '0.75rem' }}>
                        {task.prioridad || 'Media'}
                      </span>
                    </div>

                    {/* Proyecto */}
                    {task.proyecto_id && (
                      <div className="mb-3">
                        <small className="text-muted d-flex align-items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                          {getProjectName(task.proyecto_id)}
                        </small>
                      </div>
                    )}

                    {/* Fechas */}
                    {(task.fecha_inicio || task.fecha_fin) && (
                      <div className="border-top pt-3 mt-auto">
                        <div className="row g-0 text-muted" style={{ fontSize: '0.8rem' }}>
                          {task.fecha_inicio && (
                            <div className="col-6">
                              <div className="d-flex align-items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>Inicio</span>
                              </div>
                              <div className="fw-medium text-dark" style={{ fontSize: '0.8rem' }}>
                                {new Date(task.fecha_inicio).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          )}
                          {task.fecha_fin && (
                            <div className="col-6">
                              <div className="d-flex align-items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>Fin</span>
                              </div>
                              <div className="fw-medium text-dark" style={{ fontSize: '0.8rem' }}>
                                {new Date(task.fecha_fin).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        title={formMode === 'create' ? 'Crear Nueva Tarea' : 'Editar Tarea'}
      >
        <form onSubmit={handleTaskSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              value={taskForm.titulo}
              onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })}
              className="form-control"
              placeholder="Ingresa el título de la tarea"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">
              Descripción
            </label>
            <textarea
              value={taskForm.descripcion}
              onChange={(e) => setTaskForm({ ...taskForm, descripcion: e.target.value })}
              rows={3}
              className="form-control"
              placeholder="Describe la tarea"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">
              Proyecto *
            </label>
            <select
              required
              value={taskForm.proyecto_id}
              onChange={(e) => setTaskForm({ ...taskForm, proyecto_id: e.target.value })}
              className="form-select"
            >
              <option value="">Seleccionar proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={taskForm.fecha_inicio}
                onChange={(e) => setTaskForm({ ...taskForm, fecha_inicio: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={taskForm.fecha_fin}
                onChange={(e) => setTaskForm({ ...taskForm, fecha_fin: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Estado
              </label>
              <select
                value={taskForm.estado}
                onChange={(e) => setTaskForm({ ...taskForm, estado: e.target.value })}
                className="form-select"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Prioridad
              </label>
              <select
                value={taskForm.prioridad}
                onChange={(e) => setTaskForm({ ...taskForm, prioridad: e.target.value })}
                className="form-select"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="btn btn-outline-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {formMode === 'create' ? 'Crear Tarea' : 'Actualizar Tarea'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar la tarea "${selectedTask?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TasksPage;
