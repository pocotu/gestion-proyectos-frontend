import React, { useState, useEffect } from 'react';

/**
 * RoleForm - Componente para crear/editar roles
 * Basado en la estructura de la base de datos: tabla 'roles' con campo 'nombre'
 */
const RoleForm = ({ 
  role = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del rol si está editando
  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre || ''
      });
    } else {
      setFormData({
        nombre: ''
      });
    }
    setErrors({});
  }, [role]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.nombre.trim())) {
      newErrors.nombre = 'El nombre solo puede contener letras, números y guiones bajos, y debe comenzar con una letra';
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

    onSubmit({
      ...formData,
      nombre: formData.nombre.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label fw-semibold">
          Nombre del Rol <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
          placeholder="Ej: admin, responsable_proyecto, responsable_tarea"
          disabled={loading}
          maxLength={50}
        />
        {errors.nombre && (
          <div className="invalid-feedback">
            {errors.nombre}
          </div>
        )}
        <div className="form-text">
          Utiliza nombres descriptivos como: admin, responsable_proyecto, responsable_tarea
        </div>
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
              Guardando...
            </>
          ) : (
            <>
              <i className={`bi ${role ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
              {role ? 'Actualizar Rol' : 'Crear Rol'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;