import StatusBadge from '../common/StatusBadge';

/**
 * ProjectInfoCard - Displays general project information
 * Follows Single Responsibility Principle: Only displays project info
 * 
 * @param {Object} props
 * @param {Object} props.project - Project data object
 * @param {Array} props.responsibles - Array of responsible users
 * @param {Function} props.onEdit - Callback for edit button
 * @param {boolean} props.canEdit - Whether user can edit project
 * @returns {JSX.Element}
 */
const ProjectInfoCard = ({ project, responsibles = [], onEdit, canEdit = false }) => {
  if (!project) {
    return null;
  }

  /**
   * Format date to DD/MM/YYYY format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Get status variant for badge
   * @param {string} status - Project status
   * @returns {string} Badge variant
   */
  const getStatusVariant = (status) => {
    const statusMap = {
      'planificacion': 'info',
      'en_progreso': 'warning',
      'completado': 'success',
      'cancelado': 'danger'
    };
    return statusMap[status] || 'default';
  };

  /**
   * Get status label in Spanish
   * @param {string} status - Project status
   * @returns {string} Status label
   */
  const getStatusLabel = (status) => {
    const labelMap = {
      'planificacion': 'Planificación',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return labelMap[status] || status;
  };

  return (
    <div className="card project-detail-card project-info-modern">
      <div className="card-body" style={{ padding: '3rem 3.5rem' }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-5">
          <div className="flex-grow-1 pe-5">
            <h1 className="mb-4" style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              {project.titulo}
            </h1>
            <p className="mb-0" style={{ fontSize: '1.0625rem', color: '#6b7280', lineHeight: '1.7', maxWidth: '90%' }}>
              {project.descripcion || 'No hay descripción disponible'}
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <StatusBadge 
              status={getStatusLabel(project.estado)} 
              variant={getStatusVariant(project.estado)}
              size="medium"
            />
            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                title="Editar proyecto"
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="d-flex flex-wrap align-items-center gap-5 pt-5 pb-5" style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
          {/* Dates */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                {formatDate(project.fecha_inicio)}
              </span>
            </div>
            <span style={{ color: '#d1d5db', fontSize: '1.25rem', fontWeight: '300' }}>→</span>
            <div className="d-flex align-items-center gap-2">
              <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                {formatDate(project.fecha_fin)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }}></div>

          {/* Creator */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: '40px', height: '40px', fontSize: '0.9375rem', fontWeight: '600', backgroundColor: '#4f46e5', color: '#ffffff' }}>
              {project.creator_name ? project.creator_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', lineHeight: '1.4' }}>
                {project.creator_name || 'Usuario desconocido'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.4' }}>
                {project.creator_email || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Responsibles Section */}
        {responsibles.length > 0 && (
          <div className="pt-5">
            <h3 className="mb-4" style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Responsables del Proyecto
            </h3>
            <div className="d-flex flex-wrap gap-4">
              {responsibles.map((responsible) => (
                <div 
                  key={responsible.id}
                  className="d-flex align-items-center gap-3 p-3 rounded"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    minWidth: '280px'
                  }}
                >
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff'
                    }}
                  >
                    {responsible.nombre ? responsible.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-grow-1">
                    <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#111827', lineHeight: '1.4' }}>
                      {responsible.nombre}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: '1.4' }}>
                      {responsible.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoCard;
