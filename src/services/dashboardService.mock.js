// dashboardService.mock.js

const dashboardService = {
  getDashboardData: async () => {
    // 🔹 Datos de proyectos (limitados a 5)
    const projects = {
      total: 5,
      active: 3,
      completed: 2,
      myProjects: 2,
    };

    // 🔹 Datos de tareas (mockeadas en base al taskService)
    const tasks = {
      total: 42,
      pending: 20,
      inProgress: 12,
      completed: 10,
      myTasks: 7,
    };

    // 🔹 Actividades recientes (simuladas)
    const recentActivities = [
      {
        descripcion: "Se creó el proyecto 'Sistema de Inventarios'",
        usuario_nombre: "Juan Pérez",
        created_at: "2025-09-20T14:32:00Z",
      },
      {
        descripcion: "La tarea 'Configurar CI/CD' fue marcada como completada",
        usuario_nombre: "María García",
        created_at: "2025-09-21T10:15:00Z",
      },
      {
        descripcion: "Se asignó la tarea 'Login con OAuth' al usuario Carlos Ruiz",
        usuario_nombre: "Admin",
        created_at: "2025-09-21T16:45:00Z",
      },
      {
        descripcion: "El proyecto 'Gestión de RRHH' cambió a estado Activo",
        usuario_nombre: "Pedro Martínez",
        created_at: "2025-09-22T08:50:00Z",
      },
      {
        descripcion: "La tarea 'Testing de UI' fue creada",
        usuario_nombre: "Laura Torres",
        created_at: "2025-09-23T12:20:00Z",
      },
    ];

    return { projects, tasks, recentActivities };
  },
};

export default dashboardService;
