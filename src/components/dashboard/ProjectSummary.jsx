import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ProjectSummary - Componente para mostrar resumen de proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar estadísticas de proyectos
 * - Open/Closed: Abierto para extensión (nuevas métricas, estilos)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de resumen
 * - Interface Segregation: Props específicas para datos de proyectos
 * - Dependency Inversion: No depende de implementaciones específicas
 */

const ProjectSummary = ({ 
  projectData, 
  isLoading = false, 
  userRole = 'usuario',
  className = '' 
}) => {
  if (isLoading) {
    return (
      <div className={`project-summary loading ${className}`}>
        <div className="summary-header">
          <h3>Resumen de Proyectos</h3>
        </div>
        <div className="loading-content">
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className={`project-summary error ${className}`}>
        <div className="summary-header">
          <h3>Resumen de Proyectos</h3>
        </div>
        <div className="error-content">
          <p>No se pudieron cargar los datos de proyectos</p>
        </div>
      </div>
    );
  }

  const {
    total = 0,
    active = 0,
    completed = 0,
    myProjects = 0,
    planificacion = 0,
    en_progreso = 0,
    cancelado = 0
  } = projectData;

  // Calcular porcentajes
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className={`project-summary ${className}`}>
      <div className="summary-header">
         <h3>Resumen de Proyectos</h3>
         <Link to="/projects" className="view-all-link">
           Ver todos →
         </Link>
       </div>

      <div className="summary-content">
        {/* Estadísticas principales */}
        <div className="main-stats">
          <div className="stat-card primary">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total de Proyectos</div>
          </div>

          <div className="stat-card success">
            <div className="stat-number">{active}</div>
            <div className="stat-label">Activos</div>
            <div className="stat-percentage">{activeRate}%</div>
          </div>

          <div className="stat-card info">
            <div className="stat-number">{completed}</div>
            <div className="stat-label">Completados</div>
            <div className="stat-percentage">{completionRate}%</div>
          </div>

          {userRole !== 'admin' && (
            <div className="stat-card warning">
              <div className="stat-number">{myProjects}</div>
              <div className="stat-label">Mis Proyectos</div>
            </div>
          )}
        </div>

        {/* Estadísticas por estado (solo para admin) */}
        {userRole === 'admin' && (
          <div className="status-breakdown">
            <h4>Por Estado:</h4>
            <div className="status-stats">
              <div className="status-item">
                <span className="status-dot planning"></span>
                <span className="status-label">Planificación</span>
                <span className="status-count">{planificacion}</span>
              </div>
              <div className="status-item">
                <span className="status-dot progress"></span>
                <span className="status-label">En Progreso</span>
                <span className="status-count">{en_progreso}</span>
              </div>
              <div className="status-item">
                <span className="status-dot completed"></span>
                <span className="status-label">Completados</span>
                <span className="status-count">{completed}</span>
              </div>
              {cancelado > 0 && (
                <div className="status-item">
                  <span className="status-dot cancelled"></span>
                  <span className="status-label">Cancelados</span>
                  <span className="status-count">{cancelado}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barra de progreso general */}
        <div className="progress-section">
          <div className="progress-header">
            <span>Progreso General</span>
            <span>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="quick-actions">
          {userRole === 'admin' && (
            <Link to="/projects/new" className="action-button primary">
              + Nuevo Proyecto
            </Link>
          )}
          <Link to="/projects" className="action-button secondary">
            Gestionar Proyectos
          </Link>
        </div>
      </div>

      <style jsx>{`
        .project-summary {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .view-all-link {
          color: var(--color-bright-blue);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .main-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-card.primary {
          background: var(--color-bright-blue);
          color: white;
          border: none;
        }

        .stat-card.success {
          background: #059669;
          color: white;
          border: none;
        }

        .stat-card.info {
          background: var(--color-dark-teal);
          color: white;
          border: none;
        }

        .stat-card.warning {
          background: #d97706;
          color: white;
          border: none;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .stat-percentage {
          font-size: 0.75rem;
          margin-top: 4px;
          opacity: 0.8;
        }

        .status-breakdown {
          margin-bottom: 24px;
        }

        .status-breakdown h4 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
        }

        .status-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.planning { background: #f59e0b; }
        .status-dot.progress { background: #3b82f6; }
        .status-dot.completed { background: #10b981; }
        .status-dot.cancelled { background: #ef4444; }

        .status-label {
          flex: 1;
          font-size: 0.875rem;
          color: #374151;
        }

        .status-count {
          font-weight: 600;
          color: #1f2937;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #059669;
          transition: width 0.3s ease;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background: var(--color-bright-blue);
          color: white;
        }

        .action-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .loading-content, .error-content {
          padding: 20px;
          text-align: center;
        }

        .loading-skeleton {
          height: 20px;
          background: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 12px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-content p {
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 768px) {
          .main-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .quick-actions {
            flex-direction: column;
          }
          
          .action-button {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectSummary;