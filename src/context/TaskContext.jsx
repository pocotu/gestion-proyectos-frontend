import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';

/**
 * Context de Tareas
 * Implementa el patrón Context + Reducer para manejo de estado global de tareas
 * Principio de Responsabilidad Única: Solo maneja el estado de tareas
 * Principio de Inversión de Dependencias: Depende de api (abstracción)
 */

// Estados posibles
const TASK_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Acciones del reducer
const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_TASKS: 'SET_TASKS',
  SET_CURRENT_TASK: 'SET_CURRENT_TASK',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  RESET_STATE: 'RESET_STATE'
};

// Estado inicial
const initialState = {
  tasks: [],
  currentTask: null,
  status: TASK_STATES.IDLE,
  error: null,
  isLoading: false,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    projectId: null,
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
 * Reducer para manejar el estado de tareas
 */
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
        status: TASK_STATES.LOADING
      };

    case TASK_ACTIONS.SET_TASKS:
      return {
        ...state,
        tasks: action.payload.tasks,
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null,
        status: TASK_STATES.SUCCESS
      };

    case TASK_ACTIONS.SET_CURRENT_TASK:
      return {
        ...state,
        currentTask: action.payload,
        isLoading: false,
        error: null,
        status: TASK_STATES.SUCCESS
      };

    case TASK_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        isLoading: false,
        error: null,
        status: TASK_STATES.SUCCESS
      };

    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        currentTask: state.currentTask?.id === action.payload.id 
          ? action.payload 
          : state.currentTask,
        isLoading: false,
        error: null,
        status: TASK_STATES.SUCCESS
      };

    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        currentTask: state.currentTask?.id === action.payload 
          ? null 
          : state.currentTask,
        isLoading: false,
        error: null,
        status: TASK_STATES.SUCCESS
      };

    case TASK_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        status: TASK_STATES.ERROR
      };

    case TASK_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case TASK_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case TASK_ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Crear contexto
const TaskContext = createContext(null);

/**
 * Provider del contexto de tareas
 */
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  /**
   * Obtener todas las tareas
   */
  const getTasks = useCallback(async (params = {}) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      const queryParams = {
        ...state.filters,
        ...params,
        page: params.page || state.pagination.page,
        limit: params.limit || state.pagination.limit
      };

      const response = await api.get('/tasks', { params: queryParams });
      
      dispatch({
        type: TASK_ACTIONS.SET_TASKS,
        payload: {
          tasks: response.data.tasks || response.data,
          pagination: response.data.pagination
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al obtener tareas'
      });
      return { success: false, error: error.message };
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  /**
   * Obtener tareas por proyecto
   */
  const getTasksByProject = useCallback(async (projectId, params = {}) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      const queryParams = {
        ...state.filters,
        ...params,
        projectId,
        page: params.page || state.pagination.page,
        limit: params.limit || state.pagination.limit
      };

      const response = await api.get(`/projects/${projectId}/tasks`, { params: queryParams });
      
      dispatch({
        type: TASK_ACTIONS.SET_TASKS,
        payload: {
          tasks: response.data.tasks || response.data,
          pagination: response.data.pagination
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al obtener tareas del proyecto'
      });
      return { success: false, error: error.message };
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  /**
   * Obtener una tarea por ID
   */
  const getTask = useCallback(async (id) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      const response = await api.get(`/tasks/${id}`);
      
      dispatch({
        type: TASK_ACTIONS.SET_CURRENT_TASK,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al obtener tarea'
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Crear una nueva tarea
   */
  const createTask = useCallback(async (taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      const response = await api.post('/tasks', taskData);
      
      dispatch({
        type: TASK_ACTIONS.ADD_TASK,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al crear tarea'
      });
      return { success: false, error: error.message, errors: error.errors };
    }
  }, []);

  /**
   * Actualizar una tarea
   */
  const updateTask = useCallback(async (id, taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      
      dispatch({
        type: TASK_ACTIONS.UPDATE_TASK,
        payload: response.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al actualizar tarea'
      });
      return { success: false, error: error.message, errors: error.errors };
    }
  }, []);

  /**
   * Eliminar una tarea
   */
  const deleteTask = useCallback(async (id) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING });

    try {
      await api.delete(`/tasks/${id}`);
      
      dispatch({
        type: TASK_ACTIONS.DELETE_TASK,
        payload: id
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.message || 'Error al eliminar tarea'
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Cambiar estado de una tarea
   */
  const updateTaskStatus = useCallback(async (id, status) => {
    return await updateTask(id, { status });
  }, [updateTask]);

  /**
   * Asignar tarea a usuario
   */
  const assignTask = useCallback(async (id, userId) => {
    return await updateTask(id, { assigned_to: userId });
  }, [updateTask]);

  /**
   * Establecer tarea actual
   */
  const setCurrentTask = useCallback((task) => {
    dispatch({
      type: TASK_ACTIONS.SET_CURRENT_TASK,
      payload: task
    });
  }, []);

  /**
   * Actualizar filtros
   */
  const setFilters = useCallback((filters) => {
    dispatch({
      type: TASK_ACTIONS.SET_FILTERS,
      payload: filters
    });
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Resetear estado
   */
  const resetState = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.RESET_STATE });
  }, []);

  /**
   * Buscar tareas
   */
  const searchTasks = useCallback(async (searchTerm) => {
    const filters = { ...state.filters, search: searchTerm };
    setFilters(filters);
    return await getTasks({ ...filters, page: 1 });
  }, [state.filters, getTasks]);

  /**
   * Filtrar tareas por estado
   */
  const filterByStatus = useCallback(async (status) => {
    const filters = { ...state.filters, status };
    setFilters(filters);
    return await getTasks({ ...filters, page: 1 });
  }, [state.filters, getTasks]);

  /**
   * Filtrar tareas por prioridad
   */
  const filterByPriority = useCallback(async (priority) => {
    const filters = { ...state.filters, priority };
    setFilters(filters);
    return await getTasks({ ...filters, page: 1 });
  }, [state.filters, getTasks]);

  /**
   * Obtener estadísticas de tareas
   */
  const getTaskStats = useCallback(async (projectId = null) => {
    try {
      const url = projectId ? `/projects/${projectId}/tasks/stats` : '/tasks/stats';
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Valor del contexto
  const contextValue = {
    // Estado
    tasks: state.tasks,
    currentTask: state.currentTask,
    isLoading: state.isLoading,
    error: state.error,
    status: state.status,
    filters: state.filters,
    pagination: state.pagination,

    // Acciones CRUD
    getTasks,
    getTasksByProject,
    getTask,
    createTask,
    updateTask,
    deleteTask,

    // Acciones específicas
    updateTaskStatus,
    assignTask,

    // Acciones de estado
    setCurrentTask,
    setFilters,
    clearError,
    resetState,

    // Utilidades
    searchTasks,
    filterByStatus,
    filterByPriority,
    getTaskStats
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de tareas
 */
export const useTasks = () => {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTasks debe ser usado dentro de un TaskProvider');
  }
  
  return context;
};

export default TaskContext;