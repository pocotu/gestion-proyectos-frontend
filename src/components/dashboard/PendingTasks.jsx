import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import taskService from '../../services/taskService';

/**
 * PendingTasks - Componente para mostrar tareas pendientes
 * Siguiendo la temática del dashboard con diseño simple y limpio
 */
const PendingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);

  useEffect(() => {
    loadPendingTasks();
  }, [user]);

  const loadPendingTasks = async () => {
    try {
      setLoading(true);
      
      // Obtener tareas pendientes del backend
      const response = await dashboardService.getPendingTasks();
      const backendTasks = response?.data || [];
      
      // Formatear datos del backend para el componente
      const formattedTasks = backendTasks.map(task => ({
        id: task.id,
        titulo: task.titulo,
        descripcion: task.descripcion,
        estado: task.estado,
        prioridad: task.prioridad,
        fecha_limite: task.fecha_limite ? new Date(task.fecha_limite) : null,
        proyecto: task.proyecto_titulo || 'Sin proyecto',
        asignado_a: user?.nombre || 'Usuario Actual'
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error cargando tareas pendientes:', error);
      setTasks([]); // Fallback a array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTask(taskId);
      
      // Llamar a la API real para completar la tarea
      const response = await taskService.updateTaskStatus(taskId, 'completada');
      
      if (response.success) {
        // Actualizar el estado local
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, estado: 'completada' }
              : task
          ).filter(task => task.estado !== 'completada')
        );
        
        console.log('Tarea completada exitosamente');
      } else {
        throw new Error(response.message || 'Error al completar la tarea');
      }
    } catch (error) {
      console.error('Error completando tarea:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return '#dc3545';
      case 'media':
        return '#ffc107';
      case 'baja':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getPriorityText = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return null;
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div style={styles.container} data-testid="pending-tasks">
        <div style={styles.header}>
          <h3 style={styles.title}>Tareas Pendientes</h3>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Cargando tareas...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="pending-tasks">
      <div style={styles.header}>
        <h3 style={styles.title}>Tareas Pendientes</h3>
        <div style={styles.headerActions}>
          <button 
            style={styles.refreshButton}
            onClick={loadPendingTasks}
            title="Actualizar tareas"
          >
            🔄
          </button>
          <Link to="/tasks" style={styles.viewAllLink}>
            Ver todas
          </Link>
        </div>
      </div>
      
      <div style={styles.tasksList}>
        {tasks.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✅</span>
            <p style={styles.emptyText}>¡No hay tareas pendientes!</p>
            <p style={styles.emptySubtext}>Todas las tareas están completadas</p>
          </div>
        ) : (
          tasks.map((task) => {
            const daysLeft = getDaysUntilDeadline(task.fecha_limite);
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const isUrgent = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0;
            
            return (
              <div key={task.id} style={styles.taskItem}>
                <div style={styles.taskHeader}>
                  <div style={styles.taskTitle}>
                    <Link 
                      to={`/tasks/${task.id}`} 
                      style={styles.taskName}
                    >
                      {task.titulo}
                    </Link>
                    <span 
                      style={{
                        ...styles.taskPriority,
                        backgroundColor: getPriorityColor(task.prioridad)
                      }}
                    >
                      {getPriorityText(task.prioridad)}
                    </span>
                  </div>
                  <button
                    style={styles.completeButton}
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={completingTask === task.id}
                    data-testid="complete-task-button"
                    title="Marcar como completada"
                  >
                    {completingTask === task.id ? '⏳' : '✓'}
                  </button>
                </div>
                
                <div style={styles.taskDescription}>
                  {task.descripcion}
                </div>
                
                <div style={styles.taskMeta}>
                  <div style={styles.taskInfo}>
                    <span style={styles.metaLabel}>Proyecto:</span>
                    <span style={styles.metaValue}>{task.proyecto}</span>
                  </div>
                  <div style={styles.taskInfo}>
                    <span style={styles.metaLabel}>Límite:</span>
                    <span 
                      style={{
                        ...styles.metaValue,
                        color: isOverdue ? '#dc3545' : isUrgent ? '#ffc107' : '#333333',
                        fontWeight: isOverdue || isUrgent ? 'bold' : 'normal'
                      }}
                    >
                      {formatDate(task.fecha_limite)}
                      {isOverdue && ' (Vencida)'}
                      {isUrgent && daysLeft !== null && ` (${daysLeft} días)`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Estilos siguiendo la temática del dashboard
const styles = {
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxHeight: '400px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #cccccc'
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  },
  viewAllLink: {
    fontSize: '14px',
    color: '#333333',
    textDecoration: 'none',
    padding: '6px 12px',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    color: '#666666'
  },
  loadingText: {
    fontSize: '14px'
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '5px'
  },
  taskItem: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eeeeee'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  taskTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  taskName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333333',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  taskPriority: {
    fontSize: '12px',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  completeButton: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },
  taskDescription: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  taskMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '12px'
  },
  taskInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  metaLabel: {
    color: '#666666',
    fontWeight: '500'
  },
  metaValue: {
    color: '#333333'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#666666'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '16px',
    margin: '0 0 8px 0',
    fontWeight: 'bold'
  },
  emptySubtext: {
    fontSize: '14px',
    margin: '0',
    opacity: 0.7
  }
};

export default PendingTasks;