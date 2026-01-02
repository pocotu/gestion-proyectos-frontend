import { useState, useEffect } from 'react';

/**
 * ProjectTaskEditModal - Modal para editar tareas existentes
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la edición de tareas
 * - Open/Closed: Extensible mediante props
 * - Dependency Inversion: Depende de abstracciones (servicios)
 */
const ProjectTaskEditModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  onDelete,
  task,
  projectResponsibles = [],
  saving = false,
  deleting = false
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    prioridad: 'media',
    fecha_inicio: '',
    fecha_fin: '',
    asignados: []
  });

  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cargar datos de la tarea cuando se abre el modal
  useEffect(() => {
    if (isOpen && task) {
      // Obtener IDs de usuarios asignados desde las asignaciones
      const assignedUserIds = task.asignaciones 
        ? task.asignaciones.map(a => a.usuario_id)
        : (task.usuario_asignado_id ? [task.usuario_asignado_id] : []);

      setFormData({
        titulo: task.titulo || '',
        descripcion: task.descripcion || '',
        estado: task.estado || 'pendiente',
        prioridad: task.prioridad || 'media',
        fecha_inicio: task.fecha_inicio ? task.fecha_inicio.split('T')[0] : '',
        fecha_fin: task.fecha_fin ? task.fecha_fin.split('T')[0] : '',
        asignados: assignedUserIds
      });
      setErrors({});
    }
  }, [isOpen, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      if (fin < inicio) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const taskData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      estado: formData.estado,
      prioridad: formData.prioridad,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      asignados: formData.asignados
    };

    onSave(task.id, taskData);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete(task.id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Tarea</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={saving}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Título */}
              <div className="mb-3">
                <label htmlFor="titulo" className="form-label">
                  Título <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Implementar módulo de autenticación"
                  disabled={saving}
                  maxLength={200}
                />
                {errors.titulo && (
                  <div className="invalid-feedback">{errors.titulo}</div>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                  Descripción <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe los detalles de la tarea..."
                  disabled={saving}
                ></textarea>
                {errors.descripcion && (
                  <div className="invalid-feedback">{errors.descripcion}</div>
                )}
              </div>

              {/* Estado y Prioridad */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="estado" className="form-label">Estado</label>
                  <select
                    className="form-select"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="prioridad" className="form-label">Prioridad</label>
                  <select
                    className="form-select"
                    id="prioridad"
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Fechas */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="fecha_inicio" className="form-label">
                    Fecha de Inicio <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_inicio ? 'is-invalid' : ''}`}
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {errors.fecha_inicio && (
                    <div className="invalid-feedback">{errors.fecha_inicio}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="fecha_fin" className="form-label">
                    Fecha de Fin <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_fin ? 'is-invalid' : ''}`}
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {errors.fecha_fin && (
                    <div className="invalid-feedback">{errors.fecha_fin}</div>
                  )}
                </div>
              </div>

              {/* Asignar a (Lista de usuarios con checkboxes) */}
              <div className="mb-3">
                <label className="form-label">Asignar a</label>
                {projectResponsibles.length === 0 ? (
                  <p className="text-muted">No hay usuarios disponibles para asignar</p>
                ) : (
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {projectResponsibles.map(user => (
                      <div key={user.id} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={formData.asignados.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                asignados: [...prev.asignados, user.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                asignados: prev.asignados.filter(id => id !== user.id)
                              }));
                            }
                          }}
                          disabled={saving}
                        />
                        <label className="form-check-label" htmlFor={`user-${user.id}`}>
                          <strong>{user.nombre}</strong>
                          <br />
                          <small className="text-muted">{user.email}</small>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {formData.asignados.length > 0 && (
                  <small className="text-muted d-block mt-2">
                    {formData.asignados.length} usuario{formData.asignados.length !== 1 ? 's' : ''} seleccionado{formData.asignados.length !== 1 ? 's' : ''}
                  </small>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <div className="me-auto">
                {onDelete && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleDeleteClick}
                    disabled={saving || deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-1"></i>
                        Eliminar Tarea
                      </>
                    )}
                  </button>
                )}
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving || deleting}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body text-center pt-0">
                <div className="mb-3">
                  <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
                </div>
                <h5 className="mb-3">¿Eliminar esta tarea?</h5>
                <p className="text-muted mb-0">
                  Esta acción no se puede deshacer. La tarea <strong>"{task?.titulo}"</strong> será eliminada permanentemente.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-secondary px-4" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4" 
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectTaskEditModal;
