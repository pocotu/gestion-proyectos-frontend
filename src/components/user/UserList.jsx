import React from 'react';

/**
 * UserList - Componente para mostrar la lista de usuarios
 * Muestra información de usuarios en formato de tabla con acciones
 */
const UserList = ({ 
  users = [], 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading = false 
}) => {
  /**
   * Obtener badges de rol con colores Bootstrap
   */
  const getRoleBadges = (user) => {
    const roles = [];
    
    if (user.es_administrador) {
      roles.push({ name: 'Administrador', class: 'bg-danger text-white' });
    }
    
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach(role => {
        switch (role.nombre) {
          case 'responsable_proyecto':
            roles.push({ name: 'Resp. Proyecto', class: 'bg-primary text-white' });
            break;
          case 'responsable_tarea':
            roles.push({ name: 'Resp. Tarea', class: 'bg-success text-white' });
            break;
          default:
            roles.push({ name: role.nombre, class: 'bg-secondary text-white' });
        }
      });
    }
    
    if (roles.length === 0) {
      roles.push({ name: 'Usuario', class: 'bg-light text-dark' });
    }
    
    return roles;
  };

  /**
   * Obtener badge de estado con Bootstrap
   */
  const getStatusBadge = (estado) => {
    return estado ? (
      <span className="badge bg-success text-white px-2 py-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        Habilitado
      </span>
    ) : (
      <span className="badge bg-danger text-white px-2 py-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Deshabilitado
      </span>
    );
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card-body text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mb-0">Cargando usuarios...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card-body text-center py-5">
        <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-3 p-3 mb-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h5 className="text-dark mb-2">No hay usuarios</h5>
        <p className="text-muted mb-0">No se encontraron usuarios con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="border-0 fw-semibold text-muted">Usuario</th>
              <th scope="col" className="border-0 fw-semibold text-muted">Contacto</th>
              <th scope="col" className="border-0 fw-semibold text-muted">Roles</th>
              <th scope="col" className="border-0 fw-semibold text-muted">Estado</th>
              <th scope="col" className="border-0 fw-semibold text-muted">Registro</th>
              <th scope="col" className="border-0 fw-semibold text-muted text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} data-testid="user-row">
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div 
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-semibold"
                        style={{ width: '40px', height: '40px' }}
                      >
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark mb-1">
                        {user.nombre}
                      </div>
                      <small className="text-muted">
                        ID: {user.id}
                      </small>
                    </div>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="text-dark fw-medium">{user.email}</div>
                  <small className="text-muted">{user.telefono || 'Sin teléfono'}</small>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap gap-1">
                    {getRoleBadges(user).map((role, index) => (
                      <span
                        key={index}
                        className={`badge ${role.class} px-2 py-1`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="align-middle">
                  {getStatusBadge(user.estado)}
                </td>
                <td className="align-middle">
                  <small className="text-muted">
                    {formatDate(user.created_at)}
                  </small>
                </td>
                <td className="align-middle text-end">
                  <div className="btn-group" role="group">
                    <button
                      onClick={() => onEdit(user)}
                      className="btn btn-sm btn-outline-primary"
                      title="Editar usuario"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id, user.estado)}
                      className={`btn btn-sm ${user.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      title={user.estado ? "Deshabilitar usuario" : "Habilitar usuario"}
                    >
                      {user.estado ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar usuario"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer con información de resultados */}
      <div className="card-footer bg-light border-top">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
          </small>
          <small className="text-muted">
            Total: {users.length}
          </small>
        </div>
      </div>
    </>
  );
};

export default UserList;