import React from 'react';
import ActionButton from '../common/ActionButton';

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
   * Obtener badge de rol con color
   */
  const getRoleBadge = (user) => {
    const roles = [];
    
    if (user.es_administrador) {
      roles.push({ name: 'Admin', color: 'bg-red-100 text-red-800' });
    }
    
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach(role => {
        switch (role.nombre) {
          case 'responsable_proyecto':
            roles.push({ name: 'Resp. Proyecto', color: 'bg-blue-100 text-blue-800' });
            break;
          case 'responsable_tarea':
            roles.push({ name: 'Resp. Tarea', color: 'bg-green-100 text-green-800' });
            break;
          default:
            roles.push({ name: role.nombre, color: 'bg-gray-100 text-gray-800' });
        }
      });
    }
    
    if (roles.length === 0) {
      roles.push({ name: 'Usuario', color: 'bg-gray-100 text-gray-800' });
    }
    
    return roles;
  };

  /**
   * Obtener badge de estado
   */
  const getStatusBadge = (estado) => {
    return estado ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Habilitado
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
          <p className="text-gray-600">No se encontraron usuarios con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.telefono || 'Sin teléfono'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {getRoleBadge(user).map((role, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.estado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <ActionButton
                      onClick={() => onEdit(user)}
                      variant="secondary"
                      size="sm"
                      icon="✏️"
                      title="Editar usuario"
                    >
                      Editar
                    </ActionButton>
                    <ActionButton
                      onClick={() => onToggleStatus(user.id, user.estado)}
                      variant={user.estado ? "warning" : "success"}
                      size="sm"
                      icon={user.estado ? "🚫" : "✅"}
                      title={user.estado ? "Deshabilitar usuario" : "Habilitar usuario"}
                    >
                      {user.estado ? "Deshabilitar" : "Habilitar"}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete(user)}
                      variant="danger"
                      size="sm"
                      icon="🗑️"
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer con información de resultados */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span>
            Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
          </span>
          <span>
            Total: {users.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserList;