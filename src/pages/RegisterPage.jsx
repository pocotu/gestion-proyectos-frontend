import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/**
 * RegisterPage - Página de registro de usuarios con diseño moderno usando Bootstrap
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="gradient-bg min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold text-dark mb-2">
                Crear Cuenta
              </h1>
              <p className="text-muted fs-5">
                Únete a nuestro sistema de gestión
              </p>
            </div>

            {/* Register Card */}
            <div className="card card-modern shadow-lg border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label fw-semibold">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      data-testid="name-input"
                    />
                    {errors.nombre && (
                      <div className="invalid-feedback">
                        {errors.nombre}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      data-testid="email-input"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="contraseña" className="form-label fw-semibold">
                      Contraseña
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${errors.contraseña ? 'is-invalid' : ''}`}
                        id="contraseña"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        data-testid="password-input"
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute"
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          color: '#6c757d',
                          padding: '0',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.contraseña && (
                      <div className="invalid-feedback">
                        {errors.contraseña}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-3">
                    <label htmlFor="confirmarContraseña" className="form-label fw-semibold">
                      Confirmar Contraseña
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${errors.confirmarContraseña ? 'is-invalid' : ''}`}
                        id="confirmarContraseña"
                        name="confirmarContraseña"
                        value={formData.confirmarContraseña}
                        onChange={handleInputChange}
                        placeholder="Repite tu contraseña"
                        data-testid="confirm-password-input"
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute"
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          color: '#6c757d',
                          padding: '0',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmarContraseña && (
                      <div className="invalid-feedback">
                        {errors.confirmarContraseña}
                      </div>
                    )}
                  </div>

                  {/* Security Info */}
                  <div className="alert alert-success d-flex align-items-start mb-4" role="alert">
                    <svg className="me-2 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <small>
                        Tu contraseña debe tener al menos 6 caracteres para garantizar la seguridad de tu cuenta.
                      </small>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-modern btn-lg"
                      disabled={isLoading}
                      data-testid="register-button"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <hr className="my-4" />

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary fw-semibold text-decoration-none"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted small">
                © 2025 Sistema de Gestión de Proyectos. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;