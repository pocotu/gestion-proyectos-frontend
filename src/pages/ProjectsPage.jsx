import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import projectService from '../services/projectService';
import userService from '../services/userService';

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
  const [totalProjects, setTotalProjects] = useState(0);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
    estado: 'planificacion',
    responsables: [] // Array de IDs de usuarios responsables
  });

  // Estados de selección
  const [selectedProject, setSelectedProject] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    estado: ''
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Cargar usuarios disponibles
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getUsers();
      const usersData = response.data?.users || response.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar proyectos
  const loadProjects = async () => {
    try {
      setLoading(true);
      // Cargar todos los proyectos sin límite de paginación
      const response = await projectService.getAllProjects({ limit: 1000 });
      const projectsData = response.projects || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setTotalProjects(response.data?.pagination?.total || projectsData.length);
      setError(null);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos');
      setProjects([]);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  };

  // Manejar creación/edición de proyecto
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        // Crear proyecto
        const response = await projectService.createProject({
          titulo: projectForm.titulo,
          descripcion: projectForm.descripcion,
          fecha_inicio: projectForm.fecha_inicio,
          fecha_fin: projectForm.fecha_fin,
          estado: projectForm.estado
        });
        
        // Asignar responsables si hay alguno seleccionado
        const projectId = response.data?.project?.id || response.project?.id;
        if (projectId && projectForm.responsables && projectForm.responsables.length > 0) {
          for (const userId of projectForm.responsables) {
            try {
              await projectService.assignResponsible(projectId, userId);
            } catch (error) {
              console.error(`Error al asignar responsable ${userId}:`, error);
            }
          }
        }
      } else {
        await projectService.updateProject(selectedProject.id, {
          titulo: projectForm.titulo,
          descripcion: projectForm.descripcion,
          fecha_inicio: projectForm.fecha_inicio,
          fecha_fin: projectForm.fecha_fin,
          estado: projectForm.estado
        });
      }
      setShowProjectForm(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto. Por favor intenta nuevamente.');
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setProjectForm({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificacion',
      responsables: []
    });
    setSelectedProject(null);
    setFormMode('create');
    setUserSearchQuery('');
    setShowUserDropdown(false);
  };

  // Abrir formulario de creación
  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setShowProjectForm(true);
    loadUsers(); // Cargar usuarios al abrir el formulario
  };

  // Abrir formulario de edición
  const openEditForm = (project) => {
    setSelectedProject(project);
    setProjectForm({
      titulo: project.titulo || '',
      descripcion: project.descripcion || '',
      fecha_inicio: project.fecha_inicio ? project.fecha_inicio.split('T')[0] : '',
      fecha_fin: project.fecha_fin ? project.fecha_fin.split('T')[0] : '',
      estado: project.estado || 'planificacion',
      responsables: [] // TODO: cargar responsables del proyecto si existen
    });
    setFormMode('edit');
    setShowProjectForm(true);
    loadUsers(); // Cargar usuarios al abrir el formulario
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

  // Manejar selección de responsables
  const handleResponsableToggle = (userId) => {
    setProjectForm(prev => {
      const responsables = prev.responsables || [];
      if (responsables.includes(userId)) {
        return { ...prev, responsables: responsables.filter(id => id !== userId) };
      } else {
        return { ...prev, responsables: [...responsables, userId] };
      }
    });
  };

  // Filtrar usuarios según búsqueda
  const filteredUsers = users.filter(user => {
    const searchLower = userSearchQuery.toLowerCase();
    return (
      user.nombre?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Obtener nombres de usuarios seleccionados
  const getSelectedUserNames = () => {
    if (!projectForm.responsables || projectForm.responsables.length === 0) {
      return 'Seleccionar responsables...';
    }
    const selectedUsers = users.filter(u => projectForm.responsables.includes(u.id));
    if (selectedUsers.length === 1) {
      return selectedUsers[0].nombre;
    }
    return `${selectedUsers.length} responsables seleccionados`;
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
            {totalProjects} {totalProjects === 1 ? 'proyecto' : 'proyectos'} en total
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
            const isHovered = hoveredCardId === project.id;
            return (
              <div
                key={project.id}
                style={{
                  ...styles.card,
                  ...(isHovered ? styles.cardHover : {})
                }}
                onClick={() => navigateToProject(project.id)}
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {/* Header de la card */}
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{project.titulo}</h3>
                  <div
                    style={styles.cardMenu}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      style={styles.menuButton}
                      onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                    >
                      ⋮
                    </button>
                    {openMenuId === project.id && (
                      <div style={styles.dropdownMenu}>
                        <button
                          style={styles.dropdownItem}
                          onClick={() => {
                            setOpenMenuId(null);
                            openEditForm(project);
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          style={{...styles.dropdownItem, ...styles.dropdownItemDanger}}
                          onClick={() => {
                            setOpenMenuId(null);
                            confirmDelete(project);
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
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
                placeholder="Opcional"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Fecha de Fin</label>
              <input
                type="date"
                value={projectForm.fecha_fin}
                onChange={(e) => setProjectForm({ ...projectForm, fecha_fin: e.target.value })}
                style={styles.formInput}
                placeholder="Opcional"
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

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Responsables del Proyecto</label>
            <div style={styles.dropdownContainer} className="dropdown-container">
              <div
                style={styles.dropdownTrigger}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <span style={styles.dropdownText}>{getSelectedUserNames()}</span>
                <span style={styles.dropdownArrow}>{showUserDropdown ? '▲' : '▼'}</span>
              </div>
              
              {showUserDropdown && (
                <div style={styles.dropdownMenu}>
                  {/* Buscador */}
                  <div style={styles.searchContainer}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      style={styles.searchInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Lista de usuarios */}
                  <div style={styles.usersList}>
                    {loadingUsers ? (
                      <div style={styles.loadingUsers}>Cargando usuarios...</div>
                    ) : filteredUsers.length === 0 ? (
                      <div style={styles.noUsers}>
                        {userSearchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                      </div>
                    ) : (
                      filteredUsers.map(user => (
                        <label
                          key={user.id}
                          style={styles.userCheckbox}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={(projectForm.responsables || []).includes(user.id)}
                            onChange={() => handleResponsableToggle(user.id)}
                            style={styles.checkbox}
                          />
                          <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>
                              {user.nombre?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div style={styles.userDetails}>
                              <div style={styles.userName}>{user.nombre}</div>
                              <div style={styles.userEmail}>{user.email}</div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {(projectForm.responsables || []).length > 0 && (
              <div style={styles.selectedCount}>
                {(projectForm.responsables || []).length} responsable(s) seleccionado(s)
              </div>
            )}
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
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderColor: '#D1D5DB'
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
    flexShrink: 0,
    position: 'relative'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    transition: 'color 0.15s ease'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #E5E7EB',
    minWidth: '140px',
    zIndex: 1000,
    overflow: 'hidden'
  },
  dropdownItem: {
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.15s ease'
  },
  dropdownItemDanger: {
    color: '#DC2626'
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
  },
  loadingUsers: {
    padding: '12px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '13px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E5E7EB'
  },
  noUsers: {
    padding: '12px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '13px',
    backgroundColor: '#F9FAFB'
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%'
  },
  dropdownTrigger: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13.5px',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'border-color 0.15s ease'
  },
  dropdownText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  dropdownArrow: {
    fontSize: '10px',
    color: '#6B7280',
    marginLeft: '8px'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    maxHeight: '320px',
    display: 'flex',
    flexDirection: 'column'
  },
  searchContainer: {
    position: 'relative',
    padding: '8px',
    borderBottom: '1px solid #E5E7EB'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 32px',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  usersList: {
    maxHeight: '240px',
    overflowY: 'auto'
  },
  userCheckbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.15s ease'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginRight: '12px',
    cursor: 'pointer',
    accentColor: '#3B82F6'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0
  },
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '2px'
  },
  userEmail: {
    fontSize: '12px',
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  selectedCount: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500'
  }
};

export default ProjectsPage;
