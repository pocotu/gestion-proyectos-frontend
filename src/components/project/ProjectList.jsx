import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import ActionButton from '../common/ActionButton';
import LoadingSpinner from '../common/LoadingSpinner';
import ProjectFilters from './ProjectFilters';
import projectService from '../../services/projectService';

/**
 * ProjectList - Componente para listar proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga de mostrar la lista de proyectos
 * - Open/Closed: Abierto para extensión (nuevas columnas, filtros)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de lista
 * - Interface Segregation: Props específicas para configuración de lista
 * - Dependency Inversion: Depende de abstracciones (projectService)
 */

const ProjectList = ({ 
  onEdit, 
  onDelete, 
  onView, 
  showActions = true,
  filters = {},
  searchTerm = '',
  refreshTrigger = 0,
  onFiltersChange,
  onSearchChange 
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Cargar proyectos
  useEffect(() => {
    loadProjects();
  }, [refreshTrigger, filters]);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    applyFilters();
  }, [projects, filters, searchTerm]);

  /**
   * Cargar lista de proyectos
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectService.getAllProjects(filters);
      
      if (response.success) {
        // El backend devuelve {success, projects, data} donde projects contiene la lista
        setProjects(response.projects || response.data || []);
      } else {
        throw new Error(response.message || 'Error al cargar proyectos');
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar filtros y búsqueda
   */
  const applyFilters = () => {
    let filtered = [...projects];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.nombre?.toLowerCase().includes(term) ||
        project.descripcion?.toLowerCase().includes(term) ||
        project.estado?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros adicionales
    if (filters.estado) {
      filtered = filtered.filter(project => project.estado === filters.estado);
    }

    if (filters.responsable_id) {
      filtered = filtered.filter(project => 
        project.responsables?.some(resp => resp.id === filters.responsable_id)
      );
    }

    if (filters.fecha_inicio) {
      filtered = filtered.filter(project => 
        new Date(project.fecha_inicio) >= new Date(filters.fecha_inicio)
      );
    }

    if (filters.fecha_fin) {
      filtered = filtered.filter(project => 
        new Date(project.fecha_fin) <= new Date(filters.fecha_fin)
      );
    }

    setFilteredProjects(filtered);
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
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
   * Configuración de columnas para la tabla
   */
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (project) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{project.nombre}</span>
          {project.descripcion && (
            <span className="text-sm text-gray-500 truncate max-w-xs">
              {project.descripcion}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (project) => (
        <StatusBadge 
          status={project.estado} 
          color={getStatusColor(project.estado)}
        />
      )
    },
    {
      key: 'responsables',
      label: 'Responsables',
      render: (project) => (
        <div className="flex flex-col">
          {project.responsables && project.responsables.length > 0 ? (
            project.responsables.slice(0, 2).map((resp, index) => (
              <span key={resp.id} className="text-sm text-gray-700">
                {resp.nombre} {resp.apellido}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">Sin asignar</span>
          )}
          {project.responsables && project.responsables.length > 2 && (
            <span className="text-xs text-gray-500">
              +{project.responsables.length - 2} más
            </span>
          )}
        </div>
      )
    },
    {
      key: 'fechas',
      label: 'Fechas',
      render: (project) => (
        <div className="flex flex-col text-sm">
          <span className="text-gray-600">
            Inicio: {formatDate(project.fecha_inicio)}
          </span>
          <span className="text-gray-600">
            Fin: {formatDate(project.fecha_fin)}
          </span>
        </div>
      )
    },
    {
      key: 'progreso',
      label: 'Progreso',
      render: (project) => (
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${project.progreso || 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 min-w-max">
              {project.progreso || 0}%
            </span>
          </div>
          {project.total_tareas > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              {project.tareas_completadas || 0} de {project.total_tareas} tareas
            </span>
          )}
        </div>
      )
    }
  ];

  // Agregar columna de acciones si está habilitada
  if (showActions) {
    columns.push({
      key: 'actions',
      label: 'Acciones',
      render: (project) => (
        <div className="flex space-x-2">
          {onView && (
            <ActionButton
              variant="info"
              size="sm"
              onClick={() => onView(project)}
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </ActionButton>
          )}
          
          {onEdit && (
            <ActionButton
              variant="warning"
              size="sm"
              onClick={() => onEdit(project)}
              title="Editar proyecto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </ActionButton>
          )}
          
          {onDelete && (
            <ActionButton
              variant="danger"
              size="sm"
              onClick={() => onDelete(project)}
              title="Eliminar proyecto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ActionButton>
          )}
        </div>
      )
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
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
              Error al cargar proyectos
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <ActionButton
                variant="danger"
                size="sm"
                onClick={loadProjects}
              >
                Reintentar
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="projects-list">
      {/* Filtros */}
      <ProjectFilters
        filters={filters}
        searchTerm={searchTerm}
        onFiltersChange={onFiltersChange}
        onSearchChange={onSearchChange}
      />

      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {filteredProjects.length} de {projects.length} proyectos
        </div>
        
        {searchTerm && (
          <div className="text-sm text-gray-500">
            Filtrado por: "{searchTerm}"
          </div>
        )}
      </div>

      {/* Tabla de proyectos */}
      {filteredProjects.length > 0 ? (
        <DataTable
          data={filteredProjects}
          columns={columns}
          keyField="id"
          className="shadow-sm"
          rowTestId="project-row"
        />
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proyectos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'No se encontraron proyectos que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primer proyecto.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;