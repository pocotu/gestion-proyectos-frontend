import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import projectService from '../services/projectService';
import '../styles/projects.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // Estados principales
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados de formularios
  const [formMode, setFormMode] = useState('create');
  const [projectForm, setProjectForm] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificacion'
  });

  // Estados de selección
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    estado: ''
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  // Cargar proyectos
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      console.log('Response from API:', response);

      // Según el backend, la respuesta tiene esta estructura:
      // { success: true, projects: [...], data: { pagination: {...} } }
      const projectsData = response.projects || response.data || [];

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos');
      addNotification('Error al cargar los proyectos', 'error');
      setProjects([]); // Asegurar que projects sea siempre un array
    } finally {
      setLoading(false);
    }
  };

  // Manejar creación/edición de proyecto
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        await projectService.createProject(projectForm);
        addNotification('Proyecto creado exitosamente', 'success');
      } else {
        await projectService.updateProject(selectedProject.id, projectForm);
        addNotification('Proyecto actualizado exitosamente', 'success');
      }

      setShowProjectForm(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      addNotification(
        formMode === 'create' ? 'Error al crear el proyecto' : 'Error al actualizar el proyecto',
        'error'
      );
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setProjectForm({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificacion'
    });
    setSelectedProject(null);
    setFormMode('create');
  };

  // Abrir formulario de creación
  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setShowProjectForm(true);
  };

  // Abrir formulario de edición
  const openEditForm = (project) => {
    setSelectedProject(project);
    setProjectForm({
      titulo: project.titulo || '',
      descripcion: project.descripcion || '',
      fecha_inicio: project.fecha_inicio ? project.fecha_inicio.split('T')[0] : '',
      fecha_fin: project.fecha_fin ? project.fecha_fin.split('T')[0] : '',
      estado: project.estado || 'planificacion'
    });
    setFormMode('edit');
    setShowProjectForm(true);
  };

  // Confirmar eliminación
  const confirmDelete = (project) => {
    setSelectedProject(project);
    setShowConfirmDialog(true);
  };

  // Eliminar proyecto
  const handleDelete = async () => {
    try {
      await projectService.deleteProject(selectedProject.id);
      addNotification('Proyecto eliminado exitosamente', 'success');
      setShowConfirmDialog(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      addNotification('Error al eliminar el proyecto', 'error');
    }
  };

  // Navegar a detalles del proyecto
  const navigateToProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Filtrar proyectos
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(project => {
    const matchesSearch = project.titulo?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.descripcion?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesEstado = !filters.estado || project.estado === filters.estado;

    return matchesSearch && matchesEstado;
  });

  // Obtener clase de badge para el estado
  const getStatusBadgeClass = (estado) => {
    const classes = {
      planificacion: 'bg-primary text-white',
      en_progreso: 'bg-warning text-dark',
      completado: 'bg-success text-white',
      cancelado: 'bg-danger text-white'
    };
    return classes[estado] || 'bg-secondary text-white';
  };

  // Formatear estado para mostrar
  const formatStatus = (estado) => {
    const formats = {
      planificacion: 'Planificación',
      en_progreso: 'En Progreso',
      completado: 'Completado',
      cancelado: 'Cancelado'
    };
    return formats[estado] || 'Sin estado';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Header limpio y profesional */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 mb-2 text-primary fw-bold">Proyectos</h1>
            <p className="text-muted mb-0">Gestiona y supervisa todos tus proyectos</p>
          </div>
          <button
            onClick={openCreateForm}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Barra de filtros moderna */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="position-relative">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="position-absolute text-muted"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="form-control ps-5"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="form-select"
              >
                <option value="">Todos los estados</option>
                <option value="planificacion">Planificación</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-4">
              <button
                onClick={() => setFilters({ search: '', estado: '' })}
                className="btn btn-outline-secondary w-100"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Contenido principal */}
      <div className="projects-content">
        {filteredProjects.length === 0 && !error ? (
          <div className="empty-state text-center py-5">
            <div className="empty-state-icon mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-3 p-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="h4 mb-3 text-dark">Sin proyectos aún</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
              Crea tu primer proyecto para comenzar a organizar tus tareas y colaborar con tu equipo.
            </p>
            <button
              onClick={openCreateForm}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="col-lg-4 col-md-6">
                <div
                  className="card h-100 border-0 shadow-sm project-card"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => navigateToProject(project.id)}
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
                        {project.titulo}
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
                                openEditForm(project);
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
                                confirmDelete(project);
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
                      {project.descripcion || 'Sin descripción'}
                    </p>

                    {/* Estado */}
                    <div className="d-flex gap-2 mb-3">
                      <span className={`badge ${getStatusBadgeClass(project.estado)} px-2 py-1`} style={{ fontSize: '0.75rem' }}>
                        {formatStatus(project.estado)}
                      </span>
                    </div>

                    {/* Fechas */}
                    {(project.fecha_inicio || project.fecha_fin) && (
                      <div className="border-top pt-3 mt-auto">
                        <div className="row g-0 text-muted" style={{ fontSize: '0.8rem' }}>
                          {project.fecha_inicio && (
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
                                {new Date(project.fecha_inicio).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          )}
                          {project.fecha_fin && (
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
                                {new Date(project.fecha_fin).toLocaleDateString('es-ES')}
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
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        title={formMode === 'create' ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
      >
        <form onSubmit={handleProjectSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={projectForm.titulo}
              onChange={(e) => setProjectForm({ ...projectForm, titulo: e.target.value })}
              className="form-control"
              placeholder="Ingresa el título del proyecto"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">
              Descripción
            </label>
            <textarea
              value={projectForm.descripcion}
              onChange={(e) => setProjectForm({ ...projectForm, descripcion: e.target.value })}
              rows={3}
              className="form-control"
              placeholder="Describe el proyecto"
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={projectForm.fecha_inicio}
                onChange={(e) => setProjectForm({ ...projectForm, fecha_inicio: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-medium">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={projectForm.fecha_fin}
                onChange={(e) => setProjectForm({ ...projectForm, fecha_fin: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">
              Estado
            </label>
            <select
              value={projectForm.estado}
              onChange={(e) => setProjectForm({ ...projectForm, estado: e.target.value })}
              className="form-select"
            >
              <option value="planificacion">Planificación</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              onClick={() => setShowProjectForm(false)}
              className="btn btn-outline-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {formMode === 'create' ? 'Crear Proyecto' : 'Actualizar Proyecto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${selectedProject?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ProjectsPage;