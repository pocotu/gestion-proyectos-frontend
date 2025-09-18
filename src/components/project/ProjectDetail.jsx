import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import DataTable from '../common/DataTable';
import projectService from '../../services/projectService';

/**
 * ProjectDetail - Componente para mostrar detalles de un proyecto
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar detalles del proyecto
 * - Open/Closed: Abierto para extensión (nuevas secciones, datos)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de detalle
 * - Interface Segregation: Props específicas para configuración de vista
 * - Dependency Inversion: Depende de abstracciones (projectService)
 */

const ProjectDetail = ({ 
  projectId, 
  onEdit, 
  onDelete, 
  onClose,
  showActions = true 
}) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [responsibles, setResponsibles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Cargar datos del proyecto
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  /**
   * Cargar todos los datos del proyecto
   */
  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [projectResponse, tasksResponse, responsiblesResponse, statsResponse] = await Promise.allSettled([
        projectService.getProjectById(projectId),
        projectService.getProjectTasks(projectId),
        projectService.getProjectResponsibles(projectId),
        projectService.getProjectStats(projectId)
      ]);

      // Procesar respuesta del proyecto
      if (projectResponse.status === 'fulfilled' && projectResponse.value.success) {
        setProject(projectResponse.value.data);
      } else {
        throw new Error('Error al cargar datos del proyecto');
      }

      // Procesar respuesta de tareas
      if (tasksResponse.status === 'fulfilled' && tasksResponse.value.success) {
        setTasks(tasksResponse.value.data || []);
      }

      // Procesar respuesta de responsables
      if (responsiblesResponse.status === 'fulfilled' && responsiblesResponse.value.success) {
        setResponsibles(responsiblesResponse.value.data || []);
      }

      // Procesar respuesta de estadísticas
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        setStats(statsResponse.value.data);
      }

    } catch (err) {
      console.error('Error al cargar datos del proyecto:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  /**
   * Obtener color del estado
   */
  const getStatusColor = (estado) => {
    const colors = {
      'planificacion': 'blue',
      'en_progreso': 'yellow',
      'completado': 'green',
      'cancelado': 'red',
      'pausado': 'gray'
    };
    return colors[estado] || 'gray';
  };

  /**
   * Obtener color de prioridad
   */
  const getPriorityColor = (prioridad) => {
    const colors = {
      'baja': 'green',
      'media': 'yellow',
      'alta': 'orange',
      'critica': 'red'
    };
    return colors[prioridad] || 'gray';
  };

  /**
   * Configuración de columnas para tabla de tareas
   */
  const taskColumns = [
    {
      key: 'nombre',
      label: 'Tarea',
      render: (task) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{task.nombre}</span>
          {task.descripcion && (
            <span className="text-sm text-gray-500 truncate max-w-xs">
              {task.descripcion}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (task) => (
        <StatusBadge 
          status={task.estado} 
          color={getStatusColor(task.estado)}
        />
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      render: (task) => (
        <StatusBadge 
          status={task.prioridad} 
          color={getPriorityColor(task.prioridad)}
        />
      )
    },
    {
      key: 'asignado',
      label: 'Asignado a',
      render: (task) => (
        task.usuario_asignado ? (
          <span className="text-sm text-gray-700">
            {task.usuario_asignado.nombre} {task.usuario_asignado.apellido}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Sin asignar</span>
        )
      )
    },
    {
      key: 'fecha_vencimiento',
      label: 'Vencimiento',
      render: (task) => (
        <span className="text-sm text-gray-600">
          {formatDate(task.fecha_vencimiento)}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error al cargar el proyecto
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <ActionButton
                variant="danger"
                size="sm"
                onClick={loadProjectData}
              >
                Reintentar
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Proyecto no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          El proyecto solicitado no existe o no tienes permisos para verlo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.nombre}</h1>
              <StatusBadge 
                status={project.estado} 
                color={getStatusColor(project.estado)}
                size="lg"
              />
              <StatusBadge 
                status={project.prioridad} 
                color={getPriorityColor(project.prioridad)}
                size="lg"
              />
            </div>
            
            {project.descripcion && (
              <p className="mt-2 text-gray-600">{project.descripcion}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                {onEdit && (
                  <ActionButton
                    variant="warning"
                    onClick={() => onEdit(project)}
                  >
                    Editar
                  </ActionButton>
                )}
                
                {onDelete && (
                  <ActionButton
                    variant="danger"
                    onClick={() => onDelete(project)}
                  >
                    Eliminar
                  </ActionButton>
                )}
              </>
            )}
            
            {onClose && (
              <ActionButton
                variant="secondary"
                onClick={onClose}
              >
                Cerrar
              </ActionButton>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'tasks', label: `Tareas (${tasks.length})` },
            { id: 'team', label: `Equipo (${responsibles.length})` },
            { id: 'stats', label: 'Estadísticas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información del Proyecto</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha de Inicio:</span>
                  <span className="text-sm text-gray-900">{formatDate(project.fecha_inicio)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha de Fin:</span>
                  <span className="text-sm text-gray-900">{formatDate(project.fecha_fin)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Presupuesto:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(project.presupuesto)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Creado:</span>
                  <span className="text-sm text-gray-900">{formatDate(project.fecha_creacion)}</span>
                </div>
              </div>
            </div>

            {/* Progreso */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Progreso</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Completado</span>
                    <span className="text-gray-900">{project.progreso || 0}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${project.progreso || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                {stats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Total de Tareas:</span>
                      <span className="text-sm text-gray-900">{stats.total_tareas || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Tareas Completadas:</span>
                      <span className="text-sm text-gray-900">{stats.tareas_completadas || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Tareas Pendientes:</span>
                      <span className="text-sm text-gray-900">{stats.tareas_pendientes || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Tareas del Proyecto</h3>
              <Link
                to={`/tasks?project=${projectId}`}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Ver todas las tareas →
              </Link>
            </div>
            
            {tasks.length > 0 ? (
              <DataTable
                data={tasks}
                columns={taskColumns}
                keyField="id"
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay tareas asignadas a este proyecto.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Equipo del Proyecto</h3>
            
            {responsibles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {responsibles.map((responsible) => (
                  <div key={responsible.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {responsible.nombre.charAt(0)}{responsible.apellido.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {responsible.nombre} {responsible.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{responsible.email}</p>
                        {responsible.roles && (
                          <p className="text-xs text-gray-400">
                            {responsible.roles.map(role => role.nombre).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay responsables asignados a este proyecto.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Estadísticas del Proyecto</h3>
            
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h10a2 2 0 012 2v11a2 2 0 01-2 2H9m0-13v13" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Tareas</p>
                      <p className="text-2xl font-semibold text-blue-900">{stats.total_tareas || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Completadas</p>
                      <p className="text-2xl font-semibold text-green-900">{stats.tareas_completadas || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                      <p className="text-2xl font-semibold text-yellow-900">{stats.tareas_en_progreso || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Vencidas</p>
                      <p className="text-2xl font-semibold text-red-900">{stats.tareas_vencidas || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay estadísticas disponibles.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;