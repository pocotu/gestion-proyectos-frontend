// src/services/activityService.mock.js

const mockLogs = [
  {
    id: 1,
    usuario_id: 1,
    usuario_nombre: "Juan Pérez",
    usuario_email: "juan@example.com",
    accion: "login",
    entidad_tipo: "usuario",
    entidad_id: 1,
    descripcion: "Usuario inició sesión",
    ip_address: "192.168.1.10",
    created_at: "2025-09-22T08:30:00Z",
    detalles_adicionales: { navegador: "Chrome", version: "118" }
  },
  {
    id: 2,
    usuario_id: 2,
    usuario_nombre: "María Gómez",
    usuario_email: "maria@example.com",
    accion: "crear",
    entidad_tipo: "proyecto",
    entidad_id: 4,
    descripcion: "Se creó el proyecto 'Sistema de Gestión Escolar'",
    ip_address: "192.168.1.11",
    created_at: "2025-09-22T09:15:00Z",
  },
  {
    id: 3,
    usuario_id: 3,
    usuario_nombre: "Carlos Ruiz",
    usuario_email: "carlos@example.com",
    accion: "asignacion",
    entidad_tipo: "tarea",
    entidad_id: 17,
    descripcion: "Se asignó la tarea 'Configurar API de usuarios'",
    ip_address: "192.168.1.12",
    created_at: "2025-09-22T09:40:00Z",
  },
  {
    id: 4,
    usuario_id: 4,
    usuario_nombre: "Ana Torres",
    usuario_email: "ana@example.com",
    accion: "subir_archivo",
    entidad_tipo: "archivo",
    entidad_id: 301,
    descripcion: "Se subió el archivo 'reporte_avance.pdf'",
    ip_address: "192.168.1.13",
    created_at: "2025-09-22T10:05:00Z",
  },
  {
    id: 5,
    usuario_id: 5,
    usuario_nombre: "Pedro Sánchez",
    usuario_email: "pedro@example.com",
    accion: "eliminar",
    entidad_tipo: "tarea",
    entidad_id: 22,
    descripcion: "La tarea 'Diseño del dashboard' fue eliminada",
    ip_address: "192.168.1.14",
    created_at: "2025-09-22T10:30:00Z",
  },
  {
    id: 6,
    usuario_id: 1,
    usuario_nombre: "Juan Pérez",
    usuario_email: "juan@example.com",
    accion: "actualizar",
    entidad_tipo: "rol",
    entidad_id: 3,
    descripcion: "Se actualizó el rol 'Responsable de tarea'",
    ip_address: "192.168.1.15",
    created_at: "2025-09-22T11:00:00Z",
  },
  {
    id: 7,
    usuario_id: 2,
    usuario_nombre: "María Gómez",
    usuario_email: "maria@example.com",
    accion: "logout",
    entidad_tipo: "usuario",
    entidad_id: 2,
    descripcion: "Usuario cerró sesión",
    ip_address: "192.168.1.11",
    created_at: "2025-09-22T12:10:00Z",
  },
  {
    id: 8,
    usuario_id: 3,
    usuario_nombre: "Carlos Ruiz",
    usuario_email: "carlos@example.com",
    accion: "crear",
    entidad_tipo: "tarea",
    entidad_id: 33,
    descripcion: "Se creó la tarea 'Revisión de requisitos'",
    ip_address: "192.168.1.12",
    created_at: "2025-09-22T13:20:00Z",
  },
  {
    id: 9,
    usuario_id: 4,
    usuario_nombre: "Ana Torres",
    usuario_email: "ana@example.com",
    accion: "asignacion",
    entidad_tipo: "tarea",
    entidad_id: 12,
    descripcion: "Se asignó la tarea 'Crear wireframes'",
    ip_address: "192.168.1.13",
    created_at: "2025-09-22T14:45:00Z",
  },
  {
    id: 10,
    usuario_id: 5,
    usuario_nombre: "Pedro Sánchez",
    usuario_email: "pedro@example.com",
    accion: "subir_archivo",
    entidad_tipo: "archivo",
    entidad_id: 402,
    descripcion: "Se subió el archivo 'plan_tareas.xlsx'",
    ip_address: "192.168.1.14",
    created_at: "2025-09-22T15:00:00Z",
  },
  {
    id: 11,
    usuario_id: 1,
    usuario_nombre: "Juan Pérez",
    usuario_email: "juan@example.com",
    accion: "crear",
    entidad_tipo: "proyecto",
    entidad_id: 6,
    descripcion: "Se creó el proyecto 'Gestión de Inventario'",
    ip_address: "192.168.1.10",
    created_at: "2025-09-22T16:30:00Z",
  },
  {
    id: 12,
    usuario_id: 2,
    usuario_nombre: "María Gómez",
    usuario_email: "maria@example.com",
    accion: "actualizar",
    entidad_tipo: "tarea",
    entidad_id: 27,
    descripcion: "Se actualizó la tarea 'Testing unitario'",
    ip_address: "192.168.1.11",
    created_at: "2025-09-22T17:00:00Z",
  },
  {
    id: 13,
    usuario_id: 3,
    usuario_nombre: "Carlos Ruiz",
    usuario_email: "carlos@example.com",
    accion: "eliminar",
    entidad_tipo: "archivo",
    entidad_id: 205,
    descripcion: "Se eliminó el archivo 'antiguo_doc.docx'",
    ip_address: "192.168.1.12",
    created_at: "2025-09-22T18:15:00Z",
  },
  {
    id: 14,
    usuario_id: 4,
    usuario_nombre: "Ana Torres",
    usuario_email: "ana@example.com",
    accion: "login",
    entidad_tipo: "usuario",
    entidad_id: 4,
    descripcion: "Usuario inició sesión",
    ip_address: "192.168.1.13",
    created_at: "2025-09-22T19:40:00Z",
  },
  {
    id: 15,
    usuario_id: 5,
    usuario_nombre: "Pedro Sánchez",
    usuario_email: "pedro@example.com",
    accion: "logout",
    entidad_tipo: "usuario",
    entidad_id: 5,
    descripcion: "Usuario cerró sesión",
    ip_address: "192.168.1.14",
    created_at: "2025-09-22T20:10:00Z",
  }
];

