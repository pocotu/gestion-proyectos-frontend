import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/user/UserList';
import UserForm from '../components/user/UserForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import userService from '../services/userService';
import '../styles/projects.css';

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

  // Cargar usuarios al montar el componente (sin filtros)
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Cargar lista de usuarios desde el backend
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar todos los usuarios sin filtros (filtrado en frontend)
      const response = await userService.getUsers();
      // Backend devuelve {success, message, data: {users}} o {success, data: [users]}
      setUsers(response.data?.users || response.data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar usuarios en el frontend
   */
  const filteredUsers = users.filter(user => {
    // Filtro de búsqueda por nombre o email
    const matchesSearch = !filters.search || 
      user.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase());

    // Filtro por rol
    const matchesRole = !filters.role || 
      (filters.role === 'admin' && user.es_administrador) ||
      user.roles?.some(role => role.nombre === filters.role);

    // Filtro por estado
    const matchesEstado = !filters.estado || 
      (filters.estado === 'true' && user.estado === 'activo') ||
      (filters.estado === 'false' && user.estado === 'inactivo');

    return matchesSearch && matchesRole && matchesEstado;
  });

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
            loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
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
              } else {
        await userService.updateUser(selectedUser.id, userData);
              }
      
      setShowUserForm(false);
      setSelectedUser(null);
      loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al guardar usuario:', err);
          }
  };

  /**
   * Cambiar estado de usuario (habilitar/deshabilitar)
   */
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await userService.updateUserStatus(userId, newStatus);
            loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
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
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Header limpio y profesional */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 mb-2 text-primary fw-bold">Usuarios</h1>
            <p className="text-muted mb-0">
              Administra usuarios y permisos del sistema ({filteredUsers.length} usuarios)
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Barra de filtros moderna */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="position-relative">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="position-absolute text-muted"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-control ps-5"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="form-select"
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="responsable_proyecto">Responsable de Proyecto</option>
                <option value="responsable_tarea">Responsable de Tarea</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="form-select"
              >
                <option value="">Todos los estados</option>
                <option value="true">Habilitado</option>
                <option value="false">Deshabilitado</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                onClick={clearFilters}
                className="btn btn-outline-secondary w-100"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            {error}
            <button
              onClick={loadUsers}
              className="btn btn-link p-0 ms-2 text-decoration-underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      )}

      {/* Lista de usuarios con diseño profesional */}
      <div className="card border-0 shadow-sm">
        <UserList
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
          loading={loading}
        />
      </div>

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

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default UsersPage;