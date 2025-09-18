import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProjectList from '../components/project/ProjectList';
import ProjectForm from '../components/project/ProjectForm';
import ProjectDetail from '../components/project/ProjectDetail';
import ActionButton from '../components/common/ActionButton';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import projectService from '../services/projectService';

/**
 * ProjectsPage - Página principal de gestión de proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Gestiona la vista principal de proyectos
 * - Open/Closed: Abierto para extensión (nuevas funcionalidades)
 * - Liskov Substitution: Puede ser sustituido por otras páginas de gestión
 * - Interface Segregation: Componentes específicos para cada funcionalidad
 * - Dependency Inversion: Depende de abstracciones (projectService)
 */

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados principales
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de modales y vistas
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail'
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Estados de datos seleccionados
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  
  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    prioridad: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
    
    // Verificar parámetros de URL para mostrar proyecto específico
    const projectId = searchParams.get('id');
    if (projectId) {
      setCurrentView('detail');
      setSelectedProject({ id: projectId });
    }
  }, [searchParams]);

  /**
   * Cargar lista de proyectos
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectService.getAllProjects(filters);
      
      if (response.success) {
        setProjects(response.data || []);
      } else {
        throw new Error(response.message || 'Error al cargar proyectos');
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cambios en filtros
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Recargar proyectos con nuevos filtros
    loadProjects();
  };

  /**
   * Mostrar formulario para crear proyecto
   */
  const handleCreateProject = () => {
    setSelectedProject(null);
    setFormMode('create');
    setShowForm(true);
  };

  /**
   * Mostrar formulario para editar proyecto
   */
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setFormMode('edit');
    setShowForm(true);
  };

  /**
   * Mostrar detalles del proyecto
   */
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setCurrentView('detail');
    
    // Actualizar URL sin recargar la página
    setSearchParams({ id: project.id });
  };

  /**
   * Confirmar eliminación de proyecto
   */
  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  /**
   * Ejecutar eliminación de proyecto
   */
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setLoading(true);
      
      const response = await projectService.deleteProject(projectToDelete.id);
      
      if (response.success) {
        // Recargar lista de proyectos
        await loadProjects();
        
        // Si estamos viendo el proyecto eliminado, volver a la lista
        if (selectedProject && selectedProject.id === projectToDelete.id) {
          handleBackToList();
        }
        
        // Mostrar mensaje de éxito (opcional)
        console.log('Proyecto eliminado exitosamente');
      } else {
        throw new Error(response.message || 'Error al eliminar proyecto');
      }
    } catch (err) {
      console.error('Error al eliminar proyecto:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    }
  };

  /**
   * Manejar envío del formulario
   */
  const handleFormSubmit = async (projectData) => {
    try {
      setLoading(true);
      let response;

      if (formMode === 'create') {
        response = await projectService.createProject(projectData);
      } else {
        response = await projectService.updateProject(selectedProject.id, projectData);
      }

      if (response.success) {
        // Recargar lista de proyectos
        await loadProjects();
        
        // Cerrar formulario
        setShowForm(false);
        setSelectedProject(null);
        
        // Si estamos editando, actualizar la vista de detalle
        if (formMode === 'edit' && currentView === 'detail') {
          setSelectedProject(response.data);
        }
        
        console.log(`Proyecto ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
      } else {
        throw new Error(response.message || `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} proyecto`);
      }
    } catch (err) {
      console.error('Error en formulario:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Volver a la vista de lista
   */
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProject(null);
    setSearchParams({});
  };

  /**
   * Cambiar estado del proyecto
   */
  const handleChangeStatus = async (projectId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await projectService.changeProjectStatus(projectId, newStatus);
      
      if (response.success) {
        // Recargar proyectos
        await loadProjects();
        
        // Si estamos viendo el proyecto, actualizar los datos
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({ ...selectedProject, estado: newStatus });
        }
        
        console.log('Estado del proyecto actualizado exitosamente');
      } else {
        throw new Error(response.message || 'Error al cambiar estado del proyecto');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar contenido principal
  const renderMainContent = () => {
    if (loading && projects.length === 0) {
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

    switch (currentView) {
      case 'detail':
        return (
          <ProjectDetail
            projectId={selectedProject?.id}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onClose={handleBackToList}
          />
        );
      
      case 'list':
      default:
        return (
          <ProjectList
            projects={projects}
            loading={loading}
            onView={handleViewProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onChangeStatus={handleChangeStatus}
            onFiltersChange={handleFiltersChange}
            filters={filters}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {currentView === 'detail' && (
                <ActionButton
                  variant="secondary"
                  onClick={handleBackToList}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Volver</span>
                </ActionButton>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentView === 'detail' ? 'Detalle del Proyecto' : 'Gestión de Proyectos'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {currentView === 'detail' 
                    ? 'Información completa del proyecto seleccionado'
                    : `Administra y supervisa todos los proyectos (${projects.length})`
                  }
                </p>
              </div>
            </div>

            {currentView === 'list' && (
              <div className="flex items-center space-x-3">
                <ActionButton
                  variant="primary"
                  onClick={handleCreateProject}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nuevo Proyecto</span>
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </div>

      {/* Modal para formulario */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={formMode === 'create' ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
        size="lg"
      >
        <ProjectForm
          project={selectedProject}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteProject}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${projectToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default ProjectsPage;