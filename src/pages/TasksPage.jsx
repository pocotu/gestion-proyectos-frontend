import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import '../styles/projects.css';

const TasksPage = () => {
  const navigate = useNavigate();
  
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
  const [openMenuId, setOpenMenuId] = useState(null);
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

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && !event.target.closest('.task-menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Cargar tareas
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      console.log('Response from tasks API:', response);

      // Manejar diferentes estructuras de respuesta
      const tasksData = response.data?.tasks || response.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setError('Error al cargar las tareas');
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
              } else {
        await taskService.updateTask(selectedTask.id, taskForm);
              }

      setShowTaskForm(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
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
            setShowConfirmDialog(false);
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
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

  // Estado para vista (Kanban o Lista)
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' o 'list'

  // Agrupar tareas por estado para Kanban (SRP - Single Responsibility)
  const groupTasksByStatus = () => {
    const grouped = {
      pendiente: [],
      en_progreso: [],
      completada: [],
      cancelada: []
    };

    filteredTasks.forEach(task => {
      if (grouped[task.estado]) {
        grouped[task.estado].push(task);
      }
    });

    return grouped;
  };

  const tasksByStatus = groupTasksByStatus();

  // Configuración de columnas Kanban (DRY - Don't Repeat Yourself)
  const kanbanColumns = [
    { 
      id: 'pendiente', 
      title: 'Pendiente', 
      color: '#6c757d',
      icon: 'bi-pause-circle'
    },
    { 
      id: 'en_progreso', 
      title: 'En Progreso', 
      color: '#0d6efd',
      icon: 'bi-arrow-repeat'
    },
    { 
      id: 'completada', 
      title: 'Completada', 
      color: '#198754',
      icon: 'bi-check-circle'
    },
    { 
      id: 'cancelada', 
      title: 'Cancelada', 
      color: '#dc3545',
      icon: 'bi-x-circle'
    }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Moderno */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1 fw-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.5px', fontSize: '1.75rem' }}>
                Gestión de Tareas
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} en total
              </p>
            </div>
            <div className="d-flex gap-2">
              {/* Toggle Vista */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'kanban' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('kanban')}
                  style={{ 
                    borderRadius: '8px 0 0 8px',
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <i className="bi bi-kanban me-1"></i>
                  Kanban
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                  style={{ 
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <i className="bi bi-list-ul me-1"></i>
                  Lista
                </button>
              </div>
              
              <button
                onClick={openCreateForm}
                className="btn btn-dark d-flex align-items-center"
                style={{ 
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1.25rem',
                  fontWeight: '500'
                }}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Nueva Tarea
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Minimalistas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-lg-4 col-md-6">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute" style={{ 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6c757d',
                      fontSize: '0.9rem'
                    }}></i>
                    <input
                      type="text"
                      placeholder="Buscar tareas..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="form-control"
                      style={{ 
                        paddingLeft: '2.5rem',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-2 col-md-6">
                  <select
                    value={filters.prioridad}
                    onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
                    className="form-select"
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Prioridad</option>
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
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Todos los proyectos</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <button
                    onClick={() => setFilters({ search: '', estado: '', prioridad: '', proyecto_id: '' })}
                    className="btn btn-outline-secondary w-100"
                    style={{ 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Limpiar filtros
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
      {filteredTasks.length === 0 && !error ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: '80px', height: '80px', backgroundColor: '#f8f9fa' }}>
              <i className="bi bi-clipboard-check" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            </div>
          </div>
          <h3 className="h4 mb-3" style={{ color: '#1a1a1a', fontWeight: '600' }}>Sin tareas aún</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
            Crea tu primera tarea para comenzar a organizar tu trabajo
          </p>
          <button
            onClick={openCreateForm}
            className="btn btn-dark"
            style={{ borderRadius: '8px', padding: '0.625rem 1.5rem' }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Crear primera tarea
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Vista Kanban */
        <div className="row g-3">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ 
                borderRadius: '12px',
                backgroundColor: '#ffffff'
              }}>
                {/* Header de columna */}
                <div className="card-header border-0 bg-transparent pt-3 pb-2 px-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className={column.icon} style={{ fontSize: '1rem', color: column.color }}></i>
                      <h6 className="mb-0 fw-semibold" style={{ 
                        fontSize: '0.875rem',
                        color: '#1a1a1a'
                      }}>
                        {column.title}
                      </h6>
                    </div>
                    <span className="badge rounded-pill" style={{ 
                      backgroundColor: `${column.color}15`,
                      color: column.color,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem'
                    }}>
                      {tasksByStatus[column.id].length}
                    </span>
                  </div>
                </div>

                {/* Tareas de la columna */}
                <div className="card-body p-2" style={{ 
                  maxHeight: 'calc(100vh - 320px)',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                  <div className="d-flex flex-column gap-2">
                    {tasksByStatus[column.id].map((task) => (
                      <div
                        key={task.id}
                        className="card border-0 shadow-sm"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${column.color}`
                        }}
                        onClick={() => navigateToTask(task.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                      >
                        <div className="card-body p-3">
                          {/* Header de tarea */}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0 fw-semibold" style={{ 
                              fontSize: '0.875rem',
                              color: '#1a1a1a',
                              lineHeight: '1.4',
                              flex: 1,
                              paddingRight: '8px'
                            }}>
                              {task.titulo}
                            </h6>
                            <div className="task-menu-container" style={{ position: 'relative', flexShrink: 0 }}>
                              <button
                                className="btn btn-sm border-0 task-menu-button"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === task.id ? null : task.id);
                                }}
                                style={{ 
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  transition: 'all 0.15s ease',
                                  backgroundColor: openMenuId === task.id ? '#e5e7eb' : '#f3f4f6',
                                  padding: 0,
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: '#374151',
                                  lineHeight: 1
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                                }}
                                onMouseLeave={(e) => {
                                  if (openMenuId !== task.id) {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                  }
                                }}
                              >
                                ⋮
                              </button>
                              {openMenuId === task.id && (
                                <div 
                                  className="task-menu-dropdown"
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '4px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    border: '1px solid #e9ecef',
                                    minWidth: '140px',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="task-menu-item"
                                    style={{
                                      width: '100%',
                                      padding: '10px 14px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      color: '#374151',
                                      fontSize: '0.875rem',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      transition: 'background-color 0.15s ease',
                                      fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      openEditForm(task);
                                    }}
                                  >
                                    <i className="bi bi-pencil" style={{ fontSize: '0.9rem' }}></i>
                                    Editar
                                  </button>
                                  <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '0' }}></div>
                                  <button
                                    className="task-menu-item"
                                    style={{
                                      width: '100%',
                                      padding: '10px 14px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      color: '#dc3545',
                                      fontSize: '0.875rem',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      transition: 'background-color 0.15s ease',
                                      fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      confirmDelete(task);
                                    }}
                                  >
                                    <i className="bi bi-trash" style={{ fontSize: '0.9rem' }}></i>
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Descripción */}
                          {task.descripcion && (
                            <p className="text-muted mb-2" style={{
                              fontSize: '0.75rem',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {task.descripcion}
                            </p>
                          )}

                          {/* Prioridad */}
                          {task.prioridad && (
                            <div className="mb-2">
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                backgroundColor: task.prioridad === 'alta' ? '#dc354515' : 
                                                task.prioridad === 'media' ? '#ffc10715' : '#19875415',
                                color: task.prioridad === 'alta' ? '#dc3545' : 
                                       task.prioridad === 'media' ? '#ffc107' : '#198754',
                                fontWeight: '600'
                              }}>
                                {task.prioridad === 'alta' ? 'Alta' : 
                                 task.prioridad === 'media' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                            {task.proyecto_id && (
                              <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                <i className="bi bi-folder2"></i>
                                <span style={{
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {getProjectName(task.proyecto_id)}
                                </span>
                              </small>
                            )}
                            {task.fecha_fin && (
                              <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                <i className="bi bi-calendar3"></i>
                                {new Date(task.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Lista */
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th className="border-0 py-3 px-4" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>TAREA</th>
                        <th className="border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>PROYECTO</th>
                        <th className="border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>ESTADO</th>
                        <th className="border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>PRIORIDAD</th>
                        <th className="border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>FECHA FIN</th>
                        <th className="border-0 py-3 px-4" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr 
                          key={task.id} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigateToTask(task.id)}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
                                {task.titulo}
                              </div>
                              {task.descripcion && (
                                <div className="text-muted" style={{ 
                                  fontSize: '0.75rem',
                                  maxWidth: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {task.descripcion}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                              {getProjectName(task.proyecto_id)}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`badge ${getStatusBadgeClass(task.estado)}`} style={{ fontSize: '0.75rem' }}>
                              {formatStatus(task.estado)}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="d-flex align-items-center gap-1" style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: task.prioridad === 'alta' ? '#dc354515' : 
                                              task.prioridad === 'media' ? '#ffc10715' : '#19875415',
                              color: task.prioridad === 'alta' ? '#dc3545' : 
                                     task.prioridad === 'media' ? '#ffc107' : '#198754',
                              fontWeight: '600'
                            }}>
                              <i className={`bi ${task.prioridad === 'alta' ? 'bi-exclamation-circle' : 
                                                  task.prioridad === 'media' ? 'bi-dash-circle' : 'bi-arrow-down-circle'}`}
                                 style={{ fontSize: '0.7rem' }}></i>
                              {task.prioridad || 'Media'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                              {task.fecha_fin ? new Date(task.fecha_fin).toLocaleDateString('es-ES') : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditForm(task);
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(task);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
