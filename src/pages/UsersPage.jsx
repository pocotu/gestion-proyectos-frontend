import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import UserList from '../components/user/UserList';
import UserForm from '../components/user/UserForm';
import ActionButton from '../components/common/ActionButton';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import userService from '../services/userService';

/**
 * UsersPage - Página de gestión de usuarios (solo para administradores)
 * Funcionalidades:
 * - Listar todos los usuarios del sistema
 * - Crear nuevos usuarios
 * - Editar usuarios existentes
 * - Cambiar estados y roles de usuarios
 * - Eliminar usuarios
 */
const UsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [showUserForm, setShowUserForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    estado: ''
  });

  // Verificar permisos de administrador
  useEffect(() => {
    if (!user?.es_administrador && !user?.roles?.some(role => role.nombre === 'admin')) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [filters]);

  /**
   * Cargar lista de usuarios con filtros aplicados
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers(filters);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios');
      addNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal para crear nuevo usuario
   */
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormMode('create');
    setShowUserForm(true);
  };

  /**
   * Abrir modal para editar usuario
   */
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    setShowUserForm(true);
  };

  /**
   * Confirmar eliminación de usuario
   */
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  /**
   * Ejecutar eliminación de usuario
   */
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      addNotification('Usuario eliminado exitosamente', 'success');
      loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      addNotification('Error al eliminar usuario', 'error');
    } finally {
      setShowConfirmDialog(false);
      setSelectedUser(null);
    }
  };

  /**
   * Manejar envío del formulario de usuario
   */
  const handleUserSubmit = async (userData) => {
    try {
      if (formMode === 'create') {
        await userService.createUser(userData);
        addNotification('Usuario creado exitosamente', 'success');
      } else {
        await userService.updateUser(selectedUser.id, userData);
        addNotification('Usuario actualizado exitosamente', 'success');
      }
      
      setShowUserForm(false);
      setSelectedUser(null);
      loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      addNotification(
        formMode === 'create' ? 'Error al crear usuario' : 'Error al actualizar usuario',
        'error'
      );
    }
  };

  /**
   * Cambiar estado de usuario (habilitar/deshabilitar)
   */
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await userService.updateUserStatus(userId, newStatus);
      addNotification(
        `Usuario ${newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`,
        'success'
      );
      loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      addNotification('Error al cambiar estado del usuario', 'error');
    }
  };

  /**
   * Manejar cambios en filtros
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      estado: ''
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <div>
            <div>
              <h1>
                Gestión de Usuarios
              </h1>
              <p>
                Administra usuarios y permisos del sistema ({users.length} usuarios)
              </p>
            </div>

            <div>
              <button
                onClick={handleCreateUser}
                type="button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="responsable_proyecto">Responsable de Proyecto</option>
              <option value="responsable_tarea">Responsable de Tarea</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Habilitado</option>
              <option value="false">Deshabilitado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Lista de usuarios */}
      <UserList
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleUserStatus}
        loading={loading}
      />

      {/* Modal de formulario de usuario */}
      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title={formMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          mode={formMode}
          onSubmit={handleUserSubmit}
          onCancel={() => setShowUserForm(false)}
        />
      </Modal>

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;