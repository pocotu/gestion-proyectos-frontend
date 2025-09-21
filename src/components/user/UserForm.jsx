import React, { useState, useEffect } from 'react';
import FormInput from '../common/FormInput';
import LoadingButton from '../common/LoadingButton';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nombre completo"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          error={errors.nombre}
          required
          placeholder="Ingresa el nombre completo"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="usuario@ejemplo.com"
        />
      </div>

      {/* Contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
          name="contraseña"
          type="password"
          value={formData.contraseña}
          onChange={(e) => handleInputChange('contraseña', e.target.value)}
          error={errors.contraseña}
          required={mode === 'create'}
          placeholder="Mínimo 6 caracteres"
        />

        <FormInput
          label="Confirmar contraseña"
          name="confirmarContraseña"
          type="password"
          value={formData.confirmarContraseña}
          onChange={(e) => handleInputChange('confirmarContraseña', e.target.value)}
          error={errors.confirmarContraseña}
          required={mode === 'create' || formData.contraseña}
          placeholder="Repite la contraseña"
        />
      </div>

      {/* Teléfono */}
      <FormInput
        label="Teléfono (opcional)"
        name="telefono"
        type="tel"
        value={formData.telefono}
        onChange={(e) => handleInputChange('telefono', e.target.value)}
        error={errors.telefono}
        placeholder="+1234567890"
      />

      {/* Estado y administrador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Usuario habilitado</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Los usuarios deshabilitados no pueden acceder al sistema
          </p>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.es_administrador}
              onChange={(e) => handleInputChange('es_administrador', e.target.checked)}
              className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Administrador del sistema</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Los administradores tienen acceso completo al sistema
          </p>
        </div>
      </div>

      {/* Roles adicionales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roles adicionales
        </label>
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <label key={role.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.roles.includes(role.id)}
                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{role.name}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Los usuarios pueden tener múltiples roles según sus responsabilidades
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <LoadingButton
          type="submit"
          loading={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
        </LoadingButton>
      </div>
    </form>
  );
};

export default UserForm;