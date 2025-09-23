import React, { useState, useEffect } from 'react';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import FormSelect from '../common/FormSelect';
import LoadingButton from '../common/LoadingButton';
import FileUpload from '../file/FileUpload';
import projectService from '../../services/projectService';

/**
 * ProjectForm - Componente para crear y editar proyectos
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo se encarga del formulario de proyectos
 * - Open/Closed: Abierto para extensión (nuevos campos, validaciones)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de formulario
 * - Interface Segregation: Props específicas para configuración del formulario
 * - Dependency Inversion: Depende de abstracciones (projectService)
 */

const ProjectForm = ({ 
  project = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificacion'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  // Estados disponibles para proyectos
  const estadosOptions = [
    { value: 'planificacion', label: 'Planificación' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Prioridades disponibles - removed as not in database schema

  // Cargar datos del proyecto si está en modo edición
  useEffect(() => {
    if (project) {
      setFormData({
        titulo: project.titulo || '',
        descripcion: project.descripcion || '',
        fecha_inicio: project.fecha_inicio ? project.fecha_inicio.split('T')[0] : '',
        fecha_fin: project.fecha_fin ? project.fecha_fin.split('T')[0] : '',
        estado: project.estado || 'planificacion'
      });
    }
  }, [project]);

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

    // Validar titulo (requerido)
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título del proyecto es requerido';
    } else if (formData.titulo.trim().length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    } else if (formData.titulo.trim().length > 150) {
      newErrors.titulo = 'El título no puede exceder 150 caracteres';
    }

    // Validar descripción (opcional pero con límite)
    if (formData.descripcion && formData.descripcion.length > 1000) {
      newErrors.descripcion = 'La descripción no puede exceder 1000 caracteres';
    }

    // Validar fechas
    if (formData.fecha_inicio && formData.fecha_fin) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFin = new Date(formData.fecha_fin);
      
      if (fechaFin <= fechaInicio) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
        files: files // Incluir archivos en los datos
      };

      // Llamar función onSubmit pasada como prop
      if (onSubmit) {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      // Manejar errores específicos del servidor
      if (error.message.includes('ya existe')) {
        setErrors({ titulo: 'Ya existe un proyecto con este título' });
      } else {
        setErrors({ general: error.message || 'Error al guardar el proyecto' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Manejar cancelación
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificacion'
    });
    setErrors({});
    setFiles([]);
  };

  /**
   * Manejar cambios en archivos
   */
  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al guardar el proyecto
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.general}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Título del Proyecto"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  error={errors.titulo}
                  required
                  placeholder="Ingresa el título del proyecto"
                  maxLength={150}
                />
              </div>

              <div className="md:col-span-2">
                <FormTextarea
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  error={errors.descripcion}
                  placeholder="Describe el proyecto (opcional)"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <FormSelect
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                error={errors.estado}
                options={estadosOptions}
                required
              />
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Planificación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Fecha de Inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleChange}
                error={errors.fecha_inicio}
              />

              <FormInput
                label="Fecha de Fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={handleChange}
                error={errors.fecha_fin}
              />
            </div>
          </div>

          {/* Archivos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Archivos del Proyecto
            </h3>
            
            <FileUpload
              files={files}
              onFilesChange={handleFilesChange}
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
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isLoading}
            data-testid="cancel-project-button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <LoadingButton
            type="submit"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
            data-testid="submit-project-button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;