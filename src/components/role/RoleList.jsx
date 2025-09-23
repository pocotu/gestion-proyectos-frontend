import React from 'react';

/**
 * RoleList - Componente para mostrar lista de roles
 * Basado en la estructura de la base de datos: tabla 'roles'
 */
const RoleList = ({ 
  roles = [], 
  onEdit, 
  onDelete, 
  getUserCountForRole,
  getUsersForRole 
}) => {
  if (roles.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-shield-check display-1 text-muted mb-3"></i>
          <h5 className="card-title">No hay roles disponibles</h5>
          <p className="card-text text-muted">
            Los roles se mostrarán aquí una vez que sean creados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-light">
        <h6 className="card-title mb-0 d-flex align-items-center">
          <i className="bi bi-shield-check me-2"></i>
          Roles del Sistema ({roles.length})
        </h6>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="fw-semibold">Rol</th>
              <th scope="col" className="fw-semibold">Usuarios Asignados</th>
              <th scope="col" className="fw-semibold">Fecha Creación</th>
              <th scope="col" className="fw-semibold text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-shield text-primary"></i>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{role.nombre}</div>
                      <small className="text-muted">ID: {role.id}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-info bg-opacity-10 text-info">
                    {getUserCountForRole ? getUserCountForRole(role.id) : 0} usuarios
                  </span>
                  {getUsersForRole && getUsersForRole(role.id) && (
                    <div className="small text-muted mt-1" title={getUsersForRole(role.id)}>
                      {getUsersForRole(role.id).length > 30 
                        ? getUsersForRole(role.id).substring(0, 30) + '...'
                        : getUsersForRole(role.id)
                      }
                    </div>
                  )}
                </td>
                <td>
                  <small className="text-muted">
                    {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
                  </small>
                </td>
                <td>
                  <div className="d-flex justify-content-end gap-1">
                    <button
                      onClick={() => onEdit && onEdit(role)}
                      className="btn btn-sm btn-outline-primary"
                      title="Editar rol (no disponible)"
                      disabled={true}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(role)}
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar rol (no disponible)"
                      disabled={true}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleList;