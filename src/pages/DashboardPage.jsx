import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import dashboardService from '../services/dashboardService';
import ProjectSummary from '../components/dashboard/ProjectSummary';
import TaskSummary from '../components/dashboard/TaskSummary';
import StatsOverview from '../components/dashboard/StatsOverview';

/**
 * DashboardPage - Página principal del dashboard
 * Diseño simple y limpio con un solo color
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [dashboardData, setDashboardData] = useState({
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      myProjects: 0
    },
    tasks: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      myTasks: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      if (process.env.NODE_ENV === 'development') {
        // Simular delay para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = await dashboardService.getMockDashboardData();
        setDashboardData({
          projects: {
            total: mockData.projects.total,
            active: mockData.projects.active,
            completed: mockData.projects.completed,
            myProjects: mockData.projects.myProjects
          },
          tasks: {
            total: mockData.tasks.total,
            pending: mockData.tasks.pending,
            inProgress: mockData.tasks.inProgress,
            completed: mockData.tasks.completed,
            myTasks: mockData.tasks.myTasks
          }
        });
      } else {
        const response = await dashboardService.getDashboardSummary();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.message || 'Error al cargar datos del dashboard');
        }
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      showError('Error al cargar los datos del dashboard');
      
      try {
        const mockData = await dashboardService.getMockDashboardData();
        setDashboardData({
          projects: {
            total: mockData.projects.total,
            active: mockData.projects.active,
            completed: mockData.projects.completed,
            myProjects: mockData.projects.myProjects
          },
          tasks: {
            total: mockData.tasks.total,
            pending: mockData.tasks.pending,
            inProgress: mockData.tasks.inProgress,
            completed: mockData.tasks.completed,
            myTasks: mockData.tasks.myTasks
          }
        });
      } finally {
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner />
        <p style={styles.loadingText}>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer} data-testid="dashboard-page">
      {/* Header simplificado */}
      <div style={styles.header} data-testid="dashboard-header">
        <h1 style={styles.title}>
          ¡Bienvenido, {user?.nombre || 'Usuario'}!
        </h1>
        <span style={styles.role}>
          {user?.es_administrador ? 'Administrador' : 'Usuario'}
        </span>
      </div>

      {/* Contenido principal sin contenedores innecesarios */}
      <div style={styles.content}>
        {/* Estadísticas */}
        <StatsOverview />

        {/* Resúmenes */}
        <ProjectSummary 
          data={dashboardData.projects}
          userRole={user?.es_administrador ? 'admin' : 'user'}
        />
        
        <TaskSummary 
          data={dashboardData.tasks}
          userRole={user?.es_administrador ? 'admin' : 'user'}
        />

        {/* Acciones Rápidas */}
        <div style={styles.actions}>
          <h3 style={styles.actionsTitle}>Acciones Rápidas</h3>
          
          {user?.es_administrador && (
            <>
              <Link to="/projects/new" style={styles.actionLink}>
                Nuevo Proyecto
              </Link>
              
              <Link to="/tasks/new" style={styles.actionLink}>
                Nueva Tarea
              </Link>
              
              <Link to="/users" style={styles.actionLink}>
                Gestionar Usuarios
              </Link>
            </>
          )}
          
          <Link to="/projects" style={styles.actionLink}>
            Ver Proyectos
          </Link>
          
          <Link to="/tasks" style={styles.actionLink}>
            Ver Tareas
          </Link>
        </div>
      </div>
    </div>
  );
};

// Estilos simplificados con un solo color
const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333333'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#333333'
  },
  
  loadingText: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#333333'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #cccccc'
  },
  
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0'
  },
  
  role: {
    fontSize: '14px',
    color: '#333333',
    padding: '8px 16px',
    border: '1px solid #cccccc',
    borderRadius: '4px'
  },
  
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  
  actionsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0 0 15px 0'
  },
  
  actionLink: {
    display: 'inline-block',
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    color: '#333333',
    textDecoration: 'none',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    fontSize: '16px',
    textAlign: 'center',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  }
};

// Media queries simplificadas
const mediaQueries = `
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 15px !important;
    }
    
    .header {
      flex-direction: column !important;
      gap: 15px !important;
      text-align: center !important;
    }
    
    .title {
      font-size: 24px !important;
    }
  }
  
  .actionLink:hover {
    background-color: #f5f5f5 !important;
  }
`;

// Inyectar estilos CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}

export default DashboardPage;