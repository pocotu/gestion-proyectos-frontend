import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ActionButton from '../components/common/ActionButton';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

/**
 * RolesPage - Página de gestión de roles (solo para administradores)
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la gestión de roles
 * - Open/Closed: Abierto para extensión (nuevas funcionalidades de roles)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de gestión
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotifications)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const RolesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Estados principales
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'

  // Estados de formularios
  const [roleForm, setRoleForm] = useState({
    nombre: '',
    descripcion: ''
  });
  const [assignForm, setAssignForm] = useState({
    userId: '',
    roleId: ''
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    activeOnly: false
  });

  // Verificar permisos de administrador
  useEffect(() => {
    if (!user?.es_administrador && !user?.roles?.some(role => role.nombre === 'admin')) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  // Función para cargar roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      // Simulación de API call - reemplazar con servicio real
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      } else {
        throw new Error('Error al cargar roles');
      }
    } catch (err) {
      setError(err.message);
      addNotification('Error al cargar roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  // Función para crear/editar rol
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = formMode === 'create' ? '/api/roles' : `/api/roles/${selectedRole.id}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(roleForm)
      });

      if (response.ok) {
        addNotification(
          `Rol ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente`,
          'success'
        );
        setShowRoleForm(false);
        setRoleForm({ nombre: '', descripcion: '' });
        loadRoles();
      } else {
        throw new Error('Error al guardar rol');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Función para asignar rol a usuario
  const handleAssignRole = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: parseInt(assignForm.userId),
          roleIdentifier: assignForm.roleId
        })
      });

      if (response.ok) {
        addNotification('Rol asignado exitosamente', 'success');
        setShowAssignForm(false);
        setAssignForm({ userId: '', roleId: '' });
        loadUsers();
      } else {
        throw new Error('Error al asignar rol');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Función para eliminar rol
  const handleDeleteRole = async () => {
    try {
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        addNotification('Rol eliminado exitosamente', 'success');
        setShowConfirmDialog(false);
        setSelectedRole(null);
        loadRoles();
      } else {
        throw new Error('Error al eliminar rol');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Función para abrir formulario de creación
  const handleCreateRole = () => {
    setFormMode('create');
    setRoleForm({ nombre: '', descripcion: '' });
    setShowRoleForm(true);
  };

  // Función para abrir formulario de edición
  const handleEditRole = (role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setRoleForm({
      nombre: role.nombre,
      descripcion: role.descripcion || ''
    });
    setShowRoleForm(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteRole = (role) => {
    setSelectedRole(role);
    setShowConfirmDialog(true);
  };

  // Filtrar roles según búsqueda
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                         (role.descripcion && role.descripcion.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Cargando roles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600">Administra los roles y permisos del sistema</p>
        </div>
        <div className="flex space-x-3">
          <ActionButton
            onClick={() => setShowAssignForm(true)}
            variant="secondary"
            icon="👤"
          >
            Asignar Rol
          </ActionButton>
          <ActionButton
            onClick={handleCreateRole}
            variant="primary"
            icon="➕"
          >
            Nuevo Rol
          </ActionButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar roles..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Roles */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Roles del Sistema ({filteredRoles.length})
          </h3>
        </div>
        
        {filteredRoles.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron roles
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {role.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {role.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {role.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.usuarios_count || 0} usuarios
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => confirmDeleteRole(role)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulario de Rol */}
      <Modal
        isOpen={showRoleForm}
        onClose={() => setShowRoleForm(false)}
        title={formMode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'}
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol
            </label>
            <input
              type="text"
              required
              value={roleForm.nombre}
              onChange={(e) => setRoleForm({ ...roleForm, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: responsable_proyecto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={roleForm.descripcion}
              onChange={(e) => setRoleForm({ ...roleForm, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del rol..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <ActionButton
              type="button"
              onClick={() => setShowRoleForm(false)}
              variant="secondary"
            >
              Cancelar
            </ActionButton>
            <ActionButton
              type="submit"
              variant="primary"
            >
              {formMode === 'create' ? 'Crear Rol' : 'Actualizar Rol'}
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Modal de Asignación de Rol */}
      <Modal
        isOpen={showAssignForm}
        onClose={() => setShowAssignForm(false)}
        title="Asignar Rol a Usuario"
      >
        <form onSubmit={handleAssignRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <select
              required
              value={assignForm.userId}
              onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar usuario...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              required
              value={assignForm.roleId}
              onChange={(e) => setAssignForm({ ...assignForm, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar rol...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.nombre}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <ActionButton
              type="button"
              onClick={() => setShowAssignForm(false)}
              variant="secondary"
            >
              Cancelar
            </ActionButton>
            <ActionButton
              type="submit"
              variant="primary"
            >
              Asignar Rol
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteRole}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${selectedRole?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default RolesPage;