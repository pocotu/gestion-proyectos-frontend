import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import FormInput from '../components/common/FormInput';
import LoadingButton from '../components/common/LoadingButton';

/**
 * LoginPage - Página de inicio de sesión
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja el formulario de login
 * - Open/Closed: Abierto para extensión (nuevos campos, validaciones)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de página
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotification)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    contraseña: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Valida los datos del formulario
   * Principio de Responsabilidad Única: Solo valida
   */
  const validateForm = () => {
    const newErrors = {};

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
  };

  /**
   * Maneja el envío del formulario
   * Principio de Responsabilidad Única: Solo maneja el login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.contraseña);
      
      showSuccess('Inicio de sesión exitoso');
      
      // Redirigir a la página anterior o al dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Error en login:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión. Intenta nuevamente.';
      
      showError(errorMessage);
      
      // Si las credenciales son inválidas, limpiar la contraseña
      if (errorMessage.includes('Credenciales inválidas')) {
        setFormData(prev => ({ ...prev, contraseña: '' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta del sistema de gestión de proyectos</p>
      </div>

      <form onSubmit={handleSubmit} data-testid="login-form">
        <div>
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
            data-testid="email-input"
          />

          <FormInput
            label="Contraseña"
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleInputChange}
            error={errors.contraseña}
            placeholder="Tu contraseña"
            required
            autoComplete="current-password"
            disabled={isLoading}
            data-testid="password-input"
          />
        </div>

        {location.state?.from && (
          <div>
            <p>Necesitas iniciar sesión para acceder a esa página</p>
          </div>
        )}

        <div>
          <LoadingButton
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            loadingText="Iniciando sesión..."
            data-testid="login-button"
          >
            Iniciar Sesión
          </LoadingButton>
        </div>

        <div>
          <div>
            <Link to="/register">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
          <div>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                showInfo('Funcionalidad de recuperación de contraseña próximamente');
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;