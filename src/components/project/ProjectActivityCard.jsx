import React from 'react';

/**
 * ProjectActivityCard - Displays recent activity logs
 * Follows Single Responsibility Principle: Only displays activity history
 * 
 * @param {Object} props
 * @param {Array} props.activityLogs - Array of activity log entries
 * @returns {JSX.Element}
 */
const ProjectActivityCard = ({ activityLogs = [], hideHeader = false }) => {
  /**
   * Get relative time string (e.g., "2 hours ago", "3 days ago")
   * @param {string} dateString - ISO date string
   * @returns {string} Relative time string
   */
  const getRelativeTime = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) {
      return 'Hace unos segundos';
    } else if (diffMin < 60) {
      return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHour < 24) {
      return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else if (diffDay < 7) {
      return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    } else if (diffWeek < 4) {
      return `Hace ${diffWeek} ${diffWeek === 1 ? 'semana' : 'semanas'}`;
    } else if (diffMonth < 12) {
      return `Hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`;
    } else {
      return `Hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`;
    }
  };

  /**
   * Get action label in Spanish
   * @param {string} action - Action type
   * @returns {string} Action label
   */
  const getActionLabel = (action) => {
    const actionMap = {
      // English actions
      'created': 'Creó',
      'updated': 'Actualizó',
      'deleted': 'Eliminó',
      'viewed': 'Visualizó',
      'added_user': 'Agregó usuario',
      'removed_user': 'Removió usuario',
      'uploaded_file': 'Subió archivo',
      'deleted_file': 'Eliminó archivo',
      'created_task': 'Creó tarea',
      'updated_task': 'Actualizó tarea',
      'completed_task': 'Completó tarea',
      'assigned_task': 'Asignó tarea',
      // Spanish actions (from backend)
      'crear': 'Creó',
      'actualizar': 'Actualizó',
      'eliminar': 'Eliminó',
      'ver': 'Visualizó',
      'viewed': 'Visualizó',
      'login': 'Inició sesión',
      'logout': 'Cerró sesión',
      'cambio_estado': 'Cambió estado',
      'asignacion': 'Asignó',
      'subir_archivo': 'Subió archivo',
      'descargar_archivo': 'Descargó archivo'
    };
    return actionMap[action] || action;
  };

  /**
   * Get action icon based on action type
   * @param {string} action - Action type
   * @returns {JSX.Element} SVG icon
   */
  const getActionIcon = (action) => {
    const iconColor = 'var(--primary-500)';
    
    // Normalize action to handle both English and Spanish
    const normalizedAction = action?.toLowerCase();
    
    if (normalizedAction === 'created' || normalizedAction === 'crear') {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (normalizedAction === 'updated' || normalizedAction === 'actualizar') {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    }
    
    if (normalizedAction === 'deleted' || normalizedAction === 'eliminar') {
      return (
        <svg style={{ width: '20px', height: '20px', color: 'var(--danger-500)' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (normalizedAction === 'viewed' || normalizedAction === 'ver') {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (normalizedAction?.includes('user') || normalizedAction?.includes('usuario')) {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
      );
    }
    
    if (normalizedAction?.includes('file') || normalizedAction?.includes('archivo')) {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (normalizedAction?.includes('task') || normalizedAction?.includes('tarea')) {
      return (
        <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg style={{ width: '20px', height: '20px', color: iconColor }} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`card project-detail-card ${hideHeader ? 'no-card-style' : ''}`}>
      {!hideHeader && (
        <div className="card-header project-detail-card-header">
          <h3 className="mb-0">Actividad Reciente</h3>
        </div>
      )}
      <div className={`card-body project-detail-card-body ${hideHeader ? 'p-0' : ''}`}>
        {activityLogs.length === 0 ? (
          <div className="text-center py-4">
            <svg 
              className="mx-auto mb-3" 
              style={{ width: '48px', height: '48px', color: 'var(--gray-400)' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-muted mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
              No hay actividad reciente en este proyecto
            </p>
          </div>
        ) : (
          <div className="timeline">
            {activityLogs.map((log, index) => (
              <div 
                key={log.id} 
                className="timeline-item d-flex"
                style={{ 
                  paddingBottom: index < activityLogs.length - 1 ? 'var(--spacing-lg)' : '0',
                  position: 'relative'
                }}
              >
                {/* Timeline line */}
                {index < activityLogs.length - 1 && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '28px',
                      bottom: '0',
                      width: '2px',
                      backgroundColor: 'var(--border-color)'
                    }}
                  />
                )}
                
                {/* Icon */}
                <div 
                  className="flex-shrink-0 me-3 d-flex align-items-center justify-content-center rounded-circle bg-white"
                  style={{ 
                    width: '40px', 
                    height: '40px',
                    border: '2px solid var(--border-color)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {getActionIcon(log.accion)}
                </div>
                
                {/* Content */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {log.user_name || 'Usuario desconocido'}
                      </span>
                      <span className="text-muted mx-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {getActionLabel(log.accion)}
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                      {getRelativeTime(log.created_at)}
                    </span>
                  </div>
                  
                  {log.descripcion && (
                    <p className="mb-0 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {log.descripcion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectActivityCard;
