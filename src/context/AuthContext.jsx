import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Context de Autenticación
 * Implementa el patrón Context + Reducer para manejo de estado global
 * Principio de Responsabilidad Única: Solo maneja el estado de autenticación
 * Principio de Inversión de Dependencias: Depende de authService (abstracción)
 */

// Estados posibles de autenticación
const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};

// Acciones del reducer
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial
const initialState = {
  user: null,
  token: null,
  status: AUTH_STATES.IDLE,
  error: null,
  isLoading: false,
  isAuthenticated: false
};

/**
 * Reducer para manejar el estado de autenticación
 * Implementa el patrón Reducer para cambios de estado predecibles
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
        status: AUTH_STATES.LOADING
      };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        status: AUTH_STATES.AUTHENTICATED
      };

    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        status: AUTH_STATES.UNAUTHENTICATED
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        status: AUTH_STATES.ERROR
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext(null);

/**
 * Provider del contexto de autenticación
 * Implementa el patrón Provider para compartir estado global
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Inicializar estado de autenticación
   */
  const initializeAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });

    try {
      // Verificar si hay datos de autenticación guardados
      const token = authService.getCurrentToken();
      const user = authService.getCurrentUser();

      if (token && user) {
        // Verificar token con el servidor
        const verifiedUser = await authService.verifyToken();
        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATED,
          payload: { user: verifiedUser, token }
        });

        // Inicializar verificación periódica de tokens
        authService.initTokenExpirationCheck();
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      }
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  };

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });

    try {
      const { user, token } = await authService.login(email, password);
      dispatch({
        type: AUTH_ACTIONS.SET_AUTHENTICATED,
        payload: { user, token }
      });
      return { success: true, user, token };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al iniciar sesión'
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Registrar usuario
   */
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });

    try {
      const response = await authService.register(userData);
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al registrar usuario'
      });
      return { success: false, error: error.message, errors: error.errors };
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  };

  /**
   * Actualizar datos del usuario
   */
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  /**
   * Cambiar contraseña
   */
  const changePassword = async (currentPassword, newPassword) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING });

    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al cambiar contraseña'
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = () => {
    return authService.isAdmin();
  };

  /**
   * Limpiar errores
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    status: state.status,

    // Acciones
    login,
    register,
    logout,
    updateUser,
    changePassword,
    hasRole,
    isAdmin,
    clearError,

    // Utilidades
    initializeAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 * Implementa el patrón Custom Hook para encapsular lógica
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;