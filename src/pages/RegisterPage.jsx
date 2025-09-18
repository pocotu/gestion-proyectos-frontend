import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import FormInput from '../components/common/FormInput';
import LoadingButton from '../components/common/LoadingButton';

/**
 * RegisterPage - Página de registro de usuarios
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja el formulario de registro
 * - Open/Closed: Abierto para extensión (nuevos campos, validaciones)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de página
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotification)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmarContraseña: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Valida los datos del formulario
   * Principio de Responsabilidad Única: Solo valida
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validar contraseña
    if (!formData.contraseña.trim()) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    } else if (formData.contraseña.length > 255) {
      newErrors.contraseña = 'La contraseña no puede exceder 255 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmarContraseña.trim()) {
      newErrors.confirmarContraseña = 'Confirma tu contraseña';
    } else if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja los cambios en los inputs
   * Principio de Responsabilidad Única: Solo actualiza el estado
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

    // Validar confirmación de contraseña en tiempo real
    if (name === 'confirmarContraseña' || name === 'contraseña') {
      if (name === 'confirmarContraseña' && value !== formData.contraseña) {
        setErrors(prev => ({
          ...prev,
          confirmarContraseña: 'Las contraseñas no coinciden'
        }));
      } else if (name === 'contraseña' && formData.confirmarContraseña && value !== formData.confirmarContraseña) {
        setErrors(prev => ({
          ...prev,
          confirmarContraseña: 'Las contraseñas no coinciden'
        }));
      } else if (name === 'confirmarContraseña' && value === formData.contraseña) {
        setErrors(prev => ({
          ...prev,
          confirmarContraseña: ''
        }));
      } else if (name === 'contraseña' && formData.confirmarContraseña && value === formData.confirmarContraseña) {
        setErrors(prev => ({
          ...prev,
          confirmarContraseña: ''
        }));
      }
    }
  };

  /**
   * Maneja el envío del formulario
   * Principio de Responsabilidad Única: Solo maneja el registro
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para el registro (sin confirmarContraseña)
      const registrationData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        contraseña: formData.contraseña
      };

      await register(registrationData);
      
      showSuccess('Registro exitoso. ¡Bienvenido!');
      
      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Error en registro:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al registrar usuario. Intenta nuevamente.';
      
      showError(errorMessage);
      
      // Si el email ya existe, enfocar el campo email
      if (errorMessage.includes('email') || errorMessage.includes('existe')) {
        setErrors(prev => ({
          ...prev,
          email: errorMessage
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg 
              className="h-6 w-6 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Únete al sistema de gestión de proyectos
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              label="Nombre completo"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              error={errors.nombre}
              placeholder="Tu nombre completo"
              required
              autoComplete="name"
              disabled={isLoading}
            />

            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />

            <FormInput
              label="Contraseña"
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleInputChange}
              error={errors.contraseña}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <FormInput
              label="Confirmar contraseña"
              type="password"
              name="confirmarContraseña"
              value={formData.confirmarContraseña}
              onChange={handleInputChange}
              error={errors.confirmarContraseña}
              placeholder="Repite tu contraseña"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          {/* Información de seguridad */}
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-blue-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Tu información está protegida y será utilizada únicamente para el funcionamiento del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div>
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              loadingText="Creando cuenta..."
            >
              Crear Cuenta
            </LoadingButton>
          </div>

          {/* Enlaces adicionales */}
          <div className="text-center">
            <div className="text-sm">
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;