import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { activityService } from '../services/activityService.mock';
import { useAuth } from '../hooks/useAuth';

const ActivityLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    entityType: '',
    action: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Log user information
  console.log('ActivityLogsPage - User info:', user);
  console.log('ActivityLogsPage - es_administrador:', user?.es_administrador);
  console.log('ActivityLogsPage - roles:', user?.roles);

  // Manejar click en fila para mostrar detalles
  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  // Cargar logs de actividad
  const loadActivityLogs = async () => {
    try {
      console.log('ActivityLogsPage - loadActivityLogs - Starting with filters:', filters);
      setLoading(true);
      const response = await activityService.getActivityLogs(filters);
      console.log('ActivityLogsPage - loadActivityLogs - Response:', response);
      setLogs(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 50, total: 0 });
      console.log('ActivityLogsPage - loadActivityLogs - Logs set:', response.data?.length || 0, 'logs');
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      console.log('ActivityLogsPage - loadStats - Starting');
      const response = await activityService.getActivityStats();
      console.log('ActivityLogsPage - loadStats - Response:', response);
      setStats(response.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats([]);
    }
  };

  useEffect(() => {
    // Verificar si el usuario es admin por el campo es_administrador o por roles
    const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
    console.log('ActivityLogsPage - Final isAdmin check:', isAdmin);
    
    if (isAdmin) {
      loadActivityLogs();
      loadStats();
    } else {
      console.log('ActivityLogsPage - User is not admin, not loading logs');
    }
  }, [user, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userId: '',
      entityType: '',
      action: '',
      page: 1,
      limit: 50
    });
  };

  // Exportar logs
  const exportLogs = async (format = 'json') => {
    try {
      const response = await activityService.exportLogs({
        ...filters,
        format
      });
      
      if (format === 'csv') {
        // El backend devuelve CSV directamente
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // JSON format
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  // Obtener icono para el tipo de acción
  const getActionIcon = (action) => {
    const iconMap = {
      'crear': 'bi-plus-lg',
      'actualizar': 'bi-pencil',
      'eliminar': 'bi-trash',
      'ver': 'bi-eye',
      'login': 'bi-box-arrow-in-right',
      'logout': 'bi-box-arrow-left',
      'cambio_estado': 'bi-gear',
      'asignacion': 'bi-people',
      'subir_archivo': 'bi-upload',
      'descargar_archivo': 'bi-download'
    };
    
    return iconMap[action] || 'bi-activity';
  };

  // Obtener color para el tipo de acción
  const getActionColor = (action) => {
    const colorMap = {
      'crear': 'bg-success bg-opacity-10 text-success',
      'actualizar': 'bg-primary bg-opacity-10 text-primary',
      'eliminar': 'bg-danger bg-opacity-10 text-danger',
      'ver': 'bg-secondary bg-opacity-10 text-secondary',
      'login': 'bg-info bg-opacity-10 text-info',
      'logout': 'bg-warning bg-opacity-10 text-warning',
      'cambio_estado': 'bg-warning bg-opacity-10 text-warning',
      'asignacion': 'bg-info bg-opacity-10 text-info',
      'subir_archivo': 'bg-primary bg-opacity-10 text-primary',
      'descargar_archivo': 'bg-success bg-opacity-10 text-success'
    };
    
    return colorMap[action] || 'bg-secondary bg-opacity-10 text-secondary';
  };

  // Obtener icono para el tipo de entidad
  const getEntityIcon = (entityType) => {
    const iconMap = {
      'usuario': 'bi-person',
      'proyecto': 'bi-folder',
      'tarea': 'bi-check-circle',
      'archivo': 'bi-file-text',
      'rol': 'bi-shield'
    };
    
    return iconMap[entityType] || 'bi-database';
  };

  // Verificar si el usuario es admin por el campo es_administrador o por roles
  const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
  
  console.log('ActivityLogsPage - Render isAdmin check:', isAdmin);
  console.log('ActivityLogsPage - User in render:', user);
  
  if (!user) {
    return <LoadingSpinner message="Cargando..." />;
  }
  
  if (!isAdmin) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-shield-x display-1 text-danger mb-3"></i>
                <h3 className="card-title">Acceso Denegado</h3>
                <p className="card-text text-muted">
                  No tienes permisos para ver los logs de actividad del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
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
              <h1 className="h3 mb-1 text-dark fw-bold">Logs de Actividad</h1>
              <p className="text-muted mb-0">Monitorea y audita todas las actividades del sistema</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => exportLogs('json')}
                className="btn btn-outline-primary d-flex align-items-center"
              >
                <i className="bi bi-download me-2"></i>
                Exportar JSON
              </button>
              <button
                onClick={() => exportLogs('csv')}
                className="btn btn-outline-success d-flex align-items-center"
              >
                <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && stats.length > 0 && (
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-activity text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Total Actividades</h6>
                    <h4 className="card-title mb-0 fw-bold">
                      {stats.reduce((acc, stat) => acc + stat.total, 0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-people text-success fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Usuarios Activos</h6>
                    <h4 className="card-title mb-0 fw-bold">
                      {new Set(logs.map(log => log.usuario_id)).size}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-database text-info fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Tipos de Entidad</h6>
                    <h4 className="card-title mb-0 fw-bold">
                      {new Set(stats.map(stat => stat.entidad_tipo)).size}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-clock text-warning fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Últimas 24h</h6>
                    <h4 className="card-title mb-0 fw-bold">
                      {logs.filter(log => {
                        const logDate = new Date(log.created_at);
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return logDate >= yesterday;
                      }).length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="row mb-3">
                <div className="col-lg-3 col-md-6 mb-3">
                  <label className="form-label fw-semibold">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <label className="form-label fw-semibold">Tipo de Entidad</label>
                  <select
                    className="form-select"
                    value={filters.entityType}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                    data-testid="entity-type-select"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="proyecto">Proyecto</option>
                    <option value="tarea">Tarea</option>
                    <option value="usuario">Usuario</option>
                    <option value="archivo">Archivo</option>
                    <option value="rol">Rol</option>
                  </select>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                  <label className="form-label fw-semibold">Acción</label>
                  <select
                    className="form-select"
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    data-testid="filter-select"
                  >
                    <option value="">Todas las acciones</option>
                    <option value="crear">Crear</option>
                    <option value="actualizar">Actualizar</option>
                    <option value="eliminar">Eliminar</option>
                    <option value="ver">Ver</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="cambio_estado">Cambio Estado</option>
                    <option value="asignacion">Asignación</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por usuario, descripción o IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button
                  onClick={clearFilters}
                  className="btn btn-outline-secondary d-flex align-items-center"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-activity me-2"></i>
                Registro de Actividades ({logs.length})
              </h6>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary me-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <span>Cargando logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-5" data-testid="no-data-message">
                  <i className="bi bi-exclamation-circle display-1 text-muted mb-3"></i>
                  <h5 className="card-title">No hay logs disponibles</h5>
                  <p className="card-text text-muted">
                    No se encontraron registros de actividad con los filtros aplicados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0" data-testid="activity-logs-table">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="fw-semibold">Fecha/Hora</th>
                          <th scope="col" className="fw-semibold">Usuario</th>
                          <th scope="col" className="fw-semibold">Acción</th>
                          <th scope="col" className="fw-semibold">Entidad</th>
                          <th scope="col" className="fw-semibold">Descripción</th>
                          <th scope="col" className="fw-semibold">IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr 
                            key={log.id} 
                            data-testid="activity-log-row"
                            className="cursor-pointer"
                            onClick={() => handleRowClick(log)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td data-testid="timestamp">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-clock text-muted me-2"></i>
                                <div>
                                  <div className="fw-semibold">
                                    {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: es })}
                                  </div>
                                  <small className="text-muted">
                                    {format(new Date(log.created_at), 'HH:mm:ss', { locale: es })}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td data-testid="user-name">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person text-muted me-2"></i>
                                <div>
                                  <div className="fw-semibold">
                                    {log.usuario_nombre || 'Usuario desconocido'}
                                  </div>
                                  <small className="text-muted">
                                    {log.usuario_email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td data-testid="action-type">
                              <span className={`badge d-flex align-items-center ${getActionColor(log.accion)}`} style={{ width: 'fit-content' }}>
                                <i className={`bi ${getActionIcon(log.accion)} me-1`}></i>
                                <span className="text-capitalize">{log.accion}</span>
                              </span>
                            </td>
                            <td data-testid="resource-type">
                              <div className="d-flex align-items-center">
                                <i className={`bi ${getEntityIcon(log.entidad_tipo)} text-muted me-2`}></i>
                                <div>
                                  <div className="fw-semibold text-capitalize">
                                    {log.entidad_tipo}
                                  </div>
                                  {log.entidad_id && (
                                    <small className="text-muted">
                                      ID: {log.entidad_id}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '200px' }} title={log.descripcion}>
                                {log.descripcion}
                              </div>
                            </td>
                            <td>
                              <code className="text-muted small">
                                {log.ip_address || 'N/A'}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <div className="text-muted small">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, logs.length)} de{' '}
                      {logs.length} registros
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                        disabled={pagination.page <= 1}
                      >
                        <i className="bi bi-chevron-left me-1"></i>
                        Anterior
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleFilterChange('page', pagination.page + 1)}
                        disabled={logs.length < pagination.limit}
                      >
                        Siguiente
                        <i className="bi bi-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Detalles del Log de Actividad"
        data-testid="log-details-modal"
      >
        {selectedLog && (
          <div>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Fecha y Hora</label>
                <p className="mb-0">
                  {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Usuario</label>
                <p className="mb-0">
                  {selectedLog.usuario_nombre || 'Usuario desconocido'}
                </p>
                <small className="text-muted">
                  {selectedLog.usuario_email}
                </small>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Acción</label>
                <div>
                  <span className={`badge d-flex align-items-center ${getActionColor(selectedLog.accion)}`} style={{ width: 'fit-content' }}>
                    <i className={`bi ${getActionIcon(selectedLog.accion)} me-1`}></i>
                    <span className="text-capitalize">{selectedLog.accion}</span>
                  </span>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Tipo de Entidad</label>
                <div className="d-flex align-items-center">
                  <i className={`bi ${getEntityIcon(selectedLog.entidad_tipo)} me-2`}></i>
                  <span className="text-capitalize">
                    {selectedLog.entidad_tipo}
                  </span>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">ID de Entidad</label>
                <p className="mb-0">
                  {selectedLog.entidad_id || 'N/A'}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Dirección IP</label>
                <p className="mb-0">
                  <code>{selectedLog.ip_address || 'N/A'}</code>
                </p>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <div className="bg-light p-3 rounded">
                {selectedLog.descripcion}
              </div>
            </div>
            {selectedLog.detalles_adicionales && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Detalles Adicionales</label>
                <pre className="bg-light p-3 rounded small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(selectedLog.detalles_adicionales, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLogsPage;
