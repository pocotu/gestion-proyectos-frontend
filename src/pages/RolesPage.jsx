// src/services/userService.mock.js
const mockRoles = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Editor" },
  { id: 3, nombre: "Usuario" },
];

const mockUsers = [
  { id: 1, nombre: "Ana Pérez", email: "ana@example.com" },
  { id: 2, nombre: "Luis García", email: "luis@example.com" },
  { id: 3, nombre: "María Torres", email: "maria@example.com" },
];

const userService = {
  getRoles: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRoles]), 500); // simula delay
    });
  },

  getUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockUsers]), 500);
    });
  },

  createRole: async (roleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockRoles.push({ id: mockRoles.length + 1, nombre: roleData.nombre });
        resolve({ success: true });
      }, 500);
    });
  },

  updateRole: async (id, roleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockRoles.findIndex((r) => r.id === id);
        if (idx >= 0) mockRoles[idx].nombre = roleData.nombre;
        resolve({ success: true });
      }, 500);
    });
  },

  assignRole: async (userId, roleName) => {
    return new Promise((resolve) => {
      console.log(`Mock: asignando rol ${roleName} al usuario ${userId}`);
      setTimeout(() => resolve({ success: true }), 500);
    });
  },
};

export default userService;
