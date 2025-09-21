import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ActionButton from '../components/common/ActionButton';

/**
 * ReportsPage - Página de reportes y estadísticas del sistema
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la generación y visualización de reportes
 * - Open/Closed: Abierto para extensión (nuevos tipos de reportes)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de reportes
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotifications)
 * - Dependency Inversion: Depende de abstracciones (hooks, contextos)
 */
const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Estados principales
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, active: 0, completed: 0, cancelled: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    files: { total: 0, totalSize: 0 },
    activity: { logins: 0, actions: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros para reportes
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'general',
    format: 'pdf'
  });

  // Estados de gráficos
  const [chartData, setChartData] = useState({
    projectsOverTime: [],
    tasksOverTime: [],
    userActivity: []
  });

  // Verificar permisos
  useEffect(() => {
    const hasPermission = user?.es_administrador || 
                         user?.roles?.some(role => ['admin', 'responsable_proyecto'].includes(role.nombre));
    
    if (!hasPermission) {
      navigate('/unauthorized');
      return;
    }
  }, [user, navigate]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStatistics();
    loadChartData();
  }, []);

  // Función para cargar estadísticas generales
  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/reports/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      } else {
        throw new Error('Error al cargar estadísticas');
      }
    } catch (err) {
      setError(err.message);
      addNotification('Error al cargar estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos de gráficos
  const loadChartData = async () => {
    try {
      const response = await fetch('/api/reports/charts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChartData(data.data || {});
      }
    } catch (err) {
      console.error('Error al cargar datos de gráficos:', err);
    }
  };

  // Función para generar reporte
  const handleGenerateReport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(reportFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/reports/generate?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const extension = reportFilters.format === 'pdf' ? 'pdf' : 'xlsx';
        a.download = `reporte_${reportFilters.reportType}_${new Date().toISOString().split('T')[0]}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        addNotification('Reporte generado exitosamente', 'success');
      } else {
        throw new Error('Error al generar reporte');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Función para formatear números
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Función para formatear tamaño de archivos
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Componente para tarjetas de estadísticas
  const StatCard = ({ title, value, subtitle, color = 'bg-blue-500', icon, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-md p-3 mr-4`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{formatNumber(value)}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="text-xs">{trend.positive ? '↗' : '↘'} {trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando reportes..." />;
  }

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <h1>
            Reportes y Estadísticas
          </h1>
          <p>
            Análisis y métricas del sistema de gestión de proyectos
          </p>
        </div>

        <div>
          <button
            onClick={loadStatistics}
            disabled={loading}
            type="button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Configuración de Reportes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Reportes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={reportFilters.reportType}
              onChange={(e) => setReportFilters({ ...reportFilters, reportType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="projects">Proyectos</option>
              <option value="tasks">Tareas</option>
              <option value="users">Usuarios</option>
              <option value="activity">Actividad</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select
              value={reportFilters.format}
              onChange={(e) => setReportFilters({ ...reportFilters, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Usuarios"
            value={stats.users?.total || 0}
            subtitle={`${stats.users?.active || 0} activos`}
            color="bg-blue-500"
            icon="👥"
          />
          <StatCard
            title="Total Proyectos"
            value={stats.projects?.total || 0}
            subtitle={`${stats.projects?.active || 0} activos`}
            color="bg-green-500"
            icon="📁"
          />
          <StatCard
            title="Total Tareas"
            value={stats.tasks?.total || 0}
            subtitle={`${stats.tasks?.completed || 0} completadas`}
            color="bg-purple-500"
            icon="✅"
          />
          <StatCard
            title="Archivos"
            value={stats.files?.total || 0}
            subtitle={formatFileSize(stats.files?.totalSize || 0)}
            color="bg-orange-500"
            icon="📎"
          />
        </div>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Proyectos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activos</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.projects?.active / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projects?.active || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completados</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.projects?.completed / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projects?.completed || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelados</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.projects?.cancelled / stats.projects?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projects?.cancelled || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Tareas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendientes</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tasks?.pending / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.tasks?.pending || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Progreso</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tasks?.inProgress / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.tasks?.inProgress || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completadas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tasks?.completed / stats.tasks?.total * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.tasks?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad del Sistema */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{formatNumber(stats.activity?.logins || 0)}</div>
            <div className="text-sm text-gray-600">Inicios de Sesión</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{formatNumber(stats.activity?.actions || 0)}</div>
            <div className="text-sm text-gray-600">Acciones Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{formatNumber(stats.users?.active || 0)}</div>
            <div className="text-sm text-gray-600">Usuarios Activos</div>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reportes Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📊</span>
              <h4 className="font-medium">Reporte General</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Resumen completo del sistema con todas las métricas principales
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Generar →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📁</span>
              <h4 className="font-medium">Reporte de Proyectos</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Análisis detallado del estado y progreso de proyectos
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Generar →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">👥</span>
              <h4 className="font-medium">Reporte de Usuarios</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Estadísticas de usuarios, roles y actividad
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Generar →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;