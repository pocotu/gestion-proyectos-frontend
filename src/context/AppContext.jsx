import React from 'react';
import { AuthProvider } from './AuthContext';
import { ProjectProvider } from './ProjectContext';
import { TaskProvider } from './TaskContext';

/**
 * Proveedor principal de la aplicación
 * Implementa el patrón Composite para combinar múltiples contextos
 * Principio de Responsabilidad Única: Solo se encarga de proveer contextos
 * Principio Abierto/Cerrado: Fácil de extender con nuevos contextos
 */
const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default AppProvider;