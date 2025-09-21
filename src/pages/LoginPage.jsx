import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/**
 * LoginPage - Página de inicio de sesión con diseño moderno usando Bootstrap
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
   * Maneja los cambios en los inputs del formulario
   * Principio de Responsabilidad Única: Solo maneja cambios de input
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
   * Principio de Responsabilidad Única: Solo maneja el envío
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.contraseña);
      showSuccess('¡Bienvenido! Has iniciado sesión correctamente');
      
      // Redirigir a la página solicitada o al dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Error en login:', error);
      showError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar mensaje si viene de una ruta protegida
  useEffect(() => {
    if (location.state?.from) {
      showInfo('Debes iniciar sesión para acceder a esa página');
    }
  }, [location.state, showInfo]);

  return (
    <div className="gradient-bg min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4 fade-in">
              <h1 className="display-4 fw-bold text-white mb-2">
                Bienvenido
              </h1>
              <h2 className="lead text-white-50">
                Iniciar Sesión
              </h2>
            </div>

            <Card className="card-modern shadow-modern fade-in">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Correo Electrónico
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      className={`form-control-modern ${errors.email ? 'is-invalid' : ''}`}
                      disabled={isLoading}
                      data-testid="email-input"
                    />
                    {errors.email && (
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Contraseña
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`form-control-modern ${errors.contraseña ? 'is-invalid' : ''}`}
                      disabled={isLoading}
                      data-testid="password-input"
                    />
                    {errors.contraseña && (
                      <Form.Control.Feedback type="invalid">
                        {errors.contraseña}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <div className="d-grid mb-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="btn-modern"
                      disabled={isLoading}
                      data-testid="login-button"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-3">
                    ¿No tienes una cuenta?{' '}
                    <Link 
                      to="/register" 
                      className="text-decoration-none fw-semibold"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                  
                  <Link 
                    to="/forgot-password" 
                    className="text-muted text-decoration-none small"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4 fade-in">
              <p className="small text-muted">
                © 2024 Sistema de Gestión de Proyectos. Todos los derechos reservados.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;