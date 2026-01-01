import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import userService from '../../services/userService';

/**
 * ProjectEditModal - Modal para editar información del proyecto
 * Incluye: título, descripción, fechas, estado, y gestión de responsables
 * 
 * @param {Object} props
 * @param {boolean} props.show - Si el modal está visible
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onSave - Callback al guardar cambios
 * @param {Object} props.project - Datos del proyecto
 * @param {Array} props.currentResponsibles - Responsables actuales
 * @param {Function} props.onAddResponsible - Callback para agregar responsable
 * @param {Function} props.onRemoveResponsible - Callback para remover responsable
 * @returns {JSX.Element}
 */
const ProjectEditModal = ({ 
  show, 
  onClose, 
  onSave, 
  project,
  currentResponsibles = [],
  onAddResponsible,
  onRemoveResponsible
}) => {
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificacion'
  });

  // Available users for assignment
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        titulo: project.titulo || '',
        descripcion: project.descripcion || '',
        fecha_inicio: project.fecha_inicio ? project.fecha_inicio.split('T')[0] : '',
        fecha_fin: project.fecha_fin ? project.fecha_fin.split('T')[0] : '',
        estado: project.estado || 'planificacion'
      });
    }
  }, [project]);

  // Load available users
  useEffect(() => {
    if (show) {
      loadAvailableUsers();
    }
  }, [show]);

  /**
   * Load users that can be assigned as responsibles
   */
  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getUsers();
      const users = response.data?.users || response.users || [];
      
      // Filter out users that are already responsibles
      const currentResponsibleIds = currentResponsibles.map(r => r.id);
      const available = users.filter(user => !currentResponsibleIds.includes(user.id));
      
      setAvailableUsers(available);
    } catch (error) {
      console.error('Error loading users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const startDate = new Date(formData.fecha_inicio);
      const endDate = new Date(formData.fecha_fin);
      
      if (endDate < startDate) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  /**
   * Handle adding a responsible
   */
  const handleAddResponsible = () => {
    if (selectedUserId) {
      onAddResponsible(parseInt(selectedUserId));
      setSelectedUserId('');
      // Reload available users after adding
      setTimeout(loadAvailableUsers, 500);
    }
  };

  /**
   * Handle removing a responsible
   */
  const handleRemoveResponsible = (userId) => {
    onRemoveResponsible(userId);
    // Reload available users after removing
    setTimeout(loadAvailableUsers, 500);
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    const labels = {
      'planificacion': 'Planificación',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Editar Proyecto"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Título */}
        <div className="mb-4">
          <label htmlFor="titulo" className="form-label fw-semibold">
            Título del Proyecto <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ingrese el título del proyecto"
          />
          {errors.titulo && (
            <div className="invalid-feedback">{errors.titulo}</div>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="descripcion" className="form-label fw-semibold">
            Descripción
          </label>
          <textarea
            className="form-control"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Ingrese una descripción detallada del proyecto"
          />
        </div>

        {/* Fechas */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label htmlFor="fecha_inicio" className="form-label fw-semibold">
              Fecha de Inicio <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${errors.fecha_inicio ? 'is-invalid' : ''}`}
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
            />
            {errors.fecha_inicio && (
              <div className="invalid-feedback">{errors.fecha_inicio}</div>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="fecha_fin" className="form-label fw-semibold">
              Fecha de Fin <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${errors.fecha_fin ? 'is-invalid' : ''}`}
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
            {errors.fecha_fin && (
              <div className="invalid-feedback">{errors.fecha_fin}</div>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="mb-4">
          <label htmlFor="estado" className="form-label fw-semibold">
            Estado del Proyecto
          </label>
          <select
            className="form-select"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="planificacion">Planificación</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Responsables Section */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            Responsables del Proyecto
          </label>

          {/* Current Responsibles */}
          {currentResponsibles.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-column gap-2">
                {currentResponsibles.map((responsible) => (
                  <div
                    key={responsible.id}
                    className="d-flex align-items-center justify-content-between p-3 rounded"
                    style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: '#4f46e5',
                          color: '#ffffff'
                        }}
                      >
                        {responsible.nombre ? responsible.nombre.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#111827' }}>
                          {responsible.nombre}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          {responsible.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveResponsible(responsible.id)}
                      title="Remover responsable"
                    >
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Responsible */}
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers || availableUsers.length === 0}
            >
              <option value="">
                {loadingUsers ? 'Cargando usuarios...' : 
                 availableUsers.length === 0 ? 'No hay usuarios disponibles' : 
                 'Seleccionar usuario'}
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddResponsible}
              disabled={!selectedUserId || loadingUsers}
              style={{ whiteSpace: 'nowrap' }}
            >
              <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectEditModal;
