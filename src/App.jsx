import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import AppRouter from './router/AppRouter';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <AppRouter />
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
