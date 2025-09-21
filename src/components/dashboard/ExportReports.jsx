import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
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
  const [reportType, setReportType] = useState('general');
  const [dateRange, setDateRange] = useState('month');
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleExport = async (format) => {
    setIsExporting(true);
    
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar datos mock según el tipo de reporte
      const reportData = generateReportData();
      
      if (format === 'pdf') {
        exportToPDF(reportData);
      } else if (format === 'excel') {
        exportToExcel(reportData);
      } else if (format === 'csv') {
        exportToCSV(reportData);
      }
      
      addNotification({
        type: 'success',
        message: `Reporte ${format.toUpperCase()} exportado exitosamente`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error al exportar el reporte'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportData = () => {
    const baseData = {
      title: getReportTitle(),
      dateRange: getDateRangeText(),
      generatedBy: user?.nombre || 'Usuario',
      generatedAt: new Date().toLocaleString('es-ES'),
    };

    switch (reportType) {
      case 'projects':
        return {
          ...baseData,
          data: [
            { nombre: 'Proyecto Alpha', estado: 'Activo', progreso: '75%', fechaInicio: '2024-01-15' },
            { nombre: 'Proyecto Beta', estado: 'Completado', progreso: '100%', fechaInicio: '2024-02-01' },
            { nombre: 'Proyecto Gamma', estado: 'En Pausa', progreso: '45%', fechaInicio: '2024-03-10' }
          ]
        };
      case 'tasks':
        return {
          ...baseData,
          data: [
            { titulo: 'Diseño UI/UX', prioridad: 'Alta', estado: 'En Progreso', asignado: 'Juan Pérez' },
            { titulo: 'Desarrollo Backend', prioridad: 'Media', estado: 'Pendiente', asignado: 'María García' },
            { titulo: 'Testing', prioridad: 'Baja', estado: 'Completada', asignado: 'Carlos López' }
          ]
        };
      case 'users':
        return {
          ...baseData,
          data: user?.es_administrador ? [
            { nombre: 'Juan Pérez', email: 'juan@empresa.com', rol: 'Desarrollador', estado: 'Activo' },
            { nombre: 'María García', email: 'maria@empresa.com', rol: 'Diseñadora', estado: 'Activo' },
            { nombre: 'Carlos López', email: 'carlos@empresa.com', rol: 'Tester', estado: 'Inactivo' }
          ] : []
        };
      default:
        return {
          ...baseData,
          projects: { total: 12, activos: 8, completados: 4 },
          tasks: { total: 45, pendientes: 15, enProgreso: 20, completadas: 10 },
          users: user?.es_administrador ? { total: 25, activos: 22, inactivos: 3 } : null
        };
    }
  };

  const getReportTitle = () => {
    const titles = {
      general: 'Reporte General del Dashboard',
      projects: 'Reporte de Proyectos',
      tasks: 'Reporte de Tareas',
      users: 'Reporte de Usuarios'
    };
    return titles[reportType] || 'Reporte';
  };

  const getDateRangeText = () => {
    const ranges = {
      week: 'Esta semana',
      month: 'Este mes',
      quarter: 'Este trimestre',
      year: 'Este año'
    };
    return ranges[dateRange] || 'Período seleccionado';
  };

  const exportToPDF = (data) => {
    // Simular exportación a PDF
    const content = `${data.title}\n\nGenerado por: ${data.generatedBy}\nFecha: ${data.generatedAt}\nPeríodo: ${data.dateRange}\n\nDatos:\n${JSON.stringify(data.data || data, null, 2)}`;
    downloadFile(content, `reporte-${reportType}-${Date.now()}.txt`, 'text/plain');
  };

  const exportToExcel = (data) => {
    // Simular exportación a Excel (CSV)
    let csvContent = `${data.title}\nGenerado por: ${data.generatedBy}\nFecha: ${data.generatedAt}\nPeríodo: ${data.dateRange}\n\n`;
    
    if (Array.isArray(data.data)) {
      const headers = Object.keys(data.data[0] || {});
      csvContent += headers.join(',') + '\n';
      data.data.forEach(row => {
        csvContent += headers.map(header => row[header] || '').join(',') + '\n';
      });
    } else {
      csvContent += JSON.stringify(data.data || data, null, 2);
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
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          data-testid="export-report-button"
        >
          {isExporting ? (
            <span className="export-btn__loading">⏳ Exportando...</span>
          ) : (
            <>
              <span className="export-btn__icon">📄</span>
              <span>Exportar PDF</span>
            </>
          )}
        </button>

        <button
          className="export-btn export-btn--excel"
          onClick={() => handleExport('excel')}
          disabled={isExporting}
        >
          {isExporting ? (
            <span className="export-btn__loading">⏳ Exportando...</span>
          ) : (
            <>
              <span className="export-btn__icon">📊</span>
              <span>Exportar Excel</span>
            </>
          )}
        </button>

        <button
          className="export-btn export-btn--csv"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          {isExporting ? (
            <span className="export-btn__loading">⏳ Exportando...</span>
          ) : (
            <>
              <span className="export-btn__icon">📋</span>
              <span>Exportar CSV</span>
            </>
          )}
        </button>
      </div>

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