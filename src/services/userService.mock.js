// src/services/userService.mock.js

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
];

// --- Asignaciones (usuario-rol) ---
const userRoles = [
  { usuario_id: 1, rol_id: 1 }, // Juan -> Administrador del sistema
  { usuario_id: 2, rol_id: 2 }, // María -> Responsable de proyecto
  { usuario_id: 3, rol_id: 3 }, // Carlos -> Responsable de tarea
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
      userRoles.push({ usuario_id: userId, rol_id: role.id });
    }
    return { success: true };
  },
};
