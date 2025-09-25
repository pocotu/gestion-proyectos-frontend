// src/services/fileService.mock.js

// Generador helper para crear archivos falsos
const tipos = ["PDF", "DOCX", "XLSX", "PNG", "JPG", "TXT"];
const nombresBase = [
  "Plan_proyecto",
  "Requerimientos",
  "Manual_usuario",
  "Guia_instalacion",
  "Informe_avance",
  "Notas_reunion",
  "Pruebas_unitarias",
  "Logo_app",
  "Buglist",
  "Sprint_resumen",
  "Captura_error",
  "Test_plan",
  "Checklist_seguridad",
  "Reporte_bugs",
  "Esquema_bd",
  "Wireframes_app",
  "Plan_capacitacion",
  "Minutas_reunion",
  "Especificaciones",
  "Mockup_UI",
  "Release_notes",
  "Documentacion_API",
  "Script_migracion",
  "Diagrama_flujo",
  "Casos_prueba"
];

// utilidades random
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomSize() {
  return Math.floor(Math.random() * (250000 - 2500) + 2500); // 2.5kb - 250kb
}
function randomDate() {
  const start = new Date(2025, 8, 1); // sep 2025
  const end = new Date(2025, 8, 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// dataset
let files = [];

// 20 archivos de proyectos (4,6,7,8)
for (let i = 1; i <= 20; i++) {
  files.push({
    id: 1000 + i,
    nombre_original: `${randomItem(nombresBase)}_${i}.${randomItem(tipos).toLowerCase()}`,
    tipo: randomItem(tipos),
    tamaño_bytes: randomSize(),
    proyecto_id: [4, 6, 7, 8][Math.floor(Math.random() * 4)],
    created_at: randomDate().toISOString(),
  });
}

// 40 archivos de tareas (1–40)
for (let i = 21; i <= 60; i++) {
  files.push({
    id: 1000 + i,
    nombre_original: `${randomItem(nombresBase)}_${i}.${randomItem(tipos).toLowerCase()}`,
    tipo: randomItem(tipos),
    tamaño_bytes: randomSize(),
    tarea_id: Math.floor(Math.random() * 40) + 1,
    created_at: randomDate().toISOString(),
  });
}

export default {
  getAllFiles: async () => {
    return { files };
  },

  uploadFile: async (formData) => {
    const newFile = {
      id: files.length + 1001,
      nombre_original: formData.get("file").name,
      tipo: formData.get("file").name.split(".").pop().toUpperCase(),
      tamaño_bytes: formData.get("file").size,
      proyecto_id: formData.get("proyecto_id")
        ? parseInt(formData.get("proyecto_id"))
        : null,
      tarea_id: formData.get("tarea_id")
        ? parseInt(formData.get("tarea_id"))
        : null,
      created_at: new Date().toISOString(),
    };
    files.push(newFile);
    return newFile;
  },

  downloadFile: async (id, nombre) => {
    console.log(`Mock download file: ${nombre} (id: ${id})`);
    return true;
  },

  deleteFile: async (id) => {
    files = files.filter((f) => f.id !== id);
    return { success: true };
  },
};
