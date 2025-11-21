import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ReportsPage - Página de reportes y estadísticas con diseño moderno y compacto
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja reportes y estadísticas
 * - Open/Closed: Extensible mediante componentes modulares
 * - Dependency Inversion: Depende de abstracciones (servicios, contextos)
 */
const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, active: 0, completed: 0, cancelled: 0, planning: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
    files: { total: 0, totalSize: 0 },
    activity: { logins: 0, actions: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'general',
    format: 'pdf'
  });

  useEffect(() => {
    const hasPermission = user?.es_administrador || 
                         user?.roles?.some(role => ['admin', 'responsable_proyecto'].includes(role.nombre));
    
    if (!hasPermission) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadStatistics();
  }, []);

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
        setStats(data.data || stats);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  return (
    <div style={styles.container}>
      {/* Header Compacto */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Estadísticas del Sistema</h1>
          <p style={styles.subtitle}>Análisis y métricas del sistema de gestión de proyectos</p>
        </div>
        <button onClick={loadStatistics} disabled={loading} style={styles.refreshButton}>
          <i className="bi bi-arrow-clockwise" style={{ marginRight: '6px' }}></i>
          Actualizar
        </button>
      </div>

      {/* Contenedor Único: Configuración + Estadísticas */}
      <div style={styles.card}>
        {/* Configuración de Reportes Compacta */}
        <div style={styles.reportConfig}>
          <input
            type="date"
            style={styles.filterInput}
            value={reportFilters.startDate}
            onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            style={styles.filterInput}
            value={reportFilters.endDate}
            onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
            placeholder="Fecha fin"
          />
          <select
            style={styles.filterInput}
            value={reportFilters.reportType}
            onChange={(e) => setReportFilters({ ...reportFilters, reportType: e.target.value })}
          >
            <option value="general">General</option>
            <option value="projects">Proyectos</option>
            <option value="tasks">Tareas</option>
            <option value="users">Usuarios</option>
            <option value="activity">Actividad</option>
          </select>
          <select
            style={styles.filterInput}
            value={reportFilters.format}
            onChange={(e) => setReportFilters({ ...reportFilters, format: e.target.value })}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
          <button onClick={handleGenerateReport} style={styles.generateButton}>
            <i className="bi bi-download" style={{ marginRight: '6px' }}></i>
            Generar Reporte
          </button>
        </div>

        {/* Estadísticas Generales en Línea */}
        <div style={styles.statsInline}>
          <StatInline
            icon="bi-people"
            label="Total Usuarios"
            value={stats.users?.total || 0}
            subtitle={`${stats.users?.active || 0} activos`}
          />
          <StatInline
            icon="bi-folder"
            label="Total Proyectos"
            value={stats.projects?.total || 0}
            subtitle={`${stats.projects?.active || 0} activos`}
          />
          <StatInline
            icon="bi-clipboard-check"
            label="Total Tareas"
            value={stats.tasks?.total || 0}
            subtitle={`${stats.tasks?.completed || 0} completadas`}
          />
          <StatInline
            icon="bi-file-earmark"
            label="Archivos"
            value={stats.files?.total || 0}
            subtitle={formatFileSize(stats.files?.totalSize || 0)}
          />
        </div>
      </div>

      {/* Grid de Estadísticas Detalladas */}
      <div style={styles.detailsGrid}>
        {/* Estado de Proyectos */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-folder" style={styles.cardIcon}></i>
            <h6 style={styles.cardTitle}>Estado de Proyectos</h6>
          </div>
          <div style={styles.progressList}>
            <ProgressItem
              label="En Planificación"
              value={stats.projects?.planning || 0}
              total={stats.projects?.total || 1}
            />
            <ProgressItem
              label="En Progreso"
              value={stats.projects?.active || 0}
              total={stats.projects?.total || 1}
            />
            <ProgressItem
              label="Completados"
              value={stats.projects?.completed || 0}
              total={stats.projects?.total || 1}
            />
          </div>
        </div>

        {/* Estado de Tareas */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <i className="bi bi-clipboard-check" style={styles.cardIcon}></i>
            <h6 style={styles.cardTitle}>Estado de Tareas</h6>
          </div>
          <div style={styles.progressList}>
            <ProgressItem
              label="Pendientes"
              value={stats.tasks?.pending || 0}
              total={stats.tasks?.total || 1}
            />
            <ProgressItem
              label="En Progreso"
              value={stats.tasks?.inProgress || 0}
              total={stats.tasks?.total || 1}
            />
            <ProgressItem
              label="Completadas"
              value={stats.tasks?.completed || 0}
              total={stats.tasks?.total || 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * StatInline - Componente compacto para estadísticas en línea
 * Principio de Responsabilidad Única: Solo muestra una estadística
 */
const StatInline = ({ icon, label, value, subtitle }) => (
  <div style={styles.statInline}>
    <i className={icon} style={styles.statIcon}></i>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {subtitle && <div style={styles.statSubtitle}>{subtitle}</div>}
    </div>
  </div>
);

/**
 * ProgressItem - Componente para items de progreso
 * Principio de Responsabilidad Única: Solo muestra un item de progreso
 */
const ProgressItem = ({ label, value, total }) => {
  const percentage = total > 0 ? (value / total * 100) : 0;
  
  return (
    <div style={styles.progressItem}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressValue}>{value}</span>
      </div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

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
  refreshButton: {
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
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '0.75rem'
  },
  reportConfig: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #f3f4f6'
  },
  filterInput: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    color: '#111827',
    backgroundColor: 'white',
    minWidth: '140px',
    flex: '1 1 auto'
  },
  generateButton: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  statsInline: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },
  statInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1 1 200px'
  },
  statIcon: {
    fontSize: '1.5rem',
    color: '#6b7280'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: 1,
    marginTop: '0.25rem'
  },
  statSubtitle: {
    fontSize: '0.6875rem',
    color: '#3b82f6',
    lineHeight: 1,
    marginTop: '0.125rem'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '0.75rem'
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
  progressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  progressItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressLabel: {
    fontSize: '0.8125rem',
    color: '#6b7280'
  },
  progressValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  }
};

export default ReportsPage;
