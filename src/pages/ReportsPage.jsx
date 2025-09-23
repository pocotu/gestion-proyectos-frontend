import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ReportsPage - Página de reportes y estadísticas del sistema
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la generación y visualización de reportes
 * - Open/Closed: Abierto para extensión (nuevos tipos de reportes)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de reportes
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotifications)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Estados principales
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, active: 0, completed: 0, cancelled: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    files: { total: 0, totalSize: 0 },
    activity: { logins: 0, actions: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros para reportes
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'general',
    format: 'pdf'
  });

  // Estados de gráficos
  const [chartData, setChartData] = useState({
    projectsOverTime: [],
    tasksOverTime: [],
    userActivity: []
  });

  // Verificar permisos
  useEffect(() => {
    const hasPermission = user?.es_administrador || 
                         user?.roles?.some(role => ['admin', 'responsable_proyecto'].includes(role.nombre));
    
    if (!hasPermission) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStatistics();
    loadChartData();
  }, []);

  // Función para cargar estadísticas generales
  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/reports/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      } else {
        throw new Error('Error al cargar estadísticas');
      }
    } catch (err) {
      setError(err.message);
      addNotification('Error al cargar estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos de gráficos
  const loadChartData = async () => {
    try {
      const response = await fetch('/api/reports/charts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChartData(data.data || {});
      }
    } catch (err) {
      console.error('Error al cargar datos de gráficos:', err);
    }
  };

  // Función para generar reporte
  const handleGenerateReport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(reportFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/reports/generate?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const extension = reportFilters.format === 'pdf' ? 'pdf' : 'xlsx';
        a.download = `reporte_${reportFilters.reportType}_${new Date().toISOString().split('T')[0]}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        addNotification('Reporte generado exitosamente', 'success');
      } else {
        throw new Error('Error al generar reporte');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Función para formatear números
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Función para formatear tamaño de archivos
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Componente para tarjetas de estadísticas
  const StatCard = ({ title, value, subtitle, icon }) => (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
            <i className={`bi ${icon} text-primary fs-4`}></i>
          </div>
          <div>
            <h6 className="card-subtitle mb-1 text-muted">{title}</h6>
            <h4 className="card-title mb-0 fw-bold">{formatNumber(value)}</h4>
            {subtitle && (
              <small className="text-primary">{subtitle}</small>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">Estadísticas del Sistema</h1>
              <p className="text-muted mb-0">Análisis y métricas del sistema de gestión de proyectos</p>
            </div>
            <button
              onClick={loadStatistics}
              disabled={loading}
              className="btn btn-outline-primary d-flex align-items-center"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Configuración de Reportes */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-gear me-2"></i>
                Configuración de Reportes
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-semibold">Fecha Inicio</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-semibold">Tipo de Reporte</label>
                  <select
                    value={reportFilters.reportType}
                    onChange={(e) => setReportFilters({ ...reportFilters, reportType: e.target.value })}
                    className="form-select"
                  >
                    <option value="general">General</option>
                    <option value="projects">Proyectos</option>
                    <option value="tasks">Tareas</option>
                    <option value="users">Usuarios</option>
                    <option value="activity">Actividad</option>
                  </select>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <label className="form-label fw-semibold">Formato</label>
                  <select
                    value={reportFilters.format}
                    onChange={(e) => setReportFilters({ ...reportFilters, format: e.target.value })}
                    className="form-select"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top">
                <button
                  onClick={handleGenerateReport}
                  className="btn btn-primary"
                >
                  <i className="bi bi-download me-2"></i>
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="row mb-4">
        <div className="col-12">
          <h5 className="mb-3 text-dark fw-semibold">Resumen General</h5>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Total Usuarios"
            value={stats.users?.total || 0}
            subtitle={`${stats.users?.active || 0} activos`}
            icon="bi-people"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Total Proyectos"
            value={stats.projects?.total || 0}
            subtitle={`${stats.projects?.active || 0} activos`}
            icon="bi-folder"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Total Tareas"
            value={stats.tasks?.total || 0}
            subtitle={`${stats.tasks?.completed || 0} completadas`}
            icon="bi-clipboard-check"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <StatCard
            title="Archivos"
            value={stats.files?.total || 0}
            subtitle={formatFileSize(stats.files?.totalSize || 0)}
            icon="bi-file-earmark"
          />
        </div>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="row mb-4">
        {/* Proyectos */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-folder me-2"></i>
                Estado de Proyectos
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">En Planificación</span>
                  <span className="fw-semibold text-primary">{stats.projects?.planning || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.projects?.planning / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">En Progreso</span>
                  <span className="fw-semibold text-primary">{stats.projects?.active || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.projects?.active / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Completados</span>
                  <span className="fw-semibold text-primary">{stats.projects?.completed || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.projects?.completed / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Cancelados</span>
                  <span className="fw-semibold text-primary">{stats.projects?.cancelled || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.projects?.cancelled / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tareas */}
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-clipboard-check me-2"></i>
                Estado de Tareas
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Pendientes</span>
                  <span className="fw-semibold text-primary">{stats.tasks?.pending || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.tasks?.pending / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">En Progreso</span>
                  <span className="fw-semibold text-primary">{stats.tasks?.inProgress || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.tasks?.inProgress / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Completadas</span>
                  <span className="fw-semibold text-primary">{stats.tasks?.completed || 0}</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.tasks?.completed / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Canceladas</span>
                  <span className="fw-semibold text-primary">{stats.tasks?.cancelled || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(stats.tasks?.cancelled / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad del Sistema */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-activity me-2"></i>
                Actividad del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2">
                    <i className="bi bi-box-arrow-in-right text-primary fs-4"></i>
                  </div>
                  <h4 className="text-primary fw-bold">{formatNumber(stats.activity?.logins || 0)}</h4>
                  <small className="text-muted">Inicios de Sesión</small>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2">
                    <i className="bi bi-lightning text-primary fs-4"></i>
                  </div>
                  <h4 className="text-primary fw-bold">{formatNumber(stats.activity?.actions || 0)}</h4>
                  <small className="text-muted">Acciones Realizadas</small>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2">
                    <i className="bi bi-people text-primary fs-4"></i>
                  </div>
                  <h4 className="text-primary fw-bold">{formatNumber(stats.users?.active || 0)}</h4>
                  <small className="text-muted">Usuarios Activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0 d-flex align-items-center">
                <i className="bi bi-file-earmark-text me-2"></i>
                Reportes Disponibles
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 border">
                    <div className="card-body text-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                        <i className="bi bi-bar-chart text-primary fs-4"></i>
                      </div>
                      <h6 className="card-title">Reporte General</h6>
                      <p className="card-text text-muted small">
                        Resumen completo del sistema con todas las métricas principales
                      </p>
                      <button 
                        onClick={() => setReportFilters({...reportFilters, reportType: 'general'})}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-download me-1"></i>
                        Generar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 border">
                    <div className="card-body text-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                        <i className="bi bi-folder text-primary fs-4"></i>
                      </div>
                      <h6 className="card-title">Reporte de Proyectos</h6>
                      <p className="card-text text-muted small">
                        Análisis detallado del estado y progreso de proyectos
                      </p>
                      <button 
                        onClick={() => setReportFilters({...reportFilters, reportType: 'projects'})}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-download me-1"></i>
                        Generar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 col-md-6 mb-3">
                  <div className="card h-100 border">
                    <div className="card-body text-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                        <i className="bi bi-people text-primary fs-4"></i>
                      </div>
                      <h6 className="card-title">Reporte de Usuarios</h6>
                      <p className="card-text text-muted small">
                        Estadísticas de usuarios, roles y actividad
                      </p>
                      <button 
                        onClick={() => setReportFilters({...reportFilters, reportType: 'users'})}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-download me-1"></i>
                        Generar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;