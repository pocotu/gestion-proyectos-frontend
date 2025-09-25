// --- Roles ---
const roles = [
  { id: 1, nombre: 'Administrador del sistema' },
  { id: 2, nombre: 'Responsable de proyecto' },
  { id: 3, nombre: 'Responsable de tarea' },
];

// --- Usuarios ficticios ---
const users = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, nombre: 'María Gómez', email: 'maria@example.com' },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@example.com' },
  { id: 4, nombre: 'Ana Torres', email: 'ana@example.com' },
  { id: 5, nombre: 'Luis Fernández', email: 'luis@example.com' },
  { id: 6, nombre: 'Sofía Ramírez', email: 'sofia@example.com' },
  { id: 7, nombre: 'Pedro Morales', email: 'pedro@example.com' },
  { id: 8, nombre: 'Laura Castillo', email: 'laura@example.com' },
];

// --- Asignaciones usuario-rol ---
const userRoles = [
  { usuario_id: 1, rol_id: 1 }, // Juan → Admin
  { usuario_id: 2, rol_id: 1 }, // María → Admin
  { usuario_id: 3, rol_id: 2 }, // Carlos → Responsable de proyecto
  { usuario_id: 4, rol_id: 2 }, // Ana → Responsable de proyecto
  { usuario_id: 5, rol_id: 2 }, // Luis → Responsable de proyecto
  { usuario_id: 6, rol_id: 3 }, // Sofía → Responsable de tarea
  { usuario_id: 7, rol_id: 3 }, // Pedro → Responsable de tarea
  { usuario_id: 8, rol_id: 3 }, // Laura → Responsable de tarea
];

export default {
  getRoles: async () => roles,
  getUsers: async () => users,
  getUserRoles: async () => userRoles,

  createRole: async (roleData) => {
    const newRole = { id: roles.length + 1, ...roleData };
    roles.push(newRole);
    return newRole;
  },

  updateRole: async (roleId, roleData) => {
    const idx = roles.findIndex(r => r.id === roleId);
    if (idx !== -1) {
      roles[idx] = { ...roles[idx], ...roleData };
      return roles[idx];
    }
    throw new Error('Rol no encontrado');
  },

  assignRole: async (userId, roleName) => {
    const role = roles.find(r => r.nombre === roleName);
    if (role) {
      userRoles.push({ usuario_id: Number(userId), rol_id: role.id });
    }
    return { success: true };
  },
};