// Estadísticas agrupadas
const mockStats = [
  { accion: "login", total: 3, entidad_tipo: "usuario" },
  { accion: "logout", total: 2, entidad_tipo: "usuario" },
  { accion: "crear", total: 3, entidad_tipo: "proyecto/tarea" },
  { accion: "asignacion", total: 2, entidad_tipo: "tarea" },
  { accion: "subir_archivo", total: 2, entidad_tipo: "archivo" },
  { accion: "eliminar", total: 2, entidad_tipo: "tarea/archivo" },
  { accion: "actualizar", total: 2, entidad_tipo: "tarea/rol" }
];

// Mock service
export const activityService = {
  getActivityLogs: async (filters) => {
    console.log("activityService.mock - getActivityLogs - filters:", filters);

    let filteredLogs = [...mockLogs];

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.created_at) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.created_at) <= end);
    }
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.usuario_id === parseInt(filters.userId));
    }
    if (filters.entityType) {
      filteredLogs = filteredLogs.filter(log => log.entidad_tipo === filters.entityType);
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.accion === filters.action);
    }

    return {
      data: filteredLogs,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: filteredLogs.length
      }
    };
  },

  getActivityStats: async () => {
    console.log("activityService.mock - getActivityStats");
    return { data: mockStats };
  },

  exportLogs: async ({ format }) => {
    console.log("activityService.mock - exportLogs:", format);

    if (format === "csv") {
      const headers = Object.keys(mockLogs[0]).join(",");
      const rows = mockLogs.map(log => Object.values(log).join(","));
      return [headers, ...rows].join("\n");
    }

    return { data: mockLogs };
  }
};
