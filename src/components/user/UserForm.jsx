import { useState, useEffect } from 'react';

/**
 * UserForm - Formulario para crear y editar usuarios
 * Maneja validaciones y envío de datos de usuario
 */
const UserForm = ({ 
  user = null, 
  mode = 'create', 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmarContraseña: '',
    telefono: '',
    estado: true,
    es_administrador: false,
    roles: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Roles disponibles
  const availableRoles = [
    { id: 'responsable_proyecto', name: 'Responsable de Proyecto' },
    { id: 'responsable_tarea', name: 'Responsable de Tarea' }
  ];

  // Inicializar formulario cuando cambia el usuario
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        contraseña: '',
        confirmarContraseña: '',
        telefono: user.telefono || '',
        estado: user.estado !== undefined ? user.estado : true,
        es_administrador: user.es_administrador || false,
        roles: user.roles ? user.roles.map(role => role.nombre) : []
      });
    } else {
      // Resetear formulario para modo crear
      setFormData({
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: '',
        telefono: '',
        estado: true,
        es_administrador: false,
        roles: []
      });
    }
    setErrors({});
  }, [user, mode]);

  /**
   * Manejar cambios en inputs
   */
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Manejar cambios en checkboxes de roles
   */
  const handleRoleChange = (roleId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(role => role !== roleId)
    }));
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validar contraseña (solo en modo crear o si se está cambiando)
    if (mode === 'create' || formData.contraseña) {
      if (!formData.contraseña) {
        newErrors.contraseña = 'La contraseña es requerida';
      } else if (formData.contraseña.length < 6) {
        newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
      }

      // Validar confirmación de contraseña
      if (formData.contraseña !== formData.confirmarContraseña) {
        newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
      }
    }

    // Validar teléfono (opcional, pero si se proporciona debe ser válido)
    if (formData.telefono && !/^\+?[\d\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para envío
      const submitData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        estado: formData.estado,
        es_administrador: formData.es_administrador,
        roles: formData.roles
      };

      // Incluir contraseña solo si se está creando o cambiando
      if (mode === 'create' || formData.contraseña) {
        submitData.contraseña = formData.contraseña;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Información básica */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-medium">
            Nombre completo *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            placeholder="Ingresa el nombre completo"
          />
          {errors.nombre && (
            <div className="invalid-feedback">{errors.nombre}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="usuario@ejemplo.com"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>
      </div>

      {/* Contraseña */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-medium">
            {mode === 'create' ? 'Contraseña *' : 'Nueva contraseña (opcional)'}
          </label>
          <input
            type="password"
            required={mode === 'create'}
            value={formData.contraseña}
            onChange={(e) => handleInputChange('contraseña', e.target.value)}
            className={`form-control ${errors.contraseña ? 'is-invalid' : ''}`}
            placeholder="Mínimo 6 caracteres"
          />
          {errors.contraseña && (
            <div className="invalid-feedback">{errors.contraseña}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium">
            Confirmar contraseña {(mode === 'create' || formData.contraseña) && '*'}
          </label>
          <input
            type="password"
            required={mode === 'create' || formData.contraseña}
            value={formData.confirmarContraseña}
            onChange={(e) => handleInputChange('confirmarContraseña', e.target.value)}
            className={`form-control ${errors.confirmarContraseña ? 'is-invalid' : ''}`}
            placeholder="Repite la contraseña"
          />
          {errors.confirmarContraseña && (
            <div className="invalid-feedback">{errors.confirmarContraseña}</div>
          )}
        </div>
      </div>

      {/* Teléfono */}
      <div className="mb-3">
        <label className="form-label fw-medium">
          Teléfono
        </label>
        <input
          type="tel"
          value={formData.telefono}
          onChange={(e) => handleInputChange('telefono', e.target.value)}
          className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
          placeholder="+1234567890"
        />
        {errors.telefono && (
          <div className="invalid-feedback">{errors.telefono}</div>
        )}
      </div>

      {/* Estado y administrador */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              id="estado"
              checked={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.checked)}
              className="form-check-input"
            />
            <label className="form-check-label fw-medium" htmlFor="estado">
              Usuario habilitado
            </label>
          </div>
          <small className="text-muted">
            Los usuarios deshabilitados no pueden acceder al sistema
          </small>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              id="es_administrador"
              checked={formData.es_administrador}
              onChange={(e) => handleInputChange('es_administrador', e.target.checked)}
              className="form-check-input"
            />
            <label className="form-check-label fw-medium" htmlFor="es_administrador">
              Administrador del sistema
            </label>
          </div>
          <small className="text-muted">
            Los administradores tienen acceso completo al sistema
          </small>
        </div>
      </div>

      {/* Roles adicionales */}
      <div className="mb-4">
        <label className="form-label fw-medium">
          Roles adicionales
        </label>
        <div className="d-flex flex-column gap-2">
          {availableRoles.map((role) => (
            <div key={role.id} className="form-check">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={formData.roles.includes(role.id)}
                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor={`role-${role.id}`}>
                {role.name}
              </label>
            </div>
          ))}
        </div>
        <small className="text-muted">
          Los usuarios pueden tener múltiples roles según sus responsabilidades
        </small>
      </div>

      {/* Botones de acción */}
      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-secondary"
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
              {mode === 'create' ? 'Creando...' : 'Actualizando...'}
            </>
          ) : (
            mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;