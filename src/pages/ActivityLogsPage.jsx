import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { activityService } from '../services/activityService.mock';
import { useAuth } from '../hooks/useAuth';

/**
 * ActivityLogsPage - Página de logs de actividad con diseño moderno y compacto
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la vista de logs
 * - Open/Closed: Extensible mediante componentes modulares
 * - Dependency Inversion: Depende de abstracciones (servicios, contextos)
 */
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

  /**
   * Carga los logs de actividad desde el servicio
   * Principio de Responsabilidad Única: Solo carga logs
   */
  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await activityService.getActivityLogs(filters);
      setLogs(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 50, total: 0 });
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga las estadísticas de actividad
   * Principio de Responsabilidad Única: Solo carga estadísticas
   */
  const loadStats = async () => {
    try {
      const response = await activityService.getActivityStats();
      setStats(response.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats([]);
    }
  };

  useEffect(() => {
    const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
    
    if (isAdmin) {
      loadActivityLogs();
      loadStats();
    }
  }, [user, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

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

  const exportLogs = async (format = 'json') => {
    try {
      const response = await activityService.exportLogs({
        ...filters,
        format
      });
      
      const blob = format === 'csv' 
        ? new Blob([response], { type: 'text/csv' })
        : new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

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

  const getActionColor = (action) => {
    const colorMap = {
      'crear': '#10b981',
      'actualizar': '#3b82f6',
      'eliminar': '#ef4444',
      'ver': '#6b7280',
      'login': '#3b82f6',
      'logout': '#f59e0b',
      'cambio_estado': '#f59e0b',
      'asignacion': '#3b82f6',
      'subir_archivo': '#3b82f6',
      'descargar_archivo': '#10b981'
    };
    return colorMap[action] || '#6b7280';
  };

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

  const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
  
  if (!user) {
    return <LoadingSpinner message="Cargando..." />;
  }
  
  if (!isAdmin) {
    return (
      <div style={styles.container}>
        <div style={styles.accessDenied}>
          <i className="bi bi-shield-x" style={styles.accessDeniedIcon}></i>
          <h3 style={styles.accessDeniedTitle}>Acceso Denegado</h3>
          <p style={styles.accessDeniedText}>
            No tienes permisos para ver los logs de actividad del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Compacto */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Logs de Actividad</h1>
          <p style={styles.subtitle}>Monitorea y audita todas las actividades del sistema</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => exportLogs('json')} style={styles.exportButton}>
            <i className="bi bi-download" style={{ marginRight: '6px' }}></i>
            Exportar JSON
          </button>
          <button onClick={() => exportLogs('csv')} style={styles.exportButtonSecondary}>
            <i className="bi bi-file-earmark-spreadsheet" style={{ marginRight: '6px' }}></i>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Contenedor Único Compacto: Estadísticas + Filtros */}
      <div style={styles.card}>
        {/* Estadísticas en línea */}
        {stats && stats.length > 0 && (
          <div style={styles.statsInline}>
            <StatCardInline
              icon="bi-activity"
              label="Total Actividades"
              value={stats.reduce((acc, stat) => acc + stat.total, 0)}
            />
            <StatCardInline
              icon="bi-people"
              label="Usuarios Activos"
              value={new Set(logs.map(log => log.usuario_id)).size}
            />
            <StatCardInline
              icon="bi-database"
              label="Tipos de Entidad"
              value={new Set(stats.map(stat => stat.entidad_tipo)).size}
            />
            <StatCardInline
              icon="bi-clock"
              label="Últimas 24h"
              value={logs.filter(log => {
                const logDate = new Date(log.created_at);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return logDate >= yesterday;
              }).length}
            />
          </div>
        )}

        {/* Filtros compactos */}
        <div style={styles.filtersCompact}>
          <input
            type="date"
            style={styles.filterInputCompact}
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            style={styles.filterInputCompact}
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="Fecha fin"
          />
          <select
            style={styles.filterInputCompact}
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
          <select
            style={styles.filterInputCompact}
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
          <div style={styles.searchGroupCompact}>
            <i className="bi bi-search" style={styles.searchIconCompact}></i>
            <input
              type="text"
              style={styles.searchInputCompact}
              placeholder="Buscar por usuario, descripción o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <button onClick={clearFilters} style={styles.clearButtonCompact}>
            <i className="bi bi-x-circle"></i>
          </button>
        </div>
      </div>

      {/* Tabla de Logs Compacta */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <i className="bi bi-activity" style={styles.cardIcon}></i>
          <h6 style={styles.cardTitle}>Registro de Actividades ({logs.length})</h6>
        </div>
        {loading ? (
          <div style={styles.loadingState}>
            <div className="spinner-border" style={{ color: '#3b82f6', marginRight: '12px' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <span>Cargando logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={styles.emptyState} data-testid="no-data-message">
            <i className="bi bi-exclamation-circle" style={styles.emptyIcon}></i>
            <h5 style={styles.emptyTitle}>No hay logs disponibles</h5>
            <p style={styles.emptyText}>
              No se encontraron registros de actividad con los filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table} data-testid="activity-logs-table">
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Fecha/Hora</th>
                    <th style={styles.tableHeader}>Usuario</th>
                    <th style={styles.tableHeader}>Acción</th>
                    <th style={styles.tableHeader}>Entidad</th>
                    <th style={styles.tableHeader}>Descripción</th>
                    <th style={styles.tableHeader}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      data-testid="activity-log-row"
                      style={styles.tableRow}
                      onClick={() => handleRowClick(log)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={styles.tableCell} data-testid="timestamp">
                        <div style={styles.cellContent}>
                          <i className="bi bi-clock" style={styles.cellIcon}></i>
                          <div>
                            <div style={styles.cellPrimary}>
                              {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            <small style={styles.cellSecondary}>
                              {format(new Date(log.created_at), 'HH:mm:ss', { locale: es })}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell} data-testid="user-name">
                        <div style={styles.cellContent}>
                          <i className="bi bi-person" style={styles.cellIcon}></i>
                          <div>
                            <div style={styles.cellPrimary}>
                              {log.usuario_nombre || 'Usuario desconocido'}
                            </div>
                            <small style={styles.cellSecondary}>
                              {log.usuario_email}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell} data-testid="action-type">
                        <span style={{
                          ...styles.badge,
                          backgroundColor: `${getActionColor(log.accion)}15`,
                          color: getActionColor(log.accion)
                        }}>
                          <i className={`bi ${getActionIcon(log.accion)}`} style={{ marginRight: '4px' }}></i>
                          <span style={{ textTransform: 'capitalize' }}>{log.accion}</span>
                        </span>
                      </td>
                      <td style={styles.tableCell} data-testid="resource-type">
                        <div style={styles.cellContent}>
                          <i className={`bi ${getEntityIcon(log.entidad_tipo)}`} style={styles.cellIcon}></i>
                          <div>
                            <div style={{ ...styles.cellPrimary, textTransform: 'capitalize' }}>
                              {log.entidad_tipo}
                            </div>
                            {log.entidad_id && (
                              <small style={styles.cellSecondary}>
                                ID: {log.entidad_id}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.truncatedText} title={log.descripcion}>
                          {log.descripcion}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <code style={styles.codeText}>
                          {log.ip_address || 'N/A'}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Compacta */}
            <div style={styles.pagination}>
              <div style={styles.paginationInfo}>
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, logs.length)} de{' '}
                {logs.length} registros
              </div>
              <div style={styles.paginationButtons}>
                <button
                  style={{
                    ...styles.paginationButton,
                    opacity: pagination.page <= 1 ? 0.5 : 1,
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                >
                  <i className="bi bi-chevron-left" style={{ marginRight: '4px' }}></i>
                  Anterior
                </button>
                <button
                  style={{
                    ...styles.paginationButton,
                    opacity: logs.length < pagination.limit ? 0.5 : 1,
                    cursor: logs.length < pagination.limit ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={logs.length < pagination.limit}
                >
                  Siguiente
                  <i className="bi bi-chevron-right" style={{ marginLeft: '4px' }}></i>
                </button>
              </div>
            </div>
          </>
        )}
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
            <div style={styles.modalGrid}>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Fecha y Hora</label>
                <p style={styles.modalValue}>
                  {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                </p>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Usuario</label>
                <p style={styles.modalValue}>
                  {selectedLog.usuario_nombre || 'Usuario desconocido'}
                </p>
                <small style={styles.cellSecondary}>
                  {selectedLog.usuario_email}
                </small>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Acción</label>
                <div>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: `${getActionColor(selectedLog.accion)}15`,
                    color: getActionColor(selectedLog.accion)
                  }}>
                    <i className={`bi ${getActionIcon(selectedLog.accion)}`} style={{ marginRight: '4px' }}></i>
                    <span style={{ textTransform: 'capitalize' }}>{selectedLog.accion}</span>
                  </span>
                </div>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Tipo de Entidad</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`bi ${getEntityIcon(selectedLog.entidad_tipo)}`} style={{ marginRight: '8px' }}></i>
                  <span style={{ textTransform: 'capitalize' }}>
                    {selectedLog.entidad_tipo}
                  </span>
                </div>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>ID de Entidad</label>
                <p style={styles.modalValue}>
                  {selectedLog.entidad_id || 'N/A'}
                </p>
              </div>
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Dirección IP</label>
                <p style={styles.modalValue}>
                  <code style={styles.codeText}>{selectedLog.ip_address || 'N/A'}</code>
                </p>
              </div>
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Descripción</label>
              <div style={styles.modalDescription}>
                {selectedLog.descripcion}
              </div>
            </div>
            {selectedLog.detalles_adicionales && (
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Detalles Adicionales</label>
                <pre style={styles.modalPre}>
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

/**
 * StatCardInline - Componente compacto para estadísticas en línea
 * Principio de Responsabilidad Única: Solo muestra una estadística
 */
const StatCardInline = ({ icon, label, value }) => (
  <div style={styles.statCardInline}>
    <i className={icon} style={styles.statIconInline}></i>
    <div>
      <div style={styles.statValueInline}>{value}</div>
      <div style={styles.statLabelInline}>{label}</div>
    </div>
  </div>
);

// Estilos modernos y compactos (DRY - Don't Repeat Yourself)
const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  exportButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  exportButtonSecondary: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statsInline: {
    display: 'flex',
    gap: '1.5rem',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    flexWrap: 'wrap'
  },
  statCardInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statIconInline: {
    fontSize: '1.25rem',
    color: '#6b7280'
  },
  statValueInline: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1
  },
  statLabelInline: {
    fontSize: '0.6875rem',
    color: '#6b7280',
    lineHeight: 1
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '0.75rem'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #f3f4f6'
  },
  cardIcon: {
    marginRight: '0.5rem',
    fontSize: '1rem',
    color: '#6b7280'
  },
  cardTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  filtersCompact: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  filterInputCompact: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#111827',
    backgroundColor: 'white',
    minWidth: '140px',
    flex: '1 1 auto'
  },
  searchGroupCompact: {
    position: 'relative',
    flex: '2 1 200px'
  },
  searchIconCompact: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '0.8125rem'
  },
  searchInputCompact: {
    width: '100%',
    padding: '0.375rem 0.5rem 0.375rem 2rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#111827',
    backgroundColor: 'white'
  },
  clearButtonCompact: {
    padding: '0.375rem 0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '1rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem'
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  tableHeader: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.8125rem'
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  tableCell: {
    padding: '0.75rem',
    color: '#111827'
  },
  cellContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  cellIcon: {
    color: '#6b7280',
    fontSize: '0.875rem',
    flexShrink: 0
  },
  cellPrimary: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827'
  },
  cellSecondary: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center'
  },
  truncatedText: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  codeText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  paginationInfo: {
    fontSize: '0.8125rem',
    color: '#6b7280'
  },
  paginationButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  paginationButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem'
  },
  emptyIcon: {
    fontSize: '3rem',
    color: '#9ca3af',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  accessDenied: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '3rem 2rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '2rem auto'
  },
  accessDeniedIcon: {
    fontSize: '4rem',
    color: '#ef4444',
    marginBottom: '1rem'
  },
  accessDeniedTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  accessDeniedText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  modalField: {
    marginBottom: '1rem'
  },
  modalLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.25rem',
    display: 'block'
  },
  modalValue: {
    fontSize: '0.875rem',
    color: '#111827',
    margin: 0
  },
  modalDescription: {
    backgroundColor: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#111827'
  },
  modalPre: {
    backgroundColor: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    maxHeight: '200px',
    overflow: 'auto',
    margin: 0
  }
};

export default ActivityLogsPage;
