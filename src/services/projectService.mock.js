let projects = [
  { id: 1, titulo: "Sistema de Ventas", descripcion: "Implementación del sistema de ventas" },
  { id: 2, titulo: "Gestión de Recursos Humanos", descripcion: "Plataforma para HR" },
  { id: 3, titulo: "Aplicación Móvil", descripcion: "App de seguimiento de clientes" },
  { id: 4, titulo: "E-commerce", descripcion: "Tienda online de productos digitales" },
  { id: 5, titulo: "Intranet Corporativa", descripcion: "Portal interno para empleados" },
  { id: 6, titulo: "CRM Empresarial", descripcion: "Gestión de clientes y oportunidades" },
  { id: 7, titulo: "ERP de Manufactura", descripcion: "Producción y control de inventario" },
  { id: 8, titulo: "Plataforma Educativa", descripcion: "Cursos online y gestión de estudiantes" },
  { id: 9, titulo: "Sistema de Reservas", descripcion: "Reservas para hoteles y vuelos" },
  { id: 10, titulo: "Aplicación Financiera", descripcion: "Gestión de gastos e inversiones" },
  { id: 11, titulo: "Plataforma de Mensajería", descripcion: "Chat en tiempo real con WebSockets" },
  { id: 12, titulo: "Sistema de Logística", descripcion: "Seguimiento de envíos y rutas" },
];

export default {
  getAllProjects: async () => ({ projects }),

  createProject: async (data) => {
    const newProject = { id: projects.length + 1, ...data };
    projects.push(newProject);
    return newProject;
  },

  updateProject: async (id, data) => {
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data };
      return projects[index];
    }
    throw new Error("Proyecto no encontrado");
  },

  deleteProject: async (id) => {
    projects = projects.filter((p) => p.id !== id);
    return { success: true };
  },
};
