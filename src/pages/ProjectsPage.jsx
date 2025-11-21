import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import projectService from '../services/projectService';
import '../styles/projects.css';

const ProjectsPage = () => {
  // Escala tipográfica consistente (DRY - Don't Repeat Yourself)
  const typography = {
    pageTitle: '1.75rem',      // H1 - Título de página
    subtitle: '0.875rem',      // Subtítulo y contador
    cardTitle: '0.9375rem',    // Título de tarjeta (15px)
    body: '0.8125rem',         // Texto normal (13px)
    small: '0.75rem',          // Texto pequeño (12px)
    tiny: '0.6875rem',         // Texto muy pequeño (11px)
    button: '0.875rem',        // Botones
    input: '0.875rem'          // Inputs y selects
  };
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

  // Obtener configuración de estado (SRP - Single Responsibility Principle)
  const getStatusConfig = (estado) => {
    const configs = {
      planificacion: { 
        icon: '📋', 
        label: 'Planificación',
        color: '#6c757d',
        bgColor: '#6c757d15'
      },
      en_progreso: { 
        icon: '🔄', 
        label: 'En Progreso',
        color: '#0d6efd',
        bgColor: '#0d6efd15'
      },
      completado: { 
        icon: '✅', 
        label: 'Completado',
        color: '#198754',
        bgColor: '#19875415'
      },
      cancelado: { 
        icon: '❌', 
        label: 'Cancelado',
        color: '#dc3545',
        bgColor: '#dc354515'
      }
    };
    return configs[estado] || configs.planificacion;
  };

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
              <h1 className="mb-1 fw-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.5px', fontSize: typography.pageTitle }}>
                Proyectos
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: typography.subtitle }}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'} en total
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="btn btn-dark d-flex align-items-center"
              style={{ 
                borderRadius: '8px',
                fontSize: typography.button,
                padding: '0.5rem 1.25rem',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nuevo Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Minimalistas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-lg-5 col-md-6">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute" style={{ 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6c757d',
                      fontSize: typography.small
                    }}></i>
                    <input
                      type="text"
                      placeholder="Buscar proyectos..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="form-control"
                      style={{ 
                        paddingLeft: '2.5rem',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: typography.input
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="form-select"
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: typography.input
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="planificacion">📋 Planificación</option>
                    <option value="en_progreso">🔄 En Progreso</option>
                    <option value="completado">✅ Completado</option>
                    <option value="cancelado">❌ Cancelado</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-12">
                  <button
                    onClick={() => setFilters({ search: '', estado: '' })}
                    className="btn btn-outline-secondary w-100"
                    style={{ 
                      borderRadius: '8px',
                      fontSize: typography.button,
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
      {filteredProjects.length === 0 && !error ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: '80px', height: '80px', backgroundColor: '#f8f9fa' }}>
              <i className="bi bi-folder" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            </div>
          </div>
          <h3 className="h4 mb-3" style={{ color: '#1a1a1a', fontWeight: '600', fontSize: typography.pageTitle }}>Sin proyectos aún</h3>
          <p className="text-muted mb-4" style={{ fontSize: typography.body }}>
            Crea tu primer proyecto para comenzar a organizar tu trabajo
          </p>
          <button
            onClick={openCreateForm}
            className="btn btn-dark"
            style={{ borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: typography.button }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Crear primer proyecto
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="col-xl-3 col-lg-4 col-md-6">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${
                    project.estado === 'completado' ? '#198754' :
                    project.estado === 'en_progreso' ? '#0d6efd' :
                    project.estado === 'cancelado' ? '#dc3545' : '#6c757d'
                  }`
                }}
                onClick={() => navigateToProject(project.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div className="card-body p-3">
                  {/* Header compacto */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1 pe-2">
                      <h6 className="mb-1 fw-semibold" style={{ 
                        fontSize: typography.cardTitle,
                        color: '#1a1a1a',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {project.titulo}
                      </h6>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm p-0 border-0"
                        type="button"
                        data-bs-toggle="dropdown"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          opacity: 0.5,
                          width: '20px',
                          height: '20px'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.5}
                      >
                        <i className="bi bi-three-dots" style={{ fontSize: typography.small, color: '#6c757d' }}></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ borderRadius: '8px' }}>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            style={{ fontSize: typography.body }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(project);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                            Editar
                          </button>
                        </li>
                        <li><hr className="dropdown-divider my-1" /></li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2 text-danger"
                            style={{ fontSize: typography.body }}
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(project);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Descripción compacta */}
                  {project.descripcion && (
                    <p className="text-muted mb-2" style={{
                      fontSize: typography.small,
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {project.descripcion}
                    </p>
                  )}

                  {/* Estado minimalista */}
                  <div className="mb-2">
                    <span style={{
                      fontSize: typography.tiny,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 
                        project.estado === 'completado' ? '#19875415' :
                        project.estado === 'en_progreso' ? '#0d6efd15' :
                        project.estado === 'cancelado' ? '#dc354515' : '#6c757d15',
                      color: 
                        project.estado === 'completado' ? '#198754' :
                        project.estado === 'en_progreso' ? '#0d6efd' :
                        project.estado === 'cancelado' ? '#dc3545' : '#6c757d',
                      fontWeight: '600'
                    }}>
                      {project.estado === 'completado' ? '✅ Completado' :
                       project.estado === 'en_progreso' ? '🔄 En Progreso' :
                       project.estado === 'cancelado' ? '❌ Cancelado' : '📋 Planificación'}
                    </span>
                  </div>

                  {/* Fechas compactas */}
                  {(project.fecha_inicio || project.fecha_fin) && (
                    <div className="d-flex gap-3 mt-2 pt-2 border-top">
                      {project.fecha_inicio && (
                        <div className="flex-fill">
                          <small className="text-muted d-block" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                            INICIO
                          </small>
                          <small className="d-flex align-items-center gap-1" style={{ fontSize: typography.small, color: '#1a1a1a' }}>
                            <i className="bi bi-calendar3"></i>
                            {new Date(project.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </small>
                        </div>
                      )}
                      {project.fecha_fin && (
                        <div className="flex-fill">
                          <small className="text-muted d-block" style={{ fontSize: typography.tiny, fontWeight: '600', letterSpacing: '0.5px' }}>
                            FIN
                          </small>
                          <small className="d-flex align-items-center gap-1" style={{ fontSize: typography.small, color: '#1a1a1a' }}>
                            <i className="bi bi-calendar3"></i>
                            {new Date(project.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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