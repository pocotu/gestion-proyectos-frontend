import React from 'react';

/**
 * ProjectFilters - Componente para filtros de proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja los controles de filtrado
 * - Open/Closed: Abierto para extensión (nuevos filtros)
 * - Interface Segregation: Props específicas para configuración
 */
const ProjectFilters = ({
  filters = {},
  searchTerm = '',
  onFiltersChange,
  onSearchChange,
  className = ''
}) => {
  const handleFilterChange = (key, value) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  const handleSearchChange = (value) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const clearFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({});
    }
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(value => value);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label htmlFor="search-projects" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search-projects"
            data-testid="search-projects-input"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre, descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="project-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="project-status-filter"
            data-testid="project-status-filter"
            value={filters.estado || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="planificacion">Planificación</option>
            <option value="en_progreso">En Progreso</option>
            <option value="pausado">Pausado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Filtro por prioridad */}
        <div>
          <label htmlFor="project-priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="project-priority-filter"
            value={filters.prioridad || ''}
            onChange={(e) => handleFilterChange('prioridad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        {/* Botón para limpiar filtros */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              hasActiveFilters
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Búsqueda: "{searchTerm}"
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.estado && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Estado: {filters.estado}
                <button
                  type="button"
                  onClick={() => handleFilterChange('estado', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.prioridad && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Prioridad: {filters.prioridad}
                <button
                  type="button"
                  onClick={() => handleFilterChange('prioridad', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;