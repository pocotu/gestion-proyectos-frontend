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
              <th scope="col" className="fw-semibold">Descripción</th>
              <th scope="col" className="fw-semibold">Usuarios Asignados</th>
              <th scope="col" className="fw-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const userCount = getUserCountForRole ? getUserCountForRole(role.id) : 0;
              const usersList = getUsersForRole ? getUsersForRole(role.id) : '';
              
              // Descripciones de los roles del sistema
              const roleDescriptions = {
                'admin': 'Acceso completo al sistema, gestión de usuarios y configuración',
                'responsable_proyecto': 'Puede crear y gestionar proyectos, asignar tareas',
                'responsable_tarea': 'Puede gestionar tareas asignadas y actualizar su estado'
              };
              
              return (
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
                    <small className="text-muted">
                      {roleDescriptions[role.nombre] || 'Rol del sistema'}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${userCount > 0 ? 'bg-success' : 'bg-secondary'} bg-opacity-10 ${userCount > 0 ? 'text-success' : 'text-secondary'}`}>
                        {userCount} {userCount === 1 ? 'usuario' : 'usuarios'}
                      </span>
                    </div>
                    {usersList && (
                      <div className="small text-muted mt-1" title={usersList}>
                        {usersList.length > 40 
                          ? usersList.substring(0, 40) + '...'
                          : usersList
                        }
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-check-circle me-1"></i>
                      Activo
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleList;