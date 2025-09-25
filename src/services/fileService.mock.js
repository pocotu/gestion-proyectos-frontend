// src/services/fileService.mock.js

let files = [
  // Archivos de proyectos
  {
    id: 1001,
    nombre_original: "Plan_de_proyecto.pdf",
    tipo: "PDF",
    tamaño_bytes: 254000,
    proyecto_id: 4,
    created_at: "2025-09-01T10:20:00",
  },
  {
    id: 1002,
    nombre_original: "Requerimientos.docx",
    tipo: "DOCX",
    tamaño_bytes: 87000,
    proyecto_id: 6,
    created_at: "2025-09-02T11:30:00",
  },
  {
    id: 1003,
    nombre_original: "Manual_usuario_v1.pdf",
    tipo: "PDF",
    tamaño_bytes: 145000,
    proyecto_id: 7,
    created_at: "2025-09-03T12:45:00",
  },
  {
    id: 1004,
    nombre_original: "Guia_instalacion.docx",
    tipo: "DOCX",
    tamaño_bytes: 91000,
    proyecto_id: 8,
    created_at: "2025-09-04T15:10:00",
  },

  // Archivos de tareas (1–40)
  {
    id: 1005,
    nombre_original: "Diseño_UI.jpg",
    tipo: "JPG",
    tamaño_bytes: 125000,
    tarea_id: 1,
    created_at: "2025-09-05T14:10:00",
  },
  {
    id: 1006,
    nombre_original: "Informe_avance.pdf",
    tipo: "PDF",
    tamaño_bytes: 65000,
    tarea_id: 2,
    created_at: "2025-09-06T16:45:00",
  },
  {
    id: 1007,
    nombre_original: "Notas_reunion.docx",
    tipo: "DOCX",
    tamaño_bytes: 72000,
    tarea_id: 3,
    created_at: "2025-09-07T09:15:00",
  },
  {
    id: 1008,
    nombre_original: "Pruebas_unitarias.xlsx",
    tipo: "XLSX",
    tamaño_bytes: 96000,
    tarea_id: 4,
    created_at: "2025-09-08T13:25:00",
  },
  {
    id: 1009,
    nombre_original: "Logo_app.png",
    tipo: "PNG",
    tamaño_bytes: 48000,
    tarea_id: 5,
    created_at: "2025-09-09T09:50:00",
  },
  {
    id: 1010,
    nombre_original: "Buglist.txt",
    tipo: "TXT",
    tamaño_bytes: 2500,
    tarea_id: 6,
    created_at: "2025-09-10T14:20:00",
  },
  {
    id: 1011,
    nombre_original: "Sprint1_resumen.pdf",
    tipo: "PDF",
    tamaño_bytes: 87000,
    tarea_id: 7,
    created_at: "2025-09-11T11:40:00",
  },
  {
    id: 1012,
    nombre_original: "Sprint2_resumen.pdf",
    tipo: "PDF",
    tamaño_bytes: 91000,
    tarea_id: 8,
    created_at: "2025-09-12T10:25:00",
  },
  {
    id: 1013,
    nombre_original: "Captura_error.png",
    tipo: "PNG",
    tamaño_bytes: 30500,
    tarea_id: 9,
    created_at: "2025-09-13T08:15:00",
  },
  {
    id: 1014,
    nombre_original: "Test_plan.docx",
    tipo: "DOCX",
    tamaño_bytes: 77000,
    tarea_id: 10,
    created_at: "2025-09-14T09:45:00",
  },
  {
    id: 1015,
    nombre_original: "Checklist_seguridad.xlsx",
    tipo: "XLSX",
    tamaño_bytes: 55000,
    tarea_id: 15,
    created_at: "2025-09-15T14:10:00",
  },
  {
    id: 1016,
    nombre_original: "Reporte_bugs.pdf",
    tipo: "PDF",
    tamaño_bytes: 125000,
    tarea_id: 20,
    created_at: "2025-09-16T13:30:00",
  },
  {
    id: 1017,
    nombre_original: "Esquema_bd.vsdx",
    tipo: "VSDX",
    tamaño_bytes: 118000,
    tarea_id: 25,
    created_at: "2025-09-17T17:20:00",
  },
  {
    id: 1018,
    nombre_original: "Wireframes_app.png",
    tipo: "PNG",
    tamaño_bytes: 84500,
    tarea_id: 30,
    created_at: "2025-09-18T09:10:00",
  },
  {
    id: 1019,
    nombre_original: "Plan_capacitacion.docx",
    tipo: "DOCX",
    tamaño_bytes: 69000,
    tarea_id: 35,
    created_at: "2025-09-19T15:35:00",
  },
  {
    id: 1020,
    nombre_original: "Minutas_reunion.pdf",
    tipo: "PDF",
    tamaño_bytes: 53000,
    tarea_id: 40,
    created_at: "2025-09-20T12:05:00",
  },
];

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
