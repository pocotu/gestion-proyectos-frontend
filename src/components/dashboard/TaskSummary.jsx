import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TaskSummary - Componente para mostrar resumen de tareas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar estadísticas de tareas
 * - Open/Closed: Abierto para extensión (nuevas métricas, filtros)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de resumen
 * - Interface Segregation: Props específicas para datos de tareas
 * - Dependency Inversion: No depende de implementaciones específicas
 */

const TaskSummary = ({ 
  taskData, 
  isLoading = false, 
  userRole = 'usuario',
  className = '' 
}) => {
  if (isLoading) {
    return (
      <div className={`task-summary loading ${className}`}>
        <div className="summary-header">
          <h3>Resumen de Tareas</h3>
        </div>
        <div className="loading-content">
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className={`task-summary error ${className}`}>
        <div className="summary-header">
          <h3>Resumen de Tareas</h3>
        </div>
        <div className="error-content">
          <p>No se pudieron cargar los datos de tareas</p>
        </div>
      </div>
    );
  }

  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    completed = 0,
    myTasks = 0,
    alta = 0,
    media = 0,
    baja = 0
  } = taskData;

  // Calcular porcentajes
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Obtener prioridad más común
  const priorities = [
    { name: 'Alta', count: alta, color: '#ef4444' },
    { name: 'Media', count: media, color: '#f59e0b' },
    { name: 'Baja', count: baja, color: '#10b981' }
  ];
  const topPriority = priorities.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );

  return (
    <div className={`task-summary ${className}`}>
      <div className="summary-header">
          <h3>Resumen de Tareas</h3>
          <Link to="/tasks" className="view-all-link">
            Ver todas →
          </Link>
        </div>

      <div className="summary-content">
        {/* Estadísticas principales */}
        <div className="main-stats">
          <div className="stat-card primary">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total de Tareas</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-number">{pending}</div>
            <div className="stat-label">Pendientes</div>
            <div className="stat-percentage">{pendingRate}%</div>
          </div>

          <div className="stat-card info">
            <div className="stat-number">{inProgress}</div>
            <div className="stat-label">En Progreso</div>
            <div className="stat-percentage">{progressRate}%</div>
          </div>

          <div className="stat-card success">
            <div className="stat-number">{completed}</div>
            <div className="stat-label">Completadas</div>
            <div className="stat-percentage">{completionRate}%</div>
          </div>

          {userRole !== 'admin' && (
            <div className="stat-card personal">
              <div className="stat-number">{myTasks}</div>
              <div className="stat-label">Mis Tareas</div>
            </div>
          )}
        </div>

        {/* Distribución por prioridad */}
        <div className="priority-section">
          <h4>Distribución por Prioridad:</h4>
          <div className="priority-stats">
            <div className="priority-item high">
              <div className="priority-header">
                <span className="priority-dot high"></span>
                <span className="priority-label">Alta</span>
                <span className="priority-count">{alta}</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-fill high" 
                  style={{ width: `${total > 0 ? (alta / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="priority-item medium">
              <div className="priority-header">
                <span className="priority-dot medium"></span>
                <span className="priority-label">Media</span>
                <span className="priority-count">{media}</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-fill medium" 
                  style={{ width: `${total > 0 ? (media / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="priority-item low">
              <div className="priority-header">
                <span className="priority-dot low"></span>
                <span className="priority-label">Baja</span>
                <span className="priority-count">{baja}</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-fill low" 
                  style={{ width: `${total > 0 ? (baja / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso general */}
        <div className="progress-section">
          <div className="progress-header">
            <span>Progreso de Completación</span>
            <span>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill completed" 
              style={{ width: `${completionRate}%` }}
            ></div>
            <div 
              className="progress-fill in-progress" 
              style={{ width: `${progressRate}%`, left: `${completionRate}%` }}
            ></div>
          </div>
          <div className="progress-legend">
            <div className="legend-item">
              <span className="legend-dot completed"></span>
              <span>Completadas ({completed})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot in-progress"></span>
              <span>En Progreso ({inProgress})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot pending"></span>
              <span>Pendientes ({pending})</span>
            </div>
          </div>
        </div>

        {/* Insight destacado */}
        {total > 0 && (
          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <div className="insight-title">Insight</div>
              <div className="insight-text">
                La mayoría de tareas tienen prioridad <strong>{topPriority.name.toLowerCase()}</strong> 
                ({topPriority.count} de {total}). 
                {completionRate >= 70 ? 
                  ' ¡Excelente progreso!' : 
                  completionRate >= 40 ? 
                    ' Buen avance, sigue así.' : 
                    ' Considera revisar las tareas pendientes.'
                }
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="quick-actions">
          {userRole === 'admin' && (
            <Link to="/tasks/new" className="action-button primary">
              + Nueva Tarea
            </Link>
          )}
          <Link to="/tasks?filter=pending" className="action-button warning">
            Ver Pendientes
          </Link>
          <Link to="/tasks" className="action-button secondary">
            Gestionar Tareas
          </Link>
        </div>
      </div>

      <style jsx>{`
        .task-summary {
          background: white;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-header h3 {
          margin: 0;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .view-all-link {
          color: var(--color-dark-teal);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.7rem;
        }

        .main-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat-card {
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-card.primary {
          background: var(--color-dark-teal);
          color: white;
          border: none;
        }

        .stat-card.warning {
          background: #d97706;
          color: white;
          border: none;
        }

        .stat-card.info {
          background: var(--color-bright-blue);
          color: white;
          border: none;
        }

        .stat-card.success {
          background: #059669;
          color: white;
          border: none;
        }

        .stat-card.personal {
          background: #db2777;
          color: white;
          border: none;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1px;
        }

        .stat-label {
          font-size: 0.6rem;
          opacity: 0.9;
          font-weight: 500;
          line-height: 1.1;
        }

        .stat-percentage {
          font-size: 0.6rem;
          margin-top: 1px;
          opacity: 0.8;
        }

        .priority-section {
          margin-bottom: 12px;
        }

        .priority-section h4 {
          margin: 0 0 6px 0;
          color: #374151;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .priority-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .priority-item {
          background: #f9fafb;
          border-radius: 4px;
          padding: 6px;
        }

        .priority-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .priority-dot.high { background: #ef4444; }
        .priority-dot.medium { background: #f59e0b; }
        .priority-dot.low { background: #10b981; }

        .priority-label {
          flex: 1;
          font-size: 0.7rem;
          color: #374151;
          font-weight: 500;
        }

        .priority-count {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.7rem;
        }

        .priority-bar {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .priority-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .priority-fill.high { background: #ef4444; }
        .priority-fill.medium { background: #f59e0b; }
        .priority-fill.low { background: #10b981; }

        .progress-section {
          margin-bottom: 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.7rem;
          color: #374151;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          margin-bottom: 6px;
        }

        .progress-fill.completed {
          background: #10b981;
          position: absolute;
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-fill.in-progress {
          background: #3b82f6;
          position: absolute;
          height: 100%;
          transition: width 0.3s ease, left 0.3s ease;
        }

        .progress-legend {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: #6b7280;
        }

        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .legend-dot.completed { background: #10b981; }
        .legend-dot.in-progress { background: #3b82f6; }
        .legend-dot.pending { background: #f59e0b; }

        .insight-card {
          background: #fde68a;
          border: 1px solid #f59e0b;
          border-radius: 4px;
          padding: 8px;
          margin-bottom: 12px;
          display: flex;
          gap: 6px;
        }

        .insight-icon {
          font-size: 1rem;
        }

        .insight-content {
          flex: 1;
        }

        .insight-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 2px;
          font-size: 0.7rem;
        }

        .insight-text {
          color: #78350f;
          font-size: 0.65rem;
          line-height: 1.3;
        }

        .quick-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 4px 8px;
          border-radius: 3px;
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background: var(--color-dark-teal);
          color: white;
        }

        .action-button.warning {
          background: #f59e0b;
          color: white;
        }

        .action-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .loading-content, .error-content {
          padding: 12px;
          text-align: center;
        }

        .loading-skeleton {
          height: 12px;
          background: #f3f4f6;
          border-radius: 2px;
          margin-bottom: 6px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-content p {
          color: #6b7280;
          margin: 0;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .main-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          
          .quick-actions {
            flex-direction: column;
          }
          
          .action-button {
            text-align: center;
          }

          .progress-legend {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskSummary;