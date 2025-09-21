import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import dashboardService from '../../services/dashboardService';

/**
 * RecentActivities - Componente para mostrar actividades recientes
 * Siguiendo la temática del dashboard con diseño simple y limpio
 */
const RecentActivities = () => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivities();
  }, [user]);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      
      // Datos simulados para las pruebas
      const mockActivities = [
        {
          id: 1,
          type: 'project_created',
          message: 'Nuevo proyecto "Sistema de Gestión" creado',
          user: 'Juan Pérez',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          icon: '📁'
        },
        {
          id: 2,
          type: 'task_completed',
          message: 'Tarea "Diseño de base de datos" completada',
          user: 'María García',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          icon: '✅'
        },
        {
          id: 3,
          type: 'user_assigned',
          message: 'Usuario asignado al proyecto "E-commerce"',
          user: 'Carlos López',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
          icon: '👤'
        },
        {
          id: 4,
          type: 'task_created',
          message: 'Nueva tarea "Implementar autenticación" creada',
          user: 'Ana Martínez',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
          icon: '📝'
        },
        {
          id: 5,
          type: 'project_updated',
          message: 'Proyecto "Portal Web" actualizado',
          user: 'Luis Rodríguez',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 horas atrás
          icon: '🔄'
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error cargando actividades recientes:', error);
      showError('Error al cargar las actividades recientes');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `hace ${minutes} minutos`;
    } else if (hours < 24) {
      return `hace ${hours} horas`;
    } else {
      return `hace ${days} días`;
    }
  };

  if (loading) {
    return (
      <div style={styles.container} data-testid="recent-activities">
        <div style={styles.header}>
          <h3 style={styles.title}>Actividades Recientes</h3>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Cargando actividades...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} data-testid="recent-activities">
      <div style={styles.header}>
        <h3 style={styles.title}>Actividades Recientes</h3>
        <button 
          style={styles.refreshButton}
          onClick={loadRecentActivities}
          title="Actualizar actividades"
        >
          🔄
        </button>
      </div>
      
      <div style={styles.activitiesList}>
        {activities.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <p style={styles.emptyText}>No hay actividades recientes</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} style={styles.activityItem}>
              <div style={styles.activityIcon}>
                {activity.icon}
              </div>
              <div style={styles.activityContent}>
                <div style={styles.activityMessage}>
                  {activity.message}
                </div>
                <div style={styles.activityMeta}>
                  <span style={styles.activityUser}>{activity.user}</span>
                  <span style={styles.activityTime}>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
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
    fontFamily: 'Arial, sans-serif'
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
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
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
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eeeeee'
  },
  activityIcon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px'
  },
  activityContent: {
    flex: 1,
    minWidth: 0
  },
  activityMessage: {
    fontSize: '14px',
    color: '#333333',
    marginBottom: '4px',
    lineHeight: '1.4'
  },
  activityMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#666666'
  },
  activityUser: {
    fontWeight: '500'
  },
  activityTime: {
    fontStyle: 'italic'
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
    fontSize: '14px',
    margin: '0'
  }
};

export default RecentActivities;