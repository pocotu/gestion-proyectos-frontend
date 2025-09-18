import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';

/**
 * Context de Proyectos
 * Implementa el patrón Context + Reducer para manejo de estado global de proyectos
 * Principio de Responsabilidad Única: Solo maneja el estado de proyectos
 * Principio de Inversión de Dependencias: Depende de api (abstracción)
 */

// Estados posibles
const PROJECT_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Acciones del reducer
const PROJECT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  RESET_STATE: 'RESET_STATE'
};

// Estado inicial
const initialState = {
  projects: [],
  currentProject: null,
  status: PROJECT_STATES.IDLE,
  error: null,
  isLoading: false,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

/**
 * Reducer para manejar el estado de proyectos
 */
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
        status: PROJECT_STATES.LOADING
      };

    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload.projects,
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null,
        status: PROJECT_STATES.SUCCESS
      };

    case PROJECT_ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.payload,
        isLoading: false,
        error: null,
        status: PROJECT_STATES.SUCCESS
      };

    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        isLoading: false,
        error: null,
        status: PROJECT_STATES.SUCCESS
      };

    case PROJECT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject,
        isLoading: false,
        error: null,
        status: PROJECT_STATES.SUCCESS
      };

    case PROJECT_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload 
          ? null 
          : state.currentProject,
        isLoading: false,
        error: null,
        status: PROJECT_STATES.SUCCESS
      };

    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        status: PROJECT_STATES.ERROR
      };

    case PROJECT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case PROJECT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case PROJECT_ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Crear contexto
const ProjectContext = createContext(null);

/**
 * Provider del contexto de proyectos
 */
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  /**
   * Obtener todos los proyectos
   */
  const getProjects = useCallback(async (params = {}) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING });

    try {
      const queryParams = {
        ...state.filters,
        ...params,
        page: params.page || state.pagination.page,
        limit: params.limit || state.pagination.limit
      };

      const response = await api.get('/projects', { params: queryParams });
      
      dispatch({
        type: PROJECT_ACTIONS.SET_PROJECTS,
        payload: {
          projects: response.data.projects || response.data,
          pagination: response.data.pagination
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al obtener proyectos'
      });
      return { success: false, error: error.message };
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  /**
   * Obtener un proyecto por ID
   */
  const getProject = useCallback(async (id) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING });

    try {
      const response = await api.get(`/projects/${id}`);
      
      dispatch({
        type: PROJECT_ACTIONS.SET_CURRENT_PROJECT,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al obtener proyecto'
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Crear un nuevo proyecto
   */
  const createProject = useCallback(async (projectData) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING });

    try {
      const response = await api.post('/projects', projectData);
      
      dispatch({
        type: PROJECT_ACTIONS.ADD_PROJECT,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al crear proyecto'
      });
      return { success: false, error: error.message, errors: error.errors };
    }
  }, []);

  /**
   * Actualizar un proyecto
   */
  const updateProject = useCallback(async (id, projectData) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING });

    try {
      const response = await api.put(`/projects/${id}`, projectData);
      
      dispatch({
        type: PROJECT_ACTIONS.UPDATE_PROJECT,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al actualizar proyecto'
      });
      return { success: false, error: error.message, errors: error.errors };
    }
  }, []);

  /**
   * Eliminar un proyecto
   */
  const deleteProject = useCallback(async (id) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING });

    try {
      await api.delete(`/projects/${id}`);
      
      dispatch({
        type: PROJECT_ACTIONS.DELETE_PROJECT,
        payload: id
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al eliminar proyecto'
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Establecer proyecto actual
   */
  const setCurrentProject = useCallback((project) => {
    dispatch({
      type: PROJECT_ACTIONS.SET_CURRENT_PROJECT,
      payload: project
    });
  }, []);

  /**
   * Actualizar filtros
   */
  const setFilters = useCallback((filters) => {
    dispatch({
      type: PROJECT_ACTIONS.SET_FILTERS,
      payload: filters
    });
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    dispatch({ type: PROJECT_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Resetear estado
   */
  const resetState = useCallback(() => {
    dispatch({ type: PROJECT_ACTIONS.RESET_STATE });
  }, []);

  /**
   * Buscar proyectos
   */
  const searchProjects = useCallback(async (searchTerm) => {
    const filters = { ...state.filters, search: searchTerm };
    setFilters(filters);
    return await getProjects({ ...filters, page: 1 });
  }, [state.filters, getProjects]);

  /**
   * Filtrar proyectos por estado
   */
  const filterByStatus = useCallback(async (status) => {
    const filters = { ...state.filters, status };
    setFilters(filters);
    return await getProjects({ ...filters, page: 1 });
  }, [state.filters, getProjects]);

  /**
   * Obtener estadísticas de proyectos
   */
  const getProjectStats = useCallback(async () => {
    try {
      const response = await api.get('/projects/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Valor del contexto
  const contextValue = {
    // Estado
    projects: state.projects,
    currentProject: state.currentProject,
    isLoading: state.isLoading,
    error: state.error,
    status: state.status,
    filters: state.filters,
    pagination: state.pagination,

    // Acciones CRUD
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,

    // Acciones de estado
    setCurrentProject,
    setFilters,
    clearError,
    resetState,

    // Utilidades
    searchProjects,
    filterByStatus,
    getProjectStats
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de proyectos
 */
export const useProjects = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useProjects debe ser usado dentro de un ProjectProvider');
  }
  
  return context;
};

export default ProjectContext;