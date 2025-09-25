import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import RoleList from '../components/role/RoleList';
import RoleForm from '../components/role/RoleForm';
import RoleAssignForm from '../components/role/RoleAssignForm';
import userService from '../services/userService.mock';


/**
 * RolesPage - Página de gestión de roles (solo para administradores)
 * Basado en la estructura de la base de datos: tabla 'roles' con campos 'id' y 'nombre'
 */
const RolesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Estados principales
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados de formularios
  const [formMode, setFormMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);

  // Estados de selección
  const [selectedRole, setSelectedRole] = useState(null);
  const [filters, setFilters] = useState({
    search: ''
  });

  // Verificar permisos de administrador
  useEffect(() => {
    if (!user?.es_administrador) {
      addNotification('No tienes permisos para acceder a esta página', 'error');
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate, addNotification]);

  // Cargar todos los datos
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRoles(), loadUsers()]);
      // Note: user-roles endpoint doesn't exist in backend, so we skip it for now
      setError(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
      addNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles
  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      console.log('Roles response:', response);
      
      let rolesData = [];
      if (Array.isArray(response)) {
        rolesData = response;
      } else if (response?.data?.roles && Array.isArray(response.data.roles)) {
        // Backend format: { success: true, data: { roles: [...] } }
        rolesData = response.data.roles.map(role => ({
          id: role.id,
          nombre: role.name || role.nombre
        }));
      } else if (response?.data && Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response?.roles && Array.isArray(response.roles)) {
        rolesData = response.roles;
      } else {
        console.warn('Unexpected roles response format:', response);
        rolesData = [];
      }
      
      setRoles(rolesData);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setRoles([]); // Ensure roles is always an array
      throw error;
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      console.log('Users response:', response);
      
      let usersData = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response?.users && Array.isArray(response.users)) {
        usersData = response.users;
      } else {
        console.warn('Unexpected users response format:', response);
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsers([]); // Ensure users is always an array
      throw error;
    }
  };

  // Cargar asignaciones usuario-rol (endpoint no disponible por ahora)
  const loadUserRoles = async () => {
    // TODO: Implementar cuando el endpoint /user-roles esté disponible
    setUserRoles([]);
  };

  // Manejar creación/edición de rol
  const handleRoleSubmit = async (roleData) => {
    try {
      setSubmitting(true);
      
      if (formMode === 'create') {
        await userService.createRole(roleData);
        addNotification('Rol creado exitosamente', 'success');
      } else {
        await userService.updateRole(selectedRole.id, roleData);
        addNotification('Rol actualizado exitosamente', 'success');
      }
      
      setShowRoleForm(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      const message = error.response?.data?.message || 
        (formMode === 'create' ? 'Error al crear el rol' : 'Error al actualizar el rol');
      addNotification(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar asignación de rol
  const handleAssignRole = async (assignData) => {
    try {
      setSubmitting(true);
      
      // Find the role name by ID for the API call
      const selectedRole = roles.find(r => r.id === parseInt(assignData.rol_id));
      if (!selectedRole) {
        throw new Error('Rol no encontrado');
      }
      
      // The backend expects { userId, roleIdentifier }
      await userService.assignRole(assignData.usuario_id, selectedRole.nombre);
      addNotification('Rol asignado exitosamente', 'success');
      setShowAssignForm(false);
      loadUserRoles();
    } catch (error) {
      console.error('Error al asignar rol:', error);
      const message = error.response?.data?.message || 'Error al asignar el rol';
      addNotification(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar edición de rol (no disponible)
  const handleEditRole = (role) => {
    addNotification('La edición de roles no está disponible actualmente', 'info');
  };

  // Confirmar eliminación de rol (no disponible)
  const confirmDeleteRole = (role) => {
    addNotification('La eliminación de roles no está disponible actualmente', 'info');
  };

  // Manejar eliminación de rol (no disponible)
  const handleDeleteRole = async () => {
    // No operation
  };

  // Abrir formulario de creación
  const openCreateForm = () => {
    setFormMode('create');
    setSelectedRole(null);
    setShowRoleForm(true);
  };

  // Abrir formulario de asignación
  const openAssignForm = () => {
    setShowAssignForm(true);
  };

  // Filtrar roles - ensure roles is always an array
  const filteredRoles = Array.isArray(roles) ? roles.filter((role) => {
    return role?.nombre?.toLowerCase().includes(filters.search.toLowerCase());
  }) : [];

  // Obtener conteo de usuarios por rol
  const getUserCountForRole = (roleId) => {
    if (!Array.isArray(userRoles)) return 0;
    return userRoles.filter(ur => ur.rol_id === roleId).length;
  };

  // Obtener usuarios asignados a un rol
  const getUsersForRole = (roleId) => {
    if (!Array.isArray(userRoles) || !Array.isArray(users)) return '';
    const roleUsers = userRoles.filter(ur => ur.rol_id === roleId);
    return roleUsers.map(ur => {
      const user = users.find(u => u.id === ur.usuario_id);
      return user ? user.nombre : 'Usuario no encontrado';
    }).join(', ');
  };

  if (loading) {
    return <LoadingSpinner message="Cargando roles..." />;
  }

  // Debug information
  console.log('RolesPage render - roles:', roles);
  console.log('RolesPage render - filteredRoles:', filteredRoles);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">Gestión de Roles</h1>
              <p className="text-muted mb-0">Administra los roles del sistema</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={openAssignForm}
                className="btn btn-outline-primary d-flex align-items-center"
              >
                <i className="bi bi-person-plus me-2"></i>
                Asignar Rol
              </button>
              <button
                onClick={openCreateForm}
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Nuevo Rol
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar roles..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Lista de roles */}
      <div className="row">
        <div className="col-12">
          {!Array.isArray(roles) ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                <h5 className="card-title">Error de datos</h5>
                <p className="card-text text-muted">
                  Los datos de roles no se cargaron correctamente. 
                  <br />
                  Tipo de datos recibido: {typeof roles}
                  <br />
                  Contenido: {JSON.stringify(roles)}
                </p>
                <button onClick={loadData} className="btn btn-primary">
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <RoleList
              roles={filteredRoles}
              onEdit={handleEditRole}
              onDelete={confirmDeleteRole}
              getUserCountForRole={getUserCountForRole}
              getUsersForRole={getUsersForRole}
            />
          )}
        </div>
      </div>

      {/* Modal de Formulario de Rol */}
      <Modal
        isOpen={showRoleForm}
        onClose={() => setShowRoleForm(false)}
        title={formMode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'}
      >
        <RoleForm
          role={selectedRole}
          onSubmit={handleRoleSubmit}
          onCancel={() => setShowRoleForm(false)}
          loading={submitting}
        />
      </Modal>

      {/* Modal de Asignación de Rol */}
      <Modal
        isOpen={showAssignForm}
        onClose={() => setShowAssignForm(false)}
        title="Asignar Rol a Usuario"
      >
        <RoleAssignForm
          users={users}
          roles={roles}
          onSubmit={handleAssignRole}
          onCancel={() => setShowAssignForm(false)}
          loading={submitting}
        />
      </Modal>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteRole}
        title="Eliminar Rol"
        message={
          getUserCountForRole(selectedRole?.id) > 0
            ? `No se puede eliminar el rol "${selectedRole?.nombre}" porque tiene ${getUserCountForRole(selectedRole?.id)} usuarios asignados. Primero debes reasignar o eliminar estos usuarios.`
            : `¿Estás seguro de que deseas eliminar el rol "${selectedRole?.nombre}"? Esta acción no se puede deshacer.`
        }
        confirmText={getUserCountForRole(selectedRole?.id) > 0 ? null : "Eliminar"}
        cancelText={getUserCountForRole(selectedRole?.id) > 0 ? "Entendido" : "Cancelar"}
        variant="danger"
      />
    </div>
  );
};

export default RolesPage;
