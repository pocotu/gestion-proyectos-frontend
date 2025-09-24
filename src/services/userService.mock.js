// Datos ficticios para probar RolesPage

// Roles simulados
const mockRoles = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Editor" },
  { id: 3, nombre: "Usuario" },
  { id: 4, nombre: "Invitado" },
];

// Usuarios simulados
const mockUsers = [
  { id: 1, nombre: "Ana Pérez", email: "ana@example.com" },
  { id: 2, nombre: "Luis García", email: "luis@example.com" },
  { id: 3, nombre: "María Torres", email: "maria@example.com" },
  { id: 4, nombre: "Carlos Ramírez", email: "carlos@example.com" },
  { id: 5, nombre: "Sofía López", email: "sofia@example.com" },
];

// Asignaciones usuario-rol simuladas
let mockUserRoles = [
  { usuario_id: 1, rol_id: 1 }, // Ana → Admin
  { usuario_id: 2, rol_id: 2 }, // Luis → Editor
  { usuario_id: 3, rol_id: 3 }, // María → Usuario
  { usuario_id: 4, rol_id: 3 }, // Carlos → Usuario
];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const userService = {
  getRoles: async () => {
    await delay();
    return [...mockRoles];
  },
  getUsers: async () => {
    await delay();
    return [...mockUsers];
  },
  createRole: async (roleData) => {
    await delay();
    const newRole = { id: mockRoles.length + 1, nombre: roleData.nombre };
    mockRoles.push(newRole);
    return { success: true, data: newRole };
  },
  updateRole: async (id, roleData) => {
    await delay();
    const idx = mockRoles.findIndex((r) => r.id === id);
    if (idx >= 0) mockRoles[idx].nombre = roleData.nombre;
    return { success: true };
  },
  assignRole: async (userId, roleName) => {
    await delay();
    const role = mockRoles.find((r) => r.nombre === roleName);
    if (!role) throw new Error("Rol no encontrado");
    mockUserRoles.push({ usuario_id: Number(userId), rol_id: role.id });
    return { success: true };
  },
  getUserRoles: async () => {
    await delay();
    return [...mockUserRoles];
  },
};

export default userService;
