import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';

/**
 * RecentActivities - Componente para mostrar actividades recientes
 * Siguiendo la temática del dashboard con diseño simple y limpio
 */
const RecentActivities = () => {
  const { user } = useAuth();
    const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivities();
  }, [user]);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      
      // Obtener actividades reales del backend
      const recentActivities = await dashboardService.getRecentActivity(user?.id);
      
      // Formatear las actividades para el componente
      const formattedActivities = recentActivities.map(activity => ({
        id: activity.id,
        type: activity.tipo || activity.accion,
        message: activity.elemento || activity.descripcion || `${activity.accion} en ${activity.tipo}`,
        user: activity.usuario || 'Usuario desconocido',
        timestamp: new Date(activity.fecha || activity.created_at),
        icon: getActivityIcon(activity.accion, activity.tipo)
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error cargando actividades recientes:', error);
            // En caso de error, mostrar array vacío en lugar de datos mock
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (accion, tipo) => {
    const iconMap = {
      'crear': {
        'proyecto': '📁',
        'tarea': '📝',
        'usuario': '👤',
        'default': '➕'
      },
      'actualizar': {
        'proyecto': '🔄',
        'tarea': '✏️',
        'usuario': '👤',
        'default': '🔄'
      },
      'completar': {
        'tarea': '✅',
        'default': '✅'
      },
      'eliminar': {
        'default': '🗑️'
      },
      'asignar': {
        'default': '👥'
      },
      'login': {
        'default': '🔐'
      },
      'logout': {
        'default': '🚪'
      }
    };

    return iconMap[accion]?.[tipo] || iconMap[accion]?.['default'] || '📋';
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
    gap: '15px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '5px'
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