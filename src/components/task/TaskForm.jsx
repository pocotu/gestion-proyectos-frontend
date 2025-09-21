import React, { useState, useEffect } from 'react';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import FormSelect from '../common/FormSelect';
import LoadingButton from '../common/LoadingButton';
import FileUpload from '../file/FileUpload';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';

/**
 * TaskForm - Componente para crear y editar tareas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga del formulario de tareas
 * - Open/Closed: Abierto para extensión (nuevos campos, validaciones)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de formulario
 * - Interface Segregation: Props específicas para configuración del formulario
 * - Dependency Inversion: Depende de abstracciones (taskService, projectService)
 */

const TaskForm = ({ 
  task = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  projectId = null,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    proyecto_id: projectId || '',
    fecha_inicio: '',
    fecha_limite: '',
    estado: 'pendiente',
    prioridad: 'media',
    progreso: 0,
    usuario_asignado_id: '',
    padre_tarea_id: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [parentTasks, setParentTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [files, setFiles] = useState([]);

  // Estados disponibles para tareas
  const estadosOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  // Prioridades disponibles
  const prioridadOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar datos de la tarea si está en modo edición
  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        descripcion: task.descripcion || '',
        proyecto_id: task.proyecto_id || projectId || '',
        fecha_inicio: task.fecha_inicio ? task.fecha_inicio.split('T')[0] : '',
        fecha_limite: task.fecha_limite ? task.fecha_limite.split('T')[0] : '',
        estado: task.estado || 'pendiente',
        prioridad: task.prioridad || 'media',
        progreso: task.progreso || 0,
        usuario_asignado_id: task.usuario_asignado_id || '',
        padre_tarea_id: task.padre_tarea_id || ''
      });
    }
  }, [task, projectId]);

  // Cargar tareas padre cuando cambie el proyecto
  useEffect(() => {
    if (formData.proyecto_id) {
      loadParentTasks(formData.proyecto_id);
    }
  }, [formData.proyecto_id]);

  /**
   * Cargar datos iniciales (proyectos, usuarios)
   */
  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Cargar proyectos
      const projectsResponse = await projectService.getAllProjects();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data.projects || []);
      }

      // Cargar usuarios cuando esté disponible el endpoint
      // const usersResponse = await userService.getAllUsers();
      // if (usersResponse.success) {
      //   setUsers(usersResponse.data.users || []);
      // }
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Cargar tareas padre del proyecto seleccionado
   */
  const loadParentTasks = async (projectId) => {
    try {
      const response = await taskService.getTasksByProject(projectId);
      if (response.success) {
        // Filtrar tareas que no sean la actual (en modo edición)
        const availableTasks = response.data.tasks?.filter(t => 
          t.id !== task?.id && t.padre_tarea_id === null
        ) || [];
        setParentTasks(availableTasks);
      }
    } catch (error) {
      console.error('Error cargando tareas padre:', error);
      setParentTasks([]);
    }
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleChange = (e) => {
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
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar título (requerido)
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título de la tarea es requerido';
    } else if (formData.titulo.trim().length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    } else if (formData.titulo.trim().length > 200) {
      newErrors.titulo = 'El título no puede exceder 200 caracteres';
    }

    // Validar proyecto (requerido)
    if (!formData.proyecto_id) {
      newErrors.proyecto_id = 'Debe seleccionar un proyecto';
    }

    // Validar descripción (opcional pero con límite)
    if (formData.descripcion && formData.descripcion.length > 1000) {
      newErrors.descripcion = 'La descripción no puede exceder 1000 caracteres';
    }

    // Validar fechas
    if (formData.fecha_inicio && formData.fecha_limite) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaLimite = new Date(formData.fecha_limite);
      
      if (fechaLimite <= fechaInicio) {
        newErrors.fecha_limite = 'La fecha límite debe ser posterior a la fecha de inicio';
      }
    }

    // Validar progreso
    const progreso = parseInt(formData.progreso);
    if (isNaN(progreso) || progreso < 0 || progreso > 100) {
      newErrors.progreso = 'El progreso debe ser un número entre 0 y 100';
    }

    // Validar que no se asigne como padre a sí misma
    if (task && formData.padre_tarea_id === task.id.toString()) {
      newErrors.padre_tarea_id = 'Una tarea no puede ser padre de sí misma';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const submitData = {
        ...formData,
        proyecto_id: parseInt(formData.proyecto_id),
        progreso: parseInt(formData.progreso),
        usuario_asignado_id: formData.usuario_asignado_id ? parseInt(formData.usuario_asignado_id) : null,
        padre_tarea_id: formData.padre_tarea_id ? parseInt(formData.padre_tarea_id) : null,
        files: files // Incluir archivos en los datos
      };

      // Llamar función onSubmit pasada como prop
      if (onSubmit) {
        await onSubmit(submitData);
      }

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrors({ submit: error.message || 'Error al procesar la solicitud' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Error general */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="md:col-span-2">
          <FormInput
            label="Título de la tarea"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            error={errors.titulo}
            required
            placeholder="Ingrese el título de la tarea"
          />
        </div>

        {/* Proyecto */}
        <FormSelect
          label="Proyecto"
          name="proyecto_id"
          value={formData.proyecto_id}
          onChange={handleChange}
          error={errors.proyecto_id}
          required
          options={[
            { value: '', label: 'Seleccionar proyecto' },
            ...projects.map(project => ({
              value: project.id.toString(),
              label: project.nombre || project.titulo
            }))
          ]}
        />

        {/* Estado */}
        <FormSelect
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          error={errors.estado}
          options={estadosOptions}
        />

        {/* Prioridad */}
        <FormSelect
          label="Prioridad"
          name="prioridad"
          value={formData.prioridad}
          onChange={handleChange}
          error={errors.prioridad}
          options={prioridadOptions}
        />

        {/* Progreso */}
        <FormInput
          label="Progreso (%)"
          name="progreso"
          type="number"
          min="0"
          max="100"
          value={formData.progreso}
          onChange={handleChange}
          error={errors.progreso}
          placeholder="0"
        />

        {/* Fecha de inicio */}
        <FormInput
          label="Fecha de inicio"
          name="fecha_inicio"
          type="date"
          value={formData.fecha_inicio}
          onChange={handleChange}
          error={errors.fecha_inicio}
        />

        {/* Fecha límite */}
        <FormInput
          label="Fecha límite"
          name="fecha_limite"
          type="date"
          value={formData.fecha_limite}
          onChange={handleChange}
          error={errors.fecha_limite}
        />

        {/* Usuario asignado */}
        {users.length > 0 && (
          <FormSelect
            label="Usuario asignado"
            name="usuario_asignado_id"
            value={formData.usuario_asignado_id}
            onChange={handleChange}
            error={errors.usuario_asignado_id}
            options={[
              { value: '', label: 'Sin asignar' },
              ...users.map(user => ({
                value: user.id.toString(),
                label: user.nombre
              }))
            ]}
          />
        )}

        {/* Tarea padre */}
        {parentTasks.length > 0 && (
          <FormSelect
            label="Tarea padre (opcional)"
            name="padre_tarea_id"
            value={formData.padre_tarea_id}
            onChange={handleChange}
            error={errors.padre_tarea_id}
            options={[
              { value: '', label: 'Sin tarea padre' },
              ...parentTasks.map(parentTask => ({
                value: parentTask.id.toString(),
                label: parentTask.titulo
              }))
            ]}
          />
        )}
      </div>

      {/* Descripción */}
      <FormTextarea
        label="Descripción"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        error={errors.descripcion}
        placeholder="Describe los detalles de la tarea..."
        rows={4}
      />

      {/* Archivos */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Archivos de la Tarea
        </h3>
        
        <FileUpload
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles)}
          acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg']}
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB
          multiple={true}
          className="mb-4"
        />
        
        <p className="text-sm text-gray-500">
          Tipos de archivo permitidos: PDF, DOC/DOCX, JPG. Tamaño máximo: 10MB por archivo.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            data-testid="cancel-task-button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        
        <LoadingButton
          type="submit"
          loading={isSubmitting || isLoading}
          data-testid="submit-task-button"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {task ? 'Actualizar Tarea' : 'Crear Tarea'}
        </LoadingButton>
      </div>
    </form>
  );
};

export default TaskForm;