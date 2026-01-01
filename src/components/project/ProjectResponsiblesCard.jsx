import React from 'react';
import ActionButton from '../common/ActionButton';

/**
 * ProjectResponsiblesCard - Displays list of project responsibles
 * Follows Single Responsibility Principle: Only displays responsibles list
 * 
 * @param {Object} props
 * @param {Array} props.responsibles - Array of responsible users
 * @param {boolean} props.canManage - Whether user can add/remove responsibles
 * @param {Function} props.onAdd - Callback for adding responsible
 * @param {Function} props.onRemove - Callback for removing responsible
 * @returns {JSX.Element}
 */
const ProjectResponsiblesCard = ({ 
  responsibles = [], 
  canManage = false,
  onAdd,
  onRemove 
}) => {
  /**
   * Get role label in Spanish
   * @param {string} role - Role identifier
   * @returns {string} Role label
   */
  const getRoleLabel = (role) => {
    const roleMap = {
      'responsable_principal': 'Responsable Principal',
      'responsable_secundario': 'Responsable Secundario',
      'colaborador': 'Colaborador',
      'supervisor': 'Supervisor'
    };
    return roleMap[role] || role;
  };

  /**
   * Get role badge variant
   * @param {string} role - Role identifier
   * @returns {string} Badge variant class
   */
  const getRoleBadgeClass = (role) => {
    const roleClassMap = {
      'responsable_principal': 'badge bg-primary',
      'responsable_secundario': 'badge bg-info',
      'colaborador': 'badge bg-secondary',
      'supervisor': 'badge bg-warning'
    };
    return roleClassMap[role] || 'badge bg-secondary';
  };

  /**
   * Format date to DD/MM/YYYY
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

  return (
    <div className="card project-detail-card">
      <div className="card-header project-detail-card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Responsables del Proyecto</h3>
        {canManage && onAdd && (
          <ActionButton
            variant="primary"
            size="sm"
            onClick={onAdd}
            title="Agregar responsable"
          >
            <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="ms-1">Agregar</span>
          </ActionButton>
        )}
      </div>
      <div className="card-body project-detail-card-body">
        {responsibles.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <p className="text-muted mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>
              No hay responsables asignados a este proyecto
            </p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {responsibles.map((responsible) => (
              <div 
                key={responsible.id} 
                className="list-group-item py-3"
                style={{ 
                  border: 'none', 
                  borderBottom: '1px solid var(--border-color-light)',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem'
                }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start flex-grow-1">
                    {/* Avatar */}
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0" 
                      style={{ width: '40px', height: '40px', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}
                    >
                      {responsible.nombre ? responsible.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    {/* User Info */}
                    <div className="ms-3 flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {responsible.nombre}
                        </h6>
                        <span className={getRoleBadgeClass(responsible.rol_responsabilidad)} style={{ fontSize: 'var(--font-size-xs)' }}>
                          {getRoleLabel(responsible.rol_responsabilidad)}
                        </span>
                      </div>
                      <p className="mb-1 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {responsible.email}
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        Asignado: {formatDate(responsible.fecha_asignacion)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  {canManage && onRemove && (
                    <ActionButton
                      variant="danger"
                      size="sm"
                      onClick={() => onRemove(responsible)}
                      title="Remover responsable"
                      className="ms-2"
                    >
                      <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </ActionButton>
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

export default ProjectResponsiblesCard;
