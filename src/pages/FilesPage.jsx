import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import fileService from '../services/fileService.mock';
import projectService from '../services/projectService';
import taskService from '../services/taskService.mock';
import '../styles/projects.css';

const FilesPage = () => {
  
  // Escala tipográfica consistente (DRY - Don't Repeat Yourself)
  const typography = {
    pageTitle: '1.75rem',
    subtitle: '0.875rem',
    fileName: '0.875rem',
    body: '0.8125rem',
    small: '0.75rem',
    tiny: '0.6875rem',
    button: '0.875rem',
    input: '0.875rem'
  };

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

  // Estados de vista - Por defecto lista para ser más compacto
  const [viewMode, setViewMode] = useState('list');
  
  // Estado para el menú desplegable abierto
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Estado para el menú abierto en vista de cuadrícula
  const [openMenuId, setOpenMenuId] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFiles();
    loadProjects();
    loadTasks();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId !== null && !event.target.closest('.file-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && !event.target.closest('.file-menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

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
            return;
    }

    if (!uploadForm.entidad_id) {
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

            setShowUploadModal(false);
      resetUploadForm();
      loadFiles();
    } catch (error) {
      console.error('Error al subir archivos:', error);
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
          } catch (error) {
      console.error('Error al descargar archivo:', error);
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
            setShowDeleteDialog(false);
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
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

  // Obtener configuración de tipo de archivo (SRP - Single Responsibility Principle)
  const getFileTypeConfig = (tipo) => {
    const configs = {
      PDF: {
        icon: 'bi-file-earmark-pdf',
        color: '#dc3545',
        bgColor: '#dc354515',
        label: 'PDF'
      },
      DOCX: {
        icon: 'bi-file-earmark-word',
        color: '#0d6efd',
        bgColor: '#0d6efd15',
        label: 'DOCX'
      },
      JPG: {
        icon: 'bi-file-earmark-image',
        color: '#198754',
        bgColor: '#19875415',
        label: 'JPG'
      }
    };
    return configs[tipo] || configs.PDF;
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
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header Moderno */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1 fw-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.5px', fontSize: typography.pageTitle }}>
                Archivos
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: typography.subtitle }}>
                {filteredFiles.length} {filteredFiles.length === 1 ? 'archivo' : 'archivos'} en total
              </p>
            </div>
            <button
              onClick={openUploadModal}
              className="btn btn-dark d-flex align-items-center"
              style={{ 
                borderRadius: '8px',
                fontSize: typography.button,
                padding: '0.5rem 1.25rem',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-upload me-2"></i>
              Subir Archivos
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
                <div className="col-lg-3 col-md-6">
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
                      placeholder="Buscar archivos..."
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
                <div className="col-lg-2 col-md-6">
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                    className="form-select"
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: typography.input
                    }}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="PDF">📄 PDF</option>
                    <option value="DOCX">📝 DOCX</option>
                    <option value="JPG">🖼️ JPG</option>
                  </select>
                </div>
                <div className="col-lg-2 col-md-6">
                  <select
                    value={filters.tipo_entidad}
                    onChange={(e) => setFilters({ ...filters, tipo_entidad: e.target.value, entidad_id: '' })}
                    className="form-select"
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: typography.input
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="proyecto">📁 Proyectos</option>
                    <option value="tarea">✓ Tareas</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <select
                    value={filters.entidad_id}
                    onChange={(e) => setFilters({ ...filters, entidad_id: e.target.value })}
                    className="form-select"
                    disabled={!filters.tipo_entidad}
                    style={{ 
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: typography.input
                    }}
                  >
                    <option value="">
                      {filters.tipo_entidad === 'proyecto' ? 'Todos los proyectos' : 
                       filters.tipo_entidad === 'tarea' ? 'Todas las tareas' : 'Selecciona tipo'}
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
                <div className="col-lg-2 col-md-12">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setFilters({ search: '', tipo: '', tipo_entidad: '', entidad_id: '' })}
                      className="btn btn-outline-secondary flex-grow-1"
                      style={{ 
                        borderRadius: '8px',
                        fontSize: typography.button,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Limpiar
                    </button>
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="btn btn-outline-secondary"
                      title={viewMode === 'grid' ? 'Vista de lista' : 'Vista de cuadrícula'}
                      style={{ 
                        borderRadius: '8px',
                        fontSize: typography.button,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <i className={`bi ${viewMode === 'grid' ? 'bi-list-ul' : 'bi-grid-3x3-gap'}`}></i>
                    </button>
                  </div>
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
      {filteredFiles.length === 0 && !error ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: '80px', height: '80px', backgroundColor: '#f8f9fa' }}>
              <i className="bi bi-file-earmark" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            </div>
          </div>
          <h3 className="h4 mb-3" style={{ color: '#1a1a1a', fontWeight: '600', fontSize: typography.pageTitle }}>Sin archivos aún</h3>
          <p className="text-muted mb-4" style={{ fontSize: typography.body }}>
            Sube tu primer archivo para comenzar a organizar documentos
          </p>
          <button
            onClick={openUploadModal}
            className="btn btn-dark"
            style={{ borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: typography.button }}
          >
            <i className="bi bi-upload me-2"></i>
            Subir primer archivo
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Vista de Lista Compacta con Scroll */
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-body p-0">
                {/* Contenedor con scroll limitado */}
                <div style={{ 
                  maxHeight: 'calc(100vh - 320px)', 
                  overflowY: 'auto',
                  overflowX: 'auto'
                }}>
                  <table className="table table-hover mb-0">
                    <thead style={{ 
                      backgroundColor: '#f8f9fa',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}>
                      <tr>
                        <th className="border-0 py-3 px-4" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>ARCHIVO</th>
                        <th className="border-0 py-3" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>TIPO</th>
                        <th className="border-0 py-3" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>TAMAÑO</th>
                        <th className="border-0 py-3" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>ASOCIADO A</th>
                        <th className="border-0 py-3" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>FECHA</th>
                        <th className="border-0 py-3 px-4" style={{ fontSize: typography.tiny, fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px', backgroundColor: '#f8f9fa' }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => {
                        const typeConfig = getFileTypeConfig(file.tipo);
                        return (
                          <tr key={file.id} style={{ cursor: 'pointer' }}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${typeConfig.icon}`} style={{ fontSize: '1.25rem', color: typeConfig.color }}></i>
                                <span className="fw-medium" style={{ fontSize: typography.fileName, color: '#1a1a1a' }}>
                                  {file.nombre_original}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span style={{
                                fontSize: typography.tiny,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: typeConfig.bgColor,
                                color: typeConfig.color,
                                fontWeight: '600'
                              }}>
                                {typeConfig.label}
                              </span>
                            </td>
                            <td className="py-3">
                              <span style={{ fontSize: typography.small, color: '#6c757d' }}>
                                {formatFileSize(file.tamaño_bytes)}
                              </span>
                            </td>
                            <td className="py-3">
                              <span style={{ fontSize: typography.small, color: '#6c757d' }}>
                                {getEntityName(file)}
                              </span>
                            </td>
                            <td className="py-3">
                              <span style={{ fontSize: typography.small, color: '#6c757d' }}>
                                {new Date(file.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  style={{ borderRadius: '6px', fontSize: typography.tiny }}
                                  onClick={() => handleDownload(file)}
                                  title="Descargar"
                                >
                                  <i className="bi bi-download"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  style={{ borderRadius: '6px', fontSize: typography.tiny }}
                                  onClick={() => confirmDelete(file)}
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Cuadrícula con Scroll */
        <div style={{ 
          maxHeight: 'calc(100vh - 320px)', 
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px'
        }}>
          <div className="row g-3">
            {filteredFiles.map((file) => {
              const typeConfig = getFileTypeConfig(file.tipo);
              return (
              <div key={file.id} className="col-xl-3 col-lg-4 col-md-6">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${typeConfig.color}`
                  }}
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
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${typeConfig.icon}`} style={{ fontSize: '1.5rem', color: typeConfig.color }}></i>
                        <span style={{
                          fontSize: typography.tiny,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: typeConfig.bgColor,
                          color: typeConfig.color,
                          fontWeight: '600'
                        }}>
                          {typeConfig.label}
                        </span>
                      </div>
                      <div className="file-dropdown-container" style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                          className="btn btn-sm border-0"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === file.id ? null : file.id);
                          }}
                          style={{ 
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease',
                            backgroundColor: openDropdownId === file.id ? '#e5e7eb' : '#f3f4f6',
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
                            if (openDropdownId !== file.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                        >
                          ⋮
                        </button>
                        {openDropdownId === file.id && (
                          <div 
                            className="file-dropdown-menu"
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
                              className="file-dropdown-item"
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#374151',
                                fontSize: typography.body,
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
                                setOpenDropdownId(null);
                                handleDownload(file);
                              }}
                            >
                              <i className="bi bi-download" style={{ fontSize: '0.9rem' }}></i>
                              Descargar
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '0' }}></div>
                            <button
                              className="file-dropdown-item"
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                fontSize: typography.body,
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
                                setOpenDropdownId(null);
                                confirmDelete(file);
                              }}
                            >
                              <i className="bi bi-trash" style={{ fontSize: '0.9rem' }}></i>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nombre del archivo */}
                    <h6 className="mb-2 fw-semibold" style={{ 
                      fontSize: typography.fileName,
                      color: '#1a1a1a',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {file.nombre_original}
                    </h6>

                    {/* Información compacta */}
                    <div className="mb-2">
                      <small className="text-muted d-block" style={{ fontSize: typography.small }}>
                        {formatFileSize(file.tamaño_bytes)}
                      </small>
                      <small className="text-muted d-block" style={{ fontSize: typography.small }}>
                        {getEntityName(file)}
                      </small>
                    </div>

                    {/* Fecha */}
                    <div className="border-top pt-2 mt-2">
                      <small className="d-flex align-items-center gap-1" style={{ fontSize: typography.small, color: '#6c757d' }}>
                        <i className="bi bi-calendar3"></i>
                        {new Date(file.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

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
