import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProjectInfoCard from '../components/project/ProjectInfoCard';
import ProjectDetailTabs from '../components/project/ProjectDetailTabs';
import ProjectEditModal from '../components/project/ProjectEditModal';
import ProjectFileUploadModal from '../components/project/ProjectFileUploadModal';
import ProjectTaskCreateModal from '../components/project/ProjectTaskCreateModal';
import ProjectTaskEditModal from '../components/project/ProjectTaskEditModal';
import { useAuth } from '../hooks/useAuth';
import projectService from '../services/projectService';
import fileService from '../services/fileService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import '../styles/projectDetail.css';

/**
 * ProjectDetailPage - Main container component for project detail view
 * Follows Single Responsibility Principle: Orchestrates data fetching and rendering
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 12.1, 12.2
 */
const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for project data sections
  const [project, setProject] = useState(null);
  const [responsibles, setResponsibles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);

  // State for UI control
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showTaskCreateModal, setShowTaskCreateModal] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  // Check if user can edit project
  const canEditProject = () => {
    if (!user || !project) return false;
    
    // Admin can edit all projects
    if (user.es_administrador) return true;
    
    // Project creator can edit
    if (project.creador_id === user.id) return true;
    
    // Project responsibles can edit
    const isResponsible = responsibles.some(r => r.id === user.id);
    return isResponsible;
  };

  // Fetch project details on component mount
  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  /**
   * Fetch complete project details from API
   * Requirements: 8.1, 8.3
   */
  const fetchProjectDetails = async (bustCache = false) => {
    // Validate project ID is numeric
    const projectId = parseInt(id);
    if (isNaN(projectId) || projectId <= 0) {
      navigate('/projects');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch project details and admin users in parallel
      const [projectResponse, usersResponse] = await Promise.all([
        projectService.getProjectDetails(projectId, bustCache),
        userService.getUsers()
      ]);
      
      // Extract data from response
      const data = projectResponse.data || projectResponse;
      
      setProject(data.project || null);
      setResponsibles(data.responsibles || []);
      setTasks(data.tasks || []);
      setFiles(data.files || []);
      setActivityLogs(data.activityLogs || []);
      setStatistics(data.statistics || {});

      // Get admin users from the users response
      const usersData = usersResponse.data?.data || usersResponse.data || usersResponse;
      const allUsers = usersData.users || usersData;
      const adminUsers = allUsers.filter(u => u.es_administrador);
      
      // Normalize responsibles structure (they have usuario_id, we need id)
      const normalizedResponsibles = (data.responsibles || []).map(r => ({
        id: r.usuario_id || r.id,  // Use usuario_id as the main id
        nombre: r.nombre,
        email: r.email,
        es_administrador: r.es_administrador || false
      }));
      
      // Normalize admin users structure
      const normalizedAdmins = adminUsers.map(u => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        es_administrador: u.es_administrador
      }));
      
      // Combine project responsibles with admin users (avoid duplicates)
      const responsibleIds = new Set(normalizedResponsibles.map(r => r.id));
      const uniqueAdmins = normalizedAdmins.filter(admin => !responsibleIds.has(admin.id));
      const combinedUsers = [...normalizedResponsibles, ...uniqueAdmins];
      
      setAvailableUsers(combinedUsers);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle retry button click
   * Requirements: 8.4, 12.2
   */
  const handleRetry = () => {
    fetchProjectDetails();
  };

  /**
   * Navigate back to projects list
   * Requirements: 8.4, 12.2
   */
  const handleBackToProjects = () => {
    navigate('/projects');
  };

  /**
   * Handle edit project
   */
  const handleEditProject = () => {
    setShowEditModal(true);
  };

  /**
   * Handle save project changes
   */
  const handleSaveProject = async (updatedData) => {
    try {
      await projectService.updateProject(project.id, updatedData);
      setShowEditModal(false);
      // Reload project details
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error al actualizar el proyecto: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * Handle add responsible
   */
  const handleAddResponsible = async (userId) => {
    try {
      await projectService.assignResponsible(project.id, userId);
      // Reload project details to get updated responsibles
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error adding responsible:', error);
      alert('Error al agregar responsable: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * Handle remove responsible
   */
  const handleRemoveResponsible = async (userId) => {
    try {
      await projectService.removeResponsible(project.id, userId);
      // Reload project details to get updated responsibles
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error removing responsible:', error);
      alert('Error al remover responsable: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (files, descripcion) => {
    try {
      setUploading(true);
      
      // Upload files one by one
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo_entidad', 'proyecto');
        formData.append('entidad_id', project.id);
        if (descripcion) {
          formData.append('descripcion', descripcion);
        }

        await fileService.uploadFile(formData);
      }

      // Close modal and reload files
      setShowFileUploadModal(false);
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle file download
   */
  const handleFileDownload = async (file) => {
    try {
      await fileService.downloadFile(file.id, file.nombre_original);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar archivo: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * Handle file delete
   */
  const handleFileDelete = async (file) => {
    try {
      await fileService.deleteFile(file.id);
      // Reload project details to get updated files
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error al eliminar archivo: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * Handle create task
   */
  const handleCreateTask = () => {
    setShowTaskCreateModal(true);
  };

  /**
   * Handle save new task
   */
  const handleSaveTask = async (taskData) => {
    try {
      setSavingTask(true);
      
      // Create the task first
      const response = await taskService.createTask(taskData);
      
      // Extract task ID from response structure: { success: true, data: { task: {...} } }
      const newTask = response.data?.task || response.task;
      const newTaskId = newTask?.id;
      
      if (!newTaskId) {
        throw new Error('No se pudo obtener el ID de la tarea creada');
      }
      
      // If there are assigned users, sync assignments
      if (taskData.asignados && taskData.asignados.length > 0) {
        await taskService.syncTaskAssignments(newTaskId, taskData.asignados);
      }
      
      setShowTaskCreateModal(false);
      // Reload project details with cache busting to get fresh data
      await fetchProjectDetails(true);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear tarea: ' + (error.message || 'Error desconocido'));
    } finally {
      setSavingTask(false);
    }
  };

  /**
   * Handle edit task
   */
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskEditModal(true);
  };

  /**
   * Handle update task
   */
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      setSavingTask(true);
      
      // Update the task first
      await taskService.updateTask(taskId, taskData);
      
      // If there are assigned users, sync assignments
      if (taskData.asignados && taskData.asignados.length > 0) {
        await taskService.syncTaskAssignments(taskId, taskData.asignados);
      }
      
      setShowTaskEditModal(false);
      setSelectedTask(null);
      // Reload project details with cache busting to get fresh data
      await fetchProjectDetails(true);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar tarea: ' + (error.message || 'Error desconocido'));
    } finally {
      setSavingTask(false);
    }
  };

  /**
   * Handle delete task
   */
  const handleDeleteTask = async (taskId) => {
    try {
      setSavingTask(true);
      
      await taskService.deleteTask(taskId);
      
      setShowTaskEditModal(false);
      setSelectedTask(null);
      // Reload project details with cache busting to get fresh data
      await fetchProjectDetails(true);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar tarea: ' + (error.message || 'Error desconocido'));
    } finally {
      setSavingTask(false);
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="project-detail-loading">
        <LoadingSpinner size="large" text="Cargando detalles del proyecto..." />
      </div>
    );
  }

  // Error state UI
  if (error) {
    const errorMessage = error.message || 'Error desconocido';
    let displayMessage = 'Error al cargar el proyecto';
    let showRetry = true;

    // Handle specific error types
    if (errorMessage.includes('no encontrado') || errorMessage.includes('404')) {
      displayMessage = 'Proyecto no encontrado';
      showRetry = false;
    } else if (errorMessage.includes('permisos') || errorMessage.includes('403')) {
      displayMessage = 'No tienes permisos para ver este proyecto';
      showRetry = false;
    } else if (errorMessage.includes('conexión') || errorMessage.includes('red')) {
      displayMessage = 'Error de conexión. Verifica tu internet.';
      showRetry = true;
    }

    return (
      <div className="project-detail-error">
        <div className="project-detail-error-card">
          <div className="project-detail-error-icon">⚠️</div>
          <h2 className="project-detail-error-title">{displayMessage}</h2>
          <p className="project-detail-error-message">{errorMessage}</p>
          <div className="project-detail-error-actions">
            <button onClick={handleBackToProjects} className="project-detail-back-button">
              ← Volver a Proyectos
            </button>
            {showRetry && (
              <button onClick={handleRetry} className="project-detail-retry-button">
                🔄 Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state - render all sub-components
  return (
    <div className="project-detail-page">
      {/* Page Header */}
      <div className="project-detail-header">
        <button onClick={handleBackToProjects} className="project-detail-back-link">
          ← Volver a Proyectos
        </button>
      </div>

      {/* Project Info Card - Full width */}
      <ProjectInfoCard 
        project={project} 
        responsibles={responsibles}
        onEdit={handleEditProject}
        canEdit={canEditProject()}
      />

      {/* Tabs for Tasks, Files, and Activity */}
      <ProjectDetailTabs 
        tasks={tasks}
        files={files}
        activityLogs={activityLogs}
        projectId={project?.id}
        canManage={canEditProject()}
        onFileUpload={() => setShowFileUploadModal(true)}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDelete}
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
      />

      {/* Edit Project Modal */}
      <ProjectEditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProject}
        project={project}
        currentResponsibles={responsibles}
        onAddResponsible={handleAddResponsible}
        onRemoveResponsible={handleRemoveResponsible}
      />

      {/* File Upload Modal */}
      <ProjectFileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onUpload={handleFileUpload}
        projectId={project?.id}
        uploading={uploading}
      />

      {/* Task Create Modal */}
      <ProjectTaskCreateModal
        isOpen={showTaskCreateModal}
        onClose={() => setShowTaskCreateModal(false)}
        onSave={handleSaveTask}
        projectId={project?.id}
        projectResponsibles={availableUsers}
        saving={savingTask}
      />

      {/* Task Edit Modal */}
      <ProjectTaskEditModal
        isOpen={showTaskEditModal}
        onClose={() => {
          setShowTaskEditModal(false);
          setSelectedTask(null);
        }}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        projectResponsibles={availableUsers}
        saving={savingTask}
        deleting={savingTask}
      />
    </div>
  );
};

export default ProjectDetailPage;
