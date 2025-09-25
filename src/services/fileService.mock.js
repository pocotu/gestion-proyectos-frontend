// src/services/fileService.mock.js

let files = [
  {
    id: 1001,
    nombre_original: "Plan_de_proyecto.pdf",
    tipo: "PDF",
    tamaño_bytes: 254000,
    proyecto_id: 1,
    created_at: "2025-09-01T10:20:00",
  },
  {
    id: 1002,
    nombre_original: "Requerimientos.docx",
    tipo: "DOCX",
    tamaño_bytes: 87000,
    proyecto_id: 2,
    created_at: "2025-09-02T11:30:00",
  },
  {
    id: 1003,
    nombre_original: "Diseño_UI.jpg",
    tipo: "JPG",
    tamaño_bytes: 125000,
    tarea_id: 101,
    created_at: "2025-09-05T14:10:00",
  },
  {
    id: 1004,
    nombre_original: "Informe_avance.pdf",
    tipo: "PDF",
    tamaño_bytes: 65000,
    tarea_id: 102,
    created_at: "2025-09-06T16:45:00",
  },
  {
    id: 1005,
    nombre_original: "Notas_reunión.docx",
    tipo: "DOCX",
    tamaño_bytes: 72000,
    proyecto_id: 3,
    created_at: "2025-09-10T09:15:00",
  },
  {
    id: 1006,
    nombre_original: "Pruebas_unitarias.xlsx",
    tipo: "XLSX",
    tamaño_bytes: 96000,
    tarea_id: 103,
    created_at: "2025-09-12T13:25:00",
  },
  {
    id: 1007,
    nombre_original: "Manual_de_usuario.pdf",
    tipo: "PDF",
    tamaño_bytes: 310000,
    proyecto_id: 4,
    created_at: "2025-09-15T15:40:00",
  },
  {
    id: 1008,
    nombre_original: "Logo_app.png",
    tipo: "PNG",
    tamaño_bytes: 48000,
    tarea_id: 104,
    created_at: "2025-09-17T09:50:00",
  },
  {
    id: 1009,
    nombre_original: "Avance_sprint.docx",
    tipo: "DOCX",
    tamaño_bytes: 105000,
    proyecto_id: 5,
    created_at: "2025-09-18T11:05:00",
  },
  {
    id: 1010,
    nombre_original: "Buglist.txt",
    tipo: "TXT",
    tamaño_bytes: 2500,
    tarea_id: 105,
    created_at: "2025-09-19T14:20:00",
  },
];

export default {
  // Obtener todos los archivos
  getAllFiles: async () => {
    return { files };
  },

  // Subir archivo (simulado)
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

  // Descargar archivo (mock: solo loguea)
  downloadFile: async (id, nombre) => {
    console.log(`Mock download file: ${nombre} (id: ${id})`);
    return true;
  },

  // Eliminar archivo
  deleteFile: async (id) => {
    files = files.filter((f) => f.id !== id);
    return { success: true };
  },
};
