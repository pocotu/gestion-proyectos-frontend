import React, { useState, useEffect } from 'react';

/**
 * RoleAssignForm - Componente para asignar roles a usuarios
 * Basado en la estructura de la base de datos: tabla 'usuario_roles'
 */
const RoleAssignForm = ({ 
  users = [], 
  roles = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    rol_id: ''
  });
  const [errors, setErrors] = useState({});

  // Limpiar formulario al montar
  useEffect(() => {
    setFormData({
      usuario_id: '',
      rol_id: ''
    });
    setErrors({});
  }, []);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'Debe seleccionar un usuario';
    }

    if (!formData.rol_id) {
      newErrors.rol_id = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="usuario_id" className="form-label fw-semibold">
          Usuario <span className="text-danger">*</span>
        </label>
        <select
          id="usuario_id"
          name="usuario_id"
          value={formData.usuario_id}
          onChange={handleChange}
          className={`form-select ${errors.usuario_id ? 'is-invalid' : ''}`}
          disabled={loading}
        >
          <option value="">Seleccionar usuario...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nombre} ({user.email})
            </option>
          ))}
        </select>
        {errors.usuario_id && (
          <div className="invalid-feedback">
            {errors.usuario_id}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <label htmlFor="rol_id" className="form-label fw-semibold">
          Rol <span className="text-danger">*</span>
        </label>
        <select
          id="rol_id"
          name="rol_id"
          value={formData.rol_id}
          onChange={handleChange}
          className={`form-select ${errors.rol_id ? 'is-invalid' : ''}`}
          disabled={loading}
        >
          <option value="">Seleccionar rol...</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.nombre}
            </option>
          ))}
        </select>
        {errors.rol_id && (
          <div className="invalid-feedback">
            {errors.rol_id}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Asignando...
            </>
          ) : (
            <>
              <i className="bi bi-person-plus me-2"></i>
              Asignar Rol
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RoleAssignForm;