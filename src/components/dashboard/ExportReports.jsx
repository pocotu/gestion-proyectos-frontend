import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../common/Modal';
import dashboardService from '../../services/dashboardService';
import './ExportReports.css';

/**
 * ExportReports - Componente para exportar reportes del dashboard
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la exportación de reportes
 * - Open/Closed: Abierto para extensión (nuevos tipos de reportes)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de exportación
 * - Interface Segregation: Usa interfaces específicas (useAuth, useNotification)
 * - Dependency Inversion: Depende de abstracciones (hooks)
 */
const ExportReports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('general');
  const [dateRange, setDateRange] = useState('month');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSuccessMessage(false);
  };

  const handleConfirmExport = async () => {
    setIsExporting(true);
    
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar datos del reporte desde el backend
      const reportData = await generateReportData();
      
      if (exportFormat === 'pdf') {
        exportToPDF(reportData);
      } else if (exportFormat === 'excel') {
        exportToExcel(reportData);
      } else if (exportFormat === 'csv') {
        exportToCSV(reportData);
      }
      
      setShowSuccessMessage(true);
      addNotification({
        type: 'success',
        message: `Reporte ${exportFormat.toUpperCase()} exportado exitosamente`
      });
      
      // Cerrar modal después de mostrar mensaje de éxito
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error al exportar el reporte'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportData = async () => {
    const baseData = {
      title: `Reporte ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      generatedBy: user?.nombre || 'Usuario',
      generatedAt: new Date().toLocaleDateString('es-ES'),
      dateRange: `${startDate} - ${endDate}`,
      reportType,
      format: exportFormat
    };

    try {
      // Obtener datos del backend
      const dashboardData = await dashboardService.getDashboardData();
      
      switch (reportType) {
        case 'projects':
          const projectStats = dashboardData.projects || {};
          return {
            ...baseData,
            data: {
              totalProjects: projectStats.total || 0,
              activeProjects: projectStats.active || 0,
              completedProjects: projectStats.completed || 0,
              projectsByStatus: {
                'En progreso': projectStats.active || 0,
                'Planificado': projectStats.planned || 0,
                'Completado': projectStats.completed || 0
              }
            }
          };
        case 'tasks':
          const taskStats = dashboardData.tasks || {};
          return {
            ...baseData,
            data: {
              totalTasks: taskStats.total || 0,
              completedTasks: taskStats.completed || 0,
              pendingTasks: taskStats.pending || 0,
              tasksByPriority: {
                'Alta': taskStats.high_priority || 0,
                'Media': taskStats.medium_priority || 0,
                'Baja': taskStats.low_priority || 0
              }
            }
          };
        case 'users':
          const userStats = dashboardData.users || {};
          return {
            ...baseData,
            data: {
              totalUsers: userStats.total || 0,
              activeUsers: userStats.active || 0,
              adminUsers: userStats.admins || 0,
              inactiveUsers: userStats.inactive || 0,
              usersByRole: {
                admin: userStats.admins || 0,
                active: userStats.active || 0,
                inactive: userStats.inactive || 0
              }
            }
          };
        default:
          return {
            ...baseData,
            data: {
              projects: dashboardData.projects?.total || 0,
              tasks: dashboardData.tasks?.total || 0,
              users: dashboardData.users?.total || 0,
              completionRate: dashboardData.tasks?.total > 0 
                ? `${Math.round((dashboardData.tasks.completed / dashboardData.tasks.total) * 100)}%`
                : '0%'
            }
          };
      }
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      // Fallback con datos vacíos en caso de error
      switch (reportType) {
        case 'projects':
          return {
            ...baseData,
            data: {
              totalProjects: 0,
              activeProjects: 0,
              completedProjects: 0,
              projectsByStatus: {
                'En progreso': 0,
                'Planificado': 0,
                'Completado': 0
              }
            }
          };
        case 'tasks':
          return {
            ...baseData,
            data: {
              totalTasks: 0,
              completedTasks: 0,
              pendingTasks: 0,
              tasksByPriority: {
                'Alta': 0,
                'Media': 0,
                'Baja': 0
              }
            }
          };
        case 'users':
          return {
            ...baseData,
            data: {
              totalUsers: 0,
              activeUsers: 0,
              adminUsers: 0,
              inactiveUsers: 0,
              usersByRole: {
                admin: 0,
                active: 0,
                inactive: 0
              }
            }
          };
        default:
          return {
            ...baseData,
            data: {
              projects: 0,
              tasks: 0,
              users: 0,
              completionRate: '0%'
            }
          };
      }
    }
  };

  const exportToPDF = (data) => {
    // Simular exportación a PDF
    const content = `${data.title}\n\nGenerado por: ${data.generatedBy}\nFecha: ${data.generatedAt}\nPeríodo: ${data.dateRange}\n\nDatos:\n${JSON.stringify(data.data || data, null, 2)}`;
    downloadFile(content, `reporte-${reportType}-${Date.now()}.txt`, 'text/plain');
  };

  const exportToExcel = (data) => {
    // Simular exportación a Excel (usando CSV)
    let csvContent = `${data.title}\n`;
    csvContent += `Generado por,${data.generatedBy}\n`;
    csvContent += `Fecha,${data.generatedAt}\n`;
    csvContent += `Período,${data.dateRange}\n\n`;
    
    if (data.data && typeof data.data === 'object') {
      Object.entries(data.data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          csvContent += `\n${key}:\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            csvContent += `${subKey},${subValue}\n`;
          });
        } else {
          csvContent += `${key},${value}\n`;
        }
      });
    }
    
    downloadFile(csvContent, `reporte-${reportType}-${Date.now()}.csv`, 'text/csv');
  };

  const exportToCSV = (data) => {
    exportToExcel(data); // Usar la misma lógica que Excel
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-reports">
      <div className="export-reports__header">
        <h3 className="export-reports__title">Exportar Reportes</h3>
        <span className="export-reports__subtitle">
          Genera reportes detallados en diferentes formatos
        </span>
      </div>

      <div className="export-reports__config">
        <div className="config-group">
          <label className="config-label">Tipo de Reporte</label>
          <select 
            className="config-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="general">Reporte General</option>
            <option value="projects">Solo Proyectos</option>
            <option value="tasks">Solo Tareas</option>
            {user?.es_administrador && (
              <option value="users">Solo Usuarios</option>
            )}
          </select>
        </div>

        <div className="config-group">
          <label className="config-label">Período</label>
          <select 
            className="config-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      <div className="export-reports__actions">
        <button
          className="export-btn export-btn--pdf"
          onClick={handleOpenModal}
          disabled={isExporting}
          data-testid="export-report-button"
        >
          {isExporting ? (
            <span className="export-btn__loading">⏳ Exportando...</span>
          ) : (
            <>
              <span className="export-btn__icon">📄</span>
              <span>Exportar Reporte</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de exportación */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Exportar Reporte"
        size="md"
      >
        <div data-testid="export-modal">
          {showSuccessMessage ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Reporte exportado exitosamente!</h3>
              <p className="text-sm text-gray-500" data-testid="export-success-message">
                El archivo se ha descargado automáticamente
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de exportación
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  data-testid="export-format-select"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="export-start-date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="export-end-date"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleCloseModal}
                  disabled={isExporting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={handleConfirmExport}
                  disabled={isExporting}
                  data-testid="confirm-export-button"
                >
                  {isExporting ? 'Exportando...' : 'Confirmar Exportación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {isExporting && (
        <div className="export-reports__progress">
          <div className="progress-bar">
            <div className="progress-bar__fill"></div>
          </div>
          <span className="progress-text">Generando reporte...</span>
        </div>
      )}
    </div>
  );
};

export default ExportReports;