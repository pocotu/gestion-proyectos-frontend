import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import projectService from '../services/projectService';

/**
 * ProjectsPage - Diseño exacto de la imagen
 * Principios SOLID aplicados:
 * - Single Responsibility: Maneja solo la vista de proyectos
 * - Open/Closed: Extensible mediante configuración
 * - Dependency Inversion: Usa servicios abstractos
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  
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
      const projectsData = response.projects || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos');
      setProjects([]);
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
      } else {
        await projectService.updateProject(selectedProject.id, projectForm);
      }
      setShowProjectForm(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
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
      setShowConfirmDialog(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
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

  // Obtener configuración de estado
  const getStatusConfig = (estado) => {
    const configs = {
      planificacion: { 
        label: 'Planificación',
        color: '#6366F1',
        bgColor: '#EEF2FF'
      },
      en_progreso: { 
        label: 'En Progreso',
        color: '#3B82F6',
        bgColor: '#EFF6FF'
      },
      completado: { 
        label: 'Completado',
        color: '#10B981',
        bgColor: '#ECFDF5'
      },
      cancelado: { 
        label: 'Cancelado',
        color: '#EF4444',
        bgColor: '#FEF2F2'
      }
    };
    return configs[estado] || configs.planificacion;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Proyectos</h1>
          <p style={styles.subtitle}>
            {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'} en total
          </p>
        </div>
        <button onClick={openCreateForm} style={styles.newButton}>
          <Plus size={18} strokeWidth={2.5} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtersCard}>
        <div style={styles.filtersRow}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={styles.searchInput}
            />
          </div>
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            style={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="planificacion">Planificación</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button
            onClick={() => setFilters({ search: '', estado: '' })}
            style={styles.clearButton}
          >
            <RotateCcw size={14} strokeWidth={2.5} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Grid de proyectos */}
      {filteredProjects.length === 0 && !error ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <h3 style={styles.emptyTitle}>Sin proyectos aún</h3>
          <p style={styles.emptyText}>
            Crea tu primer proyecto para comenzar a organizar tu trabajo
          </p>
          <button onClick={openCreateForm} style={styles.emptyButton}>
            <Plus size={16} strokeWidth={2.5} />
            Crear primer proyecto
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProjects.map((project) => {
            const statusConfig = getStatusConfig(project.estado);
            return (
              <div
                key={project.id}
                style={styles.card}
                onClick={() => navigateToProject(project.id)}
              >
                {/* Header de la card */}
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{project.titulo}</h3>
                  <div
                    style={styles.cardMenu}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button style={styles.menuButton}>⋮</button>
                  </div>
                </div>

                {/* Descripción */}
                {project.descripcion && (
                  <p style={styles.cardDescription}>
                    {project.descripcion}
                  </p>
                )}

                {/* Estado */}
                <div style={styles.cardStatus}>
                  <span style={{
                    ...styles.statusBadge,
                    color: statusConfig.color,
                    backgroundColor: statusConfig.bgColor
                  }}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Fechas */}
                {(project.fecha_inicio || project.fecha_fin) && (
                  <div style={styles.cardDates}>
                    {project.fecha_inicio && (
                      <div style={styles.dateItem}>
                        <span style={styles.dateLabel}>INICIO</span>
                        <span style={styles.dateValue}>
                          {formatDate(project.fecha_inicio)}
                        </span>
                      </div>
                    )}
                    {project.fecha_fin && (
                      <div style={styles.dateItem}>
                        <span style={styles.dateLabel}>FIN</span>
                        <span style={styles.dateValue}>
                          {formatDate(project.fecha_fin)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de formulario */}
      <Modal
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        title={formMode === 'create' ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
      >
        <form onSubmit={handleProjectSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Título del Proyecto *</label>
            <input
              type="text"
              required
              value={projectForm.titulo}
              onChange={(e) => setProjectForm({ ...projectForm, titulo: e.target.value })}
              style={styles.formInput}
              placeholder="Ingresa el título del proyecto"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Descripción</label>
            <textarea
              value={projectForm.descripcion}
              onChange={(e) => setProjectForm({ ...projectForm, descripcion: e.target.value })}
              rows={3}
              style={styles.formTextarea}
              placeholder="Describe el proyecto"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Fecha de Inicio</label>
              <input
                type="date"
                value={projectForm.fecha_inicio}
                onChange={(e) => setProjectForm({ ...projectForm, fecha_inicio: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Fecha de Fin</label>
              <input
                type="date"
                value={projectForm.fecha_fin}
                onChange={(e) => setProjectForm({ ...projectForm, fecha_fin: e.target.value })}
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Estado</label>
            <select
              value={projectForm.estado}
              onChange={(e) => setProjectForm({ ...projectForm, estado: e.target.value })}
              style={styles.formInput}
            >
              <option value="planificacion">Planificación</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => setShowProjectForm(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.submitButton}>
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

// Estilos - Diseño exacto de la imagen
const styles = {
  container: {
    padding: 0,
    backgroundColor: '#F9FAFB',
    minHeight: '100vh'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '500'
  },
  newButton: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB'
  },
  filtersRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '12px',
    alignItems: 'center'
  },
  searchWrapper: {
    position: 'relative',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 38px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '13.5px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  select: {
    padding: '9px 32px 9px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '13.5px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '180px'
  },
  clearButton: {
    padding: '9px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease'
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13.5px',
    fontWeight: '500',
    border: '1px solid #FEE2E2'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '13.5px',
    color: '#6B7280',
    margin: '0 0 24px 0'
  },
  emptyButton: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    lineHeight: 1.4,
    flex: 1,
    paddingRight: '8px'
  },
  cardMenu: {
    flexShrink: 0
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1
  },
  cardDescription: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 12px 0',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardStatus: {
    marginBottom: '12px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11.5px',
    fontWeight: '600',
    letterSpacing: '0.01em'
  },
  cardDates: {
    display: 'flex',
    gap: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #F3F4F6'
  },
  dateItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dateLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: '0.05em'
  },
  dateValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#111827'
  },
  formGroup: {
    marginBottom: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  formLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13.5px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  formTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13.5px',
    color: '#111827',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB'
  },
  cancelButton: {
    padding: '9px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '9px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#3B82F6',
    cursor: 'pointer'
  }
};

export default ProjectsPage;
