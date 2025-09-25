import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import fileService from '../services/fileService.mock';
import projectService from '../services/projectService';
import taskService from '../services/taskService.mock';
import '../styles/projects.css';

const FilesPage = () => {
  const { addNotification } = useNotifications();

  // Estados principales
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Estados de formulario de upload - Adaptado a la estructura de BD
  const [uploadForm, setUploadForm] = useState({
    files: [],
    tipo_entidad: 'proyecto', // 'proyecto' | 'tarea'
    entidad_id: '',
    descripcion: ''
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    tipo: '', // PDF, DOCX, JPG según ENUM de la BD
    tipo_entidad: '', // proyecto | tarea
    entidad_id: ''
  });

  // Estados de vista
  const [viewMode, setViewMode] = useState('grid');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFiles();
    loadProjects();
    loadTasks();
  }, []);

  // Cargar archivos
  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getAllFiles(filters);
      console.log('Response from files API:', response);
      
      // Manejar diferentes estructuras de respuesta
      const filesData = response.files || response.data || [];
      setFiles(Array.isArray(filesData) ? filesData : []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      setError('Error al cargar los archivos');
      addNotification('Error al cargar los archivos', 'error');
      setFiles([]);
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

  // Cargar tareas para el selector
  const loadTasks = async () => {
    try {
      const response = await taskService.getAllTasks();
      const tasksData = response.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  };

  // Manejar subida de archivos
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (uploadForm.files.length === 0) {
      addNotification('Selecciona al menos un archivo', 'error');
      return;
    }

    if (!uploadForm.entidad_id) {
      addNotification('Selecciona un proyecto o tarea', 'error');
      return;
    }

    setUploading(true);

    try {
      for (const file of uploadForm.files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo_entidad', uploadForm.tipo_entidad);
        formData.append('entidad_id', uploadForm.entidad_id);
        if (uploadForm.descripcion) {
          formData.append('descripcion', uploadForm.descripcion);
        }

        await fileService.uploadFile(formData);
      }

      addNotification('Archivos subidos exitosamente', 'success');
      setShowUploadModal(false);
      resetUploadForm();
      loadFiles();
    } catch (error) {
      console.error('Error al subir archivos:', error);
      addNotification('Error al subir archivos', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Resetear formulario de upload
  const resetUploadForm = () => {
    setUploadForm({
      files: [],
      tipo_entidad: 'proyecto',
      entidad_id: '',
      descripcion: ''
    });
  };

  // Abrir modal de upload
  const openUploadModal = () => {
    resetUploadForm();
    setShowUploadModal(true);
  };

  // Descargar archivo
  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file.id, file.nombre_original);
      addNotification('Archivo descargado', 'success');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      addNotification('Error al descargar el archivo', 'error');
    }
  };

  // Confirmar eliminación
  const confirmDelete = (file) => {
    setSelectedFile(file);
    setShowDeleteDialog(true);
  };

  // Eliminar archivo
  const handleDelete = async () => {
    try {
      await fileService.deleteFile(selectedFile.id);
      addNotification('Archivo eliminado exitosamente', 'success');
      setShowDeleteDialog(false);
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      addNotification('Error al eliminar el archivo', 'error');
    }
  };

  // Filtrar archivos
  const filteredFiles = (Array.isArray(files) ? files : []).filter(file => {
    const matchesSearch = file.nombre_original?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         file.nombre_archivo?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesTipo = !filters.tipo || file.tipo === filters.tipo;
    const matchesTipoEntidad = !filters.tipo_entidad || 
                              (filters.tipo_entidad === 'proyecto' && file.proyecto_id) ||
                              (filters.tipo_entidad === 'tarea' && file.tarea_id);
    const matchesEntidad = !filters.entidad_id || 
                          file.proyecto_id === parseInt(filters.entidad_id) ||
                          file.tarea_id === parseInt(filters.entidad_id);
    
    return matchesSearch && matchesTipo && matchesTipoEntidad && matchesEntidad;
  });

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener icono según tipo de archivo (solo tipos permitidos en BD)
  const getFileIcon = (tipo) => {
    const iconMap = {
      PDF: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      DOCX: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="12" y1="9" x2="8" y2="9"/>
        </svg>
      ),
      JPG: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      )
    };
    return iconMap[tipo] || iconMap.PDF;
  };

  // Obtener clase de badge para el tipo
  const getTypeBadgeClass = (tipo) => {
    const classes = {
      PDF: 'bg-danger text-white',
      DOCX: 'bg-primary text-white',
      JPG: 'bg-success text-white'
    };
    return classes[tipo] || 'bg-secondary text-white';
  };

  // Obtener nombre de la entidad asociada
  const getEntityName = (file) => {
    if (file.proyecto_id) {
      const project = projects.find(p => p.id === file.proyecto_id);
      return project ? `Proyecto: ${project.titulo}` : 'Proyecto desconocido';
    }
    if (file.tarea_id) {
      const task = tasks.find(t => t.id === file.tarea_id);
      return task ? `Tarea: ${task.titulo}` : 'Tarea desconocida';
    }
    return 'Sin asociar';
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
            <h1 className="h2 mb-2 text-primary fw-bold">Archivos</h1>
            <p className="text-muted mb-0">Administra y organiza todos los archivos del sistema</p>
          </div>
          <button
            onClick={openUploadModal}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Subir Archivos
          </button>
        </div>
      </div>

      {/* Barra de filtros moderna */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-3">
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
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="form-control ps-5"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                className="form-select"
              >
                <option value="">Todos los tipos</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="JPG">JPG</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                value={filters.tipo_entidad}
                onChange={(e) => setFilters({ ...filters, tipo_entidad: e.target.value, entidad_id: '' })}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="proyecto">Proyectos</option>
                <option value="tarea">Tareas</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                value={filters.entidad_id}
                onChange={(e) => setFilters({ ...filters, entidad_id: e.target.value })}
                className="form-select"
                disabled={!filters.tipo_entidad}
              >
                <option value="">
                  {filters.tipo_entidad === 'proyecto' ? 'Todos los proyectos' : 
                   filters.tipo_entidad === 'tarea' ? 'Todas las tareas' : 'Selecciona tipo primero'}
                </option>
                {filters.tipo_entidad === 'proyecto' && projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.titulo}
                  </option>
                ))}
                {filters.tipo_entidad === 'tarea' && tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <div className="d-flex gap-1">
                <button
                  onClick={() => setFilters({ search: '', tipo: '', tipo_entidad: '', entidad_id: '' })}
                  className="btn btn-outline-secondary flex-grow-1"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="btn btn-outline-primary"
                  title={viewMode === 'grid' ? 'Vista de lista' : 'Vista de cuadrícula'}
                >
                  {viewMode === 'grid' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Contenido principal */}
      <div className="projects-content">
        {filteredFiles.length === 0 && !error ? (
          <div className="empty-state text-center py-5">
            <div className="empty-state-icon mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-3 p-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
            </div>
            <h3 className="h4 mb-3 text-dark">Sin archivos aún</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
              Sube tu primer archivo para comenzar a organizar documentos de proyectos y tareas.
            </p>
            <button
              onClick={openUploadModal}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Subir primer archivo
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'row g-4' : 'list-group'}>
            {filteredFiles.map((file) => (
              viewMode === 'grid' ? (
                <div key={file.id} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm project-card">
                    <div className="card-body p-4">
                      {/* Header con acciones */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          {getFileIcon(file.tipo)}
                          <span className={`badge ${getTypeBadgeClass(file.tipo)} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                            {file.tipo}
                          </span>
                        </div>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-light text-muted border-0 p-1"
                            type="button"
                            data-bs-toggle="dropdown"
                            style={{ opacity: 0.7 }}
                            onMouseEnter={(e) => e.target.style.opacity = 1}
                            onMouseLeave={(e) => e.target.style.opacity = 0.7}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1"/>
                              <circle cx="12" cy="5" r="1"/>
                              <circle cx="12" cy="19" r="1"/>
                            </svg>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                            <li>
                              <button 
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => handleDownload(file)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                  <polyline points="7,10 12,15 17,10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Descargar
                              </button>
                            </li>
                            <li><hr className="dropdown-divider"/></li>
                            <li>
                              <button 
                                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                onClick={() => confirmDelete(file)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                Eliminar
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Nombre del archivo */}
                      <h5 className="card-title mb-2 text-dark fw-semibold" style={{ fontSize: '1rem' }}>
                        {file.nombre_original}
                      </h5>

                      {/* Información del archivo */}
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          {formatFileSize(file.tamaño_bytes)}
                        </small>
                        <small className="text-muted d-block">
                          {getEntityName(file)}
                        </small>
                      </div>

                      {/* Fecha */}
                      <div className="border-top pt-3 mt-auto">
                        <small className="text-muted d-flex align-items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {new Date(file.created_at).toLocaleDateString('es-ES')}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={file.id} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3">
                  <div className="d-flex align-items-center gap-2">
                    {getFileIcon(file.tipo)}
                    <span className={`badge ${getTypeBadgeClass(file.tipo)} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                      {file.tipo}
                    </span>
                  </div>
                  
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-semibold">{file.nombre_original}</h6>
                    <small className="text-muted">
                      {formatFileSize(file.tamaño_bytes)} • {getEntityName(file)} • {new Date(file.created_at).toLocaleDateString('es-ES')}
                    </small>
                  </div>

                  <div className="d-flex gap-1">
                    <button
                      onClick={() => handleDownload(file)}
                      className="btn btn-sm btn-outline-primary"
                      title="Descargar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => confirmDelete(file)}
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Modal de subida */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Subir Archivos"
      >
        <form onSubmit={handleFileUpload}>
          <div className="mb-3">
            <label className="form-label fw-medium">
              Archivos *
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.jpg,.jpeg"
              onChange={(e) => setUploadForm({ ...uploadForm, files: Array.from(e.target.files) })}
              className="form-control"
              disabled={uploading}
              required
            />
            <div className="form-text">
              Tipos permitidos: PDF, DOCX, JPG. Máximo 10MB por archivo.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">
              Asociar a *
            </label>
            <select
              value={uploadForm.tipo_entidad}
              onChange={(e) => setUploadForm({ ...uploadForm, tipo_entidad: e.target.value, entidad_id: '' })}
              className="form-select"
              required
            >
              <option value="proyecto">Proyecto</option>
              <option value="tarea">Tarea</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">
              {uploadForm.tipo_entidad === 'proyecto' ? 'Proyecto' : 'Tarea'} *
            </label>
            <select
              value={uploadForm.entidad_id}
              onChange={(e) => setUploadForm({ ...uploadForm, entidad_id: e.target.value })}
              className="form-select"
              required
            >
              <option value="">
                Seleccionar {uploadForm.tipo_entidad === 'proyecto' ? 'proyecto' : 'tarea'}
              </option>
              {uploadForm.tipo_entidad === 'proyecto' && projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.titulo}
                </option>
              ))}
              {uploadForm.tipo_entidad === 'tarea' && tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">
              Descripción
            </label>
            <textarea
              value={uploadForm.descripcion}
              onChange={(e) => setUploadForm({ ...uploadForm, descripcion: e.target.value })}
              rows={2}
              className="form-control"
              placeholder="Descripción opcional del archivo"
            />
          </div>

          {uploadForm.files.length > 0 && (
            <div className="mb-3">
              <h6>Archivos seleccionados:</h6>
              <ul className="list-group list-group-flush">
                {uploadForm.files.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>{file.name}</span>
                    <small className="text-muted">{formatFileSize(file.size)}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="btn btn-outline-secondary"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || uploadForm.files.length === 0}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Subiendo...
                </>
              ) : (
                'Subir Archivos'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminar Archivo"
        message={`¿Estás seguro de que deseas eliminar el archivo "${selectedFile?.nombre_original}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default FilesPage;
