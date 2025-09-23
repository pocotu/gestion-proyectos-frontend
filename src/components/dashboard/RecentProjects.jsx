import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import dashboardService from '../../services/dashboardService';

/**
 * RecentProjects - Componente para mostrar proyectos recientes
 * Siguiendo la temática del dashboard con diseño simple y limpio
 */
const RecentProjects = () => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentProjects();
  }, [user]);

  const loadRecentProjects = async () => {
    try {
      setLoading(true);
      
      // Obtener proyectos reales del backend
      const recentProjectsResponse = await dashboardService.getRecentProjects(4);
      const recentProjects = recentProjectsResponse?.data || [];

      // Formatear los proyectos para el componente
      const formattedProjects = recentProjects.map(project => ({
        id: project.id,
        nombre: project.titulo || project.nombre,
        descripcion: project.descripcion,
        estado: project.estado,
        fecha_creacion: new Date(project.fecha_creacion || project.created_at),
        fecha_limite: project.fecha_fin ? new Date(project.fecha_fin) : null,
        progreso: project.progreso || 0,
        responsable: project.responsable_nombre || 'Sin asignar'
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error cargando proyectos recientes:', error);
      showError('Error al cargar los proyectos recientes');
      // En caso de error, mostrar array vacío en lugar de datos mock
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo':
        return '#28a745';
      case 'completado':
        return '#007bff';
      case 'pausado':
        return '#ffc107';
      case 'cancelado':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'completado':
        return 'Completado';
      case 'pausado':
        return 'Pausado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.container} data-testid="recent-projects">
        <div style={styles.header}>
          <h3 style={styles.title}>Proyectos Recientes</h3>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Cargando proyectos...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="recent-projects">
      <div style={styles.header}>
        <h3 style={styles.title}>Proyectos Recientes</h3>
        <div style={styles.headerActions}>
          <button 
            style={styles.refreshButton}
            onClick={loadRecentProjects}
            title="Actualizar proyectos"
          >
            🔄
          </button>
          <Link to="/projects" style={styles.viewAllLink}>
            Ver todos
          </Link>
        </div>
      </div>
      
      <div style={styles.projectsList}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📁</span>
            <p style={styles.emptyText}>No hay proyectos recientes</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={styles.projectItem}>
              <div style={styles.projectHeader}>
                <div style={styles.projectTitle}>
                  <Link 
                    to={`/projects/${project.id}`} 
                    style={styles.projectName}
                  >
                    {project.nombre}
                  </Link>
                  <span 
                    style={{
                      ...styles.projectStatus,
                      backgroundColor: getStatusColor(project.estado)
                    }}
                  >
                    {getStatusText(project.estado)}
                  </span>
                </div>
                <div style={styles.projectProgress}>
                  <span style={styles.progressText}>{project.progreso}%</span>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${project.progreso}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={styles.projectDescription}>
                {project.descripcion}
              </div>
              
              <div style={styles.projectMeta}>
                <div style={styles.projectInfo}>
                  <span style={styles.metaLabel}>Responsable:</span>
                  <span style={styles.metaValue}>{project.responsable}</span>
                </div>
                <div style={styles.projectInfo}>
                  <span style={styles.metaLabel}>Creado:</span>
                  <span style={styles.metaValue}>{formatDate(project.fecha_creacion)}</span>
                </div>
                <div style={styles.projectInfo}>
                  <span style={styles.metaLabel}>Límite:</span>
                  <span style={styles.metaValue}>{formatDate(project.fecha_limite)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Estilos siguiendo la temática del dashboard
const styles = {
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxHeight: '400px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #cccccc'
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#333333',
    textDecoration: 'none',
    padding: '6px 12px',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    color: '#666666'
  },
  loadingText: {
    fontSize: '14px'
  },
  projectsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '5px'
  },
  projectItem: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eeeeee'
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  projectTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  projectName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333333',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  projectStatus: {
    fontSize: '12px',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  projectProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '100px'
  },
  progressText: {
    fontSize: '12px',
    color: '#666666',
    fontWeight: '500'
  },
  progressBar: {
    width: '60px',
    height: '6px',
    backgroundColor: '#e9ecef',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  projectDescription: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  projectMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '12px'
  },
  projectInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  metaLabel: {
    color: '#666666',
    fontWeight: '500'
  },
  metaValue: {
    color: '#333333'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#666666'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '14px',
    margin: '0'
  }
};

export default RecentProjects;